import assert from 'node:assert/strict';
import { test } from 'node:test';
import { shouldRunMission } from './missionScheduler';

test('scheduler is opt-in and only selects enabled due missions', () => {
  const now = new Date('2026-11-05T00:00:00Z');
  assert.equal(shouldRunMission({ id: 'm1', runAt: '2026-11-04T00:00:00Z', enabled: true }, now), true);
  assert.equal(shouldRunMission({ id: 'm2', runAt: '2026-11-04T00:00:00Z', enabled: false }, now), false);
});
