import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTsconfigs } from './affected-tsconfigs.mjs';

const projects = [
  'apps/dock/tsconfig.json',
  'apps/headquarter/tsconfig.json',
  'packages/ui/tsconfig.json',
  'packages/vscode-extension/tsconfig.json',
];

test('application edits select only the matching TypeScript project', () => {
  assert.deepEqual(selectTsconfigs(['apps/dock/src/page.tsx'], projects), {
    all: false,
    selected: ['apps/dock/tsconfig.json'],
  });
});

test('extension edits select its own TypeScript project', () => {
  assert.deepEqual(selectTsconfigs(['packages/vscode-extension/src/client.ts'], projects), {
    all: false,
    selected: ['packages/vscode-extension/tsconfig.json'],
  });
});

test('shared package, addon, script, and unknown edits select all projects', () => {
  for (const file of ['packages/ui/src/index.ts', 'addons/base/models/user.ts', 'scripts/generator.ts', 'tools/unknown.ts']) {
    assert.deepEqual(selectTsconfigs([file], projects), { all: true, selected: projects }, file);
  }
});

test('workspace configuration and missing projects fall back to all', () => {
  assert.equal(selectTsconfigs(['tsconfig.base.json'], projects).all, true);
  assert.equal(selectTsconfigs(['apps/new-app/src/page.tsx'], projects).all, true);
});

test('documentation-only edits need no TypeScript project check', () => {
  assert.deepEqual(selectTsconfigs(['README.md', '.plans/next/task.md'], projects), { all: false, selected: [] });
});

test('empty changes fail closed to all projects', () => {
  assert.deepEqual(selectTsconfigs([], projects), { all: true, selected: projects });
});
