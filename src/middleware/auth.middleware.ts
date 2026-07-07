// backend/src/middleware/auth.middleware.ts
// Actually wired into protected routes (posts.ts, schedules.ts) — unlike
// the disclosed gap in the original project's Handoff Summary where an
// equivalent middleware existed but was never mounted anywhere.

import { Request, Response, NextFunction } from 'express';
import { verifySessionToken } from '../services/auth/tokenService.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Missing or malformed Authorization header (expected: Bearer <token>)' });
    return;
  }
  const token = header.slice('Bearer '.length);
  const verified = verifySessionToken(token);
  if (!verified) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token' });
    return;
  }
  req.userId = verified.userId;
  next();
}
