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
