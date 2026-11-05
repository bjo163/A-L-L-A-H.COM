/**
 * Static views registry (roadmap T3.1: manifest-declared SDUI views).
 *
 * Mirrors `default-data.ts`: the hub bundles addons via static imports, so a
 * manifest-declared view path is never dynamically `import()`ed at boot. Instead
 * every declared view JSON is imported here and grouped by owning addon, and the
 * arch gate `ADDON_VIEWS_CONSISTENCY` verifies this registry and each
 * `__manifest__.json` `views` key agree — the manifest still owns the
 * declaration, this file owns the static wiring the bundler requires.
 *
 * The boot loader (`apps/arsy/src/seed.ts`) turns each declared view into an
 * `ir.ui.view` row, digest-gated so an unchanged view writes nothing.
 */
import { resolveLoadOrder, ALL_ADDON_NAMES } from './index';

import baseResPartnerViews from './base/views/res_partner_views.json';
import baseResCompanyViews from './base/views/res_company_views.json';
import notifyChannelViews from './mw_notify/views/notify_channel_views.json';
import notifyEventViews from './mw_notify/views/notify_event_views.json';

/** One field entry inside a view's `fields` array (shape is view-type specific). */
export interface ViewFieldSpec {
  name: string;
  label?: string;
  [key: string]: unknown;
}

/** One view (tree/form/kanban/search): an optional title and its field list. */
export interface ViewDef {
  title?: string;
  fields: ViewFieldSpec[];
}

/** Declared view file: a target model and the views keyed by view type. */
export interface DeclaredViewFile {
  model: string;
  views: Record<string, ViewDef>;
}

/** A declared view file: a target model and the views keyed by view type. */
export interface DeclaredViewFile {
  model: string;
  views: Record<string, ViewDef>;
}

/**
 * addon name -> that addon's declared view files. Only addons that ship views
 * appear here; an addon whose manifest declares `views: []` is deliberately
 * absent, exactly like a `data: []` addon is absent from `DEFAULT_DATA_REGISTRY`
 * only when it owns no reference rows. The arch gate enforces the two-ways
 * parity between this key set and the non-empty `manifest.views` sets.
 */
export const VIEW_REGISTRY: Record<string, DeclaredViewFile[]> = {
  base: [
    baseResPartnerViews as DeclaredViewFile,
    baseResCompanyViews as DeclaredViewFile,
  ],
  mw_notify: [
    notifyChannelViews as DeclaredViewFile,
    notifyEventViews as DeclaredViewFile,
  ],
};

/**
 * The declared view files for `roots` and their transitive dependencies, in
 * dependency order. Reuses the addon loader topo-sort so an unknown dependency
 * or cycle still fails loudly rather than seeding a half-known view set.
 */
export function resolveViewFiles(roots: string[] = ALL_ADDON_NAMES): DeclaredViewFile[] {
  return resolveLoadOrder(roots).flatMap((name) => VIEW_REGISTRY[name] ?? []);
}
