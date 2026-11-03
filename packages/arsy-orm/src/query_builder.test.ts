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
    3,
    { state: 'queued' }
  );
  assert.match(result.sql, /company_id = \$3/);
  assert.match(result.sql, /"state" = \$4/);
  assert.deepEqual(result.params, ['running', 7, 3, 'queued']);
  assert.doesNotMatch(result.sql, /running|queued/);
});

test('tenant-scoped updates reject empty and unknown field sets', () => {
  const builder = new QueryBuilder(model);
  assert.throws(() => builder.buildUpdate(1, {}, 2), /at least one field/);
  assert.throws(() => builder.buildUpdate(1, { 'state" = true --': 'x' }, 2), /unknown field/);
  assert.throws(() => builder.buildUpdate(1, { state: 'running' }, 2, { company_id: 3 }), /unknown field/);
});
