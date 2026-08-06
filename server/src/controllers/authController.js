const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const addAuditLog = require('../utils/audit');
const {
  BLOOD_GROUPS,
  isValidDate,
  isValidEmail,
  missingFields,
  normalizeEmail,
  validatePassword,
} = require('../utils/helpers');

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h', algorithm: 'HS256' }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone,
  };
}

function patientData(body) {
  return {
    first_name: String(body.first_name).trim(),
    last_name: String(body.last_name).trim(),
    gender: String(body.gender).trim(),
    date_of_birth: body.date_of_birth,
    phone: String(body.phone).trim(),
    email: normalizeEmail(body.email),
    residential_address: String(body.residential_address).trim(),
    blood_group: String(body.blood_group).toUpperCase(),
    emergency_contact_name: String(body.emergency_contact_name).trim(),
    emergency_contact_phone: String(body.emergency_contact_phone).trim(),
  };
}

// A patient can create an account without staff assistance.
async function register(req, res) {
  const required = [
    'first_name',
    'last_name',
    'gender',
    'date_of_birth',
    'phone',
    'email',
    'password',
    'residential_address',
    'blood_group',
    'emergency_contact_name',
    'emergency_contact_phone',
  ];
  const missing = missingFields(req.body, required);
  if (missing.length) {
    return res.status(400).json({ error: `Missing fields: ${missing.join(', ')}.` });
  }

  const email = normalizeEmail(req.body.email);
  const passwordError = validatePassword(req.body.password);

  if (!isValidEmail(email)) return res.status(400).json({ error: 'Email is invalid.' });
  if (passwordError) return res.status(400).json({ error: passwordError });
  if (!isValidDate(req.body.date_of_birth)) {
    return res.status(400).json({ error: 'date_of_birth must use YYYY-MM-DD.' });
  }
  if (!BLOOD_GROUPS.includes(String(req.body.blood_group).toUpperCase())) {
    return res.status(400).json({ error: 'Blood group is invalid.' });
  }

  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role: 'patient',
        first_name: String(req.body.first_name).trim(),
        last_name: String(req.body.last_name).trim(),
        phone: String(req.body.phone).trim(),
      })
      .select()
      .single();

    if (userError) {
      if (userError.code === '23505') {
        return res.status(409).json({ error: 'An account already uses this email.' });
      }
      throw userError;
    }

    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .insert({ ...patientData(req.body), user_id: user.id })
      .select()
      .single();

    if (patientError) {
      // Remove the user because a patient account is incomplete without a profile.
      await supabase.from('users').delete().eq('id', user.id);
      throw patientError;
    }

    await addAuditLog(user.id, 'PATIENT_REGISTERED', `Patient ID: ${patient.id}`);

    return res.status(201).json({
      message: 'Registration successful.',
      token: createToken(user),
      user: publicUser(user),
      patient,
    });
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ error: 'Could not create the account.' });
  }
}

async function login(req, res) {
  const email = normalizeEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });
    if (!user.is_active) return res.status(403).json({ error: 'This account is inactive.' });

    const lockTime = user.locked_until ? new Date(user.locked_until).getTime() : 0;
    if (lockTime > Date.now()) {
      return res.status(423).json({ error: 'Account locked. Try again after 15 minutes.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      const failedAttempts = Number(user.failed_login_attempts) + 1;
      const update = { failed_login_attempts: failedAttempts, locked_until: null };

      if (failedAttempts >= 5) {
        update.failed_login_attempts = 0;
        update.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }

      await supabase.from('users').update(update).eq('id', user.id);
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await supabase
      .from('users')
      .update({ failed_login_attempts: 0, locked_until: null })
      .eq('id', user.id);

    await addAuditLog(user.id, 'LOGIN', `${user.email} logged in`);

    return res.json({
      message: 'Login successful.',
      token: createToken(user),
      user: publicUser(user),
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ error: 'Could not complete login.' });
  }
}

async function me(req, res) {
  let profile = null;

  if (req.user.role === 'patient') {
    const result = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();
    profile = result.data;
  }

  if (req.user.role === 'doctor') {
    const result = await supabase
      .from('doctors')
      .select('*')
      .eq('user_id', req.user.id)
      .maybeSingle();
    profile = result.data;
  }

  return res.json({ user: req.user, profile });
}

async function changePassword(req, res) {
  const currentPassword = String((req.body && req.body.current_password) || '');
  const newPassword = String((req.body && req.body.new_password) || '');
  const passwordError = validatePassword(newPassword);

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new passwords are required.' });
  }
  if (passwordError) return res.status(400).json({ error: passwordError });

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();
    if (error) throw error;

    const correctPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!correctPassword) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await supabase.from('users').update({ password_hash: passwordHash }).eq('id', req.user.id);
    await addAuditLog(req.user.id, 'PASSWORD_CHANGED');

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Could not change the password.' });
  }
}

function logout(req, res) {
  // JWT logout is handled by deleting the token in the frontend.
  return res.json({ message: 'Logged out. Remove the saved token from the frontend.' });
}

module.exports = { changePassword, login, logout, me, register };
