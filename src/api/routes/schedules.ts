import { Router } from 'express';
import { db } from '../../db/index.js';
import { recommendPostTime } from '../../agents/schedulerAgent.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import type { Platform } from '../../shared/types.js';

const router = Router();

// POST /api/schedules — requires auth; creates a schedule owned by the authenticated user
router.post('/', requireAuth, (req, res) => {
  const { platform, frequency, time } = req.body as {
    platform: Platform; frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'CUSTOM'; time?: string;
  };
  if (!platform || !frequency) {
    res.status(400).json({ success: false, error: 'Required: platform, frequency' });
    return;
  }
  const resolvedTime = time ?? recommendPostTime(platform).data.time;
  const schedule = db.schedules.create({ userId: req.userId!, platform, frequency, time: resolvedTime });
  res.status(201).json({ success: true, schedule });
});

// GET /api/schedules/mine — requires auth; lists the authenticated user's own schedules
router.get('/mine', requireAuth, (req, res) => {
  const schedules = db.schedules.findByUserId(req.userId!);
  res.json({ success: true, schedules });
});

export default router;
