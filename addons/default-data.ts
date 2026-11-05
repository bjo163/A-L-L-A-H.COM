/**
 * Static default-data registry (roadmap: Odoo-style manifest-declared seed data).
 *
 * The hub bundles addons via static imports (see `./index`), so we cannot
 * dynamically `import()` a manifest-declared path at boot. Instead every addon's
 * `loadDefaultData` loader is wired here, and the arch/contract gates verify that
 * this registry and each `__manifest__.json` `data` key agree — preserving the
 * Odoo "the manifest declares its data" guarantee without breaking the bundler.
 */
import type { SeedContext, SeedResult } from '@allah/arsy-orm';
import { resolveLoadOrder, ALL_ADDON_NAMES } from './index';

import { loadDefaultData as baseDefaultData } from './base/data/index';
import { loadDefaultData as mwLlmRouterDefaultData } from './mw_llm_router/data/index';
import { loadDefaultData as worksDefaultData } from './works/data/index';
import { loadDefaultData as projectDefaultData } from './project/data/index';
import { loadDefaultData as mwQorpusDefaultData } from './mw_qorpus/data/index';
import { loadDefaultData as mwStorageDefaultData } from './mw_storage/data/index';
import { loadDefaultData as nexusDefaultData } from './nexus/data/index';
import { loadDefaultData as orbitDefaultData } from './orbit/data/index';
import { loadDefaultData as mwNotifyDefaultData } from './mw_notify/data/index';
import { loadDefaultData as heliogridDefaultData } from './heliogrid/data/index';

/**
 * addon name -> its default-data loader. All nine addons ship a loader; four
 * (`mw_qorpus`, `mw_storage`, `nexus`, `orbit`) return an empty result because
 * they own no platform reference rows, but their presence is an explicit,
 * deliberate statement (matching `data: []` in the manifest).
 */
export const DEFAULT_DATA_REGISTRY: Record<string, (ctx: SeedContext) => Promise<SeedResult>> = {
  base: baseDefaultData,
  mw_llm_router: mwLlmRouterDefaultData,
  works: worksDefaultData,
  project: projectDefaultData,
  mw_notify: mwNotifyDefaultData,
  mw_qorpus: mwQorpusDefaultData,
  mw_storage: mwStorageDefaultData,
  nexus: nexusDefaultData,
  orbit: orbitDefaultData,
  heliogrid: heliogridDefaultData,
};

/**
 * The addons to seed, in dependency order, filtered to those that actually have
 * a registered loader. Roots default to the full addon set so a fresh install
 * seeds everything it declares. Reuses the addon loader's topo-sort, so an
 * unknown dependency or cycle still fails loudly.
 */
export function resolveSeedOrder(roots: string[] = ALL_ADDON_NAMES): string[] {
  return resolveLoadOrder(roots).filter((name) => DEFAULT_DATA_REGISTRY[name] !== undefined);
}

/**
 * Optional sample-row loaders, seeded only when `ARSY_SEED_DEMO === 'true'` and
 * not in production. Addons that ship a demo footprint register a loader here;
 * the platform catalog itself always lives in `DEFAULT_DATA_REGISTRY`. Keeping
 * this empty-but-declared makes "no demo rows" an explicit choice per addon.
 */
export const DEMO_DATA_REGISTRY: Record<string, (ctx: SeedContext) => Promise<SeedResult>> = {};

/** The addons with a demo loader, in dependency order. */
export function resolveDemoSeedOrder(roots: string[] = ALL_ADDON_NAMES): string[] {
  return resolveLoadOrder(roots).filter((name) => DEMO_DATA_REGISTRY[name] !== undefined);
}
