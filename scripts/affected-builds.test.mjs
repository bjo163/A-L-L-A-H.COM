import test from 'node:test';
import assert from 'node:assert/strict';
import { components, matrixForBuilds, matrixForDockerBuilds, selectBuilds } from './affected-builds.mjs';

test('builds the changed application only', () => {
  const result = selectBuilds(['apps/dock/src/app/page.tsx']);
  assert.equal(result.all, false);
  assert.deepEqual(result.selected.map(([name]) => name), ['dock']);
});

test('shared package changes build every application', () => {
  const result = selectBuilds(['packages/ui/src/index.ts']);
  assert.equal(result.all, true);
  assert.equal(result.selected.length, components.length);
});

test('isolated VS Code extension changes build only the extension', () => {
  const result = selectBuilds(['packages/vscode-extension/src/extension.ts']);
  assert.equal(result.all, false);
  assert.deepEqual(result.selected.map(([name]) => name), ['extension']);
});

test('workspace package manifests build every consumer', () => {
  const result = selectBuilds(['packages/ui/package.json']);
  assert.equal(result.all, true);
  assert.equal(result.selected.length, components.length);
});

test('application manifest changes build that application', () => {
  const result = selectBuilds(['apps/dock/package.json']);
  assert.equal(result.all, false);
  assert.deepEqual(result.selected.map(([name]) => name), ['dock']);
});

test('addon manifests and generator inputs build all consumers', () => {
  for (const file of ['addons/works/__manifest__.json', 'apps/id/scripts/generate-routes.ts']) {
    const result = selectBuilds([file]);
    assert.equal(result.all, true, file);
    assert.equal(result.selected.length, components.length, file);
  }
});

test('root toolchain and shared TypeScript config changes build all', () => {
  for (const file of ['.npmrc', 'tsconfig.base.json', 'pnpm-workspace.yaml']) {
    const result = selectBuilds([file]);
    assert.equal(result.all, true, file);
  }
});

test('empty, malformed, and app plus shared changes never under-select', () => {
  assert.equal(selectBuilds([]).selected.length, components.length);
  assert.equal(selectBuilds(['apps/dock/src/page.tsx', 'packages/sdk/src/index.ts']).selected.length, components.length);
  assert.equal(selectBuilds(['apps/new-app/src/page.tsx']).selected.length, components.length);
});

test('build cache paths exist only for Next.js applications', () => {
  const matrix = matrixForBuilds(components);
  assert.equal(matrix.find(({ component }) => component === 'e-isp').cachePath, 'apps/e-isp/.next/cache');
  for (const component of ['arsy', 'sentinel', 'extension']) {
    assert.equal(matrix.find((item) => item.component === component).cachePath, '');
  }
});

test('Docker build matrix includes affected apps with Dockerfiles, not the extension', () => {
  const matrix = matrixForDockerBuilds(components);
  assert.deepEqual(
    matrix.map(({ component }) => component).sort(),
    components.filter(([component, prefix]) => prefix.startsWith('apps/') && component !== 'extension')
      .map(([component]) => component).sort(),
  );
  assert.deepEqual(matrixForDockerBuilds([components.find(([component]) => component === 'extension')]), []);
});

test('discovered applications with a build script can be selected directly', () => {
  const targets = [...components, ['new-app', 'apps/new-app/', 'pnpm --filter @moonwitness/new-app... run build']];
  const result = selectBuilds(['apps/new-app/src/page.tsx'], targets);
  assert.equal(result.all, false);
  assert.deepEqual(result.selected.map(([name]) => name), ['new-app']);
});

test('unknown source paths conservatively build every application', () => {
  const result = selectBuilds(['tools/new-build-system/config.json']);
  assert.equal(result.all, true);
  assert.equal(result.selected.length, components.length);
});

test('documentation-only changes skip application builds', () => {
  const result = selectBuilds(['.plans/20261105-gate-delivery-speed/task.md', 'README.md']);
  assert.equal(result.all, false);
  assert.equal(result.selected.length, 0);
});
