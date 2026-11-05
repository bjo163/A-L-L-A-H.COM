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
  {
    resolveAclMode,
    composeRuleDomain,
    AccessDeniedError,
  },
] = await Promise.all([
  import('../src/engine.ts'),
  import('../src/fields.ts'),
  import('../src/model.ts'),
  import('../src/migrator.ts'),
  import('../src/repository.ts'),
  import('../src/registry.ts'),
  import('../src/auth_models.ts'),
  import('../src/access.ts'),
]);

// Local mirrors of the ir.model.access / ir.rule tables so the repository's raw
// SQL (`FROM "ir_model_access"`, `FROM "ir_rule"`) has columns to read against
// without pulling the addons/base package into an ORM-unit test.
const IrModelAccess = defineModel({
  name: 'ir.model.access',
  tableName: 'ir_model_access',
  fields: {
    model_name: fields.char({ size: 255, required: true }),
    group_id: fields.integer({ required: true }),
    perm_read: fields.boolean({ default: true }),
    perm_write: fields.boolean({ default: false }),
    perm_create: fields.boolean({ default: false }),
    perm_unlink: fields.boolean({ default: false }),
  },
});

const IrRule = defineModel({
  name: 'ir.rule',
  tableName: 'ir_rule',
  fields: {
    name: fields.char({ size: 255, required: true }),
    model_name: fields.char({ size: 255, required: true }),
    domain_force: fields.text({ required: true }),
    group_ids: fields.json(),
    global: fields.boolean({ default: false }),
    perm_read: fields.boolean({ default: true }),
    perm_write: fields.boolean({ default: true }),
    perm_create: fields.boolean({ default: true }),
    perm_unlink: fields.boolean({ default: true }),
  },
});

const Task = defineModel({
  name: 'test.acl.task',
  tableName: 'test_acl_task',
  fields: {
    name: fields.char({ required: true }),
    state: fields.char({ required: true }),
  },
});

async function setup(registered) {
  const engine = new PGliteEngine();
  await engine.connect();
  const all = [
    ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent,
    IrModelAccess, IrRule, ...registered,
  ];
  for (const model of all) modelRegistry.register(model, { overwrite: true });
  await new SchemaMigrator(engine, modelRegistry).sync();
  return { engine };
}

// ---- Pure record-rule compilation (no DB) --------------------------------

test('resolveAclMode reads the env flag and fails safe', () => {
  assert.equal(resolveAclMode({}), 'audit');
  assert.equal(resolveAclMode({ ARSY_ACL_MODE: 'off' }), 'off');
  assert.equal(resolveAclMode({ ARSY_ACL_MODE: 'ENFORCE' }), 'enforce');
  // Unknown values never escalate to enforce.
  assert.equal(resolveAclMode({ ARSY_ACL_MODE: 'garbage' }), 'audit');
});

test('composeRuleDomain applies Odoo global/role semantics', () => {
  const globalA = { name: 'gA', domain_force: '["company_id","=",1]', group_ids: [], global: true };
  const globalB = { name: 'gB', domain_force: '["state","=","done"]', group_ids: [], global: true };
  const roleX = { name: 'rX', domain_force: '["owner","=","alice"]', group_ids: [7], global: false };
  const roleY = { name: 'rY', domain_force: '["owner","=","bob"]', group_ids: [8], global: false };

  // No rules -> no narrowing.
  assert.equal(composeRuleDomain([], []), null);

  // Globals AND together.
  assert.deepEqual(
    composeRuleDomain([globalA, globalB], []),
    ['&', ['company_id', '=', 1], ['state', '=', 'done']]
  );

  // Role rules the principal matches OR together, then AND onto the globals.
  assert.deepEqual(
    composeRuleDomain([globalA, roleX, roleY], [7, 8]),
    ['&', ['company_id', '=', 1], ['|', ['owner', '=', 'alice'], ['owner', '=', 'bob']]]
  );

  // A role rule whose group the principal does NOT hold is dropped entirely.
  assert.deepEqual(composeRuleDomain([globalA, roleX], [99]), ['company_id', '=', 1]);
});

test('composeRuleDomain fails closed on a malformed rule', () => {
  const bad = { name: 'broken', domain_force: '{not json', group_ids: [], global: true };
  assert.throws(() => composeRuleDomain([bad], []), /invalid domain_force JSON/);

  const wrongArity = { name: 'bad-arity', domain_force: '["state","=","done","extra"]', group_ids: [], global: true };
  assert.throws(() => composeRuleDomain([wrongArity], []), /not a valid prefix domain/);
});

// ---- ACL enforcement through the write path ------------------------------

test('ACL modes: default-deny throws in enforce, proceeds in audit', { timeout: 120_000 }, async (t) => {
  const { engine } = await setup([Task]);
  const taskRepo = new BaseRepository(modelRegistry.get('test.acl.task'), engine);
  const accessRepo = new BaseRepository(modelRegistry.get('ir.model.access'), engine);
  const userRepo = new BaseRepository(modelRegistry.get('res.users'), engine);

  const scope = { systemScope: true, companyId: 1 };
  // A real res.users row is required because the audit trigger FKs actor_uid.
  const human = await userRepo.create(
    { company_id: 1, name: 'Actor', email: 'acl@test.invalid', password: 'x', role: 'user' },
    scope,
    SYSTEM_ACTOR
  );
  const actor = { type: 'user', userId: Number(human.id), groupIds: [] };

  await t.test('audit mode allows the write and does not throw', async () => {
    process.env.ARSY_ACL_MODE = 'audit';
    await assert.doesNotReject(async () => {
      await taskRepo.create({ name: 'T', state: 'draft', company_id: 1 }, { companyId: 1 }, actor);
    });
  });

  await t.test('enforce mode with no grant throws AccessDeniedError', async () => {
    process.env.ARSY_ACL_MODE = 'enforce';
    await assert.rejects(
      async () => {
        await taskRepo.create({ name: 'T2', state: 'draft', company_id: 1 }, { companyId: 1 }, actor);
      },
      (err) => err instanceof AccessDeniedError && err.model === 'test.acl.task' && err.operation === 'create'
    );
  });

  await t.test('enforce mode honors a base grant for the requested perm', async () => {
    await accessRepo.create(
      { model_name: 'test.acl.task', group_id: 0, perm_read: true, perm_write: false, perm_create: true, perm_unlink: false, company_id: 1 },
      scope,
      SYSTEM_ACTOR
    );
    // create is granted -> succeeds; delete (unlink) is not -> denied.
    await assert.doesNotReject(async () => {
      await taskRepo.create({ name: 'T3', state: 'draft', company_id: 1 }, { companyId: 1 }, actor);
    });
    await assert.rejects(
      async () => {
        await taskRepo.deleteById(1, { companyId: 1 }, actor);
      },
      AccessDeniedError
    );
  });

  await t.test('system actor bypasses ACL even in enforce mode', async () => {
    await assert.doesNotReject(async () => {
      await taskRepo.create({ name: 'sys', state: 'draft', company_id: 1 }, { companyId: 1 }, SYSTEM_ACTOR);
    });
  });

  await t.test('globalAccess actor bypasses ACL', async () => {
    const adminActor = { type: 'user', userId: Number(human.id), globalAccess: true, groupIds: [] };
    await assert.doesNotReject(async () => {
      await taskRepo.deleteById(1, { companyId: 1 }, adminActor);
    });
  });

  delete process.env.ARSY_ACL_MODE;
  await engine.close();
});

// ---- Record-rule compilation through the read path -----------------------

test('resolveSecurityDomain narrows reads via QueryOptions.securityDomain', { timeout: 120_000 }, async (t) => {
  const { engine } = await setup([Task]);
  const taskRepo = new BaseRepository(modelRegistry.get('test.acl.task'), engine);
  const ruleRepo = new BaseRepository(modelRegistry.get('ir.rule'), engine);

  const sysScope = { systemScope: true, companyId: 1 };
  await taskRepo.create({ name: 'a', state: 'draft', company_id: 1 }, sysScope, SYSTEM_ACTOR);
  await taskRepo.create({ name: 'b', state: 'done', company_id: 1 }, sysScope, SYSTEM_ACTOR);
  await taskRepo.create({ name: 'c', state: 'done', company_id: 1 }, sysScope, SYSTEM_ACTOR);

  await ruleRepo.create(
    {
      name: 'Only done',
      model_name: 'test.acl.task',
      domain_force: '["state","=","done"]',
      group_ids: [],
      global: true,
      perm_read: true, perm_write: true, perm_create: true, perm_unlink: true,
      company_id: 1,
    },
    sysScope,
    SYSTEM_ACTOR
  );

  await t.test('system actor gets no narrowing', async () => {
    assert.equal(await taskRepo.resolveSecurityDomain('read', SYSTEM_ACTOR), null);
  });

  await t.test('user actor gets the composed domain, and find honors it', async () => {
    const actor = { type: 'user', userId: 1, groupIds: [] };
    const node = await taskRepo.resolveSecurityDomain('read', actor);
    assert.deepEqual(node, ['state', '=', 'done']);

    const scope = { companyId: 1 };
    const unrestricted = await taskRepo.find({ scope });
    assert.equal(unrestricted.length, 3);

    const narrowed = await taskRepo.find({ scope, securityDomain: node });
    assert.equal(narrowed.length, 2, 'only the two done rows are visible');
    assert.ok(narrowed.every((r) => r.state === 'done'));
  });

  await engine.close();
});

test('a malformed persisted rule makes the read fail closed', { timeout: 120_000 }, async () => {
  const { engine } = await setup([Task]);
  const taskRepo = new BaseRepository(modelRegistry.get('test.acl.task'), engine);
  const ruleRepo = new BaseRepository(modelRegistry.get('ir.rule'), engine);
  const sysScope = { systemScope: true, companyId: 1 };
  await ruleRepo.create(
    { name: 'Broken', model_name: 'test.acl.task', domain_force: 'not-json', group_ids: [], global: true, company_id: 1 },
    sysScope,
    SYSTEM_ACTOR
  );
  await assert.rejects(
    async () => {
      await taskRepo.resolveSecurityDomain('read', { type: 'user', userId: 1, groupIds: [] });
    },
    /invalid domain_force JSON/
  );
  await engine.close();
});

// ---- Model constraints evaluated inside the write transaction ------------

test('model constraints abort the transaction on create/write/unlink', { timeout: 120_000 }, async (t) => {
  const Guarded = defineModel({
    name: 'test.guarded',
    tableName: 'test_guarded',
    fields: {
      name: fields.char({ required: true }),
      legal_hold: fields.boolean({ default: false }),
    },
    constraints: [
      (row, ctx) => {
        if (ctx.operation === 'unlink' && row.legal_hold === true) {
          throw new Error('legal_hold blocks deletion');
        }
        if (ctx.operation !== 'unlink' && row.legal_hold === true && row.name === '') {
          throw new Error('cannot clear name while on legal hold');
        }
      },
    ],
  });

  const { engine } = await setup([Guarded]);
  const repo = new BaseRepository(modelRegistry.get('test.guarded'), engine);
  const scope = { companyId: 1 };

  await t.test('create that violates a constraint is rolled back', async () => {
    await assert.rejects(
      async () => {
        await repo.create({ name: '', legal_hold: true, company_id: 1 }, scope, SYSTEM_ACTOR);
      },
      /clear name while on legal hold/
    );
    const rows = await repo.find({ scope: { systemScope: true, companyId: 1 } });
    assert.equal(rows.length, 0, 'the rejected insert left no row');
  });

  await t.test('valid create persists', async () => {
    const created = await repo.create({ name: 'kept', legal_hold: true, company_id: 1 }, scope, SYSTEM_ACTOR);
    assert.ok(created?.id);
  });

  await t.test('unlink of a legal_hold row is rolled back', async () => {
    const existing = await repo.find({ scope: { systemScope: true, companyId: 1 }, filters: [{ field: 'name', operator: '=', value: 'kept' }] });
    const id = Number(existing[0].id);
    await assert.rejects(
      async () => {
        await repo.deleteById(id, scope, SYSTEM_ACTOR);
      },
      /legal_hold blocks deletion/
    );
    const still = await repo.find({ scope: { systemScope: true, companyId: 1 }, filters: [{ field: 'name', operator: '=', value: 'kept' }] });
    assert.equal(still.length, 1, 'the protected row survived the rejected delete');
  });

  await engine.close();
});
