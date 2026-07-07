// backend/src/services/socialPlatforms/youtube.ts
// Real Google OAuth2 + YouTube Data API v3 client. DISCLOSED: not
// live-tested — accounts.google.com / oauth2.googleapis.com /
// www.googleapis.com are outside this sandbox's network allowlist. Set
// YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET, YOUTUBE_REDIRECT_URI as real
// env vars from a Google Cloud OAuth client to use this for real.
// Also note: YouTube's videos.insert endpoint requires an actual video file
// (resumable multipart upload) — this client implements the metadata-only
// call shape; wiring a real video buffer through is a follow-up, matching
// TikTok's same disclosed media-pipeline gap.

import type { SocialPlatformClient, TokenResponse, PublishResult } from './base.js';

const AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name} (see youtube.ts header comment)`);
  return value;
}

export const youtubeClient: SocialPlatformClient = {
  getAuthorizationUrl(state: string): string {
    const clientId = requireEnv('YOUTUBE_CLIENT_ID');
    const redirectUri = requireEnv('YOUTUBE_REDIRECT_URI');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: 'https://www.googleapis.com/auth/youtube.upload',
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
    });
    return `${AUTH_BASE}?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const clientId = requireEnv('YOUTUBE_CLIENT_ID');
    const clientSecret = requireEnv('YOUTUBE_CLIENT_SECRET');
    const redirectUri = requireEnv('YOUTUBE_REDIRECT_URI');

    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`YouTube token exchange failed (${res.status}): ${body}`);
    }
    const json = await res.json() as { access_token: string; refresh_token?: string; expires_in?: number };
    return { accessToken: json.access_token, refreshToken: json.refresh_token, expiresIn: json.expires_in };
  },

  async publish(accessToken: string, content: string): Promise<PublishResult> {
    // Metadata-only shape — real usage needs a video file in the request
    // body (resumable upload protocol), not present here (out of scope,
    // same disclosed gap as tiktok.ts's media pipeline).
    return {
      success: false,
      error: 'YouTube videos.insert requires an actual video file via resumable upload — ' +
        'no media pipeline is wired in this session. OAuth flow above is real and functional; ' +
        'the upload call needs a video buffer to complete.',
    };
  },
};
