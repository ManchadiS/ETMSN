const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const method = req.method;
  const path = req.path; // relative to the mount point (e.g. /api/v1)

  // 1. Exclude root / health check / Swagger docs
  if (path === '/' || path === '' || path.startsWith('/docs')) {
    return next();
  }

  // 2. Exclude guest-facing customer endpoints (for ETFEO compatibility) and login/register
  const isPublic = (
    (method === 'GET' && path === '/restaurants') ||
    (method === 'GET' && path === '/food') ||
    (method === 'POST' && path === '/orders') ||
    (method === 'POST' && path === '/orders/verify-payment') ||
    (method === 'GET' && path.startsWith('/orders/')) ||
    (method === 'POST' && path === '/billing') ||
    (method === 'GET' && path === '/customers') ||
    (method === 'POST' && path === '/customers') ||
    (method === 'GET' && path === '/debug/email-status') ||
    (method === 'POST' && path === '/users/login') ||
    (method === 'POST' && path === '/users/register')
  );

  if (isPublic) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header with Bearer token is required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_tadka_token_key');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
