import assert from 'node:assert/strict';
import test from 'node:test';
import { buildArsyApp } from '../src/app.ts';
import {
  dbEngine,
  BaseRepository,
  modelRegistry,
  SYSTEM_ACTOR,
  pendingOutbox,
  drainOutbox,
  drainOutboxBatch,
  ackDeliveryBatch,
  deliveryCount,
  outboxCount,
  latestOutboxId,
} from '@allah/arsy-orm';

// Cross-app sync outbox (roadmap F3): booting the hub installs the AFTER sync trigger on
// res.users (default allowlist). We write a user through the ORM and assert exactly the
// outbox contract: one tenant-tagged row per mutation, append-only, idempotent delivery.
test('append-only cross-app sync outbox (F3)', async (t) => {
  const app = await buildArsyApp({ enableLogging: false });

  // Onboard a real owner so there is a res.users row with a concrete company_id.
  const email = `sync-owner-${Date.now()}@example.test`;
  const onboarding = await app.inject({
    method: 'POST', url: '/api/auth/onboarding',
    payload: { name: 'Sync Owner', email, password: 'sync-owner-password' },
  });
  assert.equal(onboarding.statusCode, 201, onboarding.payload);

  const userDef = modelRegistry.get('res.users');
  assert.ok(userDef, 'res.users model must be registered');
  const repo = new BaseRepository(userDef);
  const owners = await repo.find({
    scope: { systemScope: true, companyId: 0 },
    filters: [{ field: 'email', operator: '=', value: email }],
    limit: 1,
  });
  assert.equal(owners.length, 1, 'the onboarded owner should be readable');
  const userId = Number(owners[0].id);
  const companyId = Number(owners[0].company_id);

  await t.test('a res.users update emits exactly one tenant-tagged outbox row', async () => {
    const before = await outboxCount();
    const boundary = await latestOutboxId();
    await repo.updateById(userId, { name: 'Renamed For Sync' }, { companyId }, SYSTEM_ACTOR);
    const after = await outboxCount();
    assert.equal(after - before, 1, 'a single update must produce exactly one outbox row');

    // Scope to rows this specific write added (onboarding also emits res.users events),
    // proving the update itself yields exactly one tenant-tagged outbox row.
    const pending = await pendingOutbox('dock', 200);
    const mine = pending.filter(
      (r) =>
        r.id > boundary &&
        r.model_name === 'res.users' &&
        r.record_id === String(userId) &&
        r.operation === 'update'
    );
    assert.equal(mine.length, 1, 'the update should produce exactly one res.users outbox row');
    assert.equal(Number(mine[0].company_id), companyId, 'every outbox row carries company_id');
    assert.equal(mine[0].operation, 'update');
    assert.ok(Array.isArray(mine[0].changed_fields) && mine[0].changed_fields.includes('name'));
  });

  await t.test('outbox rows are append-only (UPDATE and DELETE are rejected)', async () => {
    await assert.rejects(
      () => dbEngine.query('UPDATE "arsy_sync_outbox" SET "operation" = $1 WHERE "id" = (SELECT MIN("id") FROM "arsy_sync_outbox")', ['insert']),
      /append-only/,
      'mutating an outbox row must fail'
    );
    await assert.rejects(
      () => dbEngine.query('DELETE FROM "arsy_sync_outbox" WHERE "id" = (SELECT MIN("id") FROM "arsy_sync_outbox")'),
      /append-only/,
      'deleting an outbox row must fail'
    );
  });

  await t.test('delivery is exactly-once and idempotent across a simulated crash/retry', async () => {
    const pending = await pendingOutbox('dock', 50);
    const seq = pending.find((r) => r.model_name === 'res.users' && r.record_id === String(userId)).id;

    // Consumer 'gate' first attempt crashes AFTER publishing (at-least-once), so no ack lands.
    const published = [];
    await assert.rejects(
      () =>
        drainOutbox(
          'gate',
          async (row) => {
            if (row.id === seq) {
              published.push(row.id);
              throw new Error('simulated consumer crash');
            }
          },
          50
        ),
      /simulated consumer crash/
    );
    assert.equal(await deliveryCount(seq, 'gate'), 0, 'a crash before ack leaves no delivery row');

    // Retry with a healthy publisher: the same seq is delivered and acked exactly once.
    const result = await drainOutbox(
      'gate',
      async (row) => {
        published.push(row.id);
      },
      50
    );
    assert.ok(result.delivered >= 1);
    assert.equal(await deliveryCount(seq, 'gate'), 1, 'retry lands exactly one ledger row');

    // A further drain finds nothing pending for 'gate' on that seq — no double delivery.
    const stillPending = (await pendingOutbox('gate', 50)).some((r) => r.id === seq);
    assert.equal(stillPending, false, 'acked event must not reappear as pending');
    // The consumer saw the event twice (at-least-once publish) but the ledger has one row,
    // so an idempotent consumer keyed on seq applies it once (effectively-once).
    assert.equal(published.filter((id) => id === seq).length, 2, 'publish happened on both attempts');
  });

  await t.test('batched drain acks in coalesced batches and keeps a crashed row pending (T2.4d)', async () => {
    const consumer = `batch-${Date.now()}`;
    const all = await pendingOutbox(consumer, 200);
    assert.ok(all.length >= 2, 'need at least two pending events to exercise batching');

    // A crash on the second row must still ack the first (already published) row.
    let seen = 0;
    await assert.rejects(
      () =>
        drainOutboxBatch(
          consumer,
          async () => {
            seen += 1;
            if (seen === 2) throw new Error('batch crash');
          },
          200,
          10
        ),
      /batch crash/
    );
    assert.equal(await deliveryCount(all[0].id, consumer), 1, 'the pre-crash publish is batch-acked');
    assert.equal(await deliveryCount(all[1].id, consumer), 0, 'the throwing row is not acked');
    assert.equal(
      (await pendingOutbox(consumer, 200)).some((r) => r.id === all[1].id),
      true,
      'the crashed row stays pending for a retry'
    );

    // A clean batched drain delivers everything still pending, once each.
    const result = await drainOutboxBatch(consumer, async () => {}, 200, 10);
    assert.equal(result.delivered, all.length - 1, 'every remaining row is delivered');
    assert.equal((await pendingOutbox(consumer, 200)).length, 0, 'NOT EXISTS drain finds nothing left');
    for (const row of all) {
      assert.equal(await deliveryCount(row.id, consumer), 1, 'exactly one ledger row per event');
    }

    // Re-acking the same seqs is a pure no-op (append-only, idempotent).
    assert.equal(await ackDeliveryBatch(consumer, all.map((r) => r.id)), 0, 're-ack inserts nothing');
  });

  await app.close();
});
