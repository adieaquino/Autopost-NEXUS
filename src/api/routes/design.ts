import { Router } from 'express';
import { generateDesign } from '../../agents/designAgent.js';
import { selectMusic } from '../../agents/musicAgent.js';
import type { ContentMood } from '../../shared/types.js';

const router = Router();

// POST /api/design/generate — palette + font for a mood
router.post('/generate', (req, res) => {
  const { mood } = req.body as { mood: ContentMood };
  if (!mood) { res.status(400).json({ success: false, error: 'Required: mood' }); return; }
  const result = generateDesign(mood);
  res.json({ success: true, result });
});

// POST /api/design/music — background track suggestion for a mood
router.post('/music', (req, res) => {
  const { mood } = req.body as { mood: ContentMood };
  if (!mood) { res.status(400).json({ success: false, error: 'Required: mood' }); return; }
  const result = selectMusic(mood);
  res.json({ success: true, result });
});

export default router;
