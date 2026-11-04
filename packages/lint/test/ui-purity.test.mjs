import assert from 'node:assert/strict';
import test from 'node:test';
import { findPrivateUiClass } from '../src/ui-purity.mjs';

test('finds private Moon UI component classes in JSX and CSS', () => {
  assert.equal(findPrivateUiClass('<Card className="mw-card">'), 'mw-card');
  assert.equal(findPrivateUiClass('.remote-control > .mw-button {'), 'mw-button');
  assert.equal(findPrivateUiClass('className="mw-skeleton mw-skeleton--lg"'), 'mw-skeleton');
});

test('allows Moon UI CSS variables and app-owned classes', () => {
  assert.equal(findPrivateUiClass('color: var(--mw-muted-text);'), null);
  assert.equal(findPrivateUiClass('.gate-card { color: var(--mw-text); }'), null);
});
