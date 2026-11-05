import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchMissionTemplates } from './missionTemplateMatcher';

test('matches templates against workspace files and framework metadata', () => {
  const templates = [
    { id: 'api', contextRules: [{ action: 'include', pattern: 'src/routes/**/*.ts' }] },
    { id: 'docs', contextRules: [{ action: 'include', pattern: 'README.md' }] },
  ] as never[];

  assert.deepEqual(
    matchMissionTemplates(templates, { files: ['src/routes/users.ts'], frameworks: [] }).map((item) => item.id),
    ['api']
  );
});
