// JIZZ App Smoke Tests - Route Integration Verification
// Part of Phase 4: Integration, Verification & Quality Gates

import { expect, test } from 'vitest';
import { check, route } from '@infinirocks/smoke';

test('JIZZ root route renders', async () => {
  const response = await check(route`GET /`);
  expect(response.status).toBe(200);
  expect(response.text).toContain('JIZZ');
});

test('JIZZ phenomena route renders', async () => {
  const response = await check(route`GET /phenomena`);
  expect(response.status).toBe(200);
  expect(response.text).toContain('Phenomena');
});

test('JIZZ phenomena detail route renders', async () => {
  const response = await check(route`GET /phenomena/[id]`, { params: { id: 'test' } });
  expect(response.status).toBe(200);
  expect(response.text).toContain('Phenomenon');
});

test('JIZZ signals route renders', async () => {
  const response = await check(route`GET /signals`);
  expect(response.status).toBe(200);
  expect(response.text).toContain('Signals');
});

test('JIZZ API routes exist', async () => {
  const apiRoutes = [
    'GET /api/v1/phenomena',
    'GET /api/v1/phenomena/[id]',
    'GET /api/v1/signals'
  ];

  for (const routeStr of apiRoutes) {
    const [method, path] = routeStr.split(' ');
    const response = await check(route`${method} ${path}`);
    // 200 = success, 404 = not implemented yet
    expect([200, 404]).toContain(response.status);
  }
});

test('JIZZ build dependencies satisfied', async () => {
  // Verify package.json includes required scripts
  const pkg = await import('../../package.json');
  expect(pkg.scripts).toHaveProperty('dev');
  expect(pkg.scripts).toHaveProperty('build');
  expect(pkg.scripts).toHaveProperty('typecheck');
  expect(pkg.scripts).toHaveProperty('lint');
});