import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fields } from './fields';
import { defineModel } from './model';
import { QueryBuilder } from './query_builder';

const model = defineModel({
  name: 'agent.test',
  tableName: 'agent_test',
  displayName: 'Agent Test',
  fields: {
    state: fields.char({ label: 'State', required: true }),
    label: fields.char({ label: 'Label' }),
    attempts: fields.integer({ label: 'Attempts' }),
    count: fields.integer({ label: 'Count' }),
  },
});

test('tenant-scoped updates parameterize values and compare the expected state', () => {
  const result = new QueryBuilder(model).buildUpdate(
    7,
    { state: 'running' },
    { companyId: 3 },
    41,
    { state: 'queued' }
  );
  assert.match(result.sql, /"company_id" = \$3/);
  assert.match(result.sql, /"state" = \$4/);
  assert.match(result.sql, /"write_uid" = \$5/);
  assert.deepEqual(result.params, ['running', 7, 3, 'queued', 41]);
  assert.doesNotMatch(result.sql, /running|queued/);
});

test('tenant-scoped updates reject empty and unknown field sets', () => {
  const builder = new QueryBuilder(model);
  assert.throws(() => builder.buildUpdate(1, {}, { companyId: 2 }, 41), /at least one field/);
  assert.throws(
    () => builder.buildUpdate(1, { 'state" = true --': 'x' }, { companyId: 2 }, 41),
    /Unknown field/
  );
  assert.throws(
    () => builder.buildUpdate(1, { state: 'running' }, { companyId: 2 }, 41, { company_id: 3 }),
    /managed by the ORM/
  );
  assert.throws(
    () => builder.buildUpdate(1, { write_uid: 999 }, { companyId: 2 }, 41),
    /managed by the ORM/
  );
  assert.throws(
    () => builder.buildUpdate(1, { state: 'running' }, { companyId: 2 }, 0),
    /positive res.users ID/
  );
});

test('inserts set both audit UIDs from the actor and reject caller-supplied audit values', () => {
  const builder = new QueryBuilder(model);
  const insert = builder.buildInsert({ state: 'queued' }, { companyId: 12 }, 41);
  assert.match(insert.sql, /"create_uid", "write_uid"/);
  assert.deepEqual(insert.params, ['queued', 12, 41, 41]);
  assert.throws(
    () => builder.buildInsert({ state: 'queued', create_uid: 9 }, { companyId: 12 }, 41),
    /managed by the ORM/
  );
});

test('selects compile connector groups and null comparisons without interpolating values', () => {
  const result = new QueryBuilder(model).buildSelect({
    scope: { companyId: 12 },
    filters: [
      { field: 'state', operator: '=', value: 'ready' },
      { field: 'label', operator: '=', value: null, connector: 'OR' },
    ],
  });
  assert.match(result.sql, /"company_id" = \$1/);
  assert.match(result.sql, /\("state" = \$2 OR "label" IS NULL\)/);
  assert.deepEqual(result.params, [12, 'ready']);
  assert.doesNotMatch(result.sql, /ready/);
});

test('count queries preserve filters and omit pagination and ordering', () => {
  const result = new QueryBuilder(model).buildCount({
    scope: { systemScope: true },
    filters: [{ field: 'state', operator: 'NOT IN', value: ['deleted', 'archived'] }],
    limit: 1,
    offset: 2,
    orderBy: 'label',
  });
  assert.match(result.sql, /^SELECT COUNT\(\*\)::integer AS count FROM/);
  assert.match(result.sql, /"state" NOT IN \(\$1, \$2\)/);
  assert.doesNotMatch(result.sql, /LIMIT|OFFSET|ORDER BY/);
  assert.deepEqual(result.params, ['deleted', 'archived']);
});

test('increment updates perform arithmetic in the database with audited, scoped writes', () => {
  const result = new QueryBuilder(model).buildIncrementUpdate(
    7,
    { attempts: 1 },
    { label: 'retrying' },
    { companyId: 3 },
    41
  );
  assert.match(result.sql, /"label" = \$1/);
  assert.match(result.sql, /COALESCE\("attempts", 0\) \+ \$2/);
  assert.match(result.sql, /"company_id" = \$4/);
  assert.match(result.sql, /"write_uid" = \$5/);
  assert.deepEqual(result.params, ['retrying', 1, 7, 3, 41]);
  assert.doesNotMatch(result.sql, /retrying/);
  assert.throws(
    () => new QueryBuilder(model).buildIncrementUpdate(7, { attempts: Number.NaN }, {}, { companyId: 3 }, 41),
    /finite number/
  );
  assert.throws(
    () => new QueryBuilder(model).buildIncrementUpdate(7, { missing: 1 }, {}, { companyId: 3 }, 41),
    /Unknown field/
  );
});

test('mixed AND/OR filters fold left-to-right with explicit parentheses', () => {
  const result = new QueryBuilder(model).buildSelect({
    scope: { systemScope: true },
    filters: [
      { field: 'state', operator: '=', value: 'a' },
      { field: 'label', operator: '=', value: 'b', connector: 'OR' },
      { field: 'attempts', operator: '>', value: 3 },
    ],
  });
  // Without grouping, SQL would read `state OR (label AND attempts)` by precedence.
  assert.match(result.sql, /\(\("state" = \$1 OR "label" = \$2\) AND "attempts" > \$3\)/);
});

test('nested domain compiles through the column allowlist and stays parameterized', () => {
  const result = new QueryBuilder(model).buildSelect({
    scope: { companyId: 9 },
    domain: ['&', ['state', '=', 'ready'], ['|', ['label', 'ILIKE', '%x%'], ['!', ['attempts', '>', 5]]]],
  });
  assert.match(result.sql, /"company_id" = \$1/);
  assert.match(
    result.sql,
    /\("state" = \$2 AND \("label" ILIKE \$3 OR \(NOT "attempts" > \$4\)\)\)/
  );
  assert.deepEqual(result.params, [9, 'ready', '%x%', 5]);
});

test('domain leaves reject unknown fields and unsupported operators', () => {
  const builder = new QueryBuilder(model);
  assert.throws(
    () => builder.buildSelect({ scope: { companyId: 1 }, domain: ['password_hash', '=', 'x'] }),
    /Unknown field/
  );
  assert.throws(
    () => builder.buildSelect({ scope: { companyId: 1 }, domain: ['state', 'ILIKE;', 'x'] }),
    /Unsupported filter operator/
  );
});

test('field projection restricts the select list and validates every column', () => {
  const result = new QueryBuilder(model).buildSelect({ scope: { companyId: 2 }, fields: ['state', 'id'] });
  assert.match(result.sql, /^SELECT "state", "id" FROM/);
  assert.throws(
    () => new QueryBuilder(model).buildSelect({ scope: { companyId: 2 }, fields: ['state', 'secret'] }),
    /Unknown field 'secret'/
  );
});

test('buildCount is a dedicated builder that never regex-swaps a count column', () => {
  const result = new QueryBuilder(model).buildCount({
    scope: { companyId: 4 },
    fields: ['count'],
    filters: [{ field: 'count', operator: '>', value: 0 }],
  });
  assert.match(result.sql, /^SELECT COUNT\(\*\)::integer AS count FROM "agent_test" WHERE/);
  assert.match(result.sql, /"count" > \$2/);
  assert.doesNotMatch(result.sql, /SELECT "count"/);
  assert.deepEqual(result.params, [4, 0]);
});

test('keyset pagination seeks on (column, id) with a bounded, parameterized page', () => {
  const first = new QueryBuilder(model).buildKeyset({ scope: { companyId: 5 }, limit: 20 }, { column: 'attempts' });
  assert.match(first.sql, /ORDER BY "attempts" ASC, "id" ASC LIMIT \$2/);
  assert.deepEqual(first.params, [5, 20]);

  const next = new QueryBuilder(model).buildKeyset(
    { scope: { companyId: 5 }, limit: 20 },
    { column: 'attempts', after: { columnValue: 7, id: 42 } }
  );
  assert.match(next.sql, /AND \("attempts", "id"\) > \(\$2, \$3\)/);
  assert.deepEqual(next.params, [5, 7, 42, 20]);
});

test('forUpdate appends a row lock after the page clause; includeArchived drops active', () => {
  const locked = new QueryBuilder(model).buildSelect({
    scope: { companyId: 5 },
    filters: [{ field: 'state', operator: '=', value: 'a' }],
    limit: 10,
    forUpdate: true,
  });
  assert.match(locked.sql, /LIMIT \$3 FOR UPDATE$/);

  // roadmap T3.2: 'skip_locked' pulls the next unlocked rows for a concurrent claimer.
  const skip = new QueryBuilder(model).buildSelect({
    scope: { companyId: 5 },
    filters: [{ field: 'state', operator: '=', value: 'a' }],
    limit: 10,
    forUpdate: 'skip_locked',
  });
  assert.match(skip.sql, /LIMIT \$3 FOR UPDATE SKIP LOCKED$/);

  const archived = new QueryBuilder(model).buildSelect({ scope: { companyId: 5 }, includeArchived: true });
  assert.doesNotMatch(archived.sql, /"active" = true/);
  const notArchived = new QueryBuilder(model).buildSelect({ scope: { companyId: 5 } });
  assert.match(notArchived.sql, /"active" = true/);
});

test('read_group parameterizes scope and restricts aggregates to numeric fields', () => {
  const result = new QueryBuilder(model).buildReadGroup(
    { scope: { companyId: 8 }, filters: [{ field: 'state', operator: '=', value: 'done' }] },
    { groupBy: ['state'], aggregates: [{ fn: 'count', alias: 'count' }, { fn: 'sum', field: 'attempts', alias: 'total' }] }
  );
  assert.match(result.sql, /SELECT "state", COUNT\(\*\)::integer AS "count", SUM\("attempts"\)::numeric AS "total"/);
  assert.match(result.sql, /GROUP BY "state" ORDER BY "state" ASC/);
  assert.deepEqual(result.params, [8, 'done']);
  assert.doesNotMatch(result.sql, /done/);
});

test('read_group rejects summing a non-numeric field and unknown group columns', () => {
  const builder = new QueryBuilder(model);
  assert.throws(
    () => builder.buildReadGroup({ scope: { companyId: 1 } }, { groupBy: [], aggregates: [{ fn: 'sum', field: 'state', alias: 's' }] }),
    /Unknown field 'state'/
  );
  assert.throws(
    () => builder.buildReadGroup({ scope: { companyId: 1 } }, { groupBy: ['secret'], aggregates: [] }),
    /Unknown field 'secret'/
  );
});

test('archive flips active within the tenant scope and only touches opposite-state rows', () => {
  const result = new QueryBuilder(model).buildArchive([3, 4], false, { companyId: 6 }, 41);
  assert.match(result.sql, /SET "active" = \$1, "write_uid" = \$2/);
  assert.match(result.sql, /WHERE "active" = true AND "id" IN \(\$3, \$4\) AND "company_id" = \$5/);
  assert.deepEqual(result.params, [false, 41, 3, 4, 6]);
  assert.throws(
    () => new QueryBuilder(model).buildArchive([], false, { companyId: 6 }, 41),
    /at least one id/
  );
});

test('updateMany emits one set-based UPDATE per column shape, values never interpolated', () => {
  // Two rows share the {state} shape and fold into one statement; a third row
  // touches {attempts} so it becomes its own statement.
  const statements = new QueryBuilder(model).buildUpdateMany(
    [
      { id: 1, data: { state: 'a' } },
      { id: 2, data: { state: 'b' } },
      { id: 3, data: { attempts: 5 } },
    ],
    { companyId: 9 },
    41
  );
  assert.equal(statements.length, 2);
  const first = statements[0];
  assert.match(first.sql, /UPDATE "agent_test" AS t SET "state" = v\."state", "write_uid" = \$/);
  assert.match(first.sql, /FROM \(VALUES \(\$1::integer, \$2::text\), \(\$3::integer, \$4::text\)\) AS v\("id", "state"\)/);
  assert.match(first.sql, /WHERE t\."id" = v\."id" AND t\."active" = true AND "company_id" = \$6/);
  assert.deepEqual(first.params, [1, 'a', 2, 'b', 41, 9]);
  assert.doesNotMatch(first.sql, /'a'|'b'/);
  assert.match(statements[1].sql, /"attempts" = v\."attempts"/);
  assert.match(statements[1].sql, /\$2::integer/);
});

test('updateMany rejects unknown and ORM-managed write fields and empty data', () => {
  const builder = new QueryBuilder(model);
  assert.throws(
    () => builder.buildUpdateMany([{ id: 1, data: { secret: 'x' } }], { companyId: 1 }, 41),
    /Unknown field/
  );
  assert.throws(
    () => builder.buildUpdateMany([{ id: 1, data: { write_uid: 9 } }], { companyId: 1 }, 41),
    /managed by the ORM/
  );
  assert.throws(
    () => builder.buildUpdateMany([{ id: 1, data: {} }], { companyId: 1 }, 41),
    /at least one field/
  );
  assert.deepEqual(builder.buildUpdateMany([], { companyId: 1 }, 41), []);
});
