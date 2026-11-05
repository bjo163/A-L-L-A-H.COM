import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findDocumentationDrift } from './documentationDrift';

test('reports actionable documentation drift without inventing project facts', () => {
  assert.deepEqual(
    findDocumentationDrift(['build'], ['package.json'], []),
    [
      { kind: 'missing-doc', value: 'README', suggestion: 'Document the available project scripts.' },
      { kind: 'missing-script', value: 'test', suggestion: 'Add or document a test script before relying on automated validation.' },
    ]
  );
});
