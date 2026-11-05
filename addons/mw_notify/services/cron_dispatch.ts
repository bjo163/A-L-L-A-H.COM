/**
 * The shared cron handler scans spend thresholds and drains pending events.
 * Failed events remain retryable, while throwing after the batch activates the
 * cron runner's exponential backoff.
 */
import { logger, SsrfBlockedError } from '@allah/arsy-core';
import { BaseRepository, dbEngine, decryptSecret, SYSTEM_ACTOR } from '@allah/arsy-orm';
import { NotifyEvent, NotifyChannel } from '../models/notify';
import type { CronJobContext } from '../../project/services/cron_registry';
import { scanGatewaySpendThreshold } from './events';
import { deliver, renderTemplate, isLiveDeliveryEnabled, NotifySsrfBlockedError } from './webhook';

const DISPATCH_BATCH = 50;
const RETRY_BATCH = Math.floor(DISPATCH_BATCH / 2);

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function spendThreshold(): number {
  const raw = Number(process.env.ARSY_NOTIFY_SPEND_THRESHOLD_USD);
  return Number.isFinite(raw) && raw > 0 ? raw : 50;
}

function deliveryErrorMessage(err: unknown): string {
  if (err instanceof NotifySsrfBlockedError || err instanceof SsrfBlockedError) return err.message;
  if (err instanceof Error && err.message.startsWith('no active notify.channel')) return err.message;
  return 'notification delivery failed';
}

/** Resolve the channel an event should go out on: pinned id, else first active of the type. */
async function resolveChannel(event: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const channelRepo = new BaseRepository<Record<string, unknown>>(NotifyChannel, dbEngine);
  const companyId = Number(event.company_id);
  if (event.channel_id) {
    const pinned = await channelRepo.find({
      scope: { companyId },
      filters: [{ field: 'id', operator: '=', value: Number(event.channel_id) }],
      limit: 1,
    });
    if (pinned[0]) return pinned[0];
  }
  const byType = await channelRepo.find({
    scope: { companyId },
    filters: [
      { field: 'channel_type', operator: '=', value: String(event.channel_type) },
      { field: 'is_active', operator: '=', value: true },
    ],
    orderBy: 'sequence',
    limit: 1,
  });
  return byType[0] ?? null;
}

export async function notifyDispatch(_job: CronJobContext): Promise<void> {
  let spendScanFailure: string | undefined;
  try {
    await scanGatewaySpendThreshold(spendThreshold(), today());
  } catch (err) {
    spendScanFailure = err instanceof Error ? err.message : String(err);
    logger.warn({ err }, 'Notification spend-threshold scan failed');
  }

  const eventRepo = new BaseRepository<Record<string, unknown>>(NotifyEvent, dbEngine);
  const pending = await eventRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'status', operator: '=', value: 'pending' }],
    orderBy: 'id',
    limit: DISPATCH_BATCH,
  });
  const failed = await eventRepo.find({
    scope: { systemScope: true },
    filters: [{ field: 'status', operator: '=', value: 'failed' }],
    orderBy: 'id',
    limit: RETRY_BATCH,
  });
  const events = [
    ...pending.slice(0, DISPATCH_BATCH - failed.length),
    ...failed,
  ].sort((a, b) => Number(a.id) - Number(b.id));
  const failures: string[] = [];

  for (const event of events) {
    const id = Number(event.id);
    const companyId = Number(event.company_id);
    const vars = (event.payload ?? {}) as Record<string, unknown>;
    const subject = renderTemplate(String(event.subject ?? ''), vars);
    const body = renderTemplate(String(event.body ?? ''), vars);

    let result: { delivered: boolean; transport: string; error?: string };
    try {
      let baseUrl: string | undefined;
      let bearer: string | undefined;
      if (isLiveDeliveryEnabled()) {
        const channel = await resolveChannel(event);
        if (!channel) {
          throw new Error(`no active notify.channel for type '${event.channel_type}'`);
        }
        baseUrl = channel.base_url ? String(channel.base_url) : undefined;
        if (channel.auth_token_encrypted) {
          bearer = decryptSecret(String(channel.auth_token_encrypted));
        }
      }
      result = await deliver(baseUrl, {
        event_id: id,
        company_id: companyId,
        template_code: event.template_code,
        recipient: event.recipient,
        subject,
        body,
        payload: vars,
      }, bearer);
    } catch (err) {
      const error = deliveryErrorMessage(err);
      result = { delivered: false, transport: 'http', error };
    }

    const attempts = Number(event.attempts ?? 0) + 1;
    // Scope the write to the event's own tenant so the update stays a fail-closed
    // company-scoped operation (the drain reads cross-tenant, but every write names
    // its tenant) — the audit + tenant guard both require a concrete company_id.
    await eventRepo.updateById(
      id,
      {
        subject,
        body,
        status: result.delivered ? 'delivered' : 'failed',
        attempts,
        last_error: result.error ?? '',
        sent_at: result.delivered ? new Date().toISOString() : event.sent_at,
      },
      { companyId },
      SYSTEM_ACTOR
    );
    if (!result.delivered) {
      const error = result.error ?? 'delivery failed';
      failures.push(`event ${id}: ${error}`);
      logger.warn({ eventId: id, error }, 'Notification delivery failed; will retry');
    }
  }

  if (spendScanFailure) failures.unshift(`spend scan: ${spendScanFailure}`);
  if (failures.length > 0) throw new Error(`notify_dispatch failed: ${failures.join('; ')}`);
}
