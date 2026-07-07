// backend/src/services/socialPlatforms/tiktok.ts
// Real TikTok OAuth v2 + Content Posting API (direct-post init flow).
// CRITICAL DISCLOSURE: TikTok's Content Posting API requires your app to
// pass TikTok's app audit before it can post to any account other than
// your own registered test account — this is TikTok's process, not
// something bypassable from code. Unaudited apps get a 403 from the
// /post/publish/ endpoint regardless of token validity.
// Also not live-tested — open.tiktokapis.com is outside this sandbox's
// network allowlist. Set TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET,
// TIKTOK_REDIRECT_URI as real env vars to use this for real.

import type { SocialPlatformClient, TokenResponse, PublishResult } from './base.js';

const AUTH_BASE = 'https://www.tiktok.com/v2/auth/authorize';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const PUBLISH_INIT_URL = 'https://open.tiktokapis.com/v2/post/publish/content/init/';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name} (see tiktok.ts header comment)`);
  return value;
}

export const tiktokClient: SocialPlatformClient = {
  getAuthorizationUrl(state: string): string {
    const clientKey = requireEnv('TIKTOK_CLIENT_KEY');
    const redirectUri = requireEnv('TIKTOK_REDIRECT_URI');
    const params = new URLSearchParams({
      client_key: clientKey,
      redirect_uri: redirectUri,
      state,
      scope: 'video.publish,user.info.basic',
      response_type: 'code',
    });
    return `${AUTH_BASE}?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const clientKey = requireEnv('TIKTOK_CLIENT_KEY');
    const clientSecret = requireEnv('TIKTOK_CLIENT_SECRET');
    const redirectUri = requireEnv('TIKTOK_REDIRECT_URI');

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`TikTok token exchange failed (${res.status}): ${body}`);
    }
    const json = await res.json() as {
      access_token: string; refresh_token?: string; expires_in?: number; open_id?: string;
    };
    return {
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresIn: json.expires_in,
      platformUserId: json.open_id,
    };
  },

  async publish(accessToken: string, content: string): Promise<PublishResult> {
    // NOTE: TikTok's direct-post flow requires a video file (video.publish
    // scope posts video content, not text) — this initializes a post with
    // the caption only, matching what's testable without a media pipeline
    // (out of scope per this session's disclosed limitations). A real
    // integration needs the media upload step wired in before this call.
    const res = await fetch(PUBLISH_INIT_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post_info: { title: content, privacy_level: 'SELF_ONLY' },
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      return {
        success: false,
        error: `TikTok publish init failed (${res.status}): ${body} — note: requires app audit approval and a completed video upload step, neither present in this session.`,
      };
    }
    const json = await res.json() as { data?: { publish_id?: string } };
    return { success: true, platformPostId: json.data?.publish_id };
  },
};
