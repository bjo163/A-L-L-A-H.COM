import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildAuthenticatedApp } from './helpers.mjs';
import { runDueCrons } from '../../../addons/project/services/cron_runner.ts';
import { registerCronHandler } from '../../../addons/project/services/cron_registry.ts';
import { IrCron } from '../../../addons/project/models/ir_cron.ts';
import { BaseRepository, SYSTEM_ACTOR, dbEngine } from '@allah/arsy-orm';

// Roadmap T3.2: the cron runner is a claim/dispatch/backoff queue. `buildAuthenticatedApp`
// connects + migrates the engine and registers every addon (which populates the
// handler registry). Jobs are exercised directly through the exported one-poll
// seam `runDueCrons` — deterministic, no timer waiting. Test rows live at the
// platform tenant (company_id 0); the runner is cross-tenant by design.
await buildAuthenticatedApp();

const repo = new BaseRepository(IrCron, dbEngine, dbEngine);
const writeScope = { systemScope: true, companyId: 0 };
const past = new Date(Date.now() - 60_000).toISOString();

async function mkCron(methodName, state) {
  return repo.create(
    {
      company_id: 0,
      name: `test ${methodName}`,
      model_name: 'project.project',
      method_name: methodName,
      interval_number: 1,
      interval_unit: 'minutes',
      state,
      nextcall: past,
      run_count: 0,
      attempt_count: 0,
      last_error: '',
    },
    writeScope,
    SYSTEM_ACTOR,
  );
}

async function byMethod(methodName) {
  const rows = await repo.find({
    scope: { systemScope: true },
    filters: [{ field: 'method_name', operator: '=', value: methodName }],
  });
  return rows[0];
}

test('a due idle job is claimed, dispatched, and reset to idle on success', async () => {
  let calls = 0;
  registerCronHandler('queue_ok', async () => { calls += 1; });
  await mkCron('queue_ok', 'idle');

  await runDueCrons();

  assert.equal(calls, 1, 'the registered handler ran exactly once');
  const row = await byMethod('queue_ok');
  assert.equal(row.state, 'idle', 'a successful run returns the row to idle');
  assert.equal(Number(row.run_count), 1, 'a successful run increments run_count');
  assert.equal(Number(row.attempt_count), 0, 'a successful run resets attempt_count');
  assert.ok(new Date(row.nextcall).getTime() > Date.now(), 'next run is scheduled in the future');
});

test('a failing job enters error, records the cause, and backs off', async () => {
  registerCronHandler('queue_fail', async () => { throw new Error('boom'); });
  await mkCron('queue_fail', 'idle');

  await runDueCrons();

  const row = await byMethod('queue_fail');
  assert.equal(row.state, 'error', 'a failing run parks the row in error');
  assert.equal(Number(row.attempt_count), 1, 'the attempt is counted for exponential backoff');
  assert.match(String(row.last_error), /boom/, 'the error cause is persisted');
  assert.ok(new Date(row.next_retry_at).getTime() > Date.now(), 'next_retry_at is set to the backoff instant');
});

test('a disabled cron row is never claimed by the runner', async () => {
  let calls = 0;
  registerCronHandler('queue_disabled', async () => { calls += 1; });
  await mkCron('queue_disabled', 'disabled');

  await runDueCrons();

  assert.equal(calls, 0, 'a disabled job must not dispatch');
  const row = await byMethod('queue_disabled');
  assert.equal(row.state, 'disabled', 'the disabled row is untouched by the poll');
});

test('ARSY_CRON_KINDS partitions which jobs this runner claims', async () => {
  let calls = 0;
  registerCronHandler('queue_kind', async () => { calls += 1; });
  await mkCron('queue_kind', 'idle');

  process.env.ARSY_CRON_KINDS = 'some_other_method';
  try {
    await runDueCrons();
  } finally {
    delete process.env.ARSY_CRON_KINDS;
  }

  assert.equal(calls, 0, 'a method outside ARSY_CRON_KINDS is not claimed by this process');
  const row = await byMethod('queue_kind');
  assert.equal(row.state, 'idle', 'the unclaimed row stays idle for a runner assigned its kind');
});

test('an unregistered method fails closed into error, not a silent no-op', async () => {
  await mkCron('queue_orphan', 'idle');

  await runDueCrons();

  const row = await byMethod('queue_orphan');
  assert.equal(row.state, 'error', 'a row with no handler is surfaced as an error');
  assert.match(String(row.last_error), /No cron handler/, 'the cause names the missing handler');
});
