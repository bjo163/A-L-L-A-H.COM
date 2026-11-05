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

const Parent = defineModel({
  name: 'test.fk.parent',
  tableName: 'test_fk_parent',
  fields: {
    name: fields.char({ required: true }),
  },
});

const ChildCascade = defineModel({
  name: 'test.fk.child.cascade',
  tableName: 'test_fk_child_cascade',
  fields: {
    name: fields.char({ required: true }),
    parent_id: fields.many2one('test.fk.parent', { required: true, ondelete: 'cascade' }),
  },
});

const ChildSetNull = defineModel({
  name: 'test.fk.child.setnull',
  tableName: 'test_fk_child_setnull',
  fields: {
    name: fields.char({ required: true }),
    parent_id: fields.many2one('test.fk.parent', { required: false, ondelete: 'set null' }),
  },
});

const ChildRestrict = defineModel({
  name: 'test.fk.child.restrict',
  tableName: 'test_fk_child_restrict',
  fields: {
    name: fields.char({ required: true }),
    parent_id: fields.many2one('test.fk.parent', { required: true, ondelete: 'restrict' }),
  },
});

async function createTestDatabase() {
  const engine = new PGliteEngine();
  await engine.connect();
  for (const model of [
    ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent,
    Parent, ChildCascade, ChildSetNull, ChildRestrict,
  ]) {
    modelRegistry.register(model, { overwrite: true });
  }
  await new SchemaMigrator(engine, modelRegistry).sync();
  return { engine };
}

test('many2one FK constraints', { timeout: 120_000 }, async (t) => {
  const { engine } = await createTestDatabase();
  const parentRepo = new BaseRepository(modelRegistry.get('test.fk.parent'), engine);
  const cascadeRepo = new BaseRepository(modelRegistry.get('test.fk.child.cascade'), engine);
  const setNullRepo = new BaseRepository(modelRegistry.get('test.fk.child.setnull'), engine);
  const restrictRepo = new BaseRepository(modelRegistry.get('test.fk.child.restrict'), engine);

  const scope = { companyId: 1 };
  const systemScope = { systemScope: true, companyId: 1 };
  const actor = SYSTEM_ACTOR;

  await t.test('rejects orphan many2one ID', async () => {
    await assert.rejects(
      async () => {
        await cascadeRepo.create({ name: 'Orphan', parent_id: 99999, company_id: 1 }, systemScope, actor);
      },
      /foreign key constraint|violates/i,
      'Should reject orphan parent_id'
    );
  });

  await t.test('ondelete cascade removes children', async () => {
    const parent = await parentRepo.create({ name: 'Parent 1', company_id: 1 }, systemScope, actor);
    const child1 = await cascadeRepo.create({ name: 'Child 1', parent_id: parent.id, company_id: 1 }, systemScope, actor);
    const child2 = await cascadeRepo.create({ name: 'Child 2', parent_id: parent.id, company_id: 1 }, systemScope, actor);

    await parentRepo.deleteById(parent.id, systemScope, actor);

    const remaining = await cascadeRepo.find({ scope: systemScope, filters: [{ field: 'id', operator: 'IN', value: [child1.id, child2.id] }] });
    assert.equal(remaining.length, 0, 'Cascade children should be deleted');
  });

  await t.test('ondelete set null nullifies children', async () => {
    const parent = await parentRepo.create({ name: 'Parent 2', company_id: 1 }, systemScope, actor);
    const child = await setNullRepo.create({ name: 'Child 3', parent_id: parent.id, company_id: 1 }, systemScope, actor);

    await parentRepo.deleteById(parent.id, systemScope, actor);

    const refreshed = await setNullRepo.findById(child.id, systemScope);
    assert.ok(refreshed, 'Child should still exist');
    assert.equal(refreshed.parent_id, null, 'parent_id should be null');
  });

  await t.test('ondelete restrict prevents parent deletion', async () => {
    const parent = await parentRepo.create({ name: 'Parent 3', company_id: 1 }, systemScope, actor);
    await restrictRepo.create({ name: 'Child 4', parent_id: parent.id, company_id: 1 }, systemScope, actor);

    await assert.rejects(
      async () => {
        await parentRepo.deleteById(parent.id, systemScope, actor);
      },
      /foreign key constraint|violates|restrict/i,
      'Should reject parent deletion with restrict children'
    );
  });

  await engine.close();
});
