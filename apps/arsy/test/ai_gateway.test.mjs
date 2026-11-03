import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArsyApp } from '../src/app.ts';

test('AI Gateway Multi-Provider & Fallback Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  t.after(async () => {
    await app.close();
  });

  await t.test('GET /v1/models returns active models and route aliases', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/models',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.equal(body.data.object, 'list');
    assert.ok(Array.isArray(body.data.data));

    const modelIds = body.data.data.map((m) => m.id);
    assert.ok(modelIds.includes('dx-default'), 'Should list dx-default route');
    assert.ok(modelIds.includes('dx-fast'), 'Should list dx-fast route');
    assert.ok(modelIds.includes('dx-reasoning'), 'Should list dx-reasoning route');
    assert.ok(modelIds.includes('gpt-4o') || modelIds.includes('claude-3-5-sonnet-20241022'));
  });

  await t.test('POST /v1/chat/completions (non-streaming with mock fallback)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dx-default',
        messages: [{ role: 'user', content: 'Hello AI Gateway' }],
        temperature: 0.5,
      }),
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.object, 'chat.completion');
    assert.ok(body.choices.length > 0);
    assert.ok(body.choices[0].message.content.length > 0);
    assert.ok(body.usage.total_tokens > 0);
  });

  await t.test('POST /v1/chat/completions returns cached response on duplicate request', async () => {
    const payload = {
      model: 'dx-reasoning',
      messages: [{ role: 'user', content: 'Unique Cache Test Query 12345' }],
      temperature: 0.2,
    };

    // First call (cache miss)
    const res1 = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(res1.statusCode, 200);
    assert.equal(res1.headers['x-cache-hit'], undefined);

    // Second call (cache hit)
    const res2 = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(res2.statusCode, 200);
    assert.equal(res2.headers['x-cache-hit'], 'true');
  });

  await t.test('POST /v1/chat/completions streaming SSE (stream=true)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model: 'dx-fast',
        messages: [{ role: 'user', content: 'Stream test message' }],
        stream: true,
      }),
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/event-stream'));
    assert.ok(res.body.includes('chat.completion.chunk'));
    assert.ok(res.body.includes('data: [DONE]'));
  });

  await t.test('POST /v1/chat/completions with valid virtual key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: {
        'content-type': 'application/json',
        'x-virtual-key': 'mw_live_master_hash',
      },
      body: JSON.stringify({
        model: 'dx-default',
        messages: [{ role: 'user', content: 'Authorized Key Request' }],
      }),
    });

    assert.equal(res.statusCode, 200);
  });

  await t.test('POST /v1/chat/completions rejects invalid virtual key', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/chat/completions',
      headers: {
        'content-type': 'application/json',
        'x-virtual-key': 'invalid_nonexistent_key',
      },
      body: JSON.stringify({
        model: 'dx-default',
        messages: [{ role: 'user', content: 'Unauthorized Request' }],
      }),
    });

    assert.equal(res.statusCode, 403);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'VIRTUAL_KEY_ERROR');
  });

  await t.test('GET /v1/gateway/telemetry returns metrics and circuit statuses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/gateway/telemetry',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.metrics.totalRequests >= 1);
    assert.ok(typeof body.data.circuits === 'object');
  });

  await t.test('GET /v1/gateway/usage returns persisted logs from PGlite', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/v1/gateway/usage',
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });
});
