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
        secret: 'nas-shared-key',
        vendor: 'mikrotik',
        coa_port: 3799,
        source_allowlist: ['192.168.88.0/24'],
      },
    });
    assert.equal(created.statusCode, 201, created.payload);
    const nas = JSON.parse(created.payload).data;
    assert.equal(nas.secret, '[REDACTED]');
    assert.ok(!created.payload.includes('nas-shared-key'), 'plaintext secret must never be echoed');

    const rotated = await app.inject({
      method: 'PUT',
      url: `/v1/nexus/nas/${nas.id}/secret`,
      headers,
      payload: { secret: 'nas-rotated-key' },
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

  await t.test('identity models stay protected and global access is explicit and audited', async () => {
    const previousAllowlist = process.env.GENERIC_MODEL_ALLOWLIST;
    process.env.GENERIC_MODEL_ALLOWLIST = 'isp.plan,res.users,auth.user,auth.session,auth.setup,arsy.audit.event,ai.provider,ai.virtual_key,nexus.nas,nexus.nas_secret_log';
    try {
      for (const modelName of [
        'res.users',
        'auth.user',
        'auth.session',
        'auth.setup',
        'arsy.audit.event',
        'ai.provider',
        'ai.virtual_key',
        'nexus.nas',
        'nexus.nas_secret_log',
      ]) {
        const response = await app.inject({
          method: 'GET',
          url: `/api/v1/models/${modelName}`,
          headers,
        });
        assert.equal(response.statusCode, 403);
        assert.equal(JSON.parse(response.payload).error.code, 'PROTECTED_MODEL');
        const create = await app.inject({
          method: 'POST',
          url: `/api/v1/models/${modelName}`,
          headers,
          payload: { company_id: -1, role: 'superuser', email: 'forged@example.test' },
        });
        assert.equal(create.statusCode, 403);
        assert.equal(JSON.parse(create.payload).error.code, 'PROTECTED_MODEL');
      }

      const ownerPlan = await createPlan(app, headers, 'Owner tenant plan');
      const intruderPlan = await createPlan(app, intruder, 'Other tenant plan');
      const companyId = intruderPlan.company_id;
      const reason = 'Support case 123 review';
      const adminList = await app.inject({
        method: 'GET',
        url: `/v1/admin/models/isp.plan?company_id=${companyId}&reason=${encodeURIComponent(reason)}`,
        headers,
      });
      assert.equal(adminList.statusCode, 200, adminList.payload);
      assert.deepEqual(JSON.parse(adminList.payload).data.map((plan) => plan.name), ['Other tenant plan']);

      const denied = await app.inject({
        method: 'GET',
        url: `/v1/admin/models/isp.plan?company_id=${ownerPlan.company_id}&reason=${encodeURIComponent(reason)}`,
        headers: intruder,
      });
      assert.equal(denied.statusCode, 403);
      assert.equal(JSON.parse(denied.payload).error.code, 'SUPERUSER_REQUIRED');

      const adminCreate = await app.inject({
        method: 'POST',
        url: '/v1/admin/models/isp.plan',
        headers,
        payload: {
          company_id: companyId,
          reason,
          data: { name: 'Admin-created tenant plan' },
        },
      });
      assert.equal(adminCreate.statusCode, 201, adminCreate.payload);
      const tenantList = await app.inject({
        method: 'GET',
        url: '/v1/works/plans',
        headers: intruder,
      });
      assert.ok(JSON.parse(tenantList.payload).data.some((plan) => plan.name === 'Admin-created tenant plan'));

      const auditList = await app.inject({
        method: 'GET',
        url: `/v1/admin/audit-events?company_id=${companyId}&reason=${encodeURIComponent(reason)}`,
        headers,
      });
      assert.equal(auditList.statusCode, 200, auditList.payload);
      const events = JSON.parse(auditList.payload).data;
      assert.ok(events.some((event) => event.operation === 'admin_read' && event.model_name === 'isp.plan'));
      assert.ok(events.some((event) => event.operation === 'insert' && event.model_name === 'isp.plan'));
      // Only admin-authorized operations carry a reason hash; those are the ones that must be
      // marked as explicit global access. Ordinary tenant writes stay global_access=false.
      const adminEvents = events.filter((event) => event.reason_hash);
      assert.ok(adminEvents.length >= 2);
      assert.ok(adminEvents.every((event) => event.global_access === true));
      assert.ok(adminEvents.every((event) => event.reason_hash.length === 64));
      assert.doesNotMatch(auditList.payload, /Support case 123 review/);
      assert.equal(events.some((event) => Object.hasOwn(event, 'old_values') || Object.hasOwn(event, 'new_values')), false);

      const missingReason = await app.inject({
        method: 'GET',
        url: `/v1/admin/models/isp.plan?company_id=${companyId}`,
        headers,
      });
      assert.equal(missingReason.statusCode, 400);

      const adminUpdate = await app.inject({
        method: 'PUT',
        url: `/v1/admin/models/isp.plan/${JSON.parse(adminCreate.payload).data.id}`,
        headers,
        payload: {
          company_id: companyId,
          reason,
          data: { name: 'Updated by global admin' },
        },
      });
      assert.equal(adminUpdate.statusCode, 200, adminUpdate.payload);
      assert.equal(JSON.parse(adminUpdate.payload).data.company_id, companyId);
      const tenantListAfterUpdate = await app.inject({
        method: 'GET',
        url: '/v1/works/plans',
        headers: intruder,
      });
      assert.ok(JSON.parse(tenantListAfterUpdate.payload).data.some((plan) => plan.name === 'Updated by global admin'));
      const updatedAuditList = await app.inject({
        method: 'GET',
        url: `/v1/admin/audit-events?company_id=${companyId}&reason=${encodeURIComponent(reason)}`,
        headers,
      });
      assert.ok(JSON.parse(updatedAuditList.payload).data.some(
        (event) => event.operation === 'update' && event.model_name === 'isp.plan'
      ));

      const ownerTransfer = await app.inject({
        method: 'PUT',
        url: `/v1/admin/models/isp.plan/${JSON.parse(adminCreate.payload).data.id}`,
        headers,
        payload: {
          company_id: companyId,
          reason,
          data: { company_id: ownerPlan.company_id },
        },
      });
      assert.equal(ownerTransfer.statusCode, 400);

      const promoteDenied = await app.inject({
        method: 'POST',
        url: `/v1/admin/users/${JSON.parse((await app.inject({ method: 'GET', url: '/api/auth/current', headers: intruder })).payload).data.id}/role`,
        headers: intruder,
        payload: { role: 'superuser', reason },
      });
      assert.equal(promoteDenied.statusCode, 403);
      assert.equal(JSON.parse(promoteDenied.payload).error.code, 'SUPERUSER_REQUIRED');

      const registration = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          name: 'Unprivileged Registration',
        email: 'unprivileged@example.test',
        password: 'unpriv-pass-1',
        role: 'superuser',
      },
    });
    assert.equal(registration.statusCode, 201, registration.payload);
    const unprivilegedLogin = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { email: 'unprivileged@example.test', password: 'unpriv-pass-1' },
    });
      assert.equal(unprivilegedLogin.statusCode, 200);
      const unprivilegedCurrent = await app.inject({
        method: 'GET',
        url: '/api/auth/current',
        headers: { 'x-session-token': unprivilegedLogin.json().data.sessionToken },
      });
      assert.equal(unprivilegedCurrent.json().data.role, 'user');

      const userResponse = await app.inject({ method: 'GET', url: '/api/auth/current', headers: intruder });
      const userId = JSON.parse(userResponse.payload).data.id;
      const promoted = await app.inject({
        method: 'POST',
        url: `/v1/admin/users/${userId}/role`,
        headers,
        payload: { role: 'superuser', reason },
      });
      assert.equal(promoted.statusCode, 200, promoted.payload);
      assert.equal(JSON.parse((await app.inject({ method: 'GET', url: '/api/auth/current', headers: intruder })).payload).data.role, 'superuser');

      const demoted = await app.inject({
        method: 'POST',
        url: `/v1/admin/users/${userId}/role`,
        headers,
        payload: { role: 'user', reason },
      });
      assert.equal(demoted.statusCode, 200, demoted.payload);
      const ownerCurrent = await app.inject({ method: 'GET', url: '/api/auth/current', headers });
      const ownerId = JSON.parse(ownerCurrent.payload).data.id;
      const lastAdminDemotion = await app.inject({
        method: 'POST',
        url: `/v1/admin/users/${ownerId}/role`,
        headers,
        payload: { role: 'user', reason },
      });
      assert.equal(lastAdminDemotion.statusCode, 409);
      assert.equal(JSON.parse(lastAdminDemotion.payload).error.code, 'LAST_SUPERUSER');
    } finally {
      if (previousAllowlist === undefined) delete process.env.GENERIC_MODEL_ALLOWLIST;
      else process.env.GENERIC_MODEL_ALLOWLIST = previousAllowlist;
    }
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
