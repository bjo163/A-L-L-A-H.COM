import type { SeedContext, SeedResult } from '@allah/arsy-orm';

/**
 * `nexus` owns no platform reference data: sites, devices, NAS entries, and IP
 * pools are the operator's real network inventory, discovered or entered per
 * deployment. Declared empty on purpose so "no defaults" is an explicit,
 * manifest-declared decision.
 */
export async function loadDefaultData(_ctx: SeedContext): Promise<SeedResult> {
  return [];
}
