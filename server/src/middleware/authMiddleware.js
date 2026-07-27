const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const { data: user, error } = await supabase
      .from('users')
      .select('id,email,role,first_name,last_name,phone,is_active')
      .eq('id', payload.id)
      .maybeSingle();

    if (error) throw error;
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'This account is not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = authMiddleware;
