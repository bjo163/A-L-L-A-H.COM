import assert from 'node:assert/strict';
import test from 'node:test';

const [{ fields }, { defineModel }, { BaseRepository }] = await Promise.all([
  import('../src/fields.ts'),
  import('../src/model.ts'),
  import('../src/repository.ts'),
]);

// AC-12: the SDUI fallback view is built from fields_get, so its output is a
// view-rendering contract: type, label, required, selection options and relation
// targets must be present, and no column values or reserved columns leak.
const Lead = defineModel({
  name: 'metadata.lead',
  tableName: 'metadata_lead',
  displayNameSpec: 'name',
  fields: {
    company_id: fields.integer({ required: true }),
    name: fields.char({ label: 'Lead Name', required: true, help: 'Who we are chasing' }),
    state: fields.selection({ open: 'Open', won: 'Won' }, { label: 'State', default: 'open' }),
    owner_id: fields.many2one('res.users', { label: 'Owner' }),
    archived: fields.boolean({ readonly: true }),
  },
});

test('fields_get exposes type/label/required/selection/relation for the SDUI contract', () => {
  const meta = new BaseRepository(Lead).fieldsGet();

  assert.equal(meta.name.type, 'char');
  assert.equal(meta.name.string, 'Lead Name');
  assert.equal(meta.name.required, true);
  assert.equal(meta.name.help, 'Who we are chasing');

  assert.equal(meta.state.required, false);
  assert.deepEqual(
    meta.state.selection,
    [
      ['open', 'Open'],
      ['won', 'Won'],
    ],
  );

  assert.equal(meta.owner_id.relation, 'res.users');
  assert.equal(meta.archived.readonly, true);
});

test('fields_get never leaks record values or reserved columns', () => {
  const meta = new BaseRepository(Lead).fieldsGet();
  for (const entry of Object.values(meta)) {
    for (const key of Object.keys(entry)) {
      assert.ok(
        ['type', 'string', 'help', 'required', 'readonly', 'relation', 'selection'].includes(key),
        `unexpected fields_get key: ${key}`,
      );
    }
  }
});