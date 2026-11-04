import { createHash, randomUUID } from 'crypto';

export type MissionState = 'running' | 'completed' | 'cancelled' | 'failed' | 'blocked';

export interface MissionTimelineEvent {
  id: string;
  sequence: number;
  type: string;
  title: string;
  detail?: string;
  createdAt: string;
}

export interface RepairFailure {
  signature: string;
  attempts: number;
}

export function getRemoteMissionReplayState(
  sessions: Array<{ remoteMissionId?: string; state: MissionState }>,
  missionId: string
): MissionState | undefined {
  const session = sessions.find((entry) => entry.remoteMissionId === missionId);
  if (!session) return undefined;
  return session.state === 'running' ? 'blocked' : session.state;
}

export function isMissionTimelineEvent(value: unknown): value is MissionTimelineEvent {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && 'id' in value
    && typeof value.id === 'string'
    && 'sequence' in value
    && typeof value.sequence === 'number'
    && Number.isInteger(value.sequence)
    && value.sequence > 0
    && 'type' in value
    && typeof value.type === 'string'
    && 'title' in value
    && typeof value.title === 'string'
    && (!('detail' in value) || typeof value.detail === 'string' || value.detail === undefined)
    && 'createdAt' in value
    && typeof value.createdAt === 'string';
}

export function createMissionTimelineEvent(
  events: MissionTimelineEvent[],
  type: string,
  title: string,
  detail?: string
): MissionTimelineEvent {
  const sequence = events.reduce((max, event) => Math.max(max, event.sequence), 0) + 1;
  return {
    id: randomUUID(),
    sequence,
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  };
}

export function appendMissionTimelineEvent(
  events: MissionTimelineEvent[],
  event: MissionTimelineEvent
): MissionTimelineEvent[] {
  const duplicate = events.some((entry) => entry.id === event.id);
  if (duplicate) return events;
  const nextSequence = events.length === 0
    ? 1
    : Math.max(...events.map((entry) => entry.sequence)) + 1;
  return [...events, { ...event, sequence: nextSequence }];
}

export function normalizeInterruptedMissions<T extends { state: string }>(
  sessions: T[]
): Array<T & { state: string }> {
  return sessions.map((session) => session.state === 'running'
    ? { ...session, state: 'blocked' }
    : session);
}

export function classifyFailureSignature(output: string): string {
  const normalized = output
    .replace(/\r\n/g, '\n')
    .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<address>')
    .replace(/\b\d+(\.\d+)?ms\b/g, '<duration>')
    .replace(/\blines? \d+(?:,\d+)*\b/gi, '<lines>')
    .replace(/\s+/g, ' ')
    .trim();
  return createHash('sha256').update(normalized).digest('hex');
}

export function canAttemptRepair(
  failures: RepairFailure[],
  signature: string,
  limit = 1
): { allowed: boolean; attempts: number } {
  const attempts = failures.find((failure) => failure.signature === signature)?.attempts ?? 0;
  return { allowed: attempts < limit, attempts };
}
