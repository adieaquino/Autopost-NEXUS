import { Router } from 'express';
import { computeEngagementRate } from '../../agents/analyticsAgent.js';
import { estimateRevenue } from '../../agents/monetizationAgent.js';
import { db } from '../../db/index.js';

const router = Router();

// POST /api/analytics/engagement/:postId — compute + return engagement rate for a post
router.post('/engagement/:postId', (req, res) => {
  const post = db.posts.findById(req.params.postId);
  if (!post) { res.status(404).json({ success: false, error: 'Post not found' }); return; }
  const { views, likes, comments, shares } = req.body as {
    views: number; likes: number; comments: number; shares: number;
  };
  const result = computeEngagementRate(post, views ?? 0, likes ?? 0, comments ?? 0, shares ?? 0);
  res.json({ success: true, result });
});

// GET /api/analytics/revenue/:postId?views=N
router.get('/revenue/:postId', (req, res) => {
  const post = db.posts.findById(req.params.postId);
  if (!post) { res.status(404).json({ success: false, error: 'Post not found' }); return; }
  const views = parseInt((req.query.views as string) ?? '1000', 10);
  const result = estimateRevenue(views);
  res.json({ success: true, result });
});

export default router;
