// backend/src/api/routes/publish.ts
// UPDATED: now checks for a connected social account (via /api/social-auth)
// and, if one exists, calls that platform's REAL publish() — a genuine
// HTTP request to graph.facebook.com / open.tiktokapis.com / googleapis.com.
// DISCLOSED: those hosts are outside this sandbox's network allowlist, so
// a connected-account publish attempt here will fail with a real network
// error, not a faked success — same honesty standard as socialAuth.ts.
// If no account is connected for the requested platform, falls back to the
// original local-only state transition (previous behavior, preserved).

import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../../db/index.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { metaClient } from '../../services/socialPlatforms/meta.js';
import { tiktokClient } from '../../services/socialPlatforms/tiktok.js';
import { youtubeClient } from '../../services/socialPlatforms/youtube.js';
import type { SocialPlatformClient } from '../../services/socialPlatforms/base.js';
import type { SocialPlatformKey } from '../../shared/types.js';

const router = Router();

const CLIENTS: Record<SocialPlatformKey, SocialPlatformClient> = {
  meta: metaClient,
  tiktok: tiktokClient,
  youtube: youtubeClient,
};

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['SCHEDULED', 'PUBLISHING'],
  SCHEDULED: ['PUBLISHING'],
  PUBLISHING: ['PUBLISHED', 'FAILED'],
};

function isValidPlatform(p: string): p is SocialPlatformKey {
  return p === 'meta' || p === 'tiktok' || p === 'youtube';
}

// POST /api/publish/:postId  body: { socialPlatform?: 'meta'|'tiktok'|'youtube' }
// If socialPlatform is given AND the authenticated user has that account
// connected, attempts a REAL publish call. Otherwise, local-only transition.
router.post('/:postId', requireAuth, asyncHandler(async (req, res) => {
  const post = db.posts.findById(req.params.postId);
  if (!post) { res.status(404).json({ success: false, error: 'Post not found' }); return; }
  if (post.userId !== req.userId) {
    res.status(403).json({ success: false, error: 'Not your post' });
    return;
  }

  const allowed = VALID_TRANSITIONS[post.status] ?? [];
  if (!allowed.includes('PUBLISHING') && post.status !== 'PUBLISHING') {
    res.status(409).json({ success: false, error: `Cannot publish from status ${post.status}` });
    return;
  }

  const { socialPlatform } = req.body as { socialPlatform?: string };

  if (socialPlatform && isValidPlatform(socialPlatform)) {
    const account = db.socialAccounts.find(req.userId!, socialPlatform);
    if (!account) {
      res.status(400).json({
        success: false,
        error: `No ${socialPlatform} account connected. Call GET /api/social-auth/${socialPlatform}/connect first.`,
      });
      return;
    }

    const result = await CLIENTS[socialPlatform].publish(account.accessToken, post.content);
    if (!result.success) {
      db.posts.update(post.id, { status: 'FAILED' });
      res.status(502).json({ success: false, error: result.error, note: 'Real publish attempt failed — see error for the exact platform response.' });
      return;
    }

    const updated = db.posts.update(post.id, {
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
    });
    res.json({ success: true, post: updated, platformPostId: result.platformPostId });
    return;
  }

  // No platform specified or no account connected for it — local-only transition.
  const updated = db.posts.update(post.id, {
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
  });
  res.json({
    success: true,
    post: updated,
    note: 'Local state transition only — pass socialPlatform with a connected account to attempt a real publish.',
  });
}));

export default router;
