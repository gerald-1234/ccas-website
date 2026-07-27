const supabase = require('../config/supabase');
const { isValidDate } = require('../utils/helpers');

function getDateRange(query) {
  const today = new Date().toISOString().slice(0, 10);
  const from = query.from || today;
  const to = query.to || today;

  if (!isValidDate(from) || !isValidDate(to) || from > to) {
    return null;
  }
  return { from, to };
}

async function getAppointmentsInRange(from, to) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,patient_id,doctor_id,appointment_date,duration_minutes,status,
      doctor:doctors!appointments_doctor_id_fkey(
        id,first_name,last_name,specialization
      )
    `)
    .gte('appointment_date', from)
    .lte('appointment_date', to);

  if (error) throw error;
  return data || [];
}

async function summary(req, res) {
  const range = getDateRange(req.query);
  if (!range) return res.status(400).json({ error: 'Use valid from and to dates.' });

  try {
    const appointments = await getAppointmentsInRange(range.from, range.to);
    const byStatus = {
      scheduled: 0,
      checked_in: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };

    for (const appointment of appointments) {
      byStatus[appointment.status] += 1;
    }

    const attended = byStatus.checked_in + byStatus.completed;
    const finished = attended + byStatus.no_show;
    const attendanceRate = finished
      ? Number(((attended / finished) * 100).toFixed(1))
      : 0;

    return res.json({
      range,
      total_appointments: appointments.length,
      attendance_rate_percent: attendanceRate,
      appointments_by_status: byStatus,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Could not generate the report.' });
  }
}

async function doctorUtilization(req, res) {
  const range = getDateRange(req.query);
  if (!range) return res.status(400).json({ error: 'Use valid from and to dates.' });

  try {
    const [appointments, doctorResult] = await Promise.all([
      getAppointmentsInRange(range.from, range.to),
      supabase.from('doctors').select('id,first_name,last_name,specialization').order('last_name'),
    ]);

    if (doctorResult.error) throw doctorResult.error;

    const doctors = doctorResult.data.map((doctor) => {
      const ownAppointments = appointments.filter(
        (appointment) => appointment.doctor_id === doctor.id
      );
      const completed = ownAppointments.filter(
        (appointment) => appointment.status === 'completed'
      ).length;
      const totalMinutes = ownAppointments
        .filter((appointment) => appointment.status !== 'cancelled')
        .reduce((sum, appointment) => sum + Number(appointment.duration_minutes), 0);

      return {
        doctor_id: doctor.id,
        doctor_name: `Dr. ${doctor.first_name} ${doctor.last_name}`,
        specialization: doctor.specialization,
        total_appointments: ownAppointments.length,
        completed_appointments: completed,
        booked_minutes: totalMinutes,
        completion_percent: ownAppointments.length
          ? Number(((completed / ownAppointments.length) * 100).toFixed(1))
          : 0,
      };
    });

    return res.json({ range, doctors });
  } catch (error) {
    return res.status(500).json({ error: 'Could not generate doctor utilization.' });
  }
}

module.exports = { doctorUtilization, summary };
