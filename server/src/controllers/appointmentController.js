const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const { fitsDoctorSchedule, timesOverlap } = require('../utils/appointment');
const { getDayOfWeek, isValidDate, missingFields, pageDetails } = require('../utils/helpers');

const APPOINTMENT_SELECT = `
  *,
  patient:patients!appointments_patient_id_fkey(
    id,user_id,first_name,last_name,email,phone
  ),
  doctor:doctors!appointments_doctor_id_fkey(
    id,user_id,first_name,last_name,specialization,consultation_room
  )
`;

function appointmentDateTime(date, time) {
  const offset = process.env.CLINIC_UTC_OFFSET || '+01:00';
  return new Date(`${date}T${String(time).slice(0, 5)}:00${offset}`);
}

async function getPatientForRequest(req) {
  if (req.user.role === 'patient') {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();
    return data;
  }

  const { data } = await supabase
    .from('patients')
    .select('*')
    .eq('id', req.body.patient_id)
    .maybeSingle();
  return data;
}

async function appointmentHasConflict({
  appointmentId,
  patientId,
  doctorId,
  date,
  time,
  duration,
}) {
  const [doctorResult, patientResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('id,appointment_time,duration_minutes')
      .eq('doctor_id', doctorId)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'checked_in']),
    supabase
      .from('appointments')
      .select('id,appointment_time,duration_minutes')
      .eq('patient_id', patientId)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'checked_in']),
  ]);

  if (doctorResult.error) throw doctorResult.error;
  if (patientResult.error) throw patientResult.error;

  const existingAppointments = [
    ...(doctorResult.data || []),
    ...(patientResult.data || []),
  ];

  return existingAppointments.some((appointment) => {
    if (appointment.id === appointmentId) return false;
    return timesOverlap(
      time,
      duration,
      appointment.appointment_time,
      appointment.duration_minutes
    );
  });
}

async function queueNotifications(appointment, patient, doctor, type) {
  if (!patient || !patient.user_id) return;

  try {
    await supabase
      .from('notifications')
      .delete()
      .eq('appointment_id', appointment.id)
      .eq('is_read', false);

    const appointmentText =
      `${appointment.appointment_date} at ${String(appointment.appointment_time).slice(0, 5)} ` +
      `with Dr. ${doctor.first_name} ${doctor.last_name}`;

    const messages = {
      confirmation: {
        title: 'Appointment confirmed',
        message: `Your appointment is booked for ${appointmentText}.`,
      },
      rescheduled: {
        title: 'Appointment rescheduled',
        message: `Your appointment has been moved to ${appointmentText}.`,
      },
      cancelled: {
        title: 'Appointment cancelled',
        message: `Your appointment for ${appointmentText} has been cancelled.`,
      },
    };

    const rows = [{
      user_id: patient.user_id,
      appointment_id: appointment.id,
      notification_type: type,
      title: messages[type].title,
      message: messages[type].message,
      show_at: new Date().toISOString(),
    }];

    if (type !== 'cancelled') {
      const hours = Number(process.env.APPOINTMENT_REMINDER_HOURS) || 24;
      const reminderTime = new Date(
        appointmentDateTime(
          appointment.appointment_date,
          appointment.appointment_time
        ).getTime() - hours * 60 * 60 * 1000
      );

      if (reminderTime > new Date()) {
        rows.push({
          user_id: patient.user_id,
          appointment_id: appointment.id,
          notification_type: 'reminder',
          title: 'Appointment reminder',
          message: `Reminder: your appointment is ${appointmentText}.`,
          show_at: reminderTime.toISOString(),
        });
      }
    }

    await supabase.from('notifications').insert(rows);
  } catch (error) {
    // Notifications are best-effort and must not fail the appointment operation.
    console.error('Notification queueing failed:', error.message);
  }
}

async function validateBooking(doctor, date, time, duration) {
  if (!isValidDate(date)) return 'appointment_date must use YYYY-MM-DD.';
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(String(time))) {
    return 'appointment_time must use HH:MM.';
  }
  if (!Number.isInteger(Number(duration)) || Number(duration) < 10) {
    return 'duration_minutes must be at least 10.';
  }
  if (appointmentDateTime(date, time) <= new Date()) {
    return 'The appointment must be in the future.';
  }
  if (doctor.availability_status !== 'available') {
    return 'The selected doctor is currently unavailable.';
  }

  const { data: schedule, error } = await supabase
    .from('doctor_availability')
    .select('*')
    .eq('doctor_id', doctor.id)
    .eq('day_of_week', getDayOfWeek(date));

  if (error) throw error;
  if (!fitsDoctorSchedule(time, duration, schedule || [])) {
    return 'The selected time is outside the doctor\'s available slots.';
  }

  return null;
}

async function createAppointment(req, res) {
  const required = ['doctor_id', 'appointment_date', 'appointment_time', 'duration_minutes', 'reason_for_visit'];
  const missing = missingFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}.` });
  }
  if (req.user.role !== 'patient' && !req.body.patient_id) {
    return res.status(400).json({ error: 'patient_id is required for staff bookings.' });
  }

  try {
    const [patient, doctorResult] = await Promise.all([
      getPatientForRequest(req),
      supabase.from('doctors').select('*').eq('id', req.body.doctor_id).maybeSingle(),
    ]);

    if (!patient) return res.status(404).json({ error: 'Patient not found.' });
    if (doctorResult.error) throw doctorResult.error;
    if (!doctorResult.data) return res.status(404).json({ error: 'Doctor not found.' });
    const doctor = doctorResult.data;

    const bookingError = await validateBooking(
      doctor,
      req.body.appointment_date,
      req.body.appointment_time,
      req.body.duration_minutes
    );
    if (bookingError) return res.status(400).json({ error: bookingError });

    const conflict = await appointmentHasConflict({
      patientId: patient.id,
      doctorId: doctor.id,
      date: req.body.appointment_date,
      time: req.body.appointment_time,
      duration: req.body.duration_minutes,
    });
    if (conflict) {
      return res.status(409).json({ error: 'The doctor or patient already has an appointment at that time.' });
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        doctor_id: doctor.id,
        appointment_date: req.body.appointment_date,
        appointment_time: req.body.appointment_time,
        duration_minutes: Number(req.body.duration_minutes),
        reason_for_visit: String(req.body.reason_for_visit).trim(),
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error) throw error;

    await queueNotifications(appointment, patient, doctor, 'confirmation');
    await addAuditLog(req.user.id, 'APPOINTMENT_CREATED', `Appointment ID: ${appointment.id}`);

    return res.status(201).json({
      message: 'Appointment booked.',
      appointment: { ...appointment, patient, doctor },
    });
  } catch (error) {
    console.error('Create appointment error:', error.message);
    return res.status(500).json({ error: 'Could not book the appointment.' });
  }
}

async function listAppointments(req, res) {
  const { page, limit, from, to } = pageDetails(req.query);
  let query = supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT, { count: 'exact' })
    .order('appointment_date')
    .order('appointment_time')
    .range(from, to);

  if (req.user.role === 'patient') {
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!patient) return res.json({ appointments: [], pagination: { page, limit, total: 0 } });
    query = query.eq('patient_id', patient.id);
  } else if (req.user.role === 'doctor') {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    if (!doctor) return res.json({ appointments: [], pagination: { page, limit, total: 0 } });
    query = query.eq('doctor_id', doctor.id);
  } else if (!['receptionist', 'nurse', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'You cannot view appointment lists.' });
  }

  if (req.query.status) query = query.eq('status', req.query.status);
  if (req.query.date) query = query.eq('appointment_date', req.query.date);
  if (req.query.doctor_id) query = query.eq('doctor_id', req.query.doctor_id);
  if (req.query.patient_id) query = query.eq('patient_id', req.query.patient_id);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: 'Could not load appointments.' });

  return res.json({ appointments: data, pagination: { page, limit, total: count || 0 } });
}

async function getAppointment(req, res) {
  const { data: appointment, error } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not load the appointment.' });
  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  const allowed =
    ['receptionist', 'nurse', 'admin'].includes(req.user.role) ||
    (req.user.role === 'patient' && appointment.patient.user_id === req.user.id) ||
    (req.user.role === 'doctor' && appointment.doctor.user_id === req.user.id);

  if (!allowed) return res.status(403).json({ error: 'You cannot view this appointment.' });
  return res.json({ appointment });
}

async function rescheduleAppointment(req, res) {
  const required = ['appointment_date', 'appointment_time', 'duration_minutes'];
  const missing = missingFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}.` });
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', req.params.id)
    .maybeSingle();

  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  const ownsAppointment =
    req.user.role === 'patient' && appointment.patient.user_id === req.user.id;
  if (!ownsAppointment && !['receptionist', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ error: 'You cannot reschedule this appointment.' });
  }
  if (appointment.status !== 'scheduled') {
    return res.status(409).json({ error: 'Only scheduled appointments can be rescheduled.' });
  }

  try {
    const bookingError = await validateBooking(
      appointment.doctor,
      req.body.appointment_date,
      req.body.appointment_time,
      req.body.duration_minutes
    );
    if (bookingError) return res.status(400).json({ error: bookingError });

    const conflict = await appointmentHasConflict({
      appointmentId: appointment.id,
      patientId: appointment.patient_id,
      doctorId: appointment.doctor_id,
      date: req.body.appointment_date,
      time: req.body.appointment_time,
      duration: req.body.duration_minutes,
    });
    if (conflict) return res.status(409).json({ error: 'The new time is already booked.' });

    const { data: updated, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: req.body.appointment_date,
        appointment_time: req.body.appointment_time,
        duration_minutes: Number(req.body.duration_minutes),
      })
      .eq('id', appointment.id)
      .select()
      .single();

    if (error) throw error;
    await queueNotifications(updated, appointment.patient, appointment.doctor, 'rescheduled');
    await addAuditLog(req.user.id, 'APPOINTMENT_RESCHEDULED', `Appointment ID: ${appointment.id}`);

    return res.json({ message: 'Appointment rescheduled.', appointment: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Could not reschedule the appointment.' });
  }
}

async function cancelAppointment(req, res) {
  const reason = String((req.body && req.body.cancellation_reason) || '').trim();
  if (!reason) return res.status(400).json({ error: 'cancellation_reason is required.' });

  const { data: appointment } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', req.params.id)
    .maybeSingle();

  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  const allowed =
    ['receptionist', 'admin'].includes(req.user.role) ||
    (req.user.role === 'patient' && appointment.patient.user_id === req.user.id) ||
    (req.user.role === 'doctor' && appointment.doctor.user_id === req.user.id);

  if (!allowed) return res.status(403).json({ error: 'You cannot cancel this appointment.' });
  if (['completed', 'cancelled', 'no_show'].includes(appointment.status)) {
    return res.status(409).json({ error: 'This appointment is already closed.' });
  }

  const { data: cancelled, error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled', cancellation_reason: reason })
    .eq('id', appointment.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not cancel the appointment.' });

  await queueNotifications(cancelled, appointment.patient, appointment.doctor, 'cancelled');
  await addAuditLog(req.user.id, 'APPOINTMENT_CANCELLED', `Appointment ID: ${appointment.id}`);

  return res.json({ message: 'Appointment cancelled.', appointment: cancelled });
}

async function updateStatus(req, res) {
  const status = String((req.body && req.body.status) || '');
  if (!['checked_in', 'completed', 'no_show'].includes(status)) {
    return res.status(400).json({ error: 'Use checked_in, completed, or no_show.' });
  }

  const { data: appointment } = await supabase
    .from('appointments')
    .select(APPOINTMENT_SELECT)
    .eq('id', req.params.id)
    .maybeSingle();

  if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

  let allowed = req.user.role === 'admin';
  if (req.user.role === 'receptionist' && ['checked_in', 'no_show'].includes(status)) {
    allowed = true;
  }
  if (
    req.user.role === 'doctor' &&
    appointment.doctor.user_id === req.user.id &&
    status === 'completed'
  ) {
    allowed = true;
  }

  if (!allowed) return res.status(403).json({ error: 'You cannot set this status.' });

  const { data: updated, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointment.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not update the appointment.' });

  await addAuditLog(req.user.id, 'APPOINTMENT_STATUS_UPDATED', `${appointment.id}: ${status}`);
  return res.json({ message: 'Appointment status updated.', appointment: updated });
}

module.exports = {
  cancelAppointment,
  createAppointment,
  getAppointment,
  listAppointments,
  rescheduleAppointment,
  updateStatus,
};
