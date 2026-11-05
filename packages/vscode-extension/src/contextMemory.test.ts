import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ContextMemory } from './contextMemory';

test('memory is scoped, bounded, and expires', () => {
  let now = 100;
  const memory = new ContextMemory(() => now);
  memory.remember({ id: 'one', scope: 'workspace', workspaceKey: 'repo', text: 'Use pnpm', retentionMs: 10 });
  memory.remember({ id: 'two', scope: 'session', workspaceKey: 'repo', text: 'Temporary choice', retentionMs: 100 });
  assert.equal(memory.list('workspace', 'other').length, 0);
  assert.equal(memory.list('workspace', 'repo')[0].text, 'Use pnpm');
  now = 111;
  assert.equal(memory.list('workspace', 'repo').length, 0);
  assert.equal(memory.list('session', 'repo').length, 1);
});
