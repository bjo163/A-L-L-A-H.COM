import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveEcosystemEndpoints } from '../src/blocks/endpoints';

test('ecosystem origin supplies both the shared host and protocol', () => {
  const endpoints = resolveEcosystemEndpoints({
    NEXT_PUBLIC_ECOSYSTEM_ORIGIN: 'https://world.example',
  });

  assert.equal(endpoints.dock, 'https://world.example:3001');
  assert.equal(endpoints.headquarter, 'https://world.example:3002');
});

test('explicit app URLs and protocol override the ecosystem origin', () => {
  const endpoints = resolveEcosystemEndpoints({
    NEXT_PUBLIC_ECOSYSTEM_ORIGIN: 'https://world.example',
    NEXT_PUBLIC_ECOSYSTEM_PROTOCOL: 'http:',
    NEXT_PUBLIC_DOCK_URL: 'http://dock.local:3001',
  });

  assert.equal(endpoints.dock, 'http://dock.local:3001');
  assert.equal(endpoints.headquarter, 'http://world.example:3002');
});

test('invalid ecosystem origins fall back to the configured development host', () => {
  const endpoints = resolveEcosystemEndpoints({
    NEXT_PUBLIC_ECOSYSTEM_ORIGIN: 'javascript:alert(1)',
    NEXT_PUBLIC_ECOSYSTEM_DEV_HOSTNAME: '127.0.0.1',
  });

  assert.equal(endpoints.dock, 'http://127.0.0.1:3001');
});
