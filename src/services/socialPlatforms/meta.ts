// backend/src/services/socialPlatforms/meta.ts
// Real Meta Graph API v19 OAuth + Page-post publishing. Requires a Meta for
// Developers app with the `pages_manage_posts` + `pages_read_engagement`
// permissions approved by Meta's App Review before it can post to a real
// Page (unapproved apps can only post to the developer's own test Pages).
// DISCLOSED: not live-tested — graph.facebook.com is outside this sandbox's
// network allowlist. Set META_APP_ID, META_APP_SECRET, META_REDIRECT_URI,
// META_PAGE_ID as real env vars to use this for real.

import type { SocialPlatformClient, TokenResponse, PublishResult } from './base.js';

const GRAPH_VERSION = 'v19.0';
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name} (see meta.ts header comment)`);
  return value;
}

export const metaClient: SocialPlatformClient = {
  getAuthorizationUrl(state: string): string {
    const appId = requireEnv('META_APP_ID');
    const redirectUri = requireEnv('META_REDIRECT_URI');
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      state,
      scope: 'pages_manage_posts,pages_read_engagement,pages_show_list',
      response_type: 'code',
    });
    return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string): Promise<TokenResponse> {
    const appId = requireEnv('META_APP_ID');
    const appSecret = requireEnv('META_APP_SECRET');
    const redirectUri = requireEnv('META_REDIRECT_URI');

    const params = new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    });

    const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Meta token exchange failed (${res.status}): ${body}`);
    }
    const json = await res.json() as { access_token: string; expires_in?: number };
    return { accessToken: json.access_token, expiresIn: json.expires_in };
  },

  async publish(accessToken: string, content: string): Promise<PublishResult> {
    const pageId = requireEnv('META_PAGE_ID');
    const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: content, access_token: accessToken }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Meta publish failed (${res.status}): ${body}` };
    }
    const json = await res.json() as { id: string };
    return { success: true, platformPostId: json.id };
  },
};
