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

export function createMissionTimelineEvent(
  events: MissionTimelineEvent[],
  type: string,
  title: string,
  detail?: string
): MissionTimelineEvent {
  return {
    id: `${events.length + 1}-${type}-${createdAt(events)}`,
    sequence: events.length + 1,
    type,
    title,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function createdAt(events: MissionTimelineEvent[]): string {
  return String(Date.now()) + (events.length === 0 ? '' : '-last');
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
  return normalized.slice(0, 500) || 'validation-failed-without-output';
}

export function canAttemptRepair(
  failures: RepairFailure[],
  signature: string,
  limit = 1
): { allowed: boolean; attempts: number } {
  const attempts = failures.find((failure) => failure.signature === signature)?.attempts ?? 0;
  return { allowed: attempts < limit, attempts };
}

