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

// Computed & related field shapes (roadmap T2.3):
//   full_name  -> compute, store:false  (resolved at read)
//   initials   -> compute, store:true   (recomputed + persisted at write)
//   team_name  -> related 'team_id.name'(single-hop m2o, resolved at read)
const Team = defineModel({
  name: 'comp.team',
  tableName: 'comp_team',
  fields: { name: fields.char({ required: true }) },
});

const Person = defineModel({
  name: 'comp.person',
  tableName: 'comp_person',
  fields: {
    first_name: fields.char({ required: true }),
    last_name: fields.char({ required: true }),
    team_id: fields.many2one('comp.team', { required: true }),
    full_name: fields.char({ compute: 'fullName' }),
    initials: fields.char({ compute: 'initials', store: true }),
    team_name: fields.char({ related: 'team_id.name' }),
  },
})
  .compute('fullName', (r) => `${String(r.first_name ?? '')} ${String(r.last_name ?? '')}`.trim())
  .compute('initials', (r) =>
    `${String(r.first_name ?? '')[0] ?? ''}${String(r.last_name ?? '')[0] ?? ''}`.toUpperCase());

const TENANT = { companyId: -1 };

async function createDatabase() {
  const engine = new PGliteEngine();
  await engine.connect();
  for (const model of [
    ResUsers, AuthUser, AuthSession, AuthVerification, AuthSetup, AuditEvent, Team, Person,
  ]) {
    modelRegistry.register(model, { overwrite: true });
  }
  await new SchemaMigrator(engine, modelRegistry).sync();
  return engine;
}

test('computed and related fields (T2.3)', { timeout: 120_000 }, async (t) => {
  const engine = await createDatabase();
  const teams = new BaseRepository(modelRegistry.get('comp.team'), engine);
  const people = new BaseRepository(modelRegistry.get('comp.person'), engine);

  const team = await teams.create({ name: 'R&D' }, TENANT, SYSTEM_ACTOR);
  const ada = await people.create(
    { first_name: 'Ada', last_name: 'Lovelace', team_id: team.id },
    TENANT, SYSTEM_ACTOR
  );

  await t.test('store:true compute is persisted on create and returned', () => {
    assert.equal(ada.initials, 'AL');
  });

  await t.test('store:false compute and related resolve at read', async () => {
    const [row] = await people.find({ scope: TENANT, filters: [{ field: 'id', operator: '=', value: ada.id }] });
    assert.equal(row.full_name, 'Ada Lovelace');
    assert.equal(row.team_name, 'R&D');
    assert.equal(row.initials, 'AL');
  });

  await t.test('updating a source field recomputes the stored field', async () => {
    await people.updateById(ada.id, { last_name: 'Byron' }, TENANT, SYSTEM_ACTOR);
    // Read the raw column directly (bypass read-time compute) to prove persistence.
    const [raw] = await engine.query(
      'SELECT "initials" FROM "comp_person" WHERE "id" = $1;', [ada.id]
    );
    assert.equal(raw.initials, 'AB');
    const [row] = await people.find({ scope: TENANT, filters: [{ field: 'id', operator: '=', value: ada.id }] });
    assert.equal(row.full_name, 'Ada Byron');
  });

  await t.test('createMany recomputes stored fields for every row', async () => {
    const batch = await people.createMany(
      [
        { first_name: 'Grace', last_name: 'Hopper', team_id: team.id },
        { first_name: 'Alan', last_name: 'Turing', team_id: team.id },
      ],
      TENANT, SYSTEM_ACTOR
    );
    const initials = batch.map((p) => p.initials).sort();
    assert.deepEqual(initials, ['AT', 'GH']);
  });

  await engine.close();
});
