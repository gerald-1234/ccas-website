const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const { missingFields } = require('../utils/helpers');

async function getAppointment(req, appointmentId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patient:patients!appointments_patient_id_fkey(id,user_id,first_name,last_name),
      doctor:doctors!appointments_doctor_id_fkey(id,user_id,first_name,last_name)
    `)
    .eq('id', appointmentId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

async function getClinicalRecord(req, res) {
  try {
    const appointment = await getAppointment(req, req.params.appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    const allowed =
      ['nurse', 'admin'].includes(req.user.role) ||
      (req.user.role === 'patient' && appointment.patient.user_id === req.user.id) ||
      (req.user.role === 'doctor' && appointment.doctor.user_id === req.user.id);

    if (!allowed) return res.status(403).json({ error: 'You cannot view this record.' });

    const [vitalResult, recordResult] = await Promise.all([
      supabase.from('vital_signs').select('*').eq('appointment_id', appointment.id).maybeSingle(),
      supabase.from('medical_records').select('*').eq('appointment_id', appointment.id).maybeSingle(),
    ]);

    let medicalRecord = recordResult.data;
    if (medicalRecord && req.user.role === 'patient') {
      delete medicalRecord.doctor_notes;
    }

    return res.json({
      appointment,
      vital_signs: vitalResult.data,
      medical_record: medicalRecord,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Could not load the clinical record.' });
  }
}

function optionalValue(value) {
  return value === undefined || value === null || value === '' ? null : value;
}

async function saveVitalSigns(req, res) {
  try {
    const appointment = await getAppointment(req, req.params.appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    const values = {
      appointment_id: appointment.id,
      recorded_by: req.user.id,
      temperature_c: optionalValue(req.body.temperature_c),
      systolic_bp: optionalValue(req.body.systolic_bp),
      diastolic_bp: optionalValue(req.body.diastolic_bp),
      pulse_rate: optionalValue(req.body.pulse_rate),
      respiratory_rate: optionalValue(req.body.respiratory_rate),
      oxygen_saturation: optionalValue(req.body.oxygen_saturation),
      weight_kg: optionalValue(req.body.weight_kg),
      height_cm: optionalValue(req.body.height_cm),
      observations: optionalValue(req.body.observations),
    };

    const { data, error } = await supabase
      .from('vital_signs')
      .upsert(values, { onConflict: 'appointment_id' })
      .select()
      .single();

    if (error) throw error;
    await addAuditLog(req.user.id, 'VITAL_SIGNS_SAVED', `Appointment ID: ${appointment.id}`);
    return res.json({ message: 'Vital signs saved.', vital_signs: data });
  } catch (error) {
    return res.status(500).json({ error: 'Could not save vital signs.' });
  }
}

async function saveMedicalRecord(req, res) {
  const missing = missingFields(req.body, ['diagnosis']);
  if (missing.length) return res.status(400).json({ error: 'diagnosis is required.' });

  try {
    const appointment = await getAppointment(req, req.params.appointmentId);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found.' });

    if (req.user.role === 'doctor' && appointment.doctor.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the assigned doctor can write this record.' });
    }

    const values = {
      appointment_id: appointment.id,
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      diagnosis: String(req.body.diagnosis).trim(),
      treatment: req.body.treatment || null,
      prescription: req.body.prescription || null,
      doctor_notes: req.body.doctor_notes || null,
      visit_date: req.body.visit_date || appointment.appointment_date,
    };

    const { data, error } = await supabase
      .from('medical_records')
      .upsert(values, { onConflict: 'appointment_id' })
      .select()
      .single();

    if (error) throw error;
    // Only a checked-in visit is completed by saving its medical record.
    if (appointment.status === 'checked_in') {
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointment.id);
    }
    await addAuditLog(req.user.id, 'MEDICAL_RECORD_SAVED', `Appointment ID: ${appointment.id}`);

    return res.json({ message: 'Medical record saved.', medical_record: data });
  } catch (error) {
    return res.status(500).json({ error: 'Could not save the medical record.' });
  }
}

async function getPatientHistory(req, res) {
  const { data: patient } = await supabase
    .from('patients')
    .select('id,user_id')
    .eq('id', req.params.patientId)
    .maybeSingle();

  if (!patient) return res.status(404).json({ error: 'Patient not found.' });

  if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only view your own history.' });
  }

  if (req.user.role === 'doctor') {
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('user_id', req.user.id)
      .maybeSingle();
    const { count } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('doctor_id', doctor && doctor.id)
      .eq('patient_id', patient.id);

    if (!count) return res.status(403).json({ error: 'You have no appointment with this patient.' });
  }

  const { data, error } = await supabase
    .from('medical_records')
    .select('*, doctor:doctors!medical_records_doctor_id_fkey(first_name,last_name,specialization)')
    .eq('patient_id', patient.id)
    .order('visit_date', { ascending: false });

  if (error) return res.status(500).json({ error: 'Could not load medical history.' });

  const records = req.user.role === 'patient'
    ? data.map(({ doctor_notes, ...record }) => record)
    : data;

  return res.json({ medical_records: records });
}

module.exports = {
  getClinicalRecord,
  getPatientHistory,
  saveMedicalRecord,
  saveVitalSigns,
};
