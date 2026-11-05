import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateContribution } from './pluginContract';

test('validates extension contribution identity and commands', () => {
  assert.doesNotThrow(() => validateContribution({
    id: 'example.tools', version: '1.0.0', commands: ['example.run'], capabilities: ['readonly'],
  }));
  assert.throws(() => validateContribution({
    id: 'Example', version: '1.0', commands: [], capabilities: [],
  }), /invalid|semver/);
});
