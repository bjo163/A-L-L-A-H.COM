import assert from 'node:assert/strict';
import { test } from 'node:test';
import { distributionPolicy } from './distributionPolicy';

test('publishes an explicit stable distribution policy', () => {
  assert.equal(distributionPolicy.channel, 'stable');
  assert.match(distributionPolicy.supportUrl, /^https:\/\//);
});
