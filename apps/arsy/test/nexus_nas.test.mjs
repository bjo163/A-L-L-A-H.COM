import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();

test('NEXUS NAS API Endpoints', async (t) => {
  await t.test('POST /v1/nexus/nas creates NAS client with encrypted, redacted secret', async () => {
    const res = await app.inject({
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

    assert.equal(res.statusCode, 201, res.payload);
    const body = JSON.parse(res.payload);
    assert.equal(body.data.nas_identifier, 'mikrotik-ccr2004-pop-a');
    assert.equal(body.data.ip_address, '192.168.88.1');
    assert.equal(body.data.vendor, 'mikrotik');
    assert.deepEqual(body.data.source_allowlist, ['192.168.88.0/24']);
    assert.equal(body.data.secret, '[REDACTED]', 'Secret must never be echoed, plaintext or ciphertext');
    assert.ok(!res.payload.includes('s3cure-sh4red-k3y'));
  });

  await t.test('GET /v1/nexus/nas lists the tenant NAS with secrets redacted', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/nexus/nas', headers });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.data));
    for (const nas of body.data) {
      assert.equal(nas.secret, '[REDACTED]');
    }
  });

  await t.test('GET /v1/nexus/nas/:id returns a single NAS with redacted secret', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      headers,
      payload: { nas_identifier: 'mikrotik-test', ip_address: '10.0.0.1', secret: 'test-secret', vendor: 'mikrotik' },
    });
    const nasId = JSON.parse(createRes.payload).data.id;

    const getRes = await app.inject({ method: 'GET', url: `/v1/nexus/nas/${nasId}`, headers });
    assert.equal(getRes.statusCode, 200);
    const body = JSON.parse(getRes.payload);
    assert.equal(body.data.secret, '[REDACTED]');
    assert.equal(body.data.nas_identifier, 'mikrotik-test');
    assert.equal(body.data.ip_address, '10.0.0.1');
  });

  await t.test('PUT /v1/nexus/nas/:id/secret rotates the secret with audit', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      headers,
      payload: { nas_identifier: 'mikrotik-rotate-test', ip_address: '10.0.0.2', secret: 'old-secret', vendor: 'mikrotik' },
    });
    const nasId = JSON.parse(createRes.payload).data.id;

    const rotateRes = await app.inject({
      method: 'PUT',
      url: `/v1/nexus/nas/${nasId}/secret`,
      headers,
      payload: { secret: 'new-secret' },
    });

    assert.equal(rotateRes.statusCode, 200, rotateRes.payload);
    assert.equal(JSON.parse(rotateRes.payload).data.secret, '[REDACTED]');
  });

  await t.test('GET /v1/nexus/pools lists IP pools', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/nexus/pools', headers });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(JSON.parse(res.payload).data));
  });

  await app.close();
});
