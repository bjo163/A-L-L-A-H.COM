import assert from 'node:assert/strict';
import test from 'node:test';
import { authenticateSecondTenant, buildAuthenticatedApp, createPlan } from './helpers.mjs';

const PROTECTED_ROUTES = [
  { method: 'GET', url: '/v1/threads' },
  { method: 'POST', url: '/v1/threads', payload: { title: 'x' } },
  { method: 'GET', url: '/v1/nexus/nas' },
  { method: 'POST', url: '/v1/nexus/nas', payload: { nas_identifier: 'a', ip_address: '1.1.1.1', secret: 's' } },
  { method: 'GET', url: '/v1/nexus/pools' },
  { method: 'GET', url: '/v1/orbit/instances' },
  { method: 'GET', url: '/v1/works/plans' },
  { method: 'GET', url: '/v1/works/invoices' },
  { method: 'POST', url: '/v1/qorpus/ingest', payload: { title: 't', category: 'c', content: 'b' } },
  { method: 'POST', url: '/v1/qorpus/search', payload: { query: 'b' } },
  { method: 'GET', url: '/v1/i18n/languages' },
  { method: 'GET', url: '/api/v1/models/isp.plan' },
  { method: 'GET', url: '/v1/models' },
  { method: 'GET', url: '/v1/gateway/usage' },
  { method: 'GET', url: '/v1/agent/devices' },
  { method: 'GET', url: '/v1/mcp/audit' },
  { method: 'GET', url: '/api/storage/0000000000000000000000000000000000000000000000000000000000000000' },
];

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();
const intruder = await authenticateSecondTenant(app);

test('trust boundary', async (t) => {
  await t.test('every protected route answers 401 without credentials', async () => {
    for (const route of PROTECTED_ROUTES) {
      const res = await app.inject({ method: route.method, url: route.url, payload: route.payload });
      assert.equal(res.statusCode, 401, `${route.method} ${route.url} must not answer anonymously`);
      assert.equal(JSON.parse(res.payload).error.code, 'UNAUTHORIZED');
    }
  });

  await t.test('the public allowlist still answers', async () => {
    assert.equal((await app.inject({ method: 'GET', url: '/health' })).statusCode, 200);
    assert.equal((await app.inject({ method: 'GET', url: '/ready' })).statusCode, 200);
    assert.equal((await app.inject({ method: 'GET', url: '/api/auth/onboarding/status' })).statusCode, 200);
    assert.equal((await app.inject({ method: 'GET', url: '/docs/json' })).statusCode, 200);
  });

  await t.test('device lanes reach their own credential check instead of the guard', async () => {
    const next = await app.inject({ method: 'GET', url: '/v1/agent/device/missions/next' });
    assert.equal(JSON.parse(next.payload).error.code, 'DEVICE_UNAUTHORIZED');

    const claim = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings/claim',
      payload: { pairingCode: 'no-such-code', deviceName: 'laptop', platform: 'windows' },
    });
    assert.notEqual(JSON.parse(claim.payload).error.code, 'UNAUTHORIZED');
  });

  await t.test('API responses carry a locked-down CSP and no internal detail', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/threads' });
    assert.match(String(res.headers['content-security-policy']), /default-src 'none'/);
    assert.doesNotMatch(res.payload, /pglite|TypeError|at .*\.ts:/);
  });

  await t.test('an authenticated tenant can write and read its own NAS', async () => {
    const created = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      headers,
      payload: {
        nas_identifier: 'mikrotik-ccr2004-pop-a',
        ip_address: '192.168.88.1',
        secret: 's3cure-sh4red-k3y',
        vendor: 'mikrotik',
        coa_port: 3799,
        source_allowlist: ['192.168.88.0/24'],
      },
    });
    assert.equal(created.statusCode, 201, created.payload);
    const nas = JSON.parse(created.payload).data;
    assert.equal(nas.secret, '[REDACTED]');
    assert.ok(!created.payload.includes('s3cure-sh4red-k3y'), 'plaintext secret must never be echoed');

    const rotated = await app.inject({
      method: 'PUT',
      url: `/v1/nexus/nas/${nas.id}/secret`,
      headers,
      payload: { secret: 'rotated-sh4red-k3y' },
    });
    assert.equal(rotated.statusCode, 200, rotated.payload);
    assert.equal(JSON.parse(rotated.payload).data.secret, '[REDACTED]');

    const listed = await app.inject({ method: 'GET', url: '/v1/nexus/nas', headers });
    assert.equal(listed.statusCode, 200);
    assert.equal(JSON.parse(listed.payload).data.length, 1);
  });

  await t.test('a second tenant sees none of the first tenant rows', async () => {

    const listed = await app.inject({ method: 'GET', url: '/v1/nexus/nas', headers: intruder });
    assert.deepEqual(JSON.parse(listed.payload).data, []);

    const spoofed = await app.inject({ method: 'GET', url: '/v1/nexus/nas?company_id=1', headers: intruder });
    assert.deepEqual(JSON.parse(spoofed.payload).data, []);

    const ownerNas = JSON.parse((await app.inject({ method: 'GET', url: '/v1/nexus/nas', headers })).payload).data[0];
    const detail = await app.inject({ method: 'GET', url: `/v1/nexus/nas/${ownerNas.id}`, headers: intruder });
    assert.equal(detail.statusCode, 404);

    const rotation = await app.inject({
      method: 'PUT',
      url: `/v1/nexus/nas/${ownerNas.id}/secret`,
      headers: intruder,
      payload: { secret: 'stolen' },
    });
    assert.equal(rotation.statusCode, 404);
  });

  await t.test('a subscription may not book another tenant plan', async () => {
    const plan = await createPlan(app, headers, 'Family 50M');

    const res = await app.inject({
      method: 'POST',
      url: '/v1/works/subscriptions',
      headers: intruder,
      payload: { plan_id: plan.id },
    });
    assert.equal(res.statusCode, 404);
    assert.equal(JSON.parse(res.payload).error.code, 'PLAN_NOT_FOUND');
  });

  await t.test('qorpus documents are scoped to their tenant', async () => {
    const ingest = await app.inject({
      method: 'POST',
      url: '/v1/qorpus/ingest',
      headers,
      payload: { title: 'Runbook', category: 'ops', content: 'The core switch reboot runbook for the POP.' },
    });
    assert.equal(ingest.statusCode, 201, ingest.payload);

    const dupe = await app.inject({
      method: 'POST',
      url: '/v1/qorpus/ingest',
      headers,
      payload: { title: 'Runbook', category: 'ops', content: 'The core switch reboot runbook for the POP.' },
    });
    assert.equal(dupe.statusCode, 200);
    assert.equal(JSON.parse(dupe.payload).data.deduplicated, true);

    const search = await app.inject({
      method: 'POST',
      url: '/v1/qorpus/search',
      headers: intruder,
      payload: { query: 'core switch reboot runbook', min_score: 0.1 },
    });
    assert.deepEqual(JSON.parse(search.payload).data.chunks, []);
  });

  await t.test('generic model CRUD stays opt-in per model', async () => {
    const res = await app.inject({ method: 'GET', url: '/api/v1/models/isp.plan', headers });
    assert.equal(res.statusCode, 403);
    assert.equal(JSON.parse(res.payload).error.code, 'MODEL_NOT_ALLOWED');
  });

  await t.test('raw SQL is not reachable through the MCP tool surface', async () => {
    const list = await app.inject({
      method: 'POST',
      url: '/v1/mcp/message',
      headers,
      payload: { jsonrpc: '2.0', id: 1, method: 'tools/list' },
    });
    assert.equal(list.statusCode, 200, list.payload);
    const names = list.json().result.tools.map((tool) => tool.name);
    assert.ok(!names.includes('pglite_query'), `unexpected tools: ${names.join(', ')}`);

    const call = await app.inject({
      method: 'POST',
      url: '/v1/mcp/message',
      headers,
      payload: { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'pglite_query', arguments: { sql: 'SELECT 1' } } },
    });
    assert.equal(call.json().error.code, -32601);
  });

  await t.test('sign-in is rate limited', async () => {
    let last;
    for (let attempt = 0; attempt < 12; attempt++) {
      last = await app.inject({
        method: 'POST',
        url: '/api/auth/sign-in',
        payload: { email: `brute-${attempt}@example.test`, password: 'not-the-password' },
      });
    }
    assert.equal(last.statusCode, 429);
    assert.ok(Number(last.headers['retry-after']) > 0);
  });
});
