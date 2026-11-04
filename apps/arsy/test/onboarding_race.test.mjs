import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';

test('concurrent first-run requests create one superuser and closed setup is rate-limited', { timeout: 60_000 }, async () => {
  delete process.env.PG_DATA_DIR;
  const app = await buildArsyApp({ enableLogging: false });
  try {
    const credentials = [
      { name: 'First Owner', email: 'first-owner@example.test', password: 'first-owner-pw' },
      { name: 'Concurrent Owner', email: 'concurrent-owner@example.test', password: 'second-owner-pw' },
    ];
    const results = await Promise.all(
      credentials.map((payload) =>
        app.inject({ method: 'POST', url: '/api/auth/onboarding', payload })
      )
    );
    assert.deepEqual(results.map((result) => result.statusCode).sort(), [201, 409]);
    assert.equal(
      (await app.inject({ method: 'GET', url: '/api/auth/onboarding/status' })).json().data.available,
      false
    );

    for (let attempt = 0; attempt < 3; attempt++) {
      const closed = await app.inject({
        method: 'POST',
        url: '/api/auth/onboarding',
        payload: {
          name: `Closed Attempt ${attempt}`,
          email: `closed-${attempt}@example.test`,
          password: 'closed-attempt-pw',
        },
      });
      assert.equal(closed.statusCode, 409);
    }

    const limited = await app.inject({
      method: 'POST',
      url: '/api/auth/onboarding',
      payload: {
        name: 'Rate Limited Attempt',
        email: 'rate-limited@example.test',
        password: 'rate-limited-pw',
      },
    });
    assert.equal(limited.statusCode, 429);

    const { dbEngine } = await import('@allah/arsy-orm');
    const owners = await dbEngine.query(
      `SELECT "id" FROM "res_users" WHERE "role" = 'superuser';`
    );
    assert.equal(owners.length, 1);
  } finally {
    await app.close();
  }
});
