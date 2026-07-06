// backend/src/services/auth/passwordService.ts
// Real salted scrypt hashing via Node's built-in crypto module — no
// external dependency needed, no fake/plaintext storage.

import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(plain, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, derivedHex] = stored.split(':');
  if (!salt || !derivedHex) return false;
  const derived = Buffer.from(derivedHex, 'hex');
  const candidate = scryptSync(plain, salt, KEY_LENGTH);
  if (candidate.length !== derived.length) return false;
  return timingSafeEqual(candidate, derived);
}
