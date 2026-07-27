const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(normalizeEmail(email));
}

function missingFields(body, fields) {
  return fields.filter((field) => {
    const value = body && body[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
}

function validatePassword(password) {
  const value = String(password || '');
  if (value.length < 8) return 'Password must be at least 8 characters.';
  if (value.length > 72) return 'Password must be at most 72 characters.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must contain at least one letter and one number.';
  }
  return null;
}

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(date || ''));
}

function timeToMinutes(time) {
  const [hours, minutes] = String(time).split(':').map(Number);
  return hours * 60 + minutes;
}

function getDayOfWeek(date) {
  const jsDay = new Date(`${date}T00:00:00Z`).getUTCDay();
  return jsDay === 0 ? 7 : jsDay;
}

function pageDetails(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  const from = (page - 1) * limit;
  return { page, limit, from, to: from + limit - 1 };
}

module.exports = {
  BLOOD_GROUPS,
  getDayOfWeek,
  isValidDate,
  isValidEmail,
  missingFields,
  normalizeEmail,
  pageDetails,
  timeToMinutes,
  validatePassword,
};
