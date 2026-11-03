import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { toolRegistry } from '@allah/arsy-plugin-llm-gateway';

test('Cognitive Agent Loop & Generative SDUI Suite', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  await t.test('POST /v1/agent/run executes single-turn or multi-turn reasoning cleanly', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/run',
      payload: {
        prompt: 'Hitung jumlah user aktif di database',
        max_steps: 3,
      },
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.success, true);
    assert.ok(body.data.session_id);
    assert.ok(Array.isArray(body.data.steps));
    assert.ok(typeof body.data.total_steps === 'number');
  });

  await t.test('POST /v1/agent/run synthesizes SDUI with render_sdui tool', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/run',
      payload: {
        prompt: 'Buatkan kartu ringkasan status operasional platform',
        allowed_tools: ['render_sdui'],
        max_steps: 4,
      },
    });

    assert.equal(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.equal(body.success, true);
    assert.ok(body.data.session_id);
  });

  await t.test('POST /v1/agent/stream initiates Server-Sent Events', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/v1/agent/stream',
      payload: {
        prompt: 'Analisis status sistem',
        max_steps: 2,
      },
    });

    assert.equal(res.statusCode, 200);
    assert.ok(res.headers['content-type']?.includes('text/event-stream'));
    assert.ok(res.payload.includes('event: thought') || res.payload.includes('event: done'));
  });

  await app.close();
});
