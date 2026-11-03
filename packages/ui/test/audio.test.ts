import assert from 'node:assert/strict';
import test from 'node:test';
import { sfx } from '../src/sfx/audio';

test('sound effects stay off until explicitly enabled and persist the choice', () => {
  const values = new Map<string, string>();
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');

  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      localStorage: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    },
  });

  try {
    assert.equal(sfx.isEnabled(), false);
    sfx.click();

    sfx.setEnabled(true);
    assert.equal(sfx.isEnabled(), true);
    assert.equal(values.get('mw-sfx-enabled'), 'true');

    sfx.setEnabled(false);
    assert.equal(sfx.isEnabled(), false);
    assert.equal(values.get('mw-sfx-enabled'), 'false');
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, 'window', originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
  }
});
