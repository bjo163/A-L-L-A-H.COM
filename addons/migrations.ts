/**
 * Static ordered-migration registry (roadmap T2.4c).
 *
 * Mirrors `./default-data.ts`: the hub bundles addons via static imports, so a
 * manifest-declared `migrations` path is never dynamically imported. Instead
 * every addon's SQL migrations are wired here as `{ name, sql }` descriptors, and
 * `SchemaMigrator.runOrderedMigrations` applies them in ascending lexicographic
 * order inside their own transaction, recording a checksum so a later edit to an
 * already-applied migration fails closed.
 *
 * The registry is deliberately empty today — the migration *substrate* (ledger
 * versioning, the ordered runner, and this boot wiring) is the deliverable of
 * T2.4c, and the first real entry lands with T3.2 (the `ir.cron` retry-column
 * migration). `resolveMigrations()` therefore returns `[]` until an addon
 * registers a migration, at which point boot picks it up with no further wiring.
 */
import type { OrderedMigration } from '@allah/arsy-orm';
import { resolveLoadOrder, ALL_ADDON_NAMES } from './index';

/** addon name -> the ordered SQL migrations it ships. */
export const MIGRATION_REGISTRY: Record<string, OrderedMigration[]> = {};

/**
 * The migrations to apply, flattened in dependency order. Keys not present in the
 * registry contribute nothing, so an addon without migrations stays a no-op.
 */
export function resolveMigrations(roots: string[] = ALL_ADDON_NAMES): OrderedMigration[] {
  return resolveLoadOrder(roots).flatMap((name) => MIGRATION_REGISTRY[name] ?? []);
}
