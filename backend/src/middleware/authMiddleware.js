import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is required (Bearer <token>)' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Invalid authorization format. Format must be: Bearer <token>' });
  }

  const token = parts[1];
  const secret = process.env.JWT_SECRET || 'visionpulse_fallback_secret_key_2026';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Session token expired or invalid', details: err.message });
    }
    req.user = user;
    next();
  });
};

