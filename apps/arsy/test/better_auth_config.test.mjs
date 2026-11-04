import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { authPlugin } from '@allah/arsy-plugin-auth';
import { dbEngine } from '@allah/arsy-orm';

const jwtSecret = 'test-jwt-secret-not-for-production-123';
const betterAuthSecret = 'test-better-auth-secret-not-for-prod-123';
const publicUrl = 'https://identity.example.test';
const trustedOrigins = ['https://id.example.test'];
const envKeys = ['NODE_ENV', 'BETTER_AUTH_SECRET', 'BETTER_AUTH_URL', 'CORS_ORIGINS', 'PG_DATA_DIR'];

test('Better Auth refuses production startup without required configuration', { timeout: 60_000 }, async () => {
  const previousEnvironment = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  const cases = [
    {
      authSecret: undefined,
      authUrl: publicUrl,
      trustedOrigins,
      message: 'distinct BETTER_AUTH_SECRET',
    },
    {
      authSecret: betterAuthSecret,
      authUrl: undefined,
      trustedOrigins,
      message: 'BETTER_AUTH_URL',
    },
    {
      authSecret: betterAuthSecret,
      authUrl: publicUrl,
      trustedOrigins: [],
      message: 'trusted browser origins',
    },
  ];

  try {
    delete process.env.PG_DATA_DIR;
    await dbEngine.connect();
    for (const configuration of cases) {
      process.env.NODE_ENV = 'production';
      if (configuration.authSecret === undefined) delete process.env.BETTER_AUTH_SECRET;
      else process.env.BETTER_AUTH_SECRET = configuration.authSecret;
      if (configuration.authUrl === undefined) delete process.env.BETTER_AUTH_URL;
      else process.env.BETTER_AUTH_URL = configuration.authUrl;
      process.env.CORS_ORIGINS = configuration.trustedOrigins.join(',');

      const app = Fastify({ logger: false });
      app.register(authPlugin, {
        secret: jwtSecret,
        trustedOrigins: configuration.trustedOrigins,
      });

      try {
        await assert.rejects(app.ready(), new RegExp(configuration.message));
      } finally {
        await app.close().catch((error) => {
          if (!String(error.message).includes(configuration.message)) throw error;
        });
      }
    }
  } finally {
    for (const [key, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
