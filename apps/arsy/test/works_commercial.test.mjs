import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { modelRegistry, BaseRepository } from '@allah/arsy-orm';

test('WORKS Commercial Domain — Subscription State Machine Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  await t.test('Isp.plan model is registered and accessible', async () => {
    const model = modelRegistry.get('isp.plan');
    assert.ok(model, 'Isp.plan model should be registered');
    assert.equal(model.name, 'isp.plan');
    assert.equal(model.tableName, 'isp_plan');
  });

  await t.test('Isp.subscription model is registered with correct fields', async () => {
    const model = modelRegistry.get('isp.subscription');
    assert.ok(model, 'Isp.subscription model should be registered');
    assert.equal(model.name, 'isp.subscription');
    assert.equal(model.tableName, 'isp_subscription');
    
    const fields = model.fields;
    assert.ok(fields.status, 'Should have status field');
    assert.ok(fields.username, 'Should have username field');
    assert.ok(fields.start_date, 'Should have start_date field');
    assert.ok(fields.grace_until, 'Should have grace_until field');
    assert.ok(fields.suspended_reason, 'Should have suspended_reason field');
  });

  await t.test('Isp.invoice model is registered', async () => {
    const model = modelRegistry.get('isp.invoice');
    assert.ok(model, 'Isp.invoice model should be registered');
    assert.equal(model.name, 'isp.invoice');
    assert.equal(model.tableName, 'isp_invoice');
  });

  await t.test('POST /v1/works/plans creates a new ISP plan', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/works/plans',
      payload: {
        name: 'Fiber 50 Mbps',
        description: 'High-speed fiber internet',
        download_speed_kbps: 50000,
        upload_speed_kbps: 10000,
        price_cents: 59900,
        currency: 'USD',
        billing_cycle_days: 30,
        grace_period_days: 7,
      },
    });

    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.equal(body.data.name, 'Fiber 50 Mbps');
    assert.equal(body.data.download_speed_kbps, 50000);
  });

  await t.test('GET /v1/works/plans returns list of plans', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/works/plans',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.data));
  });

  await t.test('POST /v1/works/subscriptions creates a new subscription in draft state', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/v1/works/plans',
      payload: {
        name: 'Test Plan',
        download_speed_kbps: 10000,
        upload_speed_kbps: 5000,
        price_cents: 29900,
      },
    });
    const plan = JSON.parse(planRes.payload).data;

    const res = await app.inject({
      method: 'POST',
      url: '/v1/works/subscriptions',
      payload: {
        company_id: 1,
        partner_id: 1,
        plan_id: plan.id,
        username: 'testuser001',
        start_date: new Date().toISOString(),
      },
    });

    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.equal(body.data.status, 'draft');
    assert.equal(body.data.username, 'testuser001');
  });

  await t.test('POST /v1/works/subscriptions/:id/activate transitions draft to active', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/v1/works/plans',
      payload: {
        name: 'Activation Test Plan',
        download_speed_kbps: 20000,
        upload_speed_kbps: 10000,
        price_cents: 39900,
      },
    });
    const plan = JSON.parse(planRes.payload).data;

    const subRes = await app.inject({
      method: 'POST',
      url: '/v1/works/subscriptions',
      payload: {
        company_id: 1,
        partner_id: 1,
        plan_id: plan.id,
        username: 'activateuser001',
        start_date: new Date().toISOString(),
      },
    });
    const subscription = JSON.parse(subRes.payload).data;

    const res = await app.inject({
      method: 'POST',
      url: `/v1/works/subscriptions/${subscription.id}/activate`,
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.equal(body.data.status, 'active');
  });

  await t.test('POST /v1/works/subscriptions/:id/suspend transitions active to suspended', async () => {
    const planRes = await app.inject({
      method: 'POST',
      url: '/v1/works/plans',
      payload: {
        name: 'Suspend Test Plan',
        download_speed_kbps: 15000,
        upload_speed_kbps: 7500,
        price_cents: 34900,
      },
    });
    const plan = JSON.parse(planRes.payload).data;

    const subRes = await app.inject({
      method: 'POST',
      url: '/v1/works/subscriptions',
      payload: {
        company_id: 1,
        partner_id: 1,
        plan_id: plan.id,
        username: 'suspenduser001',
        start_date: new Date().toISOString(),
      },
    });
    const subscription = JSON.parse(subRes.payload).data;

    await app.inject({
      method: 'POST',
      url: `/v1/works/subscriptions/${subscription.id}/activate`,
    });

    const res = await app.inject({
      method: 'POST',
      url: `/v1/works/subscriptions/${subscription.id}/suspend`,
      payload: {
        reason: 'Non-payment',
      },
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.equal(body.data.status, 'suspended');
    assert.equal(body.data.suspended_reason, 'Non-payment');
  });

  await t.test('GET /v1/works/subscriptions returns list of subscriptions', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/works/subscriptions',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.data));
  });

  await t.test('GET /v1/works/invoices returns list of invoices', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/works/invoices',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.data));
  });

  await app.close();
});