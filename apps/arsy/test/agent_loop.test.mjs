import test from 'node:test';
import assert from 'node:assert/strict';
import { buildArsyApp } from '../src/app.ts';

test('Autonomous Cognitive Agent Loop Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  t.after(async () => {
    await app.close();
  });

  await t.test('POST /v1/agent/run accepts mission prompt and returns session', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/run',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Count the number of records in res_partner table using SQL',
        max_steps: 5,
        temperature: 0.2,
      }),
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.body);
    assert.equal(body.success, true);
    assert.ok(body.data.session_id.startsWith('agent_'));
    assert.ok(typeof body.data.finish_reason === 'string');
    assert.ok(body.data.total_steps >= 1);
  });

  await t.test('POST /v1/agent/stream emits SSE events with thought/tool_call/tool_result/done', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/stream',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Query the qorpus knowledge base for MoonWitness architecture',
        max_steps: 4,
        temperature: 0.1,
      }),
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/event-stream'));
    assert.ok(res.body.includes('event: thought'));
    assert.ok(res.body.includes('event: tool_call'));
    assert.ok(res.body.includes('event: tool_result'));
    assert.ok(res.body.includes('event: done'));
  });

  await t.test('POST /v1/agent/run rejects empty prompt', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/run',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: '' }),
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.body);
    assert.equal(body.success, false);
  });

  await t.test('POST /v1/agent/stream enforces max_steps ceiling', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/stream',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Loop detection test - execute tools repeatedly',
        max_steps: 3,
        temperature: 0.0,
      }),
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type'].includes('text/event-stream'));
    // Should terminate before exceeding max_steps
    assert.ok(!res.body.includes('max_steps_exceeded'));
  });
});