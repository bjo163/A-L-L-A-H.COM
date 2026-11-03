import crypto from 'crypto';
import fp from 'fastify-plugin';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { fail, ok } from '@allah/arsy-core';
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SchemaMigrator,
} from '@allah/arsy-orm';
import {
  AgentDevice,
  AgentMission,
  AgentMissionEvent,
  AgentPairing,
  registerAgentDeviceModels,
} from './agent_devices';

interface DeviceControlOptions {
  prefix: string;
}

interface AuthenticatedUser {
  id?: number | string;
}

interface AgentDeviceRow {
  id: number;
  name: string;
  platform: 'windows';
  credential_hash: string;
  state: 'active' | 'revoked';
  last_seen_at?: string | null;
  company_id?: number | string | null;
}

interface AgentMissionRow {
  id: number;
  device_id: number;
  submitted_by: number;
  mode: string;
  goal: string;
  state: string;
  result?: Record<string, unknown> | null;
  create_date?: string;
  write_date?: string;
}

const allowedModes = new Set(['ask', 'plan', 'code', 'debug', 'ideate', 'autopilot']);
const terminalMissionStates = new Set(['cancelled', 'completed', 'failed', 'blocked']);
const allowedDeviceEvents = new Set([
  'awaiting_approval',
  'completed',
  'cancelled',
  'failed',
  'blocked',
  'progress',
]);

function hash(value: string): string {
  return crypto.createHash('sha256').update(value, 'utf8').digest('hex');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseId(value: string | undefined): number | undefined {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

async function getCompanyContext(
  request: { user?: AuthenticatedUser },
  reply: { status(code: number): { send(payload: unknown): unknown } }
): Promise<{ userId: number; companyId: number } | undefined> {
  const userId = Number(request.user?.id);
  if (!Number.isSafeInteger(userId) || userId < 1) {
    reply.status(401).send(fail('UNAUTHORIZED', 'An authenticated user is required.'));
    return undefined;
  }

  const userModel = modelRegistry.get('auth.user');
  if (!userModel) {
    reply.status(503).send(fail('AUTH_MODEL_UNAVAILABLE', 'Authentication storage is unavailable.'));
    return undefined;
  }
  const user = await new BaseRepository(userModel).findById(userId) as { company_id?: unknown } | null;
  const companyId = Number(user?.company_id);
  if (!Number.isSafeInteger(companyId) || companyId === 0) {
    reply.status(403).send(fail('TENANT_REQUIRED', 'A verified company tenant must be assigned before pairing devices.'));
    return undefined;
  }
  return { userId, companyId };
}

function getRepository<T>(modelName: string): BaseRepository<T> {
  const model = modelRegistry.get(modelName);
  if (!model) throw new Error(`Agent control model '${modelName}' is not registered.`);
  return new BaseRepository<T>(model);
}

function recordEvent(
  missionId: number,
  companyId: number,
  eventType: string,
  payload: Record<string, unknown> = {}
): Promise<unknown> {
  return getRepository('agent.mission.event').create({
    mission_id: missionId,
    event_type: eventType,
    payload,
  }, companyId);
}

async function authenticateDevice(request: {
  headers: Record<string, string | string[] | undefined>;
}): Promise<AgentDeviceRow | undefined> {
  const rawToken = request.headers['x-agent-device-token'];
  if (typeof rawToken !== 'string' || rawToken.length < 32 || rawToken.length > 256) return undefined;
  const devices = await getRepository<AgentDeviceRow>('agent.device').find({
    filters: [
      { field: 'credential_hash', operator: '=', value: hash(rawToken) },
      { field: 'state', operator: '=', value: 'active' },
    ],
    limit: 1,
  });
  return devices[0];
}

const deviceControlAsync: FastifyPluginAsync<DeviceControlOptions> = async (
  fastify: FastifyInstance,
  options
) => {
  registerAgentDeviceModels();
  await new SchemaMigrator(dbEngine).sync();

  const authPreHandler = [(fastify as unknown as { authenticate: unknown }).authenticate] as unknown as any[];
  const routePrefix = `${options.prefix}/agent`;

  fastify.post<{
    Body: { deviceName?: unknown };
  }>(`${routePrefix}/pairings`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;

    const deviceName = request.body?.deviceName;
    if (typeof deviceName !== 'string' || deviceName.trim().length < 1 || deviceName.trim().length > 100) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A device name between 1 and 100 characters is required.');
    }

    const code = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const pairing = await getRepository('agent.pairing').create({
      code_hash: hash(code),
      user_id: owner.userId,
      expires_at: expiresAt,
      state: 'pending',
    }, owner.companyId) as { id: number };

    return ok({
      id: String(pairing.id),
      code,
      deviceName: deviceName.trim(),
      expiresAt,
    });
  });

  fastify.post<{
    Body: { code?: unknown; deviceName?: unknown; platform?: unknown };
  }>(`${routePrefix}/pairings/claim`, async (request, reply) => {
    const { code, deviceName, platform } = request.body || {};
    if (
      typeof code !== 'string'
      || code.length !== 48
      || typeof deviceName !== 'string'
      || deviceName.trim().length < 1
      || deviceName.trim().length > 100
      || platform !== 'windows'
    ) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid pairing code, device name, and Windows platform are required.');
    }

    const pairings = await getRepository('agent.pairing').find({
      filters: [
        { field: 'code_hash', operator: '=', value: hash(code) },
        { field: 'state', operator: '=', value: 'pending' },
      ],
      limit: 1,
    }) as Array<{ id: number; user_id: number; expires_at: string; company_id?: number | null }>;
    const pairing = pairings[0];
    if (!pairing || new Date(pairing.expires_at).getTime() <= Date.now()) {
      reply.status(410);
      return fail('PAIRING_EXPIRED', 'The pairing code is invalid, expired, or already used.');
    }
    const companyId = Number(pairing.company_id);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'The pairing record has no verified company tenant.');
    }

    const claimed = await getRepository('agent.pairing').updateById(
      pairing.id,
      { state: 'claimed' },
      companyId,
      { state: 'pending' }
    );
    if (!claimed) {
      reply.status(409);
      return fail('PAIRING_ALREADY_USED', 'The pairing code has already been claimed.');
    }

    const deviceToken = crypto.randomBytes(32).toString('hex');
    const device = await getRepository('agent.device').create({
      name: deviceName.trim(),
      platform: 'windows',
      credential_hash: hash(deviceToken),
      pairing_id: pairing.id,
      paired_by: pairing.user_id,
      state: 'active',
    }, companyId) as { id: number };

    return ok({
      deviceId: String(device.id),
      deviceToken,
      deviceName: deviceName.trim(),
      platform: 'windows',
    });
  });

  fastify.get(`${routePrefix}/devices`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const devices = await getRepository<AgentDeviceRow>('agent.device').find({
      companyId: owner.companyId,
      orderBy: 'id',
      orderDirection: 'DESC',
    });
    return ok(devices.map((device) => ({
      id: String(device.id),
      name: device.name,
      platform: device.platform,
      status: device.state === 'revoked'
        ? 'revoked'
        : device.last_seen_at && Date.now() - new Date(device.last_seen_at).getTime() < 60_000
          ? 'online'
          : 'offline',
      lastSeenAt: device.last_seen_at || undefined,
    })));
  });

  fastify.post<{
    Params: { deviceId: string };
  }>(`${routePrefix}/devices/:deviceId/revoke`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const deviceId = parseId(request.params.deviceId);
    if (!deviceId) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid device id is required.');
    }
    const device = await getRepository<AgentDeviceRow>('agent.device').findById(deviceId, owner.companyId);
    if (!device) {
      reply.status(404);
      return fail('DEVICE_NOT_FOUND', 'The paired device was not found in this tenant.');
    }
    if (device.state === 'active') {
      await getRepository('agent.device').updateById(
        deviceId,
        { state: 'revoked' },
        owner.companyId,
        { state: 'active' }
      );
    }
    return ok({ deviceId: String(deviceId), status: 'revoked' });
  });

  fastify.post<{
    Body: { deviceId?: unknown; mode?: unknown; goal?: unknown };
  }>(`${routePrefix}/missions`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const body = request.body || {};
    const deviceId = Number(body.deviceId);
    if (
      !Number.isSafeInteger(deviceId)
      || deviceId < 1
      || typeof body.mode !== 'string'
      || !allowedModes.has(body.mode)
      || typeof body.goal !== 'string'
      || body.goal.trim().length < 1
      || body.goal.length > 5000
    ) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid device id, mode, and mission goal (up to 5000 characters) are required.');
    }
    const device = await getRepository<AgentDeviceRow>('agent.device').findById(deviceId, owner.companyId);
    if (!device || device.state !== 'active') {
      reply.status(404);
      return fail('DEVICE_UNAVAILABLE', 'The selected paired device is not active in this tenant.');
    }
    const mission = await getRepository<AgentMissionRow>('agent.mission').create({
      device_id: deviceId,
      submitted_by: owner.userId,
      mode: body.mode,
      goal: body.goal.trim(),
      state: 'queued',
    }, owner.companyId);
    await recordEvent(mission.id, owner.companyId, 'queued', { mode: body.mode });
    return ok({
      id: String(mission.id),
      deviceId: String(deviceId),
      mode: body.mode,
      goal: mission.goal,
      state: mission.state,
      createdAt: mission.create_date || '',
      updatedAt: mission.write_date || mission.create_date || '',
    });
  });

  fastify.get<{
    Querystring: { deviceId?: string };
  }>(`${routePrefix}/missions`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const deviceId = request.query.deviceId ? parseId(request.query.deviceId) : undefined;
    if (request.query.deviceId && !deviceId) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid device id is required.');
    }
    const missions = await getRepository<AgentMissionRow>('agent.mission').find({
      companyId: owner.companyId,
      filters: deviceId ? [{ field: 'device_id', operator: '=', value: deviceId }] : undefined,
      orderBy: 'id',
      orderDirection: 'DESC',
      limit: 100,
    });
    return ok(missions.map((mission) => ({
      id: String(mission.id),
      deviceId: String(mission.device_id),
      mode: mission.mode,
      goal: mission.goal,
      state: mission.state,
      createdAt: mission.create_date || '',
      updatedAt: mission.write_date || mission.create_date || '',
    })));
  });

  fastify.post<{
    Params: { missionId: string };
  }>(`${routePrefix}/missions/:missionId/cancel`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const missionId = parseId(request.params.missionId);
    if (!missionId) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid mission id is required.');
    }
    const mission = await getRepository<AgentMissionRow>('agent.mission').findById(missionId, owner.companyId);
    if (!mission) {
      reply.status(404);
      return fail('MISSION_NOT_FOUND', 'The mission was not found in this tenant.');
    }
    if (terminalMissionStates.has(mission.state)) {
      reply.status(409);
      return fail('MISSION_FINISHED', 'A terminal mission cannot be cancelled.');
    }
    const updated = await getRepository('agent.mission').updateById(
      missionId,
      { state: 'cancel_requested' },
      owner.companyId,
      { state: mission.state }
    );
    if (!updated) {
      reply.status(409);
      return fail('MISSION_STATE_CHANGED', 'The mission state changed before cancellation could be recorded.');
    }
    await recordEvent(missionId, owner.companyId, 'cancel_requested');
    return ok({ missionId: String(missionId), state: 'cancel_requested' });
  });

  fastify.get<{
    Params: { missionId: string };
  }>(`${routePrefix}/missions/:missionId/events`, { preHandler: authPreHandler }, async (request, reply) => {
    const owner = await getCompanyContext(request as { user?: AuthenticatedUser }, reply);
    if (!owner) return;
    const missionId = parseId(request.params.missionId);
    if (!missionId) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid mission id is required.');
    }
    const mission = await getRepository<AgentMissionRow>('agent.mission').findById(missionId, owner.companyId);
    if (!mission) {
      reply.status(404);
      return fail('MISSION_NOT_FOUND', 'The mission was not found in this tenant.');
    }
    const events = await getRepository('agent.mission.event').find({
      companyId: owner.companyId,
      filters: [{ field: 'mission_id', operator: '=', value: missionId }],
      orderBy: 'id',
      orderDirection: 'ASC',
    }) as Array<{ id: number; event_type: string; payload: Record<string, unknown>; create_date: string }>;
    return ok(events.map((event) => ({
      id: String(event.id),
      sessionId: String(mission.id),
      type: event.event_type,
      createdAt: event.create_date,
      payload: event.payload || {},
    })));
  });

  fastify.get(`${routePrefix}/device/missions/next`, async (request, reply) => {
    const device = await authenticateDevice(request);
    if (!device) {
      reply.status(401);
      return fail('DEVICE_UNAUTHORIZED', 'The device credential is missing, invalid, or revoked.');
    }
    const companyId = Number(device.company_id);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'The paired device has no verified company tenant.');
    }
    const deviceRepository = getRepository<AgentDeviceRow>('agent.device');
    const stillActive = await deviceRepository.updateById(
      device.id,
      { last_seen_at: new Date().toISOString() },
      companyId,
      { state: 'active' }
    );
    if (!stillActive) {
      reply.status(401);
      return fail('DEVICE_UNAUTHORIZED', 'The paired device has been revoked.');
    }

    const missions = await getRepository<AgentMissionRow>('agent.mission').find({
      companyId,
      filters: [
        { field: 'device_id', operator: '=', value: device.id },
        { field: 'state', operator: '=', value: 'cancel_requested' },
      ],
      orderBy: 'id',
      orderDirection: 'ASC',
      limit: 1,
    });
    const cancellation = missions[0];
    if (cancellation) {
      return ok({
        mission: {
          id: String(cancellation.id),
          mode: cancellation.mode,
          goal: cancellation.goal,
          state: cancellation.state,
          createdAt: cancellation.create_date || '',
          updatedAt: cancellation.write_date || cancellation.create_date || '',
        },
      });
    }

    const activeMissions = await getRepository<AgentMissionRow>('agent.mission').find({
      companyId,
      filters: [
        { field: 'device_id', operator: '=', value: device.id },
        { field: 'state', operator: '=', value: 'running' },
      ],
      orderBy: 'id',
      orderDirection: 'ASC',
      limit: 1,
    });
    const activeMission = activeMissions[0];
    if (activeMission) {
      return ok({
        mission: {
          id: String(activeMission.id),
          mode: activeMission.mode,
          goal: activeMission.goal,
          state: activeMission.state,
          createdAt: activeMission.create_date || '',
          updatedAt: activeMission.write_date || activeMission.create_date || '',
        },
      });
    }

    const queued = await getRepository<AgentMissionRow>('agent.mission').find({
      companyId,
      filters: [
        { field: 'device_id', operator: '=', value: device.id },
        { field: 'state', operator: '=', value: 'queued' },
      ],
      orderBy: 'id',
      orderDirection: 'ASC',
      limit: 1,
    });
    const mission = queued[0];
    if (!mission) return ok({ mission: null });
    const started = await getRepository('agent.mission').updateById(
      mission.id,
      { state: 'running' },
      companyId,
      { state: 'queued' }
    );
    if (!started) return ok({ mission: null });
    await recordEvent(mission.id, companyId, 'running');
    return ok({
      mission: {
        id: String(mission.id),
        mode: mission.mode,
        goal: mission.goal,
        state: 'running',
        createdAt: mission.create_date || '',
        updatedAt: new Date().toISOString(),
      },
    });
  });

  fastify.post<{
    Params: { missionId: string };
    Body: { event?: unknown; payload?: unknown };
  }>(`${routePrefix}/device/missions/:missionId/events`, async (request, reply) => {
    const device = await authenticateDevice(request);
    if (!device) {
      reply.status(401);
      return fail('DEVICE_UNAUTHORIZED', 'The device credential is missing, invalid, or revoked.');
    }
    const missionId = parseId(request.params.missionId);
    const eventType = request.body?.event;
    const rawPayload = request.body?.payload ?? {};
    if (
      !missionId
      || typeof eventType !== 'string'
      || !allowedDeviceEvents.has(eventType)
      || !isRecord(rawPayload)
    ) {
      reply.status(400);
      return fail('VALIDATION_ERROR', 'A valid mission event and bounded metadata payload are required.');
    }
    const payload: Record<string, unknown> = {};
    if (typeof rawPayload.step === 'number' && Number.isSafeInteger(rawPayload.step) && rawPayload.step >= 0) {
      payload.step = rawPayload.step;
    }
    if (typeof rawPayload.success === 'boolean') payload.success = rawPayload.success;
    if (typeof rawPayload.durationMs === 'number' && Number.isFinite(rawPayload.durationMs) && rawPayload.durationMs >= 0) {
      payload.durationMs = Math.min(rawPayload.durationMs, 24 * 60 * 60 * 1000);
    }
    if (typeof rawPayload.tool === 'string' && /^[a-z0-9._-]{1,100}$/i.test(rawPayload.tool)) {
      payload.tool = rawPayload.tool;
    }
    const companyId = Number(device.company_id);
    if (!Number.isSafeInteger(companyId) || companyId === 0) {
      reply.status(403);
      return fail('TENANT_REQUIRED', 'The paired device has no verified company tenant.');
    }
    const mission = await getRepository<AgentMissionRow>('agent.mission').findById(missionId, companyId);
    if (!mission || mission.device_id !== device.id) {
      reply.status(404);
      return fail('MISSION_NOT_FOUND', 'The mission does not belong to this paired device.');
    }
    const state = eventType === 'awaiting_approval' || terminalMissionStates.has(eventType)
      ? eventType
      : undefined;
    if (state) {
      const current = await getRepository<AgentMissionRow>('agent.mission').findById(missionId, companyId);
      if (!current || terminalMissionStates.has(current.state)) {
        reply.status(409);
        return fail('MISSION_STATE_CHANGED', 'The mission is already in a terminal state.');
      }
      const updated = await getRepository('agent.mission').updateById(
        missionId,
        { state },
        companyId,
        { state: current.state }
      );
      if (!updated) {
        reply.status(409);
        return fail('MISSION_STATE_CHANGED', 'The mission state changed before the event could be recorded.');
      }
    }
    await recordEvent(missionId, companyId, eventType, payload);
    return ok({ missionId: String(missionId), event: eventType });
  });
};

export const deviceControlPlugin = fp(deviceControlAsync);
