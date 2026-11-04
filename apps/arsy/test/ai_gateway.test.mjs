import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();
const authed = (extra = {}) => ({ ...headers, 'content-type': 'application/json', ...extra });
const post = (payload, h = {}) =>
  app.inject({ method: 'POST', url: '/v1/chat/completions', headers: authed(h), body: JSON.stringify(payload) });

test('AI Gateway provider & routing', async (t) => {
  await t.test('GET /v1/models lists the router aliases', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/models', headers });
    assert.equal(res.statusCode, 200);
    const ids = res.json().data.data.map((m) => m.id);
    assert.ok(ids.includes('dx-default'));
    assert.ok(ids.includes('dx-fast'));
    assert.ok(ids.includes('dx-reasoning'));
  });

  await t.test('the gateway surface is not reachable anonymously', async () => {
    const res = await app.inject({
      method: 'POST', url: '/v1/chat/completions',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'dx-default', messages: [{ role: 'user', content: 'x' }] }),
    });
    assert.equal(res.statusCode, 401);
  });

  await t.test('non-streaming completion returns a chat.completion', async () => {
    const res = await post({ model: 'dx-default', messages: [{ role: 'user', content: 'Hello AI Gateway' }], temperature: 0.5 });
    assert.equal(res.statusCode, 200, res.payload);
    const body = res.json();
    assert.equal(body.object, 'chat.completion');
    assert.ok(body.choices[0].message.content.length > 0);
    assert.ok(body.usage.total_tokens > 0);
  });

  await t.test('a duplicate request is served from the semantic cache', async () => {
    const payload = { model: 'dx-reasoning', messages: [{ role: 'user', content: 'Unique Cache Test 98765' }], temperature: 0.2 };
    assert.equal((await post(payload)).headers['x-cache-hit'], undefined);
    assert.equal((await post(payload)).headers['x-cache-hit'], 'true');
  });

  await t.test('stream=true emits SSE chunks', async () => {
    const res = await post({ model: 'dx-fast', messages: [{ role: 'user', content: 'Stream test' }], stream: true });
    assert.equal(res.statusCode, 200);
    assert.match(String(res.headers['content-type']), /text\/event-stream/);
    assert.ok(res.payload.includes('chat.completion.chunk'));
    assert.ok(res.payload.includes('data: [DONE]'));
  });

  await t.test('GET /v1/gateway/telemetry reports metrics and circuits', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/gateway/telemetry', headers });
    assert.equal(res.statusCode, 200, res.payload);
    assert.ok(res.json().data.metrics.totalRequests >= 1);
  });

  await t.test('GET /v1/gateway/usage returns persisted logs', async () => {
    const res = await app.inject({ method: 'GET', url: '/v1/gateway/usage', headers });
    assert.equal(res.statusCode, 200);
    assert.ok(Array.isArray(res.json().data));
    assert.ok(res.json().data.length >= 1);
  });

  await app.close();
});
