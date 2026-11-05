import assert from 'node:assert/strict';
import { test } from 'node:test';
import { canDelegate, requireReview } from './delegationPolicy';

test('delegation is bounded by concurrency and depth', () => {
  assert.equal(canDelegate(0, 0), true);
  assert.equal(canDelegate(2, 0), false);
  assert.equal(canDelegate(0, 1), false);
});

test('consequential actions require an approved checkpoint', () => {
  assert.throws(() => requireReview({
    id: 'review-1',
    action: 'workspace.edit',
    summary: 'Apply proposed files',
    approved: false,
  }), /requires approval/);
});
