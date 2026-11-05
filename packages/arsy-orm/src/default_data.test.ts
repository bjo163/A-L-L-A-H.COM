import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  seedIdempotent,
  seedDatasets,
  totalCreated,
  PLATFORM_COMPANY_ID,
  type SeedDataset,
  type SeedRepositoryLike,
  type SeedContext,
} from './default_data';
import type { QueryOptions, TenantScope } from './query_builder';
import type { AuditActor } from './model';

const SYSTEM: AuditActor = { type: 'system' };

/**
 * A duck-typed repository that satisfies just the two operations the seeder
 * uses (find + createMany). `find` honours ANDed `IN` filters so the composite
 * key path is exercised against realistic query options, without a database.
 */
class FakeRepo implements SeedRepositoryLike {
  store: Record<string, unknown>[] = [];
  createManyCalls = 0;

  async find(options: QueryOptions): Promise<Record<string, unknown>[]> {
    const filters = options.filters ?? [];
    return this.store.filter((row) =>
      filters.every((filter) => {
        if (filter.operator !== 'IN') return true;
        const values = filter.value as unknown[];
        return values.includes(row[filter.field]);
      })
    );
  }

  async createMany(rows: Record<string, unknown>[], _scope: TenantScope, _actor: AuditActor): Promise<unknown[]> {
    this.createManyCalls += 1;
    this.store.push(...rows.map((row) => ({ ...row })));
    return rows;
  }
}

test('empty dataset is a no-op and never writes', async () => {
  const repo = new FakeRepo();
  const dataset: SeedDataset = { model: 'res.currency', keyFields: ['code'], rows: [] };
  const created = await seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM);
  assert.equal(created, 0);
  assert.equal(repo.createManyCalls, 0);
});

test('a dataset without keyFields is rejected rather than blindly inserted', async () => {
  const repo = new FakeRepo();
  const dataset: SeedDataset = { model: 'res.currency', keyFields: [], rows: [{ code: 'USD' }] };
  await assert.rejects(
    () => seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM),
    /at least one keyField/
  );
});

test('single-key seeding is idempotent across reruns', async () => {
  const repo = new FakeRepo();
  const dataset: SeedDataset = {
    model: 'res.currency',
    keyFields: ['code'],
    rows: [{ code: 'USD' }, { code: 'EUR' }],
  };
  assert.equal(await seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM), 2);
  // Second run finds both present, inserts nothing.
  assert.equal(await seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM), 0);
  assert.equal(repo.store.length, 2);
});

test('composite keys require every field to match before a row counts as present', async () => {
  const repo = new FakeRepo();
  const dataset: SeedDataset = {
    model: 'ir.translation',
    keyFields: ['lang', 'name', 'type'],
    rows: [{ lang: 'id_ID', name: 'action.save', type: 'ui', value: 'Simpan' }],
  };
  assert.equal(await seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM), 1);

  // Same lang/name but a different type is a distinct row, not a duplicate.
  const otherType: SeedDataset = {
    ...dataset,
    rows: [{ lang: 'id_ID', name: 'action.save', type: 'field', value: 'Simpan' }],
  };
  assert.equal(await seedIdempotent(repo, otherType, { systemScope: true }, SYSTEM), 1);
  assert.equal(repo.store.length, 2);

  // The exact composite triple already present inserts nothing.
  assert.equal(await seedIdempotent(repo, dataset, { systemScope: true }, SYSTEM), 0);
});

test('seedDatasets stamps the platform company id and preserves explicit ones', async () => {
  const repo = new FakeRepo();
  const ctx: SeedContext = { repository: () => repo as never, actor: SYSTEM };
  const datasets: SeedDataset[] = [
    { model: 'res.currency', keyFields: ['code'], rows: [{ code: 'USD' }, { code: 'IDR', company_id: 7 }] },
  ];
  const result = await seedDatasets(ctx, datasets);
  assert.deepEqual(result, [{ model: 'res.currency', created: 2 }]);
  assert.equal(totalCreated(result), 2);
  const usd = repo.store.find((row) => row.code === 'USD');
  const idr = repo.store.find((row) => row.code === 'IDR');
  assert.equal(usd?.company_id, PLATFORM_COMPANY_ID);
  assert.equal(idr?.company_id, 7);
});
