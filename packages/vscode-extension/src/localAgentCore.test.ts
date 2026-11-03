import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import {
  buildAgentSystemPrompt,
  isSensitiveWorkspacePath,
  parseAgentProposal,
  redactSensitiveContent,
  resolveWorkspaceTarget,
} from './localAgentCore';

test('workspace targets reject traversal and absolute paths', () => {
  const root = path.resolve('workspace');
  assert.throws(() => resolveWorkspaceTarget(root, '..\\outside.txt'), /inside the selected workspace/);
  assert.throws(() => resolveWorkspaceTarget(root, path.resolve('outside.txt')), /workspace-relative path/);
  assert.equal(resolveWorkspaceTarget(root, 'src\\app.ts'), path.resolve(root, 'src\\app.ts'));
});

test('sensitive and ignored workspace paths are excluded', () => {
  assert.equal(isSensitiveWorkspacePath('.env.local'), true);
  assert.equal(isSensitiveWorkspacePath('certs/private-key.pem'), true);
  assert.equal(isSensitiveWorkspacePath('node_modules/pkg/index.js'), true);
  assert.equal(isSensitiveWorkspacePath('src/agent.ts'), false);
});

test('credential-like content is redacted before leaving the workspace', () => {
  const redacted = redactSensitiveContent(
    'Authorization: Bearer abc.def; api_key=sk-example password="secret-value"'
  );
  assert.doesNotMatch(redacted, /abc\.def|sk-example|secret-value/);
});

test('agent proposals are validated and bounded', () => {
  assert.deepEqual(parseAgentProposal(JSON.stringify({
    response: 'Updated the function.',
    edits: [{ path: 'src/app.ts', oldText: 'return 1;', newText: 'return 2;' }],
  })), {
    response: 'Updated the function.',
    edits: [{ path: 'src/app.ts', oldText: 'return 1;', newText: 'return 2;' }],
  });
  assert.throws(() => parseAgentProposal('not json'), /JSON proposal/);
  assert.throws(() => parseAgentProposal(JSON.stringify({
    response: 'x',
    edits: [{ path: '..\\outside', oldText: '', newText: 'x' }],
  })), /non-empty oldText/);
});

test('read-only modes explicitly prohibit edit proposals', () => {
  for (const mode of ['ask', 'plan', 'ideate'] as const) {
    assert.match(buildAgentSystemPrompt(mode), /Do not propose or apply file edits|Do not propose file edits/);
  }
});
