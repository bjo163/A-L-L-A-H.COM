import assert from 'node:assert/strict';
import { test } from 'node:test';
import { agentRoleDefinitions, createAgentMessage } from './agentRoles';

test('agent roles have explicit capabilities and message correlation', () => {
  assert.equal(agentRoleDefinitions.length, 4);
  const message = createAgentMessage({
    id: 'm1',
    correlationId: 'mission-1',
    from: 'researcher',
    to: 'supervisor',
    type: 'result',
    payload: 'Repository metadata collected.',
  });
  assert.equal(message.correlationId, 'mission-1');
  assert.match(message.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});
