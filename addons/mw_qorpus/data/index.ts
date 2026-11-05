import type { SeedContext, SeedResult } from '@allah/arsy-orm';

/**
 * `mw_qorpus` owns no platform reference data: its models (`qorpus.document`,
 * `qorpus.chunk`) hold tenant/user-ingested content, not shipped defaults. The
 * empty loader is declared on purpose — absence of default data must be a
 * deliberate, manifest-declared choice, not an accidental gap.
 */
export async function loadDefaultData(_ctx: SeedContext): Promise<SeedResult> {
  return [];
}
