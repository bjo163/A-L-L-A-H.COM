import assert from 'node:assert/strict';
import test from 'node:test';

const [
  { PGliteEngine },
  { fields },
  { defineModel, SYSTEM_ACTOR },
  { SchemaMigrator },
  { BaseRepository },
  { modelRegistry },
  { ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent },
] = await Promise.all([
  import('../src/engine.ts'),
  import('../src/fields.ts'),
  import('../src/model.ts'),
  import('../src/migrator.ts'),
  import('../src/repository.ts'),
  import('../src/registry.ts'),
  import('../src/auth_models.ts'),
]);

const TestUniqueScope = defineModel({
  name: 'test.unique.scope',
  tableName: 'test_unique_scope',
  fields: {
    name: fields.char({ required: true }),
    code: fields.char({ unique: true, uniqueScope: 'company' }),
    global_code: fields.char({ unique: true }),
  },
});

async function createTestDatabase() {
  const engine = new PGliteEngine();
  await engine.connect();
  for (const model of [
    ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent, TestUniqueScope,
  ]) {
    modelRegistry.register(model, { overwrite: true });
  }
  await new SchemaMigrator(engine, modelRegistry).sync();
  return { engine };
}

test('uniqueScope per-company', { timeout: 120_000 }, async (t) => {
  const { engine } = await createTestDatabase();
  const repo = new BaseRepository(modelRegistry.get('test.unique.scope'), engine);

  const company1 = { companyId: 1 };
  const company2 = { companyId: 2 };
  const actor = SYSTEM_ACTOR;

  await t.test('per-company unique allows same value in different companies', async () => {
    const row1 = await repo.create({ name: 'Test 1', code: 'ABC', global_code: 'G1' }, company1, actor);
    assert.ok(row1.id, 'Row 1 created in company 1');

    const row2 = await repo.create({ name: 'Test 2', code: 'ABC', global_code: 'G2' }, company2, actor);
    assert.ok(row2.id, 'Row 2 created in company 2 with same code (per-company unique)');

    await repo.deleteById(row1.id, company1, actor);
    await repo.deleteById(row2.id, company2, actor);
  });

  await t.test('per-company unique rejects duplicate in same company', async () => {
    await repo.create({ name: 'Test 1', code: 'XYZ', global_code: 'G1' }, company1, actor);

    await assert.rejects(
      async () => {
        await repo.create({ name: 'Test 2', code: 'XYZ', global_code: 'G2' }, company1, actor);
      },
      /unique constraint|duplicate/i,
      'Should reject duplicate code in same company'
    );
  });

  await t.test('global unique rejects duplicate across companies', async () => {
    await repo.create({ name: 'Test 1', code: 'A1', global_code: 'GLOBAL1' }, company1, actor);

    await assert.rejects(
      async () => {
        await repo.create({ name: 'Test 2', code: 'A2', global_code: 'GLOBAL1' }, company2, actor);
      },
      /unique constraint|duplicate/i,
      'Should reject duplicate global_code across companies'
    );
  });

  await engine.close();
});
