import crypto from 'crypto';
import { resolveLocalSecret } from '@allah/arsy-core';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;

// Envelope layout: version (1) ‖ KDF salt (16) ‖ IV (12) ‖ auth tag (16) ‖ ciphertext.
// The salt lives inside the envelope so the derived key can be rebuilt on any read.
const ENVELOPE_VERSION = 1;
const HEADER_LENGTH = 1 + SALT_LENGTH + IV_LENGTH + TAG_LENGTH;

export class SecretEncryptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecretEncryptionError';
  }
}

export function isEncrypted(value: string): boolean {
  if (typeof value !== 'string' || value.length === 0) return false;
  let decoded: Buffer;
  try {
    decoded = Buffer.from(value, 'base64');
  } catch {
    return false;
  }
  if (decoded.length <= HEADER_LENGTH) return false;
  return decoded[0] === ENVELOPE_VERSION;
}

function deriveKey(salt: Buffer, masterSecret: string): Buffer {
  return crypto.pbkdf2Sync(masterSecret, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
}

function masterSecret(): string {
  return resolveLocalSecret('ARSY_MASTER_KEY', 'master.key');
}

export function encryptSecret(plaintext: string): string {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new SecretEncryptionError('Cannot encrypt an empty secret.');
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, deriveKey(salt, masterSecret()), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([Buffer.from([ENVELOPE_VERSION]), salt, iv, authTag, ciphertext]).toString('base64');
}

export function decryptSecret(stored: string): string {
  if (!isEncrypted(stored)) {
    throw new SecretEncryptionError('Stored secret is not a recognised encrypted envelope.');
  }

  const decoded = Buffer.from(stored, 'base64');
  const salt = decoded.subarray(1, 1 + SALT_LENGTH);
  const iv = decoded.subarray(1 + SALT_LENGTH, 1 + SALT_LENGTH + IV_LENGTH);
  const authTag = decoded.subarray(1 + SALT_LENGTH + IV_LENGTH, HEADER_LENGTH);
  const ciphertext = decoded.subarray(HEADER_LENGTH);

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, deriveKey(salt, masterSecret()), iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  } catch {
    throw new SecretEncryptionError('Secret failed authentication check; wrong master key or tampered envelope.');
  }
}

export function redactSecret(_value: string): string {
  return '[REDACTED]';
}
