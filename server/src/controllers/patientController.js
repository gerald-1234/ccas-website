const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const {
  BLOOD_GROUPS,
  isValidDate,
  isValidEmail,
  missingFields,
  normalizeEmail,
  pageDetails,
} = require('../utils/helpers');

function valuesFromBody(body) {
  return {
    first_name: String(body.first_name).trim(),
    last_name: String(body.last_name).trim(),
    gender: String(body.gender).trim(),
    date_of_birth: body.date_of_birth,
    phone: String(body.phone).trim(),
    email: body.email ? normalizeEmail(body.email) : null,
    residential_address: String(body.residential_address).trim(),
    blood_group: String(body.blood_group).toUpperCase(),
    emergency_contact_name: String(body.emergency_contact_name).trim(),
    emergency_contact_phone: String(body.emergency_contact_phone).trim(),
  };
}

// Receptionists can register patients who do not need an online account.
async function createPatient(req, res) {
  const required = [
    'first_name',
    'last_name',
    'gender',
    'date_of_birth',
    'phone',
    'residential_address',
    'blood_group',
    'emergency_contact_name',
    'emergency_contact_phone',
  ];
  const missing = missingFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}.` });
  }
  if (!isValidDate(req.body.date_of_birth)) {
    return res.status(400).json({ error: 'date_of_birth must use YYYY-MM-DD.' });
  }
  if (req.body.email && !isValidEmail(req.body.email)) {
    return res.status(400).json({ error: 'Email is invalid.' });
  }
  if (!BLOOD_GROUPS.includes(String(req.body.blood_group).toUpperCase())) {
    return res.status(400).json({ error: 'Blood group is invalid.' });
  }

  const { data: patient, error } = await supabase
    .from('patients')
    .insert(valuesFromBody(req.body))
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not register the patient.' });

  await addAuditLog(req.user.id, 'PATIENT_CREATED', `Patient ID: ${patient.id}`);
  return res.status(201).json({ message: 'Patient registered.', patient });
}

async function listPatients(req, res) {
  const { page, limit, from, to } = pageDetails(req.query);
  let query = supabase
    .from('patients')
    .select('*', { count: 'exact' })
    .order('registration_date', { ascending: false })
    .range(from, to);

  if (req.query.search) {
    const search = String(req.query.search).replace(/[,%()]/g, '').trim();
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,phone.ilike.%${search}%`
    );
  }

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: 'Could not load patients.' });

  return res.json({ patients: data, pagination: { page, limit, total: count || 0 } });
}

async function getPatient(req, res) {
  const { data: patient, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not load the patient.' });
  if (!patient) return res.status(404).json({ error: 'Patient not found.' });

  if (req.user.role === 'patient' && patient.user_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only view your own profile.' });
  }

  return res.json({ patient });
}

async function updatePatient(req, res) {
  const { data: patient, error: loadError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (loadError) return res.status(500).json({ error: 'Could not load the patient.' });
  if (!patient) return res.status(404).json({ error: 'Patient not found.' });

  const ownsProfile = req.user.role === 'patient' && patient.user_id === req.user.id;
  const staffCanEdit = ['receptionist', 'admin'].includes(req.user.role);
  if (!ownsProfile && !staffCanEdit) {
    return res.status(403).json({ error: 'You cannot update this patient.' });
  }

  const fields = [
    'first_name',
    'last_name',
    'gender',
    'date_of_birth',
    'phone',
    'email',
    'residential_address',
    'blood_group',
    'emergency_contact_name',
    'emergency_contact_phone',
  ];
  const updates = {};
  for (const field of fields) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }

  if (updates.email) {
    updates.email = normalizeEmail(updates.email);
    if (!isValidEmail(updates.email)) return res.status(400).json({ error: 'Email is invalid.' });
  }
  if (updates.date_of_birth && !isValidDate(updates.date_of_birth)) {
    return res.status(400).json({ error: 'date_of_birth must use YYYY-MM-DD.' });
  }
  if (updates.blood_group) {
    updates.blood_group = String(updates.blood_group).toUpperCase();
    if (!BLOOD_GROUPS.includes(updates.blood_group)) {
      return res.status(400).json({ error: 'Blood group is invalid.' });
    }
  }

  const { data: updated, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patient.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: 'Could not update the patient.' });

  await addAuditLog(req.user.id, 'PATIENT_UPDATED', `Patient ID: ${patient.id}`);
  return res.json({ message: 'Patient updated.', patient: updated });
}

module.exports = { createPatient, getPatient, listPatients, updatePatient };
