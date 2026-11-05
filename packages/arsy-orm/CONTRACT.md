---
contract: unit
id: PKG_ARSY_ORM
tier: package
name: @allah/arsy-orm
owner: platform-core
version: 1.5.0
status: released
last_verified: 2026-11-05
summary: ARSY query-layer ORM model registry repositories, access control, and the default-data seeder
publicSurface: [defineModel, fields, modelRegistry, BaseRepository, dbEngine, decryptSecret, seedDatasets, seedIdempotent, SeedContext, PLATFORM_COMPANY_ID, SYSTEM_ACTOR, DomainNode, KeysetCursor, GroupAggregate, TransactionContext, withTransaction, ComputeHandler, OrderedMigration, assertTransactional, AclMode, resolveAclMode, AccessDeniedError, PersistedRule, composeRuleDomain, ModelConstraint, ConstraintContext]
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

## Field integrity (roadmap S2)

Selection values are validated at the repository on every write (a value
outside the declared set throws `SelectionValueError`) and mirrored by a
generated `CHECK` constraint in the schema, so a raw write cannot bypass the
set. A `FieldDefinition` may opt into `uniqueScope: 'company'`, which the
migrator emits as a partial-unique index on `(company_id, <field>)` instead of
the global index — the same natural key may repeat across tenants but not
within one. `fields.many2one` validates its relation target and emits a foreign
key with a declared `ondelete` (`cascade` / `set null` / `restrict`). The sync
outbox strips credential-bearing columns (`api_key`, `secret`, `password`,
`token`, `private_key`, `credential`) by fail-closed regex patterns plus a
per-model `MODEL_SYNC_EXCLUDE` list, so a new secret-shaped column is stripped
rather than leaked.

## Access control (roadmap S3)

`BaseRepository` carries a model-permission check and a record-rule engine
modelled on Odoo's `ir.model.access` / `ir.rule`. `resolveAclMode()` reads
`ARSY_ACL_MODE` and defaults to `enforce` — a model with no matching grant is
default-deny and blocks with `AccessDeniedError`; `audit` keeps the rollout
behavior where checks run and would-denies are only logged (never written to the
append-only CRUD event table); `off` short-circuits. The audit-first review of
the live route surface is complete (ADR-3), so enforcement is now the default;
operators opt back into non-blocking rollout with `ARSY_ACL_MODE=audit`. Unknown
values fail closed to `enforce`. System actors and explicit `globalAccess`
actors bypass. `resolveSecurityDomain(operation, actor)` compiles the applicable
`ir.rule` rows into a `DomainNode` (global rules AND, the principal's group
rules OR, then AND-narrowed) via `composeRuleDomain`; the caller passes it as
`QueryOptions.securityDomain`, which `buildWhere` ANDs onto the query — a
predicate that can only narrow visibility, never widen it, and that fails closed
when a `domain_force` cannot be parsed. The principal→group mapping (how a live
auth session populates `AuditActor.groupIds`) is a consumer concern gated on
owner confirmation (conflict C-3); the mechanism keys off the ids it is given.

## Model constraints (roadmap S4.1)

A model may declare `constraints?: ModelConstraint[]`. `BaseRepository`
evaluates each one inside the write transaction before SQL emission for
`create`, `updateById`, and `deleteById` (`ConstraintContext` reports the
operation, the pre-image row, and the tenant). A throwing constraint aborts the
transaction, so a business invariant cannot be bypassed by a caller that skips
the route layer. Functions are excluded from `modelSignature` (not serializable).

## Depends

`@allah/arsy-core`; external: `@electric-sql/pglite`.
