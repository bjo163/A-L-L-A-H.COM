import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getAgentToolDecision, isAgentMode } from './agentPolicy';

test('read-only modes never permit edits, terminals, or machine-wide writes', () => {
  for (const mode of ['ask', 'plan', 'ideate'] as const) {
    assert.equal(getAgentToolDecision(mode, 'workspace.edit'), 'deny');
    assert.equal(getAgentToolDecision(mode, 'terminal.powershell'), 'deny');
    assert.equal(getAgentToolDecision(mode, 'system.write'), 'deny');
  }
});

test('autopilot permits workspace edits but keeps consequential tools gated', () => {
  assert.equal(getAgentToolDecision('autopilot', 'workspace.edit'), 'allow');
  assert.equal(getAgentToolDecision('autopilot', 'terminal.powershell'), 'ask');
  assert.equal(getAgentToolDecision('autopilot', 'git.write'), 'deny');
  assert.equal(getAgentToolDecision('autopilot', 'system.write'), 'deny');
});

test('mode parsing rejects unknown values', () => {
  assert.equal(isAgentMode('debug'), true);
  assert.equal(isAgentMode('administrator'), false);
  assert.equal(isAgentMode(null), false);
});
