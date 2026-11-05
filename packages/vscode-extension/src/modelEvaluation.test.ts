import assert from 'node:assert/strict';
import { test } from 'node:test';
import { evaluateModelResponse } from './modelEvaluation';

test('evaluates a response against explicit expected signals', () => {
  assert.deepEqual(evaluateModelResponse('local-test', {
    id: 'case-1', prompt: 'Explain validation', expectedSignals: ['validation', 'evidence'],
  }, 'Validation produces evidence.'), {
    caseId: 'case-1', model: 'local-test', passed: true, matchedSignals: ['validation', 'evidence'],
  });
});
