import assert from 'node:assert/strict';
import { test } from 'node:test';
import { matchMissionTemplates } from './missionTemplateMatcher';

test('matches templates against workspace files and framework metadata', () => {
  const templates = [
    {
      id: 'api',
      contextRules: [
        { action: 'include', pattern: 'package.json' },
        { action: 'include', pattern: 'src/routes/**/*.ts' },
      ],
    },
    { id: 'docs', contextRules: [{ action: 'include', pattern: 'README.md' }] },
  ] as never[];

  assert.deepEqual(
    matchMissionTemplates(templates, { files: ['package.json'], frameworks: [] }).map((item) => item.id),
    ['api']
  );
});

test('excludes templates for denied paths and allows templates without include rules', () => {
  const templates = [
    {
      id: 'excluded',
      contextRules: [
        { action: 'include', pattern: 'src/**/*.ts' },
        { action: 'exclude', pattern: 'src/generated/**' },
      ],
    },
    { id: 'general', contextRules: [] },
  ] as never[];

  assert.deepEqual(
    matchMissionTemplates(templates, {
      files: ['src/generated/client.ts'],
      frameworks: [],
    }).map((item) => item.id),
    ['general']
  );
});
