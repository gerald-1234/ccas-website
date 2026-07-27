const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const {
  isValidEmail,
  missingFields,
  normalizeEmail,
  pageDetails,
  validatePassword,
} = require('../utils/helpers');

const STAFF_ROLES = ['receptionist', 'doctor', 'nurse', 'manager', 'admin'];

async function createStaff(req, res) {
  const missing = missingFields(req.body, [
    'first_name',
    'last_name',
    'email',
    'password',
    'role',
  ]);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}.` });
  }

  const email = normalizeEmail(req.body.email);
  const role = String(req.body.role).toLowerCase();
  const passwordError = validatePassword(req.body.password);

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Email is invalid.' });
  if (!STAFF_ROLES.includes(role)) return res.status(400).json({ error: 'Staff role is invalid.' });
  if (passwordError) return res.status(400).json({ error: passwordError });
  if (role === 'doctor' && !req.body.specialization) {
    return res.status(400).json({ error: 'specialization is required for a doctor.' });
  }

  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        first_name: String(req.body.first_name).trim(),
        last_name: String(req.body.last_name).trim(),
        phone: req.body.phone || null,
      })
      .select('id,email,role,first_name,last_name,phone,is_active,created_at')
      .single();

    if (userError) {
      if (userError.code === '23505') {
        return res.status(409).json({ error: 'An account already uses this email.' });
      }
      throw userError;
    }

    let doctor = null;
    if (role === 'doctor') {
      const result = await supabase
        .from('doctors')
        .insert({
          user_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          specialization: String(req.body.specialization).trim(),
          phone: user.phone,
          email: user.email,
          consultation_room: req.body.consultation_room || null,
        })
        .select()
        .single();

      if (result.error) {
        await supabase.from('users').delete().eq('id', user.id);
        throw result.error;
      }
      doctor = result.data;
    }

    await addAuditLog(req.user.id, 'STAFF_CREATED', `${role}: ${user.email}`);
    return res.status(201).json({ message: 'Staff account created.', user, doctor });
  } catch (error) {
    return res.status(500).json({ error: 'Could not create the staff account.' });
  }
}

async function listUsers(req, res) {
  const { page, limit, from, to } = pageDetails(req.query);
  let query = supabase
    .from('users')
    .select(
      'id,email,role,first_name,last_name,phone,is_active,locked_until,created_at',
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to);

  if (req.query.role) query = query.eq('role', req.query.role);

  const { data, count, error } = await query;
  if (error) return res.status(500).json({ error: 'Could not load users.' });

  return res.json({ users: data, pagination: { page, limit, total: count || 0 } });
}

async function updateUserStatus(req, res) {
  if (typeof req.body.is_active !== 'boolean') {
    return res.status(400).json({ error: 'is_active must be true or false.' });
  }
  if (req.params.id === req.user.id && req.body.is_active === false) {
    return res.status(400).json({ error: 'You cannot deactivate your own account.' });
  }

  const { data, error } = await supabase
    .from('users')
    .update({ is_active: req.body.is_active })
    .eq('id', req.params.id)
    .select('id,email,role,first_name,last_name,is_active')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not update the user.' });
  if (!data) return res.status(404).json({ error: 'User not found.' });

  await addAuditLog(req.user.id, 'USER_STATUS_UPDATED', `${data.email}: ${data.is_active}`);
  return res.json({ message: 'User status updated.', user: data });
}

async function resetPassword(req, res) {
  const newPassword = String((req.body && req.body.new_password) || '');
  const passwordError = validatePassword(newPassword);
  if (passwordError) return res.status(400).json({ error: passwordError });

  const passwordHash = await bcrypt.hash(newPassword, 10);
  const { data, error } = await supabase
    .from('users')
    .update({
      password_hash: passwordHash,
      failed_login_attempts: 0,
      locked_until: null,
    })
    .eq('id', req.params.id)
    .select('id,email')
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not reset the password.' });
  if (!data) return res.status(404).json({ error: 'User not found.' });

  await addAuditLog(req.user.id, 'PASSWORD_RESET_BY_ADMIN', data.email);
  return res.json({ message: 'Password reset successful.' });
}

async function listAuditLogs(req, res) {
  const { page, limit, from, to } = pageDetails(req.query);
  const { data, count, error } = await supabase
    .from('audit_logs')
    .select('*, user:users!audit_logs_user_id_fkey(email,role,first_name,last_name)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: 'Could not load audit logs.' });
  return res.json({ audit_logs: data, pagination: { page, limit, total: count || 0 } });
}

module.exports = {
  createStaff,
  listAuditLogs,
  listUsers,
  resetPassword,
  updateUserStatus,
};
