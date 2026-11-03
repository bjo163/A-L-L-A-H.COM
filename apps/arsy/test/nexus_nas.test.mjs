import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';

test('NEXUS NAS API Endpoints', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  await t.test('POST /v1/nexus/nas creates NAS client with encrypted secret', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      payload: {
        nas_identifier: 'mikrotik-ccr2004-pop-a',
        ip_address: '192.168.88.1',
        secret: 's3cure-sh4red-k3y',
        vendor: 'mikrotik',
        coa_port: 3799,
        source_allowlist: ['192.168.88.0/24'],
        site_id: 1,
        company_id: 1,
      },
    });

    assert.equal(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.equal(body.data.nas_identifier, 'mikrotik-ccr2004-pop-a');
    assert.equal(body.data.ip_address, '192.168.88.1');
    assert.equal(body.data.vendor, 'mikrotik');
    assert.equal(body.data.coa_port, 3799);
    assert.deepStrictEqual(body.data.source_allowlist, ['192.168.88.0/24']);
    assert.ok(body.data.secret && body.data.secret !== 's3cure-sh4red-k3y', 'Secret should be encrypted, not plaintext');
    assert.equal(body.data.secret, '[REDACTED]', 'Secret should be redacted in creation response');
  });

  await t.test('GET /v1/nexus/nas list returns secrets redacted', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/nexus/nas?company_id=1',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.ok(Array.isArray(body.data));
    for (const nas of body.data) {
      assert.equal(nas.secret, '[REDACTED]', 'Secret must be redacted in list response');
    }
  });

  await t.test('GET /v1/nexus/nas/:id returns single NAS with redacted secret', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      payload: {
        nas_identifier: 'mikrotik-test',
        ip_address: '10.0.0.1',
        secret: 'test-secret',
        vendor: 'mikrotik',
        company_id: 1,
      },
    });

    const created = JSON.parse(createRes.payload);
    const nasId = created.data.id;

    const getRes = await app.inject({
      method: 'GET',
      url: `/v1/nexus/nas/${nasId}`,
    });

    assert.equal(getRes.statusCode, 200);
    const body = JSON.parse(getRes.payload);
    assert.equal(body.data.secret, '[REDACTED]', 'Secret must be redacted in detail response');
    assert.equal(body.data.nas_identifier, 'mikrotik-test');
    assert.equal(body.data.ip_address, '10.0.0.1');
  });

  await t.test('PUT /v1/nexus/nas/:id/secret rotates secret with audit', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/v1/nexus/nas',
      payload: {
        nas_identifier: 'mikrotik-rotate-test',
        ip_address: '10.0.0.2',
        secret: 'old-secret',
        vendor: 'mikrotik',
        company_id: 1,
      },
    });

    const created = JSON.parse(createRes.payload);
    const nasId = created.data.id;

    const rotateRes = await app.inject({
      method: 'PUT',
      url: `/v1/nexus/nas/${nasId}/secret`,
      payload: {
        secret: 'new-secret',
        rotated_by: 'test-user',
      },
    });

    assert.equal(rotateRes.statusCode, 200);
    const body = JSON.parse(rotateRes.payload);
    assert.ok(body.data);
    assert.equal(body.data.secret, '[REDACTED]', 'Secret must be redacted after rotation');
  });

  await t.test('GET /v1/nexus/pools lists IP pools', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/nexus/pools?company_id=1',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.ok(Array.isArray(body.data));
  });

  await app.close();
});