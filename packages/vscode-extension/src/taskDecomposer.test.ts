import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decomposeTask } from './taskDecomposer';

test('decomposes bounded steps with acceptance criteria and dependencies', () => {
  const tasks = decomposeTask('Inspect the repository. Add the change. Validate the result.', ['Tests pass']);
  assert.deepEqual(tasks.map((task) => task.id), ['task-1', 'task-2', 'task-3']);
  assert.deepEqual(tasks[2].dependsOn, ['task-2']);
  assert.deepEqual(tasks[0].acceptanceCriteria, ['Tests pass']);
});
