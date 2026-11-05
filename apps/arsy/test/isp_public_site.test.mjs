import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { runBootSeed } from '../src/seed.ts';

// The e-isp site reads the public ISP surface anonymously. This file pins the
// two guarantees its specification depends on: the boot seed is idempotent and
// the public projection never leaks private rows or tenant-owned fields.

const PUBLIC_PLAN_SLUGS = ['fiber-30', 'fiber-50', 'fiber-100', 'fiber-200'];

test('E-ISP public surface', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  await t.test('boot seed is idempotent (running twice creates no duplicate public plans)', async () => {
    await runBootSeed();
    const afterFirst = await app.inject({ method: 'GET', url: '/v1/public/isp/plans' });
    assert.equal(afterFirst.statusCode, 200, afterFirst.payload);

    await runBootSeed();
    const afterSecond = await app.inject({ method: 'GET', url: '/v1/public/isp/plans' });
    assert.equal(afterSecond.statusCode, 200, afterSecond.payload);

    const first = JSON.parse(afterFirst.payload).data;
    const second = JSON.parse(afterSecond.payload).data;
    assert.equal(second.length, first.length, 'second seed run must not add rows');
    assert.equal(second.length, PUBLIC_PLAN_SLUGS.length);
  });

  await t.test('public plans exclude the private catalog row', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/public/isp/plans' });
    assert.equal(res.statusCode, 200, res.payload);
    const plans = JSON.parse(res.payload).data;
    const slugs = plans.map((plan) => plan.slug);
    assert.deepEqual([...slugs].sort(), [...PUBLIC_PLAN_SLUGS].sort());
    assert.ok(!slugs.includes('enterprise-500'), 'private plan must not reach the public catalog');
  });

  await t.test('public responses carry no tenant-owned fields', async () => {
    for (const url of ['/v1/public/isp/plans', '/v1/public/isp/coverage']) {
      const res = await app.inject({ method: 'GET', url });
      assert.equal(res.statusCode, 200, res.payload);
      for (const forbidden of ['company_id', 'fup', 'burst']) {
        assert.ok(!res.payload.includes(forbidden), `${url} leaked '${forbidden}'`);
      }
    }
  });

  await t.test('coverage is public and filters by query server-side', async () => {
    const all = await app.inject({ method: 'GET', url: '/v1/public/isp/coverage' });
    assert.equal(all.statusCode, 200, all.payload);
    const areas = JSON.parse(all.payload).data;
    assert.ok(areas.length > 0);
    for (const area of areas) {
      assert.ok(['available', 'coming_soon', 'planned', 'unavailable'].includes(area.status));
    }

    const filtered = await app.inject({ method: 'GET', url: '/v1/public/isp/coverage?q=bandung' });
    assert.equal(filtered.statusCode, 200, filtered.payload);
    const bandung = JSON.parse(filtered.payload).data;
    assert.ok(bandung.length > 0, 'Bandung query should match rows');
    assert.ok(bandung.every((a) => `${a.area_name} ${a.city} ${a.district}`.toLowerCase().includes('bandung')));
  });
});
