import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SALT_LENGTH = 16;

let masterKey: Buffer | null = null;

function getMasterKey(): Buffer | null {
  if (masterKey !== null) return masterKey;

  const envKey = process.env.ARSY_MASTER_KEY;
  if (!envKey) {
    masterKey = null;
    return null;
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  masterKey = crypto.pbkdf2Sync(envKey, salt, 100000, KEY_LENGTH, 'sha256');
  return masterKey;
}

export function encryptSecret(plaintext: string): string | null {
  const key = getMasterKey();
  if (!key) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  const result = Buffer.concat([iv, encrypted, authTag]);
  return result.toString('base64');
}

export function decryptSecret(encryptedB64: string): string | null {
  const key = getMasterKey();
  if (!key) return null;

  try {
    const data = Buffer.from(encryptedB64, 'base64');

    if (data.length < IV_LENGTH + TAG_LENGTH) {
      return null;
    }

    const iv = data.subarray(0, IV_LENGTH);
    const authTag = data.subarray(data.length - TAG_LENGTH);
    const encrypted = data.subarray(IV_LENGTH, data.length - TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  } catch {
    return null;
  }
}

export function redactSecret(value: string): string {
  return '[REDACTED]';
}

export function isEncrypted(value: string): boolean {
  try {
    const data = Buffer.from(value, 'base64');
    return data.length >= IV_LENGTH + TAG_LENGTH;
  } catch {
    return false;
  }
}