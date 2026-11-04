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
