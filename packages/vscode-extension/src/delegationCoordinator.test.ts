import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DelegationCoordinator } from './delegationCoordinator';

test('coordinates bounded delegation and correlated messages', () => {
  const coordinator = new DelegationCoordinator({ maxConcurrent: 1, maxDepth: 1, maxMessages: 2 });
  coordinator.start(0);
  assert.throws(() => coordinator.start(0), /limit reached/);
  coordinator.send({
    id: 'm1', correlationId: 'mission-1', from: 'supervisor', to: 'researcher',
    type: 'request', payload: 'Inspect metadata.',
  });
  assert.equal(coordinator.getMessages('mission-1').length, 1);
  assert.equal(coordinator.approve({
    id: 'review-1', action: 'workspace.edit', summary: 'Apply reviewed change', approved: false,
  }).approved, true);
  coordinator.finish();
});
