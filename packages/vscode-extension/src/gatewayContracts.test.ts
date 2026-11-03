import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getGatewayErrorMessage,
  parseModelCatalogResponse,
  parsePlanCompletionContent,
  parsePlanCompletionResponse,
} from './gatewayContracts';

test('parses the Arsy model catalog envelope', () => {
  assert.deepEqual(
    parseModelCatalogResponse({
      success: true,
      data: {
        object: 'list',
        data: [{ id: 'dx-reasoning', object: 'model', owned_by: 'moonwitness' }],
      },
    }),
    [{ id: 'dx-reasoning', owned_by: 'moonwitness' }]
  );
});

test('rejects malformed or failed model catalog responses', () => {
  assert.throws(() => parseModelCatalogResponse({ data: { object: 'list', data: [] } }), /invalid model catalog envelope/i);
  assert.throws(
    () => parseModelCatalogResponse({ success: true, data: { object: 'list', data: [{ owned_by: 'moonwitness' }] } }),
    /entry 1 has no valid id/i
  );
  assert.throws(
    () => parseModelCatalogResponse({ success: false, error: { message: 'gateway unavailable' } }),
    /gateway unavailable/
  );
});

test('accepts a complete four-artifact AI response', () => {
  assert.deepEqual(
    parsePlanCompletionContent(JSON.stringify({
      spec: '## Scope\nDefine the outcome.',
      tasks: '- [ ] Implement the outcome.',
      design: '## Interaction\nUse the existing workflow.',
      rules: '- Preserve existing behavior.',
    })),
    {
      spec: '## Scope\nDefine the outcome.',
      tasks: '- [ ] Implement the outcome.',
      design: '## Interaction\nUse the existing workflow.',
      rules: '- Preserve existing behavior.',
    }
  );
});

test('rejects mock, malformed, and incomplete AI responses', () => {
  assert.throws(
    () => parsePlanCompletionContent('[Arsy LLM Gateway Mock] Processed completion.'),
    /mock completion/i
  );
  assert.throws(() => parsePlanCompletionContent('not JSON'), /must be a JSON object/i);
  assert.throws(
    () => parsePlanCompletionContent(JSON.stringify({ spec: 'Scope', tasks: '- [ ] Work', design: 'Design' })),
    /missing Markdown content for "rules"/i
  );
  assert.throws(
    () => parsePlanCompletionContent(JSON.stringify({
      spec: 'Scope',
      tasks: 'A task without a checklist.',
      design: 'Design',
      rules: 'Invariants',
    })),
    /at least one Markdown checklist item/i
  );
  assert.equal(getGatewayErrorMessage({ error: { message: 'Rate limited' } }), 'Rate limited');
  assert.equal(getGatewayErrorMessage({ success: false }), undefined);
});

test('parses the chat completion response and surfaces API errors', () => {
  const content = JSON.stringify({
    spec: 'Scope',
    tasks: '- [ ] Work',
    design: 'Workflow',
    rules: 'Invariants',
  });
  assert.equal(parsePlanCompletionResponse({ choices: [{ message: { content } }] }).spec, 'Scope');
  assert.throws(
    () => parsePlanCompletionResponse({ error: { message: 'Rate limited' } }),
    /Rate limited/
  );
});
