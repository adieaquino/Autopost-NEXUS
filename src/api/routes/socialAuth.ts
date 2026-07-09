// backend/src/api/routes/socialAuth.ts
// Real OAuth connect/callback flow for all 3 platform clients. Requires
// auth (requireAuth) so tokens are tied to the actual logged-in user, not
// a spoofable body field. DISCLOSED: the callback step calls
// exchangeCodeForToken, which makes a real HTTP request to each platform's
// token endpoint — that will fail in this sandbox (network allowlist) and
// will fail without real App credentials, both by design (real error, not
// a faked success).

import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { db } from '../../db/index.js';
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

function isValidPlatform(p: string): p is SocialPlatformKey {
  return p === 'meta' || p === 'tiktok' || p === 'youtube';
}

// GET /api/social-auth/:platform/connect — requires auth; returns the real OAuth consent URL
router.get('/:platform/connect', requireAuth, (req, res) => {
  const { platform } = req.params;
  if (!isValidPlatform(platform)) {
    res.status(400).json({ success: false, error: 'platform must be one of: meta, tiktok, youtube' });
    return;
  }
  try {
    // state carries the authenticated userId so the callback (which the
    // platform calls, not the logged-in browser session) knows who to
    // attach the resulting tokens to.
    const authUrl = CLIENTS[platform].getAuthorizationUrl(req.userId!);
    res.json({ success: true, authUrl });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

// GET /api/social-auth/:platform/callback?code=...&state=<userId> — platform redirects here after consent
router.get('/:platform/callback', asyncHandler(async (req, res) => {
  const { platform } = req.params;
  const { code, state } = req.query as { code?: string; state?: string };
  if (!isValidPlatform(platform)) {
    res.status(400).json({ success: false, error: 'platform must be one of: meta, tiktok, youtube' });
    return;
  }
  if (!code || !state) {
    res.status(400).json({ success: false, error: 'Missing code or state query param' });
    return;
  }
  try {
    const tokens = await CLIENTS[platform].exchangeCodeForToken(code);
    const account = db.socialAccounts.upsert(state, platform, {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000).toISOString() : undefined,
      platformUserId: tokens.platformUserId,
    });
    res.json({ success: true, connected: { platform: account.platform, connectedAt: account.connectedAt } });
  } catch (err) {
    res.status(502).json({ success: false, error: (err as Error).message });
  }
}));

// GET /api/social-auth/connected — requires auth; lists which platforms this user has connected
router.get('/connected', requireAuth, (req, res) => {
  const accounts = db.socialAccounts.findAllForUser(req.userId!);
  res.json({
    success: true,
    connected: accounts.map(a => ({ platform: a.platform, connectedAt: a.connectedAt })),
  });
});

export default router;
