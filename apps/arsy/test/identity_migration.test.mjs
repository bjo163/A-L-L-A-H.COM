import assert from 'node:assert/strict';
import test from 'node:test';
import { migrateAuthIdentities } from '../../../packages/arsy-plugin-auth/src/bootstrap.ts';

const {
  AuditEvent,
  AuthSession,
  AuthSetup,
  AuthUser,
  AuthVerification,
  BaseRepository,
  ModelRegistry,
  PGliteEngine,
  ResUsers,
  SchemaMigrator,
  SYSTEM_ACTOR,
} = await import('@allah/arsy-orm');

test('legacy auth identities link deterministically and fail closed on mismatches', { timeout: 60_000 }, async () => {
  const engine = new PGliteEngine();
  await engine.connect();
  const registry = new ModelRegistry();
  for (const model of [ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent]) {
    registry.register(model);
  }

  try {
    await new SchemaMigrator(engine, registry).sync();
    const userRepository = new BaseRepository(ResUsers, engine);
    const linkedIdentity = await userRepository.create(
      {
        company_id: -101,
        name: 'Linked User',
        email: 'linked@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const emailIdentity = await userRepository.create(
      {
        company_id: -102,
        name: 'Email Match',
        email: 'email-match@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );
    const mismatchIdentity = await userRepository.create(
      {
        company_id: -104,
        name: 'Different Identity',
        email: 'different@example.test',
        password: '[MANAGED_BY_AUTH_USER]',
        role: 'user',
      },
      { systemScope: true },
      SYSTEM_ACTOR
    );

    await engine.exec(`ALTER TABLE "auth_user" ALTER COLUMN "res_user_id" DROP NOT NULL;`);
    const legacyAccounts = await engine.query(
      `INSERT INTO "auth_user" ("company_id", "res_user_id", "email", "password_hash", "name", "status")
       VALUES
         (-101, $1, 'linked@example.test', 'legacy-hash-1', 'Linked User', 'active'),
         (-102, NULL, 'email-match@example.test', 'legacy-hash-2', 'Email Match', 'active'),
         (-103, NULL, 'new@example.test', 'legacy-hash-3', 'New Identity', 'active')
       RETURNING "id", "email";`,
      [linkedIdentity.id]
    );
    const botRows = await engine.query(
      `SELECT "id" FROM "res_users" WHERE "system_key" = $1;`,
      ['bot']
    );

    await engine.transaction((executor) =>
      migrateAuthIdentities(engine, registry, executor, Number(botRows[0].id))
    );

    const linked = await engine.query(
      `SELECT "id", "res_user_id" FROM "auth_user" WHERE "email" = $1;`,
      ['linked@example.test']
    );
    const matchedByEmail = await engine.query(
      `SELECT "id", "res_user_id" FROM "auth_user" WHERE "email" = $1;`,
      ['email-match@example.test']
    );
    const createdIdentity = await engine.query(
      `SELECT "id", "res_user_id" FROM "auth_user" WHERE "email" = $1;`,
      ['new@example.test']
    );
    assert.equal(Number(linked[0].res_user_id), Number(linkedIdentity.id));
    assert.equal(Number(matchedByEmail[0].res_user_id), Number(emailIdentity.id));
    assert.ok(Number(createdIdentity[0].res_user_id) > 0);

    const mismatch = await engine.query(
      `INSERT INTO "auth_user" ("company_id", "res_user_id", "email", "password_hash", "name", "status")
       VALUES (-104, $1, 'mismatch@example.test', 'legacy-hash-4', 'Mismatch', 'active')
       RETURNING "id";`,
      [mismatchIdentity.id]
    );
    await assert.rejects(
      engine.transaction((executor) =>
        migrateAuthIdentities(engine, registry, executor, Number(botRows[0].id))
      ),
      /linked to a different ORM identity/
    );
    const mismatchRow = await engine.query(
      `SELECT "id", "res_user_id" FROM "auth_user" WHERE "id" = $1;`,
      [mismatch[0].id]
    );
    assert.equal(Number(mismatchRow[0].res_user_id), Number(mismatchIdentity.id));
    assert.equal(legacyAccounts.length, 3);
  } finally {
    await engine.close();
  }
});
