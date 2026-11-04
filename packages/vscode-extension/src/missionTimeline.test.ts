import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  appendMissionTimelineEvent,
  canAttemptRepair,
  classifyFailureSignature,
  createMissionTimelineEvent,
  getRemoteMissionReplayState,
  isMissionTimelineEvent,
  normalizeInterruptedMissions,
} from './missionTimeline';

test('mission events have unique identifiers and increasing sequence numbers', () => {
  const first = createMissionTimelineEvent([], 'mission.started', 'Mission started');
  const second = createMissionTimelineEvent([first], 'context.selected', 'Context selected');
  assert.notEqual(first.id, second.id);
  assert.equal(first.sequence, 1);
  assert.equal(second.sequence, 2);
  assert.equal(isMissionTimelineEvent(first), true);
});

test('timeline append de-duplicates replayed events', () => {
  const event = createMissionTimelineEvent([], 'mission.started', 'Mission started');
  const once = appendMissionTimelineEvent([], event);
  const replayed = appendMissionTimelineEvent(once, event);
  assert.equal(replayed, once);
  assert.equal(replayed.length, 1);
});

test('interrupted missions restore as blocked instead of running', () => {
  assert.deepEqual(normalizeInterruptedMissions([
    { id: 'running', state: 'running' },
    { id: 'done', state: 'completed' },
  ]), [
    { id: 'running', state: 'blocked' },
    { id: 'done', state: 'completed' },
  ]);
});

test('completed remote missions are not re-executed when polling replays them', () => {
  const sessions = [
    { remoteMissionId: 'done-mission', state: 'completed' },
    { remoteMissionId: 'interrupted-mission', state: 'running' },
  ];
  assert.equal(getRemoteMissionReplayState(sessions, 'done-mission'), 'completed');
  assert.equal(getRemoteMissionReplayState(sessions, 'interrupted-mission'), 'blocked');
  assert.equal(getRemoteMissionReplayState(sessions, 'unknown-mission'), undefined);
});

test('failure signatures normalize variable output and repair attempts are bounded', () => {
  const first = classifyFailureSignature('Error at 127.0.0.1 after 24ms');
  const second = classifyFailureSignature('Error at 10.1.2.3 after 87ms');
  assert.equal(first, second);
  assert.equal(first.length, 64);
  assert.doesNotMatch(first, /Error at/);
  assert.deepEqual(canAttemptRepair([{ signature: first, attempts: 0 }], first), { allowed: true, attempts: 0 });
  assert.deepEqual(canAttemptRepair([{ signature: first, attempts: 1 }], first), { allowed: false, attempts: 1 });
});
