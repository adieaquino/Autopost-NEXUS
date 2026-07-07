// backend/src/services/auth/tokenService.ts
// Real HMAC-SHA256 signed tokens (JWT-equivalent trust model, no external
// jsonwebtoken dependency). DISCLOSED: SESSION_SECRET falls back to a
// dev-only constant if the env var isn't set — fine for this sandbox,
// must be set via real secret management in any real deployment.

import { createHmac, timingSafeEqual } from 'crypto';

const SECRET = process.env.SESSION_SECRET ?? 'dev-only-insecure-secret-change-in-production';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface TokenPayload {
  userId: string;
  exp: number; // epoch ms
}

function sign(data: string): string {
  return createHmac('sha256', SECRET).update(data).digest('hex');
}

export function createSessionToken(userId: string): { token: string; expiresAt: string } {
  const payload: TokenPayload = { userId, exp: Date.now() + SESSION_TTL_MS };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadB64);
  const token = `${payloadB64}.${signature}`;
  return { token, expiresAt: new Date(payload.exp).toISOString() };
}

export function verifySessionToken(token: string): { userId: string } | null {
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return null;

  const expectedSig = sign(payloadB64);
  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return null; // tampered or forged
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (Date.now() > payload.exp) return null; // expired
  return { userId: payload.userId };
}
