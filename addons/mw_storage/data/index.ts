import type { SeedContext, SeedResult } from '@allah/arsy-orm';

/**
 * `mw_storage` owns no platform reference data: `mw.storage.backend`,
 * `ir.attachment`, and `ir.legal.hold` are configured/created per deployment by
 * operators, not shipped as defaults. Declared empty on purpose so the absence
 * is explicit rather than accidental.
 */
export async function loadDefaultData(_ctx: SeedContext): Promise<SeedResult> {
  return [];
}
