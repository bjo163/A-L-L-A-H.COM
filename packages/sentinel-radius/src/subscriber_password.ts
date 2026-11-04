import crypto from 'crypto';

const KEYLEN = 32;
const SALT_BYTES = 16;

export interface SubscriberPassword {
  /** scrypt digest, hex-encoded */
  hash: string;
  /** per-subscriber salt, hex-encoded */
  salt: string;
}

/**
 * Derive a scrypt hash for a subscriber password. Reuses the existing
 * `password_hash` / `password_salt` columns on `sentinel.account` so no new
 * dependency is required (scrypt ships with Node's crypto module).
 */
export function hashSubscriberPassword(password: string, saltHex?: string): SubscriberPassword {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(SALT_BYTES);
  const hash = crypto.scryptSync(password, salt, KEYLEN);
  return { hash: hash.toString('hex'), salt: salt.toString('hex') };
}

/**
 * Constant-time verification of a subscriber password against a stored
 * scrypt digest. Returns false (never throws) on malformed stored values.
 */
export function verifySubscriberPassword(password: string, hashHex: string, saltHex: string): boolean {
  if (!password || !hashHex || !saltHex) return false;
  try {
    const expected = Buffer.from(hashHex, 'hex');
    const salt = Buffer.from(saltHex, 'hex');
    if (expected.length !== KEYLEN || salt.length === 0) return false;
    const actual = crypto.scryptSync(password, salt, KEYLEN);
    return crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
