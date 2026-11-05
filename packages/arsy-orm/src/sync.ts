import { dbEngine } from './engine';
import { logger } from '@allah/arsy-core';

// Append-only cross-app data-sync outbox (roadmap F3). The `arsy_sync_outbox` table is
// written by an AFTER trigger (installed by SchemaMigrator for allowlisted models) and is
// immutable; delivery is recorded in the append-only `arsy_sync_delivery` ledger keyed
// uniquely by (outbox_seq, consumer). That ledger is what makes drain crash-safe and
// idempotent: a re-delivery after a partial failure resolves to the same single ack row,
// and consumers dedupe on the seq — mirroring the audit-event pattern.

export interface SyncOutboxRow {
  id: number;
  company_id: number;
  model_name: string;
  record_id: string;
  operation: 'insert' | 'update' | 'delete';
  changed_fields: string[] | null;
  payload: Record<string, unknown> | null;
  emitted_at: string;
}

/** Transport hook: publish one outbox event to its destination app (e.g. over @allah/sdk). */
export type SyncPublisher = (row: SyncOutboxRow) => Promise<void>;

/**
 * Outbox events not yet delivered to `consumer`, oldest-first. The drain is a platform-level
 * cross-tenant worker, so it intentionally reads every tenant's rows; each row still carries
 * its own company_id for downstream scoping. The outbox tables are not ORM models, so these
 * reads bypass the tenant builder by design (append-only infrastructure, like the audit log).
 */
export async function pendingOutbox(consumer: string, limit = 100): Promise<SyncOutboxRow[]> {
  const rows = await dbEngine.query<SyncOutboxRow>(
    `SELECT o."id", o."company_id", o."model_name", o."record_id", o."operation",
            o."changed_fields", o."payload", o."emitted_at"
       FROM "arsy_sync_outbox" o
      WHERE NOT EXISTS (
        SELECT 1 FROM "arsy_sync_delivery" d
         WHERE d."outbox_seq" = o."id" AND d."consumer" = $1
      )
      ORDER BY o."id"
      LIMIT $2`,
    [consumer, limit]
  );
  return rows;
}

/**
 * Record a delivery for (seq, consumer). Idempotent: a duplicate ack (e.g. after a crash
 * between publish and ack) hits the UNIQUE constraint and is a no-op, returning false.
 */
export async function ackDelivery(outboxSeq: number, consumer: string): Promise<boolean> {
  const inserted = await dbEngine.query<{ id: number }>(
    `INSERT INTO "arsy_sync_delivery" ("outbox_seq", "consumer")
     VALUES ($1, $2)
     ON CONFLICT ("outbox_seq", "consumer") DO NOTHING
     RETURNING "id"`,
    [outboxSeq, consumer]
  );
  return inserted.length > 0;
}

export interface DrainResult {
  scanned: number;
  delivered: number;
}

/**
 * Ack many (seq, consumer) deliveries in a single append-only statement (roadmap
 * T2.4d). Every row is `INSERT … ON CONFLICT DO NOTHING`, so a re-ack after a
 * partial failure stays a no-op; the return value is the number of newly recorded
 * deliveries. Never deletes ledger rows — retention is served by the time index,
 * not compaction, to preserve the append-only invariant.
 */
export async function ackDeliveryBatch(consumer: string, outboxSeqs: number[]): Promise<number> {
  if (outboxSeqs.length === 0) return 0;
  const params: unknown[] = [];
  const tuples = outboxSeqs.map((seq) => {
    params.push(seq, consumer);
    return `($${params.length - 1}, $${params.length})`;
  });
  const inserted = await dbEngine.query<{ id: number }>(
    `INSERT INTO "arsy_sync_delivery" ("outbox_seq", "consumer")
     VALUES ${tuples.join(', ')}
     ON CONFLICT ("outbox_seq", "consumer") DO NOTHING
     RETURNING "id"`,
    params
  );
  return inserted.length;
}

/**
 * Publish every pending event for `consumer`, then ack it. Publish-then-ack gives at-least-once
 * delivery; the UNIQUE ledger collapses retries so each event is recorded once (effectively-once
 * for idempotent consumers). If `publisher` throws, the drain stops with that row still pending,
 * so the next drain retries it rather than losing it.
 */
export async function drainOutbox(
  consumer: string,
  publisher: SyncPublisher,
  limit = 100
): Promise<DrainResult> {
  const pending = await pendingOutbox(consumer, limit);
  let delivered = 0;
  for (const row of pending) {
    await publisher(row);
    if (await ackDelivery(row.id, consumer)) {
      delivered += 1;
    }
  }
  if (delivered > 0) {
    logger.info(`Sync drain: delivered ${delivered}/${pending.length} outbox event(s) to '${consumer}'.`);
  }
  return { scanned: pending.length, delivered };
}

/**
 * Batched drain (roadmap T2.4d): publish pending events one at a time (transport
 * is per-row), but coalesce the delivery acks into one `INSERT … ON CONFLICT DO
 * NOTHING` per `ackChunk` successes instead of one round-trip per event. On a
 * publish failure it flushes the acks already earned, then rethrows, so the
 * failing row and everything after it stays pending for the next drain.
 */
export async function drainOutboxBatch(
  consumer: string,
  publisher: SyncPublisher,
  limit = 100,
  ackChunk = 200
): Promise<DrainResult> {
  const pending = await pendingOutbox(consumer, limit);
  let delivered = 0;
  let published: number[] = [];

  const flush = async (): Promise<void> => {
    if (published.length === 0) return;
    delivered += await ackDeliveryBatch(consumer, published);
    published = [];
  };

  try {
    for (const row of pending) {
      await publisher(row);
      published.push(row.id);
      if (published.length >= ackChunk) await flush();
    }
  } finally {
    // Ack the successes earned before any throw; the failing row is not in the
    // batch, so a re-run republishes and re-acks it idempotently.
    await flush();
  }

  if (delivered > 0) {
    logger.info(`Sync drain: delivered ${delivered}/${pending.length} outbox event(s) to '${consumer}'.`);
  }
  return { scanned: pending.length, delivered };
}

/** Highest outbox sequence emitted so far — a boundary for asserting newly-added rows. */
export async function latestOutboxId(): Promise<number> {
  const rows = await dbEngine.query<{ max: string | number | null }>(
    `SELECT MAX("id") AS max FROM "arsy_sync_outbox"`
  );
  return Number(rows[0]?.max ?? 0);
}

/** Total events ever emitted — used by health/dashboards and tests. */
export async function outboxCount(): Promise<number> {
  const rows = await dbEngine.query<{ count: string | number }>(
    `SELECT COUNT(*)::bigint AS count FROM "arsy_sync_outbox"`
  );
  return Number(rows[0]?.count || 0);
}

/** Number of delivery-ledger rows for a given (seq, consumer) — proves idempotent ack. */
export async function deliveryCount(outboxSeq: number, consumer: string): Promise<number> {
  const rows = await dbEngine.query<{ count: string | number }>(
    `SELECT COUNT(*)::bigint AS count FROM "arsy_sync_delivery" WHERE "outbox_seq" = $1 AND "consumer" = $2`,
    [outboxSeq, consumer]
  );
  return Number(rows[0]?.count || 0);
}
