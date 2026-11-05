import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatAiTaskPlan, parseAiTaskPlan } from './aiTaskPlan';

const validPlan = JSON.stringify({
  tasks: [
    {
      id: 'task-1',
      title: 'Implement the change',
      acceptanceCriteria: ['The expected behavior is present.'],
      dependsOn: [],
    },
    {
      id: 'task-2',
      title: 'Verify the result',
      acceptanceCriteria: ['The focused tests pass.'],
      dependsOn: ['task-1'],
    },
  ],
  verification: ['Run the focused test suite.'],
});

test('parses and formats bounded tasks with criteria and dependencies', () => {
  const plan = parseAiTaskPlan(validPlan, 2);

  assert.equal(plan.tasks.length, 2);
  assert.deepEqual(plan.tasks[1].dependsOn, ['task-1']);
  assert.match(formatAiTaskPlan(plan), /Acceptance: The focused tests pass\./);
  assert.match(formatAiTaskPlan(plan), /Depends on: task-1/);
});

test('rejects malformed or underspecified task plans', () => {
  assert.throws(() => parseAiTaskPlan('not json'), /JSON object/);
  assert.throws(() => parseAiTaskPlan(JSON.stringify({ tasks: [], verification: ['Run tests'] })), /between 1 and 8/);
  assert.throws(() => parseAiTaskPlan(validPlan, 3), /between 3 and 8/);
});

test('rejects cyclic, forward, duplicate, or unknown dependencies', () => {
  const plan = JSON.parse(validPlan) as {
    tasks: Array<{ id: string; title: string; acceptanceCriteria: string[]; dependsOn: string[] }>;
    verification: string[];
  };
  plan.tasks[0].dependsOn = ['task-2'];
  assert.throws(() => parseAiTaskPlan(JSON.stringify(plan)), /forward, or unknown dependency/);
});

test('bounds task count, criteria, verification, and response size', () => {
  const plan = JSON.parse(validPlan) as {
    tasks: Array<{ id: string; title: string; acceptanceCriteria: string[]; dependsOn: string[] }>;
    verification: string[];
  };
  plan.tasks[0].acceptanceCriteria = Array.from({ length: 6 }, (_, index) => `Criterion ${index + 1}`);
  assert.throws(() => parseAiTaskPlan(JSON.stringify(plan)), /acceptance criteria/);
  assert.throws(() => parseAiTaskPlan(' '.repeat(12_001)), /response limit/);
});
