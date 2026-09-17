require('dotenv').config();

const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { isValidEmail, normalizeEmail, validatePassword } = require('../utils/helpers');

async function createAdmin() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = process.env.ADMIN_PASSWORD || '';
  const passwordError = validatePassword(password);

  if (!email || !isValidEmail(email)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }
  if (passwordError) {
    throw new Error(passwordError);
  }

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    console.log('An account already exists with ADMIN_EMAIL.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      password_hash: passwordHash,
      role: 'admin',
      first_name: process.env.ADMIN_FIRST_NAME || 'System',
      last_name: process.env.ADMIN_LAST_NAME || 'Administrator',
    })
    .select('id,email,role')
    .single();

  if (error) throw error;
  console.log(`Admin created: ${data.email}`);
}

createAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
