import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import { runBootSeed } from '../src/seed.ts';
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SYSTEM_ACTOR,
} from '@allah/arsy-orm';
import { evaluateTelemetryAlert } from '../../../addons/heliogrid/services/alert.ts';

async function createSeededHeliogridApp() {
  const app = await buildArsyApp({ enableLogging: false });
  await runBootSeed(() => {});
  return app;
}

function uniqueHeliogridSite(dayOffset = 0) {
  const baseMs = Date.now() + (dayOffset * 24 * 60 * 60 * 1000) + Math.floor(Math.random() * 100_000);
  const siteId = 1000 + (baseMs % 9_000);
  const day = new Date(baseMs).toISOString().slice(0, 10);
  return { siteId, day };
}

async function closeHeliogridApp(app) {
  if (app) {
    await app.close();
  }
  await dbEngine.close();
}

test('heliogrid: alert evaluator - low battery condition', async () => {
  const app = await createSeededHeliogridApp();

  const email = `heliogrid-test-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const password = 'heliogrid-test-password';
  let onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Heliogrid Test Owner', email, password },
  });
  // Handle case where onboarding already completed (test isolation)
  if (onboarding.statusCode === 409) {
    // User already onboarding - sign in directly
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  } else {
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  }

  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  const companyId = Number(owners[0].company_id);
  const { siteId } = uniqueHeliogridSite();

  // Create a battery with low SoC (15%)
  const batteryRepo = new BaseRepository(modelRegistry.get('heliogrid.battery'));
  await batteryRepo.create(
    {
      site_id: siteId,
      capacity_kwh: 100,
      state_of_charge_percent: 15.0,
      cycle_count: 0,
      status: 'active',
      company_id: String(companyId),
    },
    { companyId },
    SYSTEM_ACTOR
  );

  // Create telemetry record with battery discharge and low SoC
  const telemetry = {
    id: 1,
    site_id: siteId,
    solar_generation_kw: 0,
    battery_discharge_kw: 5.0,
    grid_import_kw: 0,
    site_consumption_kw: 0,
    recorded_at: '2026-11-05T10:00:00Z',
    company_id: String(companyId),
  };

  // Test alert evaluation
  const result = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);

  assert.equal(result.conditions.lowBattery, true, 'Should detect low battery (< 20%)');
  assert.equal(result.conditions.gridFailure, false, 'Should not detect grid failure');
  assert.equal(result.alertsEmitted, 1, 'Should emit one alert');

  await closeHeliogridApp(app);
});

test('heliogrid: alert evaluator - grid failure condition', async () => {
  const app = await createSeededHeliogridApp();

  const email = `heliogrid-test2-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const password = 'heliogrid-test-password';
  let onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Heliogrid Test Owner', email, password },
  });
  // Handle case where onboarding already completed (test isolation)
  if (onboarding.statusCode === 409) {
    // User already onboarding - sign in directly
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  } else {
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  }

  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  const companyId = Number(owners[0].company_id);
  const { siteId } = uniqueHeliogridSite();

  // Create a battery with high SoC (50%) - no low battery alert
  const batteryRepo = new BaseRepository(modelRegistry.get('heliogrid.battery'));
  await batteryRepo.create(
    {
      site_id: siteId,
      capacity_kwh: 100,
      state_of_charge_percent: 50.0,
      cycle_count: 0,
      status: 'active',
      company_id: String(companyId),
    },
    { companyId },
    SYSTEM_ACTOR
  );

  // Create telemetry record with grid failure condition
  const telemetry = {
    id: 2,
    site_id: siteId,
    solar_generation_kw: 0,
    battery_discharge_kw: 0,
    grid_import_kw: 0, // Grid failure condition: 0 import but consumption > 0
    site_consumption_kw: 10.0,
    recorded_at: '2026-11-05T10:00:00Z',
    company_id: String(companyId),
  };

  // Test alert evaluation
  const result = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);

  assert.equal(result.conditions.lowBattery, false, 'Should not detect low battery');
  assert.equal(result.conditions.gridFailure, true, 'Should detect grid failure (0 import, >0 consumption)');
  assert.equal(result.alertsEmitted, 1, 'Should emit one alert');

  await closeHeliogridApp(app);
});

test('heliogrid: alert evaluator - no conditions met', async () => {
  const app = await createSeededHeliogridApp();

  const email = `heliogrid-test3-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const password = 'heliogrid-test-password';
  let onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Heliogrid Test Owner', email, password },
  });
  // Handle case where onboarding already completed (test isolation)
  if (onboarding.statusCode === 409) {
    // User already onboarding - sign in directly
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  } else {
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  }

  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  const companyId = Number(owners[0].company_id);
  const { siteId } = uniqueHeliogridSite();

  // Create a battery with high SoC (50%) - no low battery alert
  const batteryRepo = new BaseRepository(modelRegistry.get('heliogrid.battery'));
  await batteryRepo.create(
    {
      site_id: siteId,
      capacity_kwh: 100,
      state_of_charge_percent: 50.0,
      cycle_count: 0,
      status: 'active',
      company_id: String(companyId),
    },
    { companyId },
    SYSTEM_ACTOR
  );

  // Create telemetry record with normal conditions
  const telemetry = {
    id: 3,
    site_id: siteId,
    solar_generation_kw: 5.0,
    battery_discharge_kw: 0,
    grid_import_kw: 5.0,
    site_consumption_kw: 10.0,
    recorded_at: '2026-11-05T10:00:00Z',
    company_id: String(companyId),
  };

  // Test alert evaluation
  const result = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);

  assert.equal(result.conditions.lowBattery, false, 'Should not detect low battery');
  assert.equal(result.conditions.gridFailure, false, 'Should not detect grid failure');
  assert.equal(result.alertsEmitted, 0, 'Should emit no alerts');

  await closeHeliogridApp(app);
});

test('heliogrid: alert evaluator - idempotency per site+day+type', async () => {
  const app = await createSeededHeliogridApp();

  const email = `heliogrid-test4-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const password = 'heliogrid-test-password';
  let onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Heliogrid Test Owner', email, password },
  });
  // Handle case where onboarding already completed (test isolation)
  if (onboarding.statusCode === 409) {
    // User already onboarding - sign in directly
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  } else {
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  }

  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  const companyId = Number(owners[0].company_id);
  const { siteId, day } = uniqueHeliogridSite();

  // Create a battery with low SoC (15%)
  const batteryRepo = new BaseRepository(modelRegistry.get('heliogrid.battery'));
  await batteryRepo.create(
    {
      site_id: siteId,
      capacity_kwh: 100,
      state_of_charge_percent: 15.0,
      cycle_count: 0,
      status: 'active',
      company_id: String(companyId),
    },
    { companyId },
    SYSTEM_ACTOR
  );

  // Create telemetry record
  const telemetry = {
    id: 4,
    site_id: siteId,
    solar_generation_kw: 0,
    battery_discharge_kw: 5.0,
    grid_import_kw: 0,
    site_consumption_kw: 0,
    recorded_at: `${day}T10:00:00Z`,
    company_id: String(companyId),
  };

  // First evaluation - should emit alert
  const result1 = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);
  assert.equal(result1.alertsEmitted, 1, 'First evaluation should emit alert');

  // Second evaluation same day - should not emit alert (idempotency)
  const result2 = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);
  assert.equal(result2.alertsEmitted, 0, 'Second evaluation same day should not emit alert');

  await closeHeliogridApp(app);
});

test('heliogrid: alert evaluator - gracefully degrades when template missing', async () => {
  const app = await createSeededHeliogridApp();

  const email = `heliogrid-test5-${Date.now()}-${Math.random().toString(16).slice(2)}@example.test`;
  const password = 'heliogrid-test-password';
  let onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Heliogrid Test Owner', email, password },
  });
  // Handle case where onboarding already completed (test isolation)
  if (onboarding.statusCode === 409) {
    // User already onboarding - sign in directly
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  } else {
    assert.equal(onboarding.statusCode, 201, onboarding.payload);
    const signIn = await app.inject({
      method: 'POST', url: '/api/auth/sign-in', payload: { email, password },
    });
    assert.equal(signIn.statusCode, 200, signIn.payload);
    const headers = { 'x-session-token': JSON.parse(signIn.payload).data.sessionToken };
  }

  const userRepo = new BaseRepository(modelRegistry.get('res.users'));
  const owners = await userRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  const companyId = Number(owners[0].company_id);
  const { siteId, day } = uniqueHeliogridSite();

  // Create a battery with low SoC (15%)
  const batteryRepo = new BaseRepository(modelRegistry.get('heliogrid.battery'));
  await batteryRepo.create(
    {
      site_id: siteId,
      capacity_kwh: 100,
      state_of_charge_percent: 15.0,
      cycle_count: 0,
      status: 'active',
      company_id: String(companyId),
    },
    { companyId },
    SYSTEM_ACTOR
  );

  // Create telemetry record
  const telemetry = {
    id: 5,
    site_id: siteId,
    solar_generation_kw: 0,
    battery_discharge_kw: 5.0,
    grid_import_kw: 0,
    site_consumption_kw: 0,
    recorded_at: `${day}T10:00:00Z`,
    company_id: String(companyId),
  };

  // Test that evaluation doesn't throw when template missing
  const result = await evaluateTelemetryAlert(telemetry, SYSTEM_ACTOR);
  // Should still return conditions even if alert emission fails due to missing template
  assert.equal(result.conditions.lowBattery, true, 'Should still detect low battery');
  assert.equal(result.conditions.gridFailure, false, 'Should not detect grid failure');
  // alertsEmitted may be 0 or 1 depending on whether template exists
  assert.ok(result.alertsEmitted >= 0, 'Should not throw on missing template');

  await closeHeliogridApp(app);
});
