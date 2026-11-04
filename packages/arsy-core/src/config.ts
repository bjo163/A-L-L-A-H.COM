import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export class MissingSecretError extends Error {
  constructor(envVar: string) {
    super(`${envVar} is required when NODE_ENV=production.`);
    this.name = 'MissingSecretError';
  }
}

/**
 * Production secrets come from the environment only. Locally they are generated
 * once and kept under the data directory so a restart does not invalidate
 * already-issued tokens or already-encrypted rows.
 */
export function resolveLocalSecret(envVar: string, fileName: string): string {
  const fromEnv = process.env[envVar];
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv.trim();

  if (isProduction()) throw new MissingSecretError(envVar);

  const dir = path.resolve(process.env.ARSY_DATA_DIR || 'data', 'keys');
  const file = path.join(dir, fileName);
  if (fs.existsSync(file)) {
    const existing = fs.readFileSync(file, 'utf8').trim();
    if (existing.length > 0) return existing;
  }

  const generated = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, generated, { mode: 0o600 });
  return generated;
}
