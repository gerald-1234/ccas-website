const supabase = require('../config/supabase');

async function addAuditLog(userId, action, details = '') {
  const { error } = await supabase.from('audit_logs').insert({
    user_id: userId || null,
    action,
    details,
  });

  if (error) console.error('Audit log error:', error.message);
}

module.exports = addAuditLog;
