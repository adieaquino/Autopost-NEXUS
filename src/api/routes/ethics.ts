import { Router } from 'express';
import { checkContent } from '../../agents/ethicsGuardianAgent.js';
import { db } from '../../db/index.js';

const router = Router();

// POST /api/ethics/check — screens a post's content, records violations
router.post('/check', (req, res) => {
  const { postId, content } = req.body as { postId: string; content: string };
  if (!postId || !content) {
    res.status(400).json({ success: false, error: 'Required: postId, content' });
    return;
  }
  const result = checkContent(postId, content);
  result.violations.forEach(v => db.ethicsViolations.add(postId, {
    category: v.category, severity: v.severity, description: v.description,
  }));
  res.json({ success: true, result });
});

// GET /api/ethics/violations/:postId
router.get('/violations/:postId', (req, res) => {
  const violations = db.ethicsViolations.findByPostId(req.params.postId);
  res.json({ success: true, violations });
});

export default router;
