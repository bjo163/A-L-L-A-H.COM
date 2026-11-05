import assert from 'node:assert/strict';
import { test } from 'node:test';
import { runBootSeed } from '../src/seed.ts';
import { buildAuthenticatedApp } from './helpers.mjs';
import { BaseRepository, dbEngine, modelRegistry } from '@allah/arsy-orm';

// Roadmap T3.1: manifest-declared view JSON is boot-seeded into `ir.ui.view`
// (digest-gated) and the SDUI endpoint reads the persisted arch before falling
// back to a synthetic one. `buildAuthenticatedApp` connects + migrates the
// engine and registers every addon; the SDUI route is auth-guarded, so a signed
// in owner tenant is required. The tenant reads the platform (company_id 0) view
// rows, which is what the seeder writes.
const { app, headers } = await buildAuthenticatedApp();

function viewRows() {
  const model = modelRegistry.get('ir.ui.view');
  assert.ok(model, 'ir.ui.view must be registered');
  return new BaseRepository(model, dbEngine, dbEngine).find({ scope: { systemScope: true } });
}

async function seedOnce() {
  const lines = [];
  await runBootSeed((message) => lines.push(message));
  const viewsLine = lines.find((line) => line.includes('views ir.ui.view'));
  assert.ok(viewsLine, 'boot seed must report a views summary line');
  const created = Number(/(\d+) created/.exec(viewsLine)[1]);
  const updated = Number(/(\d+) updated/.exec(viewsLine)[1]);
  const unchanged = Number(/(\d+) unchanged/.exec(viewsLine)[1]);
  return { created, updated, unchanged, lines };
}

test('declared views boot-seed into ir.ui.view at the platform tenant, digest-gated', async () => {
  const first = await seedOnce();
  // base declares res.partner (tree, form) and res.company (tree, form).
  assert.equal(first.created, 4, 'first boot creates the four declared platform views');
  assert.equal(first.updated, 0, 'a clean boot updates nothing');

  const rows = await viewRows();
  const partnerTree = rows.find((r) => r.model === 'res.partner' && r.view_type === 'tree');
  assert.ok(partnerTree, 'res.partner tree view is persisted');
  assert.equal(partnerTree.company_id, 0, 'platform view definitions live at company_id 0');
  assert.equal(partnerTree.arch_json.title, 'Contacts', 'arch_json carries the declared title');

  // Re-running must be a pure no-op: identical digests write nothing, so there is
  // zero audit churn on a stable boot (the plan's digest-gate invariant).
  const second = await seedOnce();
  assert.equal(second.created, 0, 'second boot creates no view rows');
  assert.equal(second.updated, 0, 'second boot updates no view rows (digest match)');
  assert.equal(second.unchanged, 4, 'all four views reported unchanged on re-seed');

  const after = await viewRows();
  assert.equal(after.length, rows.length, 'row count is stable across re-seed');
});

test('SDUI reads the persisted arch first, then falls back to a synthetic one', async () => {
  // Persisted path: res.partner/tree was seeded, so the response reflects the
  // declared view (title "Contacts") rather than the model-field dump.
  const persisted = await app.inject({
    method: 'GET',
    url: '/v1/sdui/res.partner/tree',
    headers,
  });
  assert.equal(persisted.statusCode, 200, persisted.payload);
  const persistedBody = JSON.parse(persisted.payload).data;
  assert.equal(persistedBody.title, 'Contacts', 'SDUI serves the persisted view title');
  const fieldNames = persistedBody.arch.fields.map((f) => f.name);
  assert.deepEqual(fieldNames, ['name', 'email', 'phone', 'is_company'], 'SDUI serves the declared field list');

  // Fallback path: res.company has no declared "search" view, so the endpoint
  // returns the synthetic model-field arch (prior, non-breaking behavior).
  const fallback = await app.inject({
    method: 'GET',
    url: '/v1/sdui/res.company/search',
    headers,
  });
  assert.equal(fallback.statusCode, 200, fallback.payload);
  const fallbackBody = JSON.parse(fallback.payload).data;
  assert.match(fallbackBody.title, /\(search\)$/, 'fallback title is the synthetic "<name> (view_type)"');
  assert.ok(
    fallbackBody.arch.fields.every((f) => typeof f.type === 'string'),
    'fallback arch fields are derived from the model definition (each carries a type)',
  );
});
