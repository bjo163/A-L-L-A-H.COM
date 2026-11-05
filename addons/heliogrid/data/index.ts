import type { SeedContext, SeedResult } from '@allah/arsy-orm';

/**
 * `heliogrid` owns no platform reference data: sites, inverters, batteries, and
 * telemetry rows are the operator's physical energy infrastructure, discovered
 * or entered per deployment. The empty loader is declared on purpose so the
 * absence is an explicit, manifest-declared choice, not an accidental gap.
 */
export async function loadDefaultData(_ctx: SeedContext): Promise<SeedResult> {
  return [];
}
