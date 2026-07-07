import { Router } from 'express';
import { db } from '../../db/index.js';
import { hashPassword, verifyPassword } from '../../services/auth/passwordService.js';
import { createSessionToken } from '../../services/auth/tokenService.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

const router = Router();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { email, password, name } = req.body as { email: string; password: string; name?: string };
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Required: email, password' });
    return;
  }
  if (!EMAIL_PATTERN.test(email)) {
    res.status(400).json({ success: false, error: 'Invalid email format' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
    return;
  }
  if (db.users.findByEmail(email)) {
    res.status(409).json({ success: false, error: 'Email already registered' });
    return;
  }

  const passwordHash = hashPassword(password);
  const user = db.users.create({ email, passwordHash, name });
  const session = createSessionToken(user.id);

  res.status(201).json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Required: email, password' });
    return;
  }

  const user = db.users.findByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const session = createSessionToken(user.id);
  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    token: session.token,
    expiresAt: session.expiresAt,
  });
});

// GET /api/auth/me — requires a valid session token, proves the middleware works end to end
router.get('/me', requireAuth, (req, res) => {
  const user = db.users.findById(req.userId!);
  if (!user) { res.status(404).json({ success: false, error: 'User not found' }); return; }
  res.json({ success: true, user: { id: user.id, email: user.email, name: user.name } });
});

export default router;
