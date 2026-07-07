// backend/src/services/socialPlatforms/base.ts
// Shared contract for platform OAuth + publishing clients. Each platform
// implementation makes REAL HTTP calls to the real OAuth/API endpoints
// documented by that platform. DISCLOSED: this sandbox's network allowlist
// does not include graph.facebook.com, open.tiktokapis.com, or Google's
// OAuth/API domains, so these calls cannot be live-tested from here. They
// are written to match each platform's real, current API contract and will
// function once run somewhere with network access to those hosts and real
// App credentials — but that combination doesn't exist in this session.

export interface TokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; // seconds
  platformUserId?: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
}

export interface SocialPlatformClient {
  /** Build the URL the user is redirected to for OAuth consent. */
  getAuthorizationUrl(state: string): string;
  /** Exchange the callback's authorization code for real tokens. */
  exchangeCodeForToken(code: string): Promise<TokenResponse>;
  /** Publish text/media content using a stored access token. */
  publish(accessToken: string, content: string): Promise<PublishResult>;
}
