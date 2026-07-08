import { Router, Request, Response, NextFunction } from 'express';
import { generatePost } from '../../agents/orchestrator.js';
import { db } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import type { ContentMood, Platform } from '../../shared/types.js';

const router = Router();

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
}

// POST /api/posts/generate — requires auth; runs the full 9-agent orchestrator, saves a DRAFT post
// owned by the authenticated user (req.userId from the verified session token,
// not a client-supplied body field — closes the "trust body.userId" gap).
router.post('/generate', requireAuth, asyncHandler(async (req, res) => {
  const { topic, mood, platform } = req.body as {
    topic: string; mood: ContentMood; platform: Platform;
  };
  if (!topic || !mood || !platform) {
    res.status(400).json({ success: false, error: 'Required: topic, mood, platform' });
    return;
  }

  const result = generatePost({ topic, mood, platform });

  const post = db.posts.create({
    userId: req.userId!,
    platform,
    content: result.caption,
    hashtags: result.hashtags,
    omegaScore: result.omegaScore,
    status: 'DRAFT',
  });

  res.status(201).json({ success: true, post, orchestration: result });
}));

// GET /api/posts/mine — requires auth; lists the authenticated user's own posts
router.get('/mine', requireAuth, (req, res) => {
  const posts = db.posts.findByUserId(req.userId!);
  res.json({ success: true, posts });
});

// GET /api/posts/detail/:id — single post (not owner-restricted; post IDs are opaque UUIDs)
router.get('/detail/:id', (req, res) => {
  const post = db.posts.findById(req.params.id);
  if (!post) { res.status(404).json({ success: false, error: 'Post not found' }); return; }
  res.json({ success: true, post });
});

export default router;
