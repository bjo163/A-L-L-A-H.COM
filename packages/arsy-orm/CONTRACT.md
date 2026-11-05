---
contract: unit
id: PKG_ARSY_ORM
tier: package
name: @allah/arsy-orm
owner: platform-core
version: 1.4.0
status: released
last_verified: 2026-11-05
summary: ARSY query-layer ORM model registry repositories and the default-data seeder
publicSurface: [defineModel, fields, modelRegistry, BaseRepository, dbEngine, decryptSecret, seedDatasets, seedIdempotent, SeedContext, PLATFORM_COMPANY_ID, SYSTEM_ACTOR, DomainNode, KeysetCursor, GroupAggregate, TransactionContext, withTransaction, ComputeHandler, OrderedMigration]
depends: [@allah/arsy-core]
---

# @allah/arsy-orm — Unit Contract

The ARSY-ORM query layer (the "QL"): model definitions and registry, `BaseRepository`
(find / create / createMany / update with tenant scope and audit), the PGlite
engine, schema migrator, encryption, vector helpers, and the shared default-data
runtime.

## Public surface

Model/registry: `defineModel`, `fields`, `modelRegistry`. Data access:
`BaseRepository`, `dbEngine`, `decryptSecret`, `SYSTEM_ACTOR`. Seed runtime
(`src/default_data.ts`): `seedDatasets`, `seedIdempotent`, `SeedContext`,
`PLATFORM_COMPANY_ID` (plus `SeedDataset`, `SeedResult`, `totalCreated`).

## Query layer (roadmap T2.1)

`BaseRepository` reads go through the `QueryBuilder`, which now supports a
nested prefix `domain` (`DomainNode`: `['&'|'|', a, b]` / `['!', a]` / leaf
`[field, op, value]`), an allowlisted `fields` projection (default `SELECT *`),
a dedicated non-regex `buildCount`, and keyset pagination (`KeysetCursor` /
`findKeyset`). Every leaf routes through the same column allowlist and
parameterized placeholders as a flat `QueryFilter`, so nesting never widens the
injection surface.

## Relational semantics (roadmap T2.2)

`fields.many2many(relation, { relation_table, column1, column2 })` declares a
virtual m2m whose join table the migrator creates as `UNIQUE(column1, column2)`.
`BaseRepository` reads accept `QueryOptions.expand?: string[]`, resolving m2o
inline and o2m/m2m via one tenant-scoped `IN` query per relation (the related
scope always comes from the parent query's principal, never the payload). Adds:
`search()` (rows + accurate total), `archive` / `unarchive` (audited lifecycle
flips), `readGroup` (`GroupAggregate` over an allowlisted numeric field or
`count`), `nameSearch` / `fieldsGet` introspection (driven by an optional
`ModelConfig.displayNameSpec`), `QueryOptions.forUpdate` / `includeArchived`,
and the `withTransaction(run, engine?)` helper returning a `TransactionContext`
that binds repositories to one commit-or-rollback transaction.

## Computed & related fields (roadmap T2.3)

A `FieldDefinition` may declare `compute: '<name>'` (with `store?: boolean`) or
`related: '<m2oField>.<valueField>'`. Handlers register beside `defineModel` via
`model.compute(name, fn)` (`ComputeHandler`). At read, non-stored `compute` and
single-hop `related` fields are resolved on the fetched rows (`related` reuses
the tenant-scoped expand traversal). A `store: true` compute field is recomputed
post-write through a fixed-point loop capped at 2 rounds, persisted with the
write inside the same audit transaction — models without stored compute are
byte-for-byte unaffected.

## Performance & migration versioning (roadmap T2.4)

The migrator snapshots the whole `public` schema in one catalog read and emits
all DDL inside a single transaction (T2.4a), then provisions the system bot and
enforces audit constraints in their own transaction (PGlite is a single
connection, so re-entrancy inside the DDL transaction would deadlock).
`BaseRepository.updateMany` is set-based: it groups rows by column shape and
issues `UPDATE … FROM (VALUES …)` chunks under the parameter cap, one statement
per shape (T2.4b) — PostgreSQL still fires the row-level audit/sync trigger for
every updated row. `SchemaMigrator.runOrderedMigrations(migrations)` applies the
optional manifest `migrations: OrderedMigration[]` key in ascending lexicographic
order, recording `version` + a sha256 `checksum` per row and failing closed on a
drifted checksum (T2.4c); legacy ledger rows backfill to `0` / `'legacy'`
idempotently.

## Default-data runtime

`seedIdempotent` performs one scoped `IN`-filtered read per dataset, matches the
exact composite key, and batch-inserts only the missing rows via `createMany` —
always through the repository, never raw SQL. `seedDatasets` runs a list of
datasets, stamping `PLATFORM_COMPANY_ID` on rows that omit `company_id`.

## Depends

`@allah/arsy-core`; external: `@electric-sql/pglite`.
