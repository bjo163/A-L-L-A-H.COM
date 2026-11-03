import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { code?: string; message?: string };
}

test('paired devices and missions remain tenant-scoped and revocable', { timeout: 60_000 }, async () => {
  delete process.env.PG_DATA_DIR;
  const require = createRequire(resolve(process.cwd(), 'device-control.test.cjs'));
  const Fastify = require('fastify') as typeof import('fastify');
  const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
  const { BaseRepository, dbEngine, modelRegistry } = require('@allah/arsy-orm') as typeof import('@allah/arsy-orm');
  const { authPlugin } = require('@allah/arsy-plugin-auth') as typeof import('@allah/arsy-plugin-auth');
  const { deviceControlPlugin } = require('@allah/arsy-plugin-llm-gateway') as typeof import('../src');
  await dbEngine.connect();
  const app = Fastify();

  const createSession = async (email: string, companyId: number): Promise<string> => {
    const userModel = modelRegistry.get('auth.user');
    assert.ok(userModel);
    await new BaseRepository(userModel).create({
      email,
      password_hash: await bcrypt.hash('test-password-only', 4),
      name: email,
      status: 'active',
    }, companyId);
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { email, password: 'test-password-only' },
    });
    assert.equal(response.statusCode, 200);
    const body = response.json<ApiResponse<{ sessionToken: string }>>();
    assert.equal(body.success, true);
    return body.data.sessionToken;
  };

  try {
    await app.register(authPlugin, { prefix: '/api/auth' });
    await app.register(deviceControlPlugin, { prefix: '/v1' });
    await app.ready();
    const tenantToken = await createSession('tenant-user@example.test', 501);
    const otherTenantToken = await createSession('other-user@example.test', 502);

    const pairingResponse = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings',
      headers: { 'x-session-token': tenantToken },
      payload: { deviceName: 'Test Windows Device' },
    });
    assert.equal(pairingResponse.statusCode, 200);
    const pairing = pairingResponse.json<ApiResponse<{ code: string }>>().data;

    const claimResponse = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings/claim',
      payload: { code: pairing.code, deviceName: 'Test Windows Device', platform: 'windows' },
    });
    assert.equal(claimResponse.statusCode, 200);
    const device = claimResponse.json<ApiResponse<{ deviceId: string; deviceToken: string }>>().data;

    const devicesResponse = await app.inject({
      method: 'GET',
      url: '/v1/agent/devices',
      headers: { 'x-session-token': otherTenantToken },
    });
    assert.deepEqual(devicesResponse.json<ApiResponse<unknown[]>>().data, []);

    const deniedMission = await app.inject({
      method: 'POST',
      url: '/v1/agent/missions',
      headers: { 'x-session-token': otherTenantToken },
      payload: { deviceId: Number(device.deviceId), mode: 'code', goal: 'Not authorized' },
    });
    assert.equal(deniedMission.statusCode, 404);

    const missionResponse = await app.inject({
      method: 'POST',
      url: '/v1/agent/missions',
      headers: { 'x-session-token': tenantToken },
      payload: { deviceId: Number(device.deviceId), mode: 'code', goal: 'Review a local file' },
    });
    assert.equal(missionResponse.statusCode, 200);
    const mission = missionResponse.json<ApiResponse<{ id: string }>>().data;

    const pollResponse = await app.inject({
      method: 'GET',
      url: '/v1/agent/device/missions/next',
      headers: { 'x-agent-device-token': device.deviceToken },
    });
    assert.equal(pollResponse.statusCode, 200);
    assert.equal(pollResponse.json<ApiResponse<{ mission: { id: string; state: string } }>>().data.mission.id, mission.id);

    const cancelResponse = await app.inject({
      method: 'POST',
      url: `/v1/agent/missions/${mission.id}/cancel`,
      headers: { 'x-session-token': tenantToken },
    });
    assert.equal(cancelResponse.statusCode, 200);

    const cancelPoll = await app.inject({
      method: 'GET',
      url: '/v1/agent/device/missions/next',
      headers: { 'x-agent-device-token': device.deviceToken },
    });
    assert.equal(cancelPoll.json<ApiResponse<{ mission: { state: string } }>>().data.mission.state, 'cancel_requested');

    const report = await app.inject({
      method: 'POST',
      url: `/v1/agent/device/missions/${mission.id}/events`,
      headers: { 'x-agent-device-token': device.deviceToken },
      payload: { event: 'cancelled', payload: { step: 1, prompt: 'must not be persisted' } },
    });
    assert.equal(report.statusCode, 200);

    const eventsResponse = await app.inject({
      method: 'GET',
      url: `/v1/agent/missions/${mission.id}/events`,
      headers: { 'x-session-token': tenantToken },
    });
    const events = eventsResponse.json<ApiResponse<Array<{ type: string; payload: Record<string, unknown> }>>>().data;
    assert.ok(events.some((event) => event.type === 'cancelled'));
    assert.equal(events.at(-1)?.payload.prompt, undefined);

    const replayResponse = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings/claim',
      payload: { code: pairing.code, deviceName: 'Replay Device', platform: 'windows' },
    });
    assert.equal(replayResponse.statusCode, 410);

    const revokeResponse = await app.inject({
      method: 'POST',
      url: `/v1/agent/devices/${device.deviceId}/revoke`,
      headers: { 'x-session-token': tenantToken },
    });
    assert.equal(revokeResponse.statusCode, 200);
    const revokedPoll = await app.inject({
      method: 'GET',
      url: '/v1/agent/device/missions/next',
      headers: { 'x-agent-device-token': device.deviceToken },
    });
    assert.equal(revokedPoll.statusCode, 401);
  } finally {
    await app.close();
    await dbEngine.close();
  }
});
