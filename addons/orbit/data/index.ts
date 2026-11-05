import type { SeedContext, SeedResult } from '@allah/arsy-orm';

/**
 * `orbit` owns no platform reference data: instances, templates, and volumes
 * are tenant compute resources provisioned at runtime, not shipped defaults.
 * Declared empty on purpose so the absence is deliberate and verifiable.
 */
export async function loadDefaultData(_ctx: SeedContext): Promise<SeedResult> {
  return [];
}
