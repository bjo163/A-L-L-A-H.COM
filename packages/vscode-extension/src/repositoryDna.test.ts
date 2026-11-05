import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildRepositoryDna } from './repositoryDna';

test('builds bounded repository DNA from metadata', () => {
  const dna = buildRepositoryDna(
    ['package.json', 'pnpm-lock.yaml', 'src/app.tsx', 'src/api.py', '.plans/demo/task.md'],
    {
      packageManager: 'pnpm@12.16.1',
      scripts: { build: 'tsup', test: 'node --test' },
      dependencies: { next: '16.0.0', react: '19.0.0' },
    }
  );

  assert.equal(dna.packageManager, 'pnpm');
  assert.deepEqual(dna.frameworks, ['Next.js', 'React']);
  assert.deepEqual(dna.languages, ['Python', 'TypeScript']);
  assert.deepEqual(dna.scripts, ['build', 'test']);
  assert.deepEqual(dna.dependencies, ['next', 'react']);
  assert.deepEqual(dna.documentation, []);
});
