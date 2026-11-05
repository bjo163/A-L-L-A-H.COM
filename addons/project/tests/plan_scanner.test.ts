import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { markerToState, stateToMarker, hashString } from '../services/plan_scanner.ts';

describe('Plan Scanner & State Conversion', () => {
  it('converts checkbox markers to internal states properly', () => {
    assert.strictEqual(markerToState(' '), 'pending');
    assert.strictEqual(markerToState('/'), 'in_progress');
    assert.strictEqual(markerToState('x'), 'completed');
    assert.strictEqual(markerToState('X'), 'completed');
  });

  it('converts internal states to checklist markers', () => {
    assert.strictEqual(stateToMarker('pending'), ' ');
    assert.strictEqual(stateToMarker('in_progress'), '/');
    assert.strictEqual(stateToMarker('completed'), 'x');
  });

  it('computes sha256 hash deterministically using Web Crypto API', async () => {
    const hash1 = await hashString('sample test task line');
    const hash2 = await hashString('sample test task line');
    assert.strictEqual(hash1, hash2);
    assert.strictEqual(typeof hash1, 'string');
    assert.strictEqual(hash1.length, 64);
  });
});
