import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';

function cookieHeader(response) {
  const setCookie = response.headers['set-cookie'];
  const values = Array.isArray(setCookie) ? setCookie : [setCookie];
  return values
    .filter((value) => typeof value === 'string')
    .map((value) => value.split(';', 1)[0])
    .join('; ');
}

test('Better Auth uses ORM identities, bcrypt credentials, HttpOnly sessions, and canonical roles', { timeout: 60_000 }, async () => {
  delete process.env.PG_DATA_DIR;
  const previousOrigins = process.env.CORS_ORIGINS;
  const previousAuthUrl = process.env.BETTER_AUTH_URL;
  process.env.CORS_ORIGINS = 'http://localhost:3003';
  process.env.BETTER_AUTH_URL = 'http://localhost:5150';
  const app = await buildArsyApp({ enableLogging: false });

  try {
    const earlyRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/better/sign-up/email',
      headers: { origin: 'http://localhost:3003' },
      payload: {
        name: 'Early Member',
        email: 'early@example.test',
        password: 'early-password-2026',
      },
    });
    assert.ok(earlyRegistration.statusCode >= 400);

    const owner = await app.inject({
      method: 'POST',
      url: '/api/auth/onboarding',
      headers: { origin: 'http://localhost:3003' },
      payload: {
        name: 'Initial Owner',
        email: 'owner@example.test',
        password: 'owner-password-2026',
      },
    });
    assert.equal(owner.statusCode, 201);

    const legacyBrowserLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      headers: { origin: 'http://localhost:3003' },
      payload: { email: 'owner@example.test', password: 'owner-password-2026' },
    });
    assert.equal(legacyBrowserLogin.statusCode, 410);
    assert.equal('token' in legacyBrowserLogin.json(), false);

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/better/sign-in/email',
      headers: { origin: 'http://localhost:3003', 'x-device-name': 'Initial Setup Device' },
      payload: { email: 'owner@example.test', password: 'owner-password-2026' },
    });
    assert.equal(login.statusCode, 200, login.body);
    const loginBody = login.json();
    assert.doesNotMatch(JSON.stringify(loginBody), /"(token|sessionToken|session_token)"\s*:/);
    assert.match(cookieHeader(login), /session_token=/);
    assert.match(String(login.headers['set-cookie']), /HttpOnly/i);
    assert.match(String(login.headers['set-cookie']), /SameSite=Lax/i);

    const ownerCookie = cookieHeader(login);
    const ownerProfile = await app.inject({
      method: 'GET',
      url: '/api/auth/current',
      headers: { cookie: ownerCookie },
    });
    assert.equal(ownerProfile.statusCode, 200, ownerProfile.body);
    assert.equal(ownerProfile.json().data.role, 'superuser');

    const registration = await app.inject({
      method: 'POST',
      url: '/api/auth/better/sign-up/email',
      headers: { origin: 'http://localhost:3003' },
      payload: {
        name: 'Regular Member',
        email: 'member@example.test',
        password: 'member-password-2026',
      },
    });
    assert.equal(registration.statusCode, 200, registration.body);
    assert.doesNotMatch(JSON.stringify(registration.json()), /"(token|sessionToken|session_token)"\s*:/);
    const memberCookie = cookieHeader(registration);
    const memberProfile = await app.inject({
      method: 'GET',
      url: '/api/auth/current',
      headers: { cookie: memberCookie },
    });
    assert.equal(memberProfile.statusCode, 200, memberProfile.body);
    assert.equal(memberProfile.json().data.role, 'user');

    const { dbEngine } = await import('@allah/arsy-orm');
    const duplicateRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/better/sign-up/email',
      headers: { origin: 'http://localhost:3003' },
      payload: {
        name: 'Duplicate Member',
        email: 'member@example.test',
        password: 'member-password-2026',
      },
    });
    assert.ok(duplicateRegistration.statusCode >= 400);
    const identities = await dbEngine.query(`
      SELECT au."id", au."company_id", au."password_hash", ru."role", ru."company_id" AS orm_company_id,
             ru."create_uid", ru."write_uid", aa."provider_id"
      FROM "auth_user" au
      JOIN "res_users" ru ON ru."id" = au."res_user_id"
      JOIN "auth_account" aa ON aa."user_id" = au."id"
      ORDER BY au."email";
    `);
    assert.equal(identities.length, 2);
    assert.deepEqual(new Set(identities.map((identity) => identity.role)), new Set(['superuser', 'user']));
    const bots = await dbEngine.query(
      `SELECT "id" FROM "res_users" WHERE "system_key" = $1 AND "role" = $2;`,
      ['bot', 'system']
    );
    assert.equal(bots.length, 1);
    for (const identity of identities) {
      assert.equal(identity.company_id, identity.orm_company_id);
      assert.ok(Number(identity.company_id) < 0);
      assert.equal(identity.provider_id, 'credential');
      assert.equal(Number(identity.create_uid), Number(bots[0].id));
      assert.equal(Number(identity.write_uid), Number(bots[0].id));
      assert.match(identity.password_hash, /^\$2[aby]\$/);
    }
    const ownerSession = await dbEngine.query(
      `SELECT "device_name" FROM "auth_session" WHERE "user_id" = $1 ORDER BY "id" DESC LIMIT 1;`,
      [Number(ownerProfile.json().data.id)]
    );
    assert.equal(ownerSession[0]?.device_name, 'Initial Setup Device');

    const sessions = await app.inject({
      method: 'GET',
      url: '/api/auth/sessions',
      headers: { cookie: memberCookie },
    });
    assert.equal(sessions.statusCode, 200, sessions.body);
    const sessionId = sessions.json().data[0].id;
    const revoke = await app.inject({
      method: 'POST',
      url: '/api/auth/sessions/revoke',
      headers: { cookie: memberCookie },
      payload: { sessionId },
    });
    assert.equal(revoke.statusCode, 200);

    const revokedProfile = await app.inject({
      method: 'GET',
      url: '/api/auth/current',
      headers: { cookie: memberCookie },
    });
    assert.equal(revokedProfile.statusCode, 401);
  } finally {
    await app.close();
    if (previousOrigins === undefined) delete process.env.CORS_ORIGINS;
    else process.env.CORS_ORIGINS = previousOrigins;
    if (previousAuthUrl === undefined) delete process.env.BETTER_AUTH_URL;
    else process.env.BETTER_AUTH_URL = previousAuthUrl;
  }
});
