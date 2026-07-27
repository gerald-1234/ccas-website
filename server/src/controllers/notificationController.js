const supabase = require('../config/supabase');
const { pageDetails } = require('../utils/helpers');

async function listNotifications(req, res) {
  const { page, limit, from, to } = pageDetails(req.query);
  const { data, count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', req.user.id)
    .lte('show_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return res.status(500).json({ error: 'Could not load notifications.' });
  return res.json({ notifications: data, pagination: { page, limit, total: count || 0 } });
}

async function markAsRead(req, res) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .select()
    .maybeSingle();

  if (error) return res.status(500).json({ error: 'Could not update the notification.' });
  if (!data) return res.status(404).json({ error: 'Notification not found.' });

  return res.json({ message: 'Notification marked as read.', notification: data });
}

module.exports = { listNotifications, markAsRead };
