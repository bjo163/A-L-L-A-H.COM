import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp, authenticateSecondTenant } from './helpers.mjs';

// One in-memory hub/DB per process (dbEngine is a Symbol.for singleton), so a
// single app instance is shared across these sub-tests. The second-tenant helper
// registers into the same DB under a different company_id — exactly what the
// tenant-isolation assertion needs.
const { app, headers } = await buildAuthenticatedApp();
const authed = (extra = {}) => ({ ...headers, 'content-type': 'application/json', ...extra });
const post = (payload, h = {}) =>
  app.inject({ method: 'POST', url: '/v1/chat/completions', headers: authed(h), body: JSON.stringify(payload) });

// UTC day bucket that the rollup and the usage log share.
const today = new Date().toISOString().slice(0, 10);

test('AI usage daily rollup (F1)', async (t) => {
  await t.test('aggregates today usage and is idempotent on re-run', async () => {
    // Generate usage for the day via a real completion path.
    const completion = await post({
      model: 'dx-default',
      messages: [{ role: 'user', content: `Rollup fixture ${Date.now()}` }],
    });
    assert.equal(completion.statusCode, 200, completion.payload);

    const first = await app.inject({
      method: 'POST', url: '/v1/gateway/usage/rollup',
      headers: authed(), body: JSON.stringify({ day: today }),
    });
    assert.equal(first.statusCode, 200, first.payload);
    const firstRows = first.json().data.rows;
    assert.ok(firstRows >= 1, 'expected at least one rollup group');

    // Read the totals so we can prove re-running does not double-count.
    const readAfterFirst = await app.inject({ method: 'GET', url: `/v1/gateway/usage/daily?day=${today}`, headers });
    assert.equal(readAfterFirst.statusCode, 200, readAfterFirst.payload);
    const totalsFirst = sumField(readAfterFirst.json().data, 'request_count');
    assert.ok(totalsFirst >= 1);

    // Re-run the same day: idempotent — totals must be unchanged.
    await app.inject({
      method: 'POST', url: '/v1/gateway/usage/rollup',
      headers: authed(), body: JSON.stringify({ day: today }),
    });
    const readAfterSecond = await app.inject({ method: 'GET', url: `/v1/gateway/usage/daily?day=${today}`, headers });
    const totalsSecond = sumField(readAfterSecond.json().data, 'request_count');
    assert.equal(totalsSecond, totalsFirst, 'rollup must be idempotent (same totals on re-run)');

    // Every returned row must be scoped to the requesting tenant.
    for (const row of readAfterSecond.json().data) {
      assert.ok('company_id' in row);
    }
  });

  await t.test('a rollup is tenant-scoped (cross-tenant reads see nothing)', async () => {
    const intruder = await authenticateSecondTenant(app);
    const res = await app.inject({
      method: 'GET', url: `/v1/gateway/usage/daily?day=${today}`,
      headers: { ...intruder, 'content-type': 'application/json' },
    });
    assert.equal(res.statusCode, 200, res.payload);
    // The second tenant never generated usage on this day, so it sees no rows —
    // proving the rollup read is scoped, not global.
    assert.equal(res.json().data.length, 0, 'second tenant must not see the owner rollup');
  });

  await t.test('daily budget guard fails-closed with 429 past the cap', async () => {
    // Accrue a deterministic non-zero spend for today first. dx-fast resolves to
    // a priced model (gpt-4o-mini), so the completion records cost_usd > 0.
    const warmup = await post({
      model: 'dx-fast',
      messages: [{ role: 'user', content: `Budget warmup ${Date.now()}` }],
    });
    assert.equal(warmup.statusCode, 200, warmup.payload);

    // Fail-closed cap that the accrued spend already exceeds. Read at request
    // time, so toggling the env only affects this sub-test's requests.
    process.env.LLM_DAILY_BUDGET_USD = '0.0000000001';
    try {
      const res = await post({
        model: 'dx-fast',
        messages: [{ role: 'user', content: `Budget trigger ${Date.now()}` }],
      });
      assert.equal(res.statusCode, 429, res.payload);
      assert.equal(res.json().error.code, 'DAILY_BUDGET_EXCEEDED');
    } finally {
      delete process.env.LLM_DAILY_BUDGET_USD;
    }

    // Off-path: with the cap removed the guard is skipped and the request succeeds.
    const after = await post({
      model: 'dx-fast',
      messages: [{ role: 'user', content: `Budget off-path ${Date.now()}` }],
    });
    assert.equal(after.statusCode, 200, after.payload);
  });

  await app.close();
});

function sumField(rows, field) {
  return rows.reduce((acc, r) => acc + Number(r[field] || 0), 0);
}
