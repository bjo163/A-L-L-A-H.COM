/**
 * Producer-facing notification API (roadmap T3.4).
 *
 * A producer never renders or sends — it appends a `pending` `notify.event` row
 * naming a template `code` plus the variables (`payload`) the template needs. The
 * `notify_dispatch` cron later renders, delivers, and flips status. Keeping the
 * write append-only at the producer boundary is what lets invoice transitions,
 * RADIUS auth failures, and gateway spend checks all funnel into one substrate
 * without any of them depending on transport or SSRF code.
 */
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SYSTEM_ACTOR,
  type AuditActor,
  type TenantScope,
} from '@allah/arsy-orm';
import { NotifyEvent, NotifyTemplate } from '../models/notify';

type ChannelType = 'email' | 'sms' | 'webhook';

export interface RecordNotifyEventInput {
  companyId: number;
  templateCode: string;
  /** Variables substituted into the template at dispatch time. */
  payload?: Record<string, unknown>;
  recipient?: string;
  /** Override the template's default channel type. */
  channelType?: ChannelType;
  /** Pin a concrete channel; otherwise the dispatcher resolves one by type. */
  channelId?: number | null;
}

const eventRepo = (): BaseRepository<Record<string, unknown>> =>
  new BaseRepository<Record<string, unknown>>(NotifyEvent, dbEngine);

const templateRepo = (): BaseRepository<Record<string, unknown>> =>
  new BaseRepository<Record<string, unknown>>(NotifyTemplate, dbEngine);

/**
 * Append one pending event. The lookup that resolves the template's channel type
 * runs against the platform catalog (company_id 0) so any tenant referencing a
 * platform code gets the same routing. Throws if the code is unknown — a producer
 * wired to a typo'd template should fail loudly, not silently drop a notification.
 */
export async function recordNotifyEvent(
  input: RecordNotifyEventInput,
  actor: AuditActor = SYSTEM_ACTOR
): Promise<number> {
  const { companyId, templateCode } = input;
  const scope: TenantScope = { companyId };

  const template = await templateRepo().find({
    scope: { systemScope: true },
    filters: [{ field: 'code', operator: '=', value: templateCode }],
    limit: 1,
  });
  const templateRow = template[0];
  if (!templateRow) {
    throw new Error(`recordNotifyEvent: unknown notify.template code '${templateCode}'`);
  }

  const channelType = (input.channelType ?? String(templateRow.channel_type ?? 'webhook')) as ChannelType;
  const created = await eventRepo().create(
    {
      template_code: templateCode,
      channel_type: channelType,
      channel_id: input.channelId ?? null,
      recipient: input.recipient ?? '',
      subject: String(templateRow.subject ?? ''),
      body: String(templateRow.body ?? ''),
      payload: input.payload ?? {},
      status: 'pending',
      attempts: 0,
    },
    scope,
    actor
  );
  return Number((created as Record<string, unknown>).id);
}

// Gateway spend thresholds are read through `modelRegistry` + `readGroup` rather
// than importing the mw_llm_router addon, so mw_notify stays decoupled from the
// router's internals and degrades to a no-op when the router is not installed.
const SPEND_MODEL = 'ai.usage_daily';

/**
 * Scan today's per-tenant gateway rollups and append a `gateway.spend_threshold`
 * event for every tenant whose summed cost crosses `thresholdUsd` and has no
 * spend event already recorded for the same day. Idempotent per (tenant, day):
 * re-running the dispatch does not spam duplicate alerts.
 */
export async function scanGatewaySpendThreshold(
  thresholdUsd: number,
  day: string,
  actor: AuditActor = SYSTEM_ACTOR
): Promise<number> {
  const spendModel = modelRegistry.get(SPEND_MODEL);
  if (!spendModel) return 0;
  const repo = new BaseRepository<Record<string, unknown>>(spendModel, dbEngine);
  const grouped = await repo.readGroup(
    { scope: { systemScope: true } },
    {
      groupBy: ['company_id'],
      aggregates: [{ fn: 'sum', field: 'total_cost_usd', alias: 'cost' }],
    }
  );

  let appended = 0;
  const eventRepo = new BaseRepository<Record<string, unknown>>(NotifyEvent, dbEngine);
  for (const bucket of grouped) {
    const cost = Number(bucket.cost ?? 0);
    const companyId = Number(bucket.company_id);
    if (!Number.isFinite(companyId) || cost < thresholdUsd) continue;

    // Skip if a spend event for this tenant+day already exists (dedupe by payload.day).
    const existing = await eventRepo.find({
      scope: { companyId },
      filters: [
        { field: 'template_code', operator: '=', value: 'gateway.spend_threshold' },
        { field: 'create_date', operator: '>=', value: `${day}T00:00:00Z` },
      ],
      limit: 1,
    });
    if (existing.length > 0) continue;

    await recordNotifyEvent(
      { companyId, templateCode: 'gateway.spend_threshold', payload: { cost_usd: cost.toFixed(2), day } },
      actor
    );
    appended += 1;
  }
  return appended;
}
