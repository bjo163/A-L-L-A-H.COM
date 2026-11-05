/**
 * Manifest-driven, dependency-ordered addon loader (roadmap T8).
 *
 * The load order and dependency edges are read from each addon's
 * `__manifest__.json` (`depends` / `installable`) rather than hand-wired, so
 * booting the hub or the sentinel pulls transitive dependencies (e.g. `base`)
 * automatically and a missing or cyclic dependency fails loudly at boot
 * instead of producing a half-registered registry.
 */
import { registerBaseAddon } from './base/index';
import { registerMwStorageAddon } from './mw_storage/index';
import { registerMwQorpusAddon } from './mw_qorpus/index';
import { registerMwLlmRouterAddon } from './mw_llm_router/index';
import { registerNexusAddon } from './nexus/index';
import { registerOrbitAddon } from './orbit/index';
import { registerWorksAddon } from './works/index';
import { registerProjectAddon } from './project/index';

import baseManifest from './base/__manifest__.json';
import mwStorageManifest from './mw_storage/__manifest__.json';
import mwQorpusManifest from './mw_qorpus/__manifest__.json';
import mwLlmRouterManifest from './mw_llm_router/__manifest__.json';
import nexusManifest from './nexus/__manifest__.json';
import orbitManifest from './orbit/__manifest__.json';
import worksManifest from './works/__manifest__.json';
import projectManifest from './project/__manifest__.json';

export interface AddonManifest {
  name: string;
  depends: string[];
  models: string[];
  installable: boolean;
  /**
   * Relative module paths (from the addon dir) that export a `loadDefaultData`
   * loader. Every addon must declare this key — an empty array is an explicit,
   * deliberate statement that the addon ships no platform reference data, so a
   * missing `data` field is a wiring bug rather than an accidental gap.
   */
  data: string[];
  /** Optional sample rows seeded only outside production (see `runBootSeed`). */
  demo?: string[];
  /**
   * Optional ordered SQL migrations this addon ships (roadmap T2.4c). The names
   * are migration keys applied in ascending lexicographic order by
   * `SchemaMigrator.runOrderedMigrations`; the SQL itself is registered in the
   * static `MIGRATION_REGISTRY` (boot bundles addons via static imports, so a
   * manifest-declared path is never dynamically imported). An absent/empty key
   * is an explicit statement that the addon owns no migrations.
   */
  migrations?: string[];
}

interface CatalogEntry {
  manifest: AddonManifest;
  register: () => void;
}

// The single source of truth for "which addon registers what". Each entry's
// dependency edges and installability come straight from its manifest file.
const ADDON_CATALOG: Record<string, CatalogEntry> = {
  [baseManifest.name]: { manifest: baseManifest as AddonManifest, register: registerBaseAddon },
  [mwStorageManifest.name]: { manifest: mwStorageManifest as AddonManifest, register: registerMwStorageAddon },
  [mwQorpusManifest.name]: { manifest: mwQorpusManifest as AddonManifest, register: registerMwQorpusAddon },
  [mwLlmRouterManifest.name]: { manifest: mwLlmRouterManifest as AddonManifest, register: registerMwLlmRouterAddon },
  [nexusManifest.name]: { manifest: nexusManifest as AddonManifest, register: registerNexusAddon },
  [orbitManifest.name]: { manifest: orbitManifest as AddonManifest, register: registerOrbitAddon },
  [worksManifest.name]: { manifest: worksManifest as AddonManifest, register: registerWorksAddon },
  [projectManifest.name]: { manifest: projectManifest as AddonManifest, register: registerProjectAddon },
};

// Every addon the loader knows about, used as the default root set for the hub.
export const ALL_ADDON_NAMES: string[] = Object.keys(ADDON_CATALOG);

/**
 * Depth-first topological sort over the `depends` graph, rooted at `roots`.
 * Throws on an unknown dependency (fail-closed: a manifest that references a
 * non-existent addon is a wiring bug, not something to silently skip) or on a
 * dependency cycle.
 */
export function resolveLoadOrder(roots: string[]): string[] {
  const order: string[] = [];
  const state = new Map<string, 'visiting' | 'done'>();

  const visit = (name: string, path: string[]): void => {
    const entry = ADDON_CATALOG[name];
    if (!entry) {
      throw new Error(`Unknown addon '${name}' required by ${path.join(' -> ') || 'root'}`);
    }
    const current = state.get(name);
    if (current === 'done') return;
    if (current === 'visiting') {
      throw new Error(`Cyclic addon dependency: ${[...path, name].join(' -> ')}`);
    }
    state.set(name, 'visiting');
    for (const dep of entry.manifest.depends) visit(dep, [...path, name]);
    state.set(name, 'done');
    order.push(name);
  };

  for (const root of roots) visit(root, []);
  return order;
}

/**
 * Register `roots` and all of their transitive dependencies in dependency
 * order. Non-installable addons are skipped (but their dependents still fail
 * if they require them, because resolution happens before the skip). Returns
 * the resolved load order for logging / assertions.
 */
export function registerAddonsFor(
  roots: string[],
  log: (message: string) => void = () => {},
): string[] {
  const order = resolveLoadOrder(roots);
  log(`[addons] resolved load order: ${order.join(' -> ')}`);
  for (const name of order) {
    const entry = ADDON_CATALOG[name];
    if (!entry.manifest.installable) {
      log(`[addons] skipping non-installable addon '${name}'`);
      continue;
    }
    entry.register();
  }
  return order;
}

/** Register every known addon — the hub's full boot surface. */
export function registerAllAddons(log?: (message: string) => void): string[] {
  return registerAddonsFor(ALL_ADDON_NAMES, log);
}
