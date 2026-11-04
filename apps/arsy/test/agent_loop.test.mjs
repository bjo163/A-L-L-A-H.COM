import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();
const run = (payload, h = {}) =>
  app.inject({ method: 'POST', url: '/v1/agent/run', headers: { ...headers, 'content-type': 'application/json', ...h }, body: JSON.stringify(payload) });
const stream = (payload) =>
  app.inject({ method: 'POST', url: '/v1/agent/stream', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify(payload) });

test('Cognitive Agent Loop', async (t) => {
  await t.test('anonymous agent runs are rejected', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/agent/run', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt: 'x' }) });
    assert.equal(res.statusCode, 401);
  });

  await t.test('agent run returns a session envelope', async () => {
    const res = await run({ prompt: 'Summarize the platform status', max_steps: 3, temperature: 0.2 });
    assert.equal(res.statusCode, 200, res.payload);
    const body = res.json();
    assert.equal(body.success, true);
    assert.match(body.data.session_id, /^agent_/);
    assert.ok(typeof body.data.finish_reason === 'string');
  });

  await t.test('agent stream emits SSE lifecycle events', async () => {
    const res = await stream({ prompt: 'Query the knowledge base', max_steps: 3, temperature: 0.1 });
    assert.equal(res.statusCode, 200);
    assert.match(String(res.headers['content-type']), /text\/event-stream/);
    assert.ok(res.payload.includes('event: thought'));
    assert.ok(res.payload.includes('event: done'));
  });

  await t.test('an empty prompt is rejected', async () => {
    const res = await run({ prompt: '' });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().success, false);
  });

  await app.close();
});
