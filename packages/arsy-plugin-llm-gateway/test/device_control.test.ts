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
  const { BaseRepository, SYSTEM_ACTOR, dbEngine, modelRegistry } = require('@allah/arsy-orm') as typeof import('@allah/arsy-orm');
  const { authPlugin } = require('@allah/arsy-plugin-auth') as typeof import('@allah/arsy-plugin-auth');
  const { deviceControlPlugin } = require('@allah/arsy-plugin-llm-gateway') as typeof import('../src');
  await dbEngine.connect();
  const app = Fastify();

  const createSession = async (email: string, companyId: number): Promise<string> => {
    const userModel = modelRegistry.get('auth.user');
    const resUserModel = modelRegistry.get('res.users');
    assert.ok(userModel);
    assert.ok(resUserModel);
    const ormUser = await new BaseRepository(resUserModel).create({
      company_id: companyId,
      email,
      name: email,
      password: '[MANAGED_BY_AUTH_USER]',
      role: 'user',
    }, { systemScope: true }, SYSTEM_ACTOR) as { id: number };
    await new BaseRepository(userModel).create({
      company_id: companyId,
      res_user_id: ormUser.id,
      email,
      password_hash: await bcrypt.hash('test-password-only', 4),
      name: email,
      status: 'active',
    }, { systemScope: true }, SYSTEM_ACTOR);
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

    const resUserModel = modelRegistry.get('res.users');
    const authUserModel = modelRegistry.get('auth.user');
    assert.ok(resUserModel);
    assert.ok(authUserModel);
    const bots = await new BaseRepository(resUserModel).find({
      scope: { systemScope: true },
      filters: [{ field: 'system_key', operator: '=', value: 'bot' }],
      limit: 2,
    }) as Array<{ id: number; role: string; name: string }>;
    assert.equal(bots.length, 1);
    assert.equal(bots[0].role, 'system');
    const botId = Number(bots[0].id);

    const onboarding = await app.inject({
      method: 'POST',
      url: '/api/auth/onboarding',
      payload: {
        name: 'Initial Owner',
        email: 'initial-owner@example.test',
        password: 'initial-owner-password',
      },
    });
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const initialUsers = await new BaseRepository(authUserModel).find({
      scope: { systemScope: true },
      filters: [{ field: 'email', operator: '=', value: 'initial-owner@example.test' }],
      limit: 1,
    }) as Array<{ id: number; res_user_id: number; create_uid: number; write_uid: number }>;
    assert.equal(initialUsers.length, 1);
    assert.equal(
      Number(initialUsers[0].id),
      Number(onboarding.json<ApiResponse<{ user: { id: number } }>>().data.user.id)
    );
    assert.equal(Number(initialUsers[0].create_uid), botId);
    assert.equal(Number(initialUsers[0].write_uid), botId);
    const initialOrmUser = await new BaseRepository(resUserModel).findById(
      initialUsers[0].res_user_id,
      { systemScope: true }
    ) as { role: string } | null;
    assert.equal(initialOrmUser?.role, 'superuser');

    const directInsert = await dbEngine.query<{ create_uid: number; write_uid: number }>(
      `INSERT INTO "auth_setup" ("company_id", "key", "completed")
       VALUES (0, 'audit-trigger-test', false)
       RETURNING "create_uid", "write_uid";`
    );
    assert.equal(Number(directInsert[0].create_uid), botId);
    assert.equal(Number(directInsert[0].write_uid), botId);

    const repeatedOnboarding = await app.inject({
      method: 'POST',
      url: '/api/auth/onboarding',
      payload: {
        name: 'Second Owner',
        email: 'second-owner@example.test',
        password: 'second-owner-password',
      },
    });
    assert.equal(repeatedOnboarding.statusCode, 409);

    const registration = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'New Account', email: 'new-account@example.test', password: 'test-password-only' },
    });
    assert.equal(registration.statusCode, 201);
    const personalSignIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { email: 'new-account@example.test', password: 'test-password-only' },
    });
    assert.equal(personalSignIn.statusCode, 200);
    const personalToken = personalSignIn.json<ApiResponse<{ sessionToken: string }>>().data.sessionToken;
    const personalUserModel = modelRegistry.get('auth.user');
    assert.ok(personalUserModel);
    const personalUser = await new BaseRepository(personalUserModel).find({
      scope: { systemScope: true },
      filters: [{ field: 'email', operator: '=', value: 'new-account@example.test' }],
      limit: 1,
    }) as Array<{ id: number; company_id: number }>;
    assert.equal(personalUser.length, 1);
    assert.equal(personalUser[0].company_id, -personalUser[0].id);

    const secondRegistration = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { name: 'Second Personal Account', email: 'second-personal@example.test', password: 'test-password-only' },
    });
    assert.equal(secondRegistration.statusCode, 201);
    const secondPersonalSignIn = await app.inject({
      method: 'POST',
      url: '/api/auth/sign-in',
      payload: { email: 'second-personal@example.test', password: 'test-password-only' },
    });
    assert.equal(secondPersonalSignIn.statusCode, 200);
    const secondPersonalToken = secondPersonalSignIn.json<ApiResponse<{ sessionToken: string }>>().data.sessionToken;
    const secondPersonalUser = await new BaseRepository(personalUserModel).find({
      scope: { systemScope: true },
      filters: [{ field: 'email', operator: '=', value: 'second-personal@example.test' }],
      limit: 1,
    }) as Array<{ id: number; company_id: number }>;
    assert.equal(secondPersonalUser.length, 1);
    assert.equal(secondPersonalUser[0].company_id, -secondPersonalUser[0].id);
    assert.notEqual(secondPersonalUser[0].company_id, personalUser[0].company_id);

    const personalPairingResponse = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings',
      headers: { 'x-session-token': personalToken },
      payload: { deviceName: 'Personal Tenant Device' },
    });
    assert.equal(personalPairingResponse.statusCode, 200);
    const personalPairing = personalPairingResponse.json<ApiResponse<{ code: string }>>().data;
    const personalClaim = await app.inject({
      method: 'POST',
      url: '/v1/agent/pairings/claim',
      payload: { code: personalPairing.code, deviceName: 'Personal Tenant Device', platform: 'windows' },
    });
    assert.equal(personalClaim.statusCode, 200);
    const personalDevice = personalClaim.json<ApiResponse<{ deviceId: string }>>().data;
    const secondPersonalDevices = await app.inject({
      method: 'GET',
      url: '/v1/agent/devices',
      headers: { 'x-session-token': secondPersonalToken },
    });
    assert.deepEqual(secondPersonalDevices.json<ApiResponse<unknown[]>>().data, []);
    const secondPersonalMission = await app.inject({
      method: 'POST',
      url: '/v1/agent/missions',
      headers: { 'x-session-token': secondPersonalToken },
      payload: { deviceId: Number(personalDevice.deviceId), mode: 'code', goal: 'Not authorized' },
    });
    assert.equal(secondPersonalMission.statusCode, 404);

    const tenantToken = await createSession('tenant-user@example.test', 501);
    const sharedTenantToken = await createSession('shared-tenant-user@example.test', 501);
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
    const sharedTenantDevices = await app.inject({
      method: 'GET',
      url: '/v1/agent/devices',
      headers: { 'x-session-token': sharedTenantToken },
    });
    assert.equal(sharedTenantDevices.json<ApiResponse<unknown[]>>().data.length, 1);

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
      headers: { 'x-session-token': sharedTenantToken },
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
      headers: { 'x-session-token': sharedTenantToken },
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
