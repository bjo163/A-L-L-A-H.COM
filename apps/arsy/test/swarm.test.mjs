import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { swarmCoordinator } from '@allah/arsy-plugin-llm-gateway';

test('Multi-Agent Swarm Orchestration Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  await t.test('POST /v1/swarm/run orchestrates a hierarchical multi-agent mission', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/swarm/run',
      payload: {
        goal: 'Analisis kesehatan database dan verifikasi ringkasan',
        max_turns: 6,
      },
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.data);
    assert.ok(body.data.mission_id);
    assert.ok(Array.isArray(body.data.steps));
    assert.ok(body.data.steps.length > 0);
    assert.ok(Array.isArray(body.data.messages));
    assert.ok(
      ['completed', 'max_turns', 'human_intervention', 'error', 'verifier_rejected'].includes(
        body.data.finish_reason
      )
    );
  });

  await t.test('POST /v1/swarm/run returns 400 when goal is missing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/swarm/run',
      payload: {},
    });

    assert.equal(res.statusCode, 400);
    const body = JSON.parse(res.payload);
    assert.ok(body.error);
  });

  await t.test('POST /v1/swarm/stream initiates Server-Sent Events with role-tagged trajectory', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/swarm/stream',
      payload: {
        goal: 'Ringkas status platform',
        max_turns: 4,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type']?.includes('text/event-stream'));
    assert.ok(res.payload.includes('event: swarm_agent_step') || res.payload.includes('event: done'));
  });

  await t.test('SwarmCoordinator exposes a ready singleton with run()', () => {
    assert.ok(swarmCoordinator);
    assert.equal(typeof swarmCoordinator.run, 'function');
  });

  await app.close();
});