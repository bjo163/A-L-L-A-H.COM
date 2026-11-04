import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

test('persistent startup backfills legacy credentials with bot audit UIDs idempotently', { timeout: 60_000 }, async () => {
  const dataDir = mkdtempSync(join(tmpdir(), 'mw-ba-auth-rehearsal-'));
  const environment = ['PG_DATA_DIR', 'NODE_ENV', 'BETTER_AUTH_URL', 'CORS_ORIGINS', 'GATEWAY_VIRTUAL_KEY'];
  const previousEnvironment = new Map(environment.map((key) => [key, process.env[key]]));
  process.env.PG_DATA_DIR = dataDir;
  process.env.NODE_ENV = 'test';
  process.env.BETTER_AUTH_URL = 'http://localhost:5150';
  process.env.CORS_ORIGINS = 'http://localhost:3003';
  process.env.GATEWAY_VIRTUAL_KEY = 'x'.repeat(64);

  let app;
  let orm;
  try {
    const [{ buildArsyApp }, loadedOrm] = await Promise.all([
      import('../src/app.ts'),
      import('@allah/arsy-orm'),
    ]);
    orm = loadedOrm;

    app = await buildArsyApp({ enableLogging: false });
    const bots = await orm.dbEngine.query(
      `SELECT "id" FROM "res_users" WHERE "system_key" = $1 AND "role" = $2;`,
      ['bot', 'system']
    );
    assert.equal(bots.length, 1);

    const resUsers = new orm.BaseRepository(orm.modelRegistry.get('res.users'), orm.dbEngine);
    const authUsers = new orm.BaseRepository(orm.modelRegistry.get('auth.user'), orm.dbEngine);
    const legacyOrmUser = await resUsers.create(
      {
        company_id: 0,
        name: 'Legacy Rehearsal User',
        email: 'legacy-rehearsal@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true, companyId: 0 },
      orm.SYSTEM_ACTOR
    );
    const ormUserId = Number(legacyOrmUser.id);
    const legacyAuthUser = await authUsers.create(
      {
        company_id: 0,
        res_user_id: ormUserId,
        email: 'legacy-rehearsal@example.test',
        password_hash: 'legacy-bcrypt-hash',
        name: 'Legacy Rehearsal User',
        status: 'active',
      },
      { systemScope: true, companyId: 0 },
      orm.SYSTEM_ACTOR
    );
    const authUserId = Number(legacyAuthUser.id);
    const tenantId = -authUserId;
    await resUsers.updateById(
      ormUserId,
      { company_id: tenantId, api_key: `legacy-rehearsal-${authUserId}` },
      { systemScope: true, companyId: 0 },
      orm.SYSTEM_ACTOR,
      { company_id: 0 }
    );
    await authUsers.updateById(
      authUserId,
      { company_id: tenantId },
      { systemScope: true, companyId: 0 },
      orm.SYSTEM_ACTOR,
      { company_id: 0 }
    );
    await orm.dbEngine.query(
      `DELETE FROM "arsy_schema_migrations" WHERE "name" = $1;`,
      ['auth-better-auth-account-v1']
    );

    await app.close();
    app = undefined;
    await orm.dbEngine.close();

    app = await buildArsyApp({ enableLogging: false });
    const backfilled = await orm.dbEngine.query(
      `SELECT "password", "create_uid", "write_uid" FROM "auth_account"
       WHERE "user_id" = $1 AND "provider_id" = $2;`,
      [authUserId, 'credential']
    );
    assert.equal(backfilled.length, 1);
    assert.equal(backfilled[0].password, 'legacy-bcrypt-hash');
    assert.equal(Number(backfilled[0].create_uid), Number(bots[0].id));
    assert.equal(Number(backfilled[0].write_uid), Number(bots[0].id));

    await app.close();
    app = undefined;
    await orm.dbEngine.close();

    app = await buildArsyApp({ enableLogging: false });
    const repeatedBackfill = await orm.dbEngine.query(
      `SELECT "id" FROM "auth_account" WHERE "user_id" = $1 AND "provider_id" = $2;`,
      [authUserId, 'credential']
    );
    assert.equal(repeatedBackfill.length, 1);
  } finally {
    if (app) await app.close();
    if (orm) await orm.dbEngine.close();
    rmSync(dataDir, { recursive: true, force: true });
    for (const [key, value] of previousEnvironment) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
