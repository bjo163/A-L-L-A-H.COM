/**
 * Low-power threshold alert evaluator for HELIOGRID (WATCHTOWER integration).
 *
 * Evaluates telemetry records for power anomalies and emits notification events
 * consumed by WATCHTOWER for operator alerting. Two alert conditions:
 * 1. Battery SoC below 20% threshold
 * 2. Grid failure (grid_import_kw == 0 but site_consumption_kw > 0)
 *
 * The evaluator is idempotent per (site, day, alert_type) to avoid alert floods.
 */
import {
  BaseRepository,
  dbEngine,
  modelRegistry,
  SYSTEM_ACTOR,
  type AuditActor,
  type TenantScope,
} from '@allah/arsy-orm';
import { recordNotifyEvent } from '../../mw_notify/services/events';

const BATTERY_SOC_THRESHOLD = 20.0;

export interface AlertEvaluationResult {
  siteId: number;
  companyId: number;
  evaluatedAt: string;
  alertsEmitted: number;
  conditions: {
    lowBattery: boolean;
    gridFailure: boolean;
  };
}

/**
 * Evaluate a single telemetry record for alert conditions and emit notification
 * events if thresholds are breached. Returns evaluation result with conditions.
 */
export async function evaluateTelemetryAlert(
  telemetry: {
    id: number;
    site_id: number;
    solar_generation_kw: number;
    battery_discharge_kw: number;
    grid_import_kw: number;
    site_consumption_kw: number;
    recorded_at: string;
    company_id: string;
  },
  actor: AuditActor = SYSTEM_ACTOR
): Promise<AlertEvaluationResult> {
  const companyId = Number(telemetry.company_id);
  const siteId = Number(telemetry.site_id);
  const scope: TenantScope = { companyId };

  const result: AlertEvaluationResult = {
    siteId,
    companyId,
    evaluatedAt: new Date().toISOString(),
    alertsEmitted: 0,
    conditions: {
      lowBattery: false,
      gridFailure: false,
    },
  };

  // Check low battery condition
  if (telemetry.battery_discharge_kw > 0 || telemetry.solar_generation_kw === 0) {
    // Battery is being used or no solar generation - check SoC
    const batteryRepo = new BaseRepository<Record<string, unknown>>(
      modelRegistry.get('heliogrid.battery')!,
      dbEngine
    );
    const batteries = await batteryRepo.find({
      scope,
      filters: [{ field: 'site_id', operator: '=', value: siteId }],
      limit: 10,
    });

    for (const battery of batteries) {
      const soc = Number(battery.state_of_charge_percent ?? 100);
      if (soc < BATTERY_SOC_THRESHOLD) {
        result.conditions.lowBattery = true;
        break;
      }
    }
  }

  // Check grid failure condition
  if (telemetry.grid_import_kw === 0 && telemetry.site_consumption_kw > 0) {
    result.conditions.gridFailure = true;
  }

  // Emit alerts for detected conditions (idempotent per site+day+type)
  const day = telemetry.recorded_at.split('T')[0];

  if (result.conditions.lowBattery) {
    const emitted = await emitLowBatteryAlert(siteId, companyId, day, actor);
    if (emitted) result.alertsEmitted += 1;
  }

  if (result.conditions.gridFailure) {
    const emitted = await emitGridFailureAlert(siteId, companyId, day, actor);
    if (emitted) result.alertsEmitted += 1;
  }

  return result;
}

/**
 * Emit a low battery alert if not already emitted for this site+day.
 * Returns true if a new alert was emitted.
 */
async function emitLowBatteryAlert(
  siteId: number,
  companyId: number,
  day: string,
  actor: AuditActor
): Promise<boolean> {
  const eventRepo = new BaseRepository<Record<string, unknown>>(
    modelRegistry.get('notify.event')!,
    dbEngine
  );

  const existing = await eventRepo.find({
    scope: { companyId },
    filters: [
      { field: 'template_code', operator: '=', value: 'heliogrid.low_battery' },
      { field: 'create_date', operator: '>=', value: `${day}T00:00:00Z` },
    ],
    limit: 50,
  });

  if (existing.some((event) => Number((event.payload as Record<string, unknown> | null)?.site_id ?? -1) === siteId)) {
    return false;
  }

  try {
    await recordNotifyEvent(
      {
        companyId,
        templateCode: 'heliogrid.low_battery',
        payload: { site_id: siteId, threshold: BATTERY_SOC_THRESHOLD, day },
      },
      actor
    );
    return true;
  } catch (error) {
    // Template may not exist yet - degrade gracefully
    if (String(error).includes('unknown notify.template')) {
      return false;
    }
    throw error;
  }
}

/**
 * Emit a grid failure alert if not already emitted for this site+day.
 * Returns true if a new alert was emitted.
 */
async function emitGridFailureAlert(
  siteId: number,
  companyId: number,
  day: string,
  actor: AuditActor
): Promise<boolean> {
  const eventRepo = new BaseRepository<Record<string, unknown>>(
    modelRegistry.get('notify.event')!,
    dbEngine
  );

  const existing = await eventRepo.find({
    scope: { companyId },
    filters: [
      { field: 'template_code', operator: '=', value: 'heliogrid.grid_failure' },
      { field: 'create_date', operator: '>=', value: `${day}T00:00:00Z` },
    ],
    limit: 50,
  });

  if (existing.some((event) => Number((event.payload as Record<string, unknown> | null)?.site_id ?? -1) === siteId)) {
    return false;
  }

  try {
    await recordNotifyEvent(
      {
        companyId,
        templateCode: 'heliogrid.grid_failure',
        payload: { site_id: siteId, day },
      },
      actor
    );
    return true;
  } catch (error) {
    // Template may not exist yet - degrade gracefully
    if (String(error).includes('unknown notify.template')) {
      return false;
    }
    throw error;
  }
}
