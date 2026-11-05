import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPromptVersion } from './promptLab';

test('creates bounded versioned prompts', () => {
  const version = createPromptVersion('v1', 'Use repository evidence.', ['planning']);
  assert.equal(version.id, 'v1');
  assert.deepEqual(version.tags, ['planning']);
  assert.match(version.createdAt, /^\d{4}-\d{2}-\d{2}T/);
});
