import assert from 'node:assert/strict';
import test from 'node:test';
import { swarmCoordinator } from '@allah/arsy-plugin-llm-gateway';
import { buildAuthenticatedApp } from './helpers.mjs';

// The hub boots one in-memory database per process, so this file keeps a single app.
const { app, headers } = await buildAuthenticatedApp();
const H = () => ({ ...headers, 'content-type': 'application/json' });

test('Multi-Agent Swarm Orchestration', async (t) => {
  await t.test('anonymous swarm runs are rejected', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/swarm/run', headers: { 'content-type': 'application/json' }, payload: { goal: 'x' } });
    assert.equal(res.statusCode, 401);
  });

  await t.test('POST /v1/swarm/run returns a mission envelope', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/swarm/run', headers: H(), payload: { goal: 'Summarize platform health', max_turns: 4 } });
    assert.equal(res.statusCode, 200, res.payload);
    const body = res.json();
    assert.match(body.data.mission_id, /^swarm_/);
    assert.ok(Array.isArray(body.data.steps));
    assert.ok(['completed', 'max_turns', 'human_intervention', 'error', 'verifier_rejected'].includes(body.data.finish_reason));
  });

  await t.test('a missing goal is rejected', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/swarm/run', headers: H(), payload: {} });
    assert.equal(res.statusCode, 400);
    assert.equal(res.json().success, false);
  });

  await t.test('swarm stream emits SSE events', async () => {
    const res = await app.inject({ method: 'POST', url: '/v1/swarm/stream', headers: H(), payload: { goal: 'Status report', max_turns: 3 } });
    assert.equal(res.statusCode, 200, res.payload);
    assert.match(String(res.headers['content-type']), /text\/event-stream/);
  });

  await t.test('SwarmCoordinator exposes a ready singleton with run()', () => {
    assert.ok(swarmCoordinator);
    assert.equal(typeof swarmCoordinator.run, 'function');
  });

  await app.close();
});
