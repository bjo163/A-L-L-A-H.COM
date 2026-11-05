import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { runBootSeed, seedRegistry } from '../src/seed.ts';
import { BaseRepository, dbEngine, modelRegistry } from '@allah/arsy-orm';

// buildArsyApp connects the in-memory PGlite engine, registers every addon, and
// runs SchemaMigrator.sync() (which creates the `system` bot that SYSTEM_ACTOR
// writes require). It does NOT seed default data — that is runBootSeed's job,
// normally called from main.ts after the build — so the DB starts clean here.
await buildArsyApp({ enableLogging: false });

function platformRows(modelName) {
  const model = modelRegistry.get(modelName);
  assert.ok(model, `model '${modelName}' must be registered before seeding`);
  const repo = new BaseRepository(model, dbEngine, dbEngine);
  return repo.find({ scope: { systemScope: true } });
}

// runBootSeed returns nothing; it logs a per-addon summary line and a final
// "boot complete: N default row(s)" line. Parse those so the test can assert
// the created-row count without the seeder exposing an internal counter.
async function seedOnce() {
  const lines = [];
  await runBootSeed((message) => lines.push(message));
  const complete = lines.find((line) => line.includes('boot complete'));
  assert.ok(complete, 'runBootSeed must log a boot-complete summary');
  const created = Number(/(\d+) default row\(s\)/.exec(complete)[1]);
  const failed = lines.filter((line) => line.includes('FAILED'));
  return { created, lines, failed };
}

test('platform default data seeds idempotently, in dependency order, at company_id 0', async () => {
  const first = await seedOnce();
  assert.deepEqual(first.failed, [], 'no addon may fail to seed on a clean boot');
  assert.ok(first.created > 0, `first boot seeds platform rows (got ${first.created})`);

  // Re-running must be a pure no-op: every dataset matches on its natural key.
  const second = await seedOnce();
  assert.equal(second.created, 0, 'second boot creates nothing (idempotent re-seed)');

  // base reference data is present and platform-owned.
  const currencies = await platformRows('res.currency');
  const countries = await platformRows('res.country');
  const langs = await platformRows('res.lang');
  assert.ok(currencies.length >= 8, 'default currencies seeded');
  assert.ok(countries.length >= 20, 'default countries seeded');
  assert.ok(langs.length >= 3, 'default languages seeded');
  for (const row of [...currencies, ...countries, ...langs]) {
    assert.equal(row.company_id, 0, 'reference rows live at the shared platform tenant');
  }

  // Country has a many2one to currency, so the base loader must seed currencies
  // ahead of countries. Assert that order is honoured in the seed summary.
  const baseLine = first.lines.find((line) => line.includes('data base'));
  assert.ok(baseLine, 'base addon is seeded');
  const currencyPos = baseLine.indexOf('res.currency:');
  const countryPos = baseLine.indexOf('res.country:');
  assert.ok(currencyPos >= 0 && countryPos >= 0, 'base summary lists currencies and countries');
  assert.ok(currencyPos < countryPos, 'currencies are seeded before countries (FK resolution order)');
});

test('boot resilience: a failing addon dataset is logged and skipped, never rethrown', async () => {
  const lines = [];
  const registry = {
    good: async () => [{ model: 'res.currency', created: 3 }],
    bad: async () => {
      throw new Error('simulated seed failure');
    },
  };
  // Must resolve rather than throw even though one addon fails, and still seed
  // the healthy datasets (spec: aggregate rethrow is NOT desired).
  const total = await seedRegistry(registry, ['bad', 'good'], 'data', (message) => lines.push(message));
  assert.equal(total, 3, 'healthy datasets still seed while a broken one is skipped');
  assert.ok(lines.some((line) => line.includes('bad FAILED')), 'failing addon is logged');
  assert.ok(
    lines.some((line) => line.includes('WARNING') && line.includes('skipped')),
    'failures are reported as a non-fatal warning, not rethrown',
  );
});
