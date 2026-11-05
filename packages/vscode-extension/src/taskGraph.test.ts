import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getReadyTasks, getTaskProgress } from './taskGraph';

test('returns only tasks whose dependencies are complete', () => {
  const tasks = [
    { id: 'a', dependsOn: [], status: 'completed' as const },
    { id: 'b', dependsOn: ['a'], status: 'pending' as const },
    { id: 'c', dependsOn: ['b'], status: 'pending' as const },
  ];
  assert.deepEqual(getReadyTasks(tasks).map((task) => task.id), ['b']);
  assert.deepEqual(getTaskProgress(tasks), { completed: 1, total: 3, percent: 33 });
});
