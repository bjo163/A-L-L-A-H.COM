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

test('restores persisted entries and returns a defensive snapshot', () => {
  const original = new ContextMemory(() => 100);
  original.remember({
    id: 'saved',
    scope: 'workspace',
    workspaceKey: 'repo',
    text: 'Use pnpm',
    retentionMs: 1_000,
  });
  const restored = new ContextMemory(() => 200);
  restored.restore(original.snapshot());
  const snapshot = restored.snapshot();
  snapshot[0].text = 'changed outside the store';

  assert.equal(restored.list('workspace', 'repo')[0].text, 'Use pnpm');
  assert.throws(() => restored.restore([{ id: 'invalid' }]), /invalid entry/);
});

test('removes expired entries from persisted snapshots', () => {
  let now = 100;
  const memory = new ContextMemory(() => now);
  memory.remember({
    id: 'expires',
    scope: 'workspace',
    workspaceKey: 'repo',
    text: 'Temporary note',
    retentionMs: 10,
  });
  now = 111;

  assert.deepEqual(memory.snapshot(), []);
});
