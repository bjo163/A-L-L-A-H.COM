import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import test from 'node:test';
import { PlanManager, TaskStatus } from './planManager';

function withTempWorkspace(run: (workspaceRoot: string) => void): void {
  const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'allah-extension-'));
  try {
    run(workspaceRoot);
  } finally {
    fs.rmSync(workspaceRoot, { recursive: true, force: true });
  }
}

test('scans all three task states and ignores malformed checklist lines', () => {
  withTempWorkspace((workspaceRoot) => {
    const planDir = path.join(workspaceRoot, '.plans', '20261103-example');
    fs.mkdirSync(planDir, { recursive: true });
    fs.writeFileSync(
      path.join(planDir, 'spec.md'),
      '---\nstatus: "in_progress"\n---\n\n# Example plan\n',
      'utf-8'
    );
    fs.writeFileSync(
      path.join(planDir, 'task.md'),
      [
        '# Tasks',
        '- [ ] Pending work',
        '  - [/] Active work',
        '- [x] Finished work',
        '- [X] Also finished',
        '- [] Malformed',
        '- [ ]',
        'Plain text',
      ].join('\r\n'),
      'utf-8'
    );

    const [plan] = PlanManager.scanWorkspace(workspaceRoot);

    assert.equal(plan.title, 'Example plan');
    assert.equal(plan.status, 'in_progress');
    assert.deepEqual(plan.tasks.map((task) => task.status), [
      'pending',
      'in-progress',
      'completed',
      'completed',
    ]);
    assert.deepEqual(plan.tasks.map((task) => task.text), [
      'Pending work',
      'Active work',
      'Finished work',
      'Also finished',
    ]);
  });
});

test('updates one checkbox and preserves mixed line endings', () => {
  withTempWorkspace((workspaceRoot) => {
    const original = '# Tasks\r\n- [/] Active\r\n- [ ] Pending\n- [X] Finished\nTail';
    const planTaskPath = path.join(workspaceRoot, '.plans', 'plan', 'task.md');
    fs.mkdirSync(path.dirname(planTaskPath), { recursive: true });
    fs.writeFileSync(planTaskPath, original, 'utf-8');
    const parsedTask = PlanManager.scanWorkspace(workspaceRoot)[0].tasks[1];

    PlanManager.setTaskStatus(parsedTask, 'completed');
    const updatedTask = PlanManager.scanWorkspace(workspaceRoot)[0].tasks[1];
    PlanManager.setTaskStatus(updatedTask, 'completed');

    assert.equal(
      fs.readFileSync(planTaskPath, 'utf-8'),
      '# Tasks\r\n- [/] Active\r\n- [x] Pending\n- [X] Finished\nTail'
    );
  });
});

test('rejects a stale tree snapshot without overwriting external edits', () => {
  withTempWorkspace((workspaceRoot) => {
    const planDir = path.join(workspaceRoot, '.plans', 'plan');
    fs.mkdirSync(planDir, { recursive: true });
    const taskPath = path.join(planDir, 'task.md');
    fs.writeFileSync(taskPath, '- [ ] Original task\r\n', 'utf-8');
    const [task] = PlanManager.scanWorkspace(workspaceRoot)[0].tasks;
    fs.writeFileSync(taskPath, '- [ ] Externally edited task\r\n', 'utf-8');

    assert.throws(() => PlanManager.setTaskStatus(task, 'in-progress'), /changed since it was loaded/i);
    assert.equal(fs.readFileSync(taskPath, 'utf-8'), '- [ ] Externally edited task\r\n');
  });
});

test('local and generated plans contain all required artifacts', () => {
  withTempWorkspace((workspaceRoot) => {
    const localDir = PlanManager.createPlan(workspaceRoot, 'Validate the plan workbench');
    const generatedDir = PlanManager.createPlanWithContent(workspaceRoot, 'Generated plan', {
      spec: '## Scope\nDescribe the work.',
      tasks: '- [ ] Implement the work.',
      design: '## Interaction\nUse native controls.',
      rules: '- Preserve workspace data.',
    });

    for (const planDir of [localDir, generatedDir]) {
      for (const fileName of ['spec.md', 'task.md', 'design.md', 'rules.md']) {
        assert.ok(fs.statSync(path.join(planDir, fileName)).isFile());
      }
      assert.match(fs.readFileSync(path.join(planDir, 'spec.md'), 'utf-8'), /status: "in_progress"/);
    }

    assert.doesNotMatch(fs.readFileSync(path.join(localDir, 'task.md'), 'utf-8'), /estimated|budget/i);
    assert.equal(PlanManager.scanWorkspace(workspaceRoot).length, 2);
  });
});

test('rejects incomplete generated artifacts before creating a plan directory', () => {
  withTempWorkspace((workspaceRoot) => {
    assert.throws(
      () => PlanManager.createPlanWithContent(workspaceRoot, 'Invalid plan', {
        spec: 'Valid',
        tasks: ' ',
        design: 'Valid',
        rules: 'Valid',
      }),
      /artifact "tasks" must contain Markdown content/i
    );
    assert.equal(fs.existsSync(path.join(workspaceRoot, '.plans')), false);
  });
});

test('rejects generated task content without a checklist item before writing files', () => {
  withTempWorkspace((workspaceRoot) => {
    assert.throws(
      () => PlanManager.createPlanWithContent(workspaceRoot, 'Invalid tasks', {
        spec: 'Scope',
        tasks: 'No task marker.',
        design: 'Workflow',
        rules: 'Invariants',
      }),
      /at least one Markdown checklist item/i
    );
    assert.equal(fs.existsSync(path.join(workspaceRoot, '.plans')), false);
  });
});

test('accepts every explicit task status for a state update', () => {
  withTempWorkspace((workspaceRoot) => {
    const planDir = path.join(workspaceRoot, '.plans', 'plan');
    fs.mkdirSync(planDir, { recursive: true });
    const taskPath = path.join(planDir, 'task.md');
    fs.writeFileSync(taskPath, '- [ ] Work\r\n', 'utf-8');
    let task = PlanManager.scanWorkspace(workspaceRoot)[0].tasks[0];
    const states: TaskStatus[] = ['in-progress', 'completed', 'pending'];

    for (const status of states) {
      PlanManager.setTaskStatus(task, status);
      task = PlanManager.scanWorkspace(workspaceRoot)[0].tasks[0];
      assert.equal(task.status, status);
    }
    assert.match(fs.readFileSync(taskPath, 'utf-8'), /\r\n$/);
  });
});
