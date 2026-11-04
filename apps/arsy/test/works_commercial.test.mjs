import assert from 'node:assert/strict';
import test from 'node:test';
import { modelRegistry } from '@allah/arsy-orm';
import { buildAuthenticatedApp, createPlan } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();

test('WORKS Commercial Domain - Subscription State Machine', async (t) => {
  await t.test('isp.plan model is registered', () => {
    const model = modelRegistry.get('isp.plan');
    assert.ok(model);
    assert.equal(model.tableName, 'isp_plan');
  });

  await t.test('isp.subscription model carries its lifecycle fields', () => {
    const model = modelRegistry.get('isp.subscription');
    assert.ok(model);
    for (const field of ['customer_id', 'plan_id', 'state', 'started_at', 'suspended_at', 'cancelled_at']) {
      assert.ok(model.fields[field], 'missing ' + field);
    }
  });

  await t.test('isp.invoice model is registered', () => {
    assert.equal(modelRegistry.get('isp.invoice').tableName, 'isp_invoice');
  });

  await t.test('POST /v1/works/plans creates a plan for the caller tenant', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/works/plans',
      headers,
      payload: { name: 'Fiber 50 Mbps', download_mbps: 50, upload_mbps: 10, price: 59900, currency: 'USD' },
    });
    assert.equal(res.statusCode, 201, res.payload);
    const plan = JSON.parse(res.payload).data;
    assert.equal(plan.name, 'Fiber 50 Mbps');
    assert.equal(plan.download_mbps, 50);
  });

  await t.test('GET /v1/works/plans lists the tenant plans', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/works/plans', headers });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(JSON.parse(res.payload).data));
  });

  await t.test('a subscription starts in draft', async () => {
    const plan = await createPlan(app, headers, 'Draft Plan');
    const res = await app.inject({
      method: 'POST',
      url: '/v1/works/subscriptions',
      headers,
      payload: { plan_id: plan.id, customer_id: 1 },
    });
    assert.equal(res.statusCode, 201, res.payload);
    assert.equal(JSON.parse(res.payload).data.state, 'draft');
  });

  await t.test('activate then suspend transitions the state', async () => {
    const plan = await createPlan(app, headers, 'Lifecycle Plan');
    const sub = JSON.parse(
      (await app.inject({ method: 'POST', url: '/v1/works/subscriptions', headers, payload: { plan_id: plan.id, customer_id: 1 } })).payload
    ).data;

    const activated = await app.inject({ method: 'POST', url: '/v1/works/subscriptions/' + sub.id + '/activate', headers });
    assert.equal(activated.statusCode, 200, activated.payload);
    assert.equal(JSON.parse(activated.payload).data.state, 'active');

    const suspended = await app.inject({ method: 'POST', url: '/v1/works/subscriptions/' + sub.id + '/suspend', headers });
    assert.equal(suspended.statusCode, 200, suspended.payload);
    assert.equal(JSON.parse(suspended.payload).data.state, 'suspended');
  });

  await t.test('GET /v1/works/invoices lists the tenant invoices', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/works/invoices', headers });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(JSON.parse(res.payload).data));
  });

  await app.close();
});
