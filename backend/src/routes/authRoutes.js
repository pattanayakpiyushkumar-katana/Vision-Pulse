import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { registerSchema, loginSchema } from '../validators/schemas.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'visionpulse_fallback_secret_key_2026';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      organization: user.organization
    },
    secret,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { full_name, organization, role, email, password } = validatedData;

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const insertRes = await db.query(
      `INSERT INTO users (full_name, organization, role, email, password_hash)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, organization, role, email, created_at`,
      [full_name, organization, role, email.toLowerCase(), password_hash]
    );

    const user = insertRes.rows[0];
    const token = generateToken(user);

    res.status(201).json({
      message: 'Account successfully registered on VisionPulse Backend',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const userRes = await db.query(
      `SELECT id, full_name, organization, role, email, password_hash, created_at
       FROM users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    const user = userRes.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email address or password' });
    }

    const { password_hash, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      message: 'Authentication successful',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userRes = await db.query(
      `SELECT id, full_name, organization, role, email, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User account not found' });
    }

    res.json({ user: userRes.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;

