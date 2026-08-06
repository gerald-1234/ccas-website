const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const { buildAvailableSlots } = require('../utils/appointment');
const { getDayOfWeek, isValidDate, isValidTime, missingFields, timeToMinutes } = require('../utils/helpers');

async function listDoctors(req, res) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, doctor_availability(*)')
    .order('last_name');

  if (error) return res.status(500).json({ error: 'Could not load doctors.' });
  return res.json({ doctors: data });
}

async function getDoctor(req, res) {
  const { data, error } = await supabase
    .from('doctors')
    .select('*, doctor_availability(*)')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not load the doctor.' });
  if (!data) return res.status(404).json({ error: 'Doctor not found.' });
  return res.json({ doctor: data });
}

async function getAvailableSlots(req, res) {
  const date = String(req.query.date || '');
  if (!isValidDate(date)) {
    return res.status(400).json({ error: 'date must use YYYY-MM-DD.' });
  }

  const dayOfWeek = getDayOfWeek(date);
  const [scheduleResult, appointmentResult] = await Promise.all([
    supabase
      .from('doctor_availability')
      .select('*')
      .eq('doctor_id', req.params.id)
      .eq('day_of_week', dayOfWeek),
    supabase
      .from('appointments')
      .select('appointment_time,duration_minutes,status')
      .eq('doctor_id', req.params.id)
      .eq('appointment_date', date)
      .in('status', ['scheduled', 'checked_in']),
  ]);

  if (scheduleResult.error || appointmentResult.error) {
    return res.status(500).json({ error: 'Could not calculate available slots.' });
  }

  const slots = buildAvailableSlots(
    scheduleResult.data || [],
    appointmentResult.data || []
  );

  return res.json({ date, slots });
}

async function setAvailability(req, res) {
  const periods = req.body && req.body.periods;
  if (!Array.isArray(periods) || periods.length === 0) {
    return res.status(400).json({ error: 'periods must be a non-empty array.' });
  }

  for (const period of periods) {
    const missing = missingFields(period, ['day_of_week', 'start_time', 'end_time']);
    if (missing.length) {
      return res.status(400).json({ error: 'Each period needs day_of_week, start_time, and end_time.' });
    }
    const dayOfWeek = Number(period.day_of_week);
    if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
      return res.status(400).json({ error: 'day_of_week must be an integer between 1 and 7.' });
    }
    if (!isValidTime(period.start_time) || !isValidTime(period.end_time)) {
      return res.status(400).json({ error: 'start_time and end_time must use HH:MM.' });
    }
    if (timeToMinutes(period.end_time) <= timeToMinutes(period.start_time)) {
      return res.status(400).json({ error: 'end_time must be after start_time.' });
    }
  }

  const { data: doctor } = await supabase
    .from('doctors')
    .select('id,user_id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (!doctor) return res.status(404).json({ error: 'Doctor not found.' });
  if (req.user.role === 'doctor' && doctor.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only edit your own availability.' });
  }

  const { data: existingRows, error: existingError } = await supabase
    .from('doctor_availability')
    .select('id')
    .eq('doctor_id', doctor.id);

  if (existingError) return res.status(500).json({ error: 'Could not load existing availability.' });

  const rows = periods.map((period) => ({
    doctor_id: doctor.id,
    day_of_week: Number(period.day_of_week),
    start_time: period.start_time,
    end_time: period.end_time,
    slot_duration_minutes: Number(period.slot_duration_minutes) || 30,
  }));

  const { data, error } = await supabase
    .from('doctor_availability')
    .insert(rows)
    .select();

  if (error) return res.status(500).json({ error: 'Could not save doctor availability.' });

  const existingIds = (existingRows || []).map((row) => row.id);
  if (existingIds.length) {
    const { error: deleteError } = await supabase
      .from('doctor_availability')
      .delete()
      .in('id', existingIds);
    if (deleteError) {
      console.error('Availability cleanup failed:', deleteError.message);
    }
  }

  await addAuditLog(req.user.id, 'DOCTOR_AVAILABILITY_UPDATED', `Doctor ID: ${doctor.id}`);
  return res.json({ message: 'Availability saved.', periods: data });
}

module.exports = { getAvailableSlots, getDoctor, listDoctors, setAvailability };
