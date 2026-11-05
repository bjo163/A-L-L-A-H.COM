---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Design: ORM Odoo-style Standardization

Companion to spec.md. Section numbers map to task.md items. All file references are to the current working tree (2026-11-05), which includes another session's uncommitted migrator DEFAULT fix; implementers re-verify line numbers before editing.

## S1 Integrity hardening

### S1.1 Shared identifier guard (FR-001, R01)
- Move the `isSafeIdentifier` regex (`/^[a-z][a-z0-9_]{0,62}$/`) from `packages/arsy-orm/src/migrator.ts` into `packages/arsy-orm/src/constants.ts` as the single owner, exported for both migrator and query builder.
- `query_builder.ts` `buildReadGroup` (lines 276 and 284 today): validate `aggregate.alias` before interpolation. Reject with `UnsafeIdentifierError` (new typed error exported from index, sibling of `UnknownFieldError`). Uppercase aliases are not accepted; current call sites use lowercase (`cost`), verified.
- Migrator index emission: run index field names and index names through the same guard before interpolation. Join-table DDL already guards; this closes the remaining DDL surface.
- Rationale: the contract promises one identifier allowlist owner; today readGroup aliases are the only unguarded interpolation in the compiler.

### S1.2 Error-preserving audit context (FR-002, R02)
- `repository.ts` `withAuditContext` (line 76 today): keep the original error as the primary throw. Cleanup runs in a guarded block; if cleanup itself fails, attach it as `cause` (or a `suppressed` property) on the original error and log at warn. Never let a cleanup rejection replace the operation error.
- When the transaction is already aborted, skip the GUC reset statements entirely (they cannot succeed and only produce the masking error observed in the probe).

### S1.3 Write/read parity (FR-008, R08/R09)
- `incrementById` (repository.ts:283): after the increment, run the same stored-compute recompute branch used by `updateById` inside the same transaction.
- `findKeyset` (repository.ts:145): route rows through the same expand/compute/related/translation resolution as `find`. Extract the shared post-read pipeline into one private method so the two paths cannot drift again.

### S1.4 Registry signature completeness (FR-013, R15)
- `registry.ts` `modelSignature`: include sorted index definitions, `displayNameSpec`, related field paths, and compute method names (the string keys, not function bodies; functions are not serializable and their identity is the method name).
- Collision behavior unchanged: `ModelCollisionError` on structural mismatch, idempotent re-registration on identical signature.

### S1.5 nameSearch wildcard escaping (FR-014, R16)
- Escape `%`, `_`, and the escape character itself in the user term before building the ILIKE pattern; use an explicit `ESCAPE` clause. The value stays parameterized; only the pattern metacharacters are neutralized.

### S1.6 Test source hygiene (FR-015, R14)
- `packages/arsy-orm/package.json` test script: run the package build before suites that import `dist/` (today `query_safety.test.mjs`), or switch those suites to `src/` imports like `computed.test.mjs`. Preferred: build-then-test, because the dist artifact is what consumers ship and safety tests should cover it.
- Mixed-source state is the defect: dist mtime lagged src during the audit, so safety tests validated a stale artifact.

## S2 Field semantics (Odoo parity)

### S2.1 Selection enforcement (FR-003, R03)
- Write path: `BaseRepository.create/updateById/updateMany` validate selection fields against the declared option keys before SQL emission; throw `SelectionValueError` listing the field and allowed keys.
- Schema: migrator emits `CONSTRAINT chk_<table>_<field>_selection CHECK (<field> IS NULL OR <field> IN (...))` for new tables. Option keys are string literals from developer-authored model definitions; they are escaped as SQL literals, never interpolated raw.
- Existing tables: additive `ALTER TABLE ... ADD CONSTRAINT` only after a validation scan finds zero violating rows. Violations produce a fail-closed report (table, field, offending values, row counts) and skip that constraint; no silent coercion, no data rewrite.
- Odoo reference: selection values are constrained at the ORM layer; the DB CHECK is our stronger equivalent, justified because PGlite is the single engine.

### S2.2 Per-company unique (FR-004, R04)
- `FieldOptions.uniqueScope?: 'global' | 'company'`, default `'global'` (preserves today's behavior; see ADR-1).
- `'company'` emits `CREATE UNIQUE INDEX uq_<table>_<field>_company ON <table> (company_id, <field>)` instead of the global `uq_<table>_<field>`.
- Opt-in migration for an existing model: create the new index, then drop the old one, in one migration step, after a duplicate scan within each company passes. Which models opt in is an owner decision (conflict.md); the mechanism ships generic.
- Odoo reference: per-company `sql_constraints`. Global uniqueness remains correct for platform catalogs (company_id 0).

### S2.3 many2one FK and ondelete (FR-005, R05)
- `FieldOptions.ondelete?: 'set null' | 'restrict' | 'cascade'`. Default: `'restrict'` when `required: true`, otherwise `'set null'` (ADR-2, Odoo convention).
- Relation-target validation at `migrator.sync()` time, not `defineModel` time: addons register in dependency order and a target may legitimately register later in the same boot. Unknown target at sync fails closed with the field path in the error.
- FK emission for new tables/columns: `REFERENCES <target_table>(id) ON DELETE <behavior>`. `set null` requires the column to be nullable; the migrator rejects the combination at sync time instead of emitting invalid DDL.
- Existing columns: orphan scan first (`SELECT ... LEFT JOIN target WHERE target.id IS NULL AND fk IS NOT NULL`). Zero orphans: add FK. Orphans found: fail-closed report, FK skipped, owner decides remediation (conflict.md). No automatic null-out or delete.
- Cross-tenant note: FK checks row existence, not tenant visibility. Tenant scoping stays in the repository WHERE clauses; the FK is an integrity backstop, not an authorization boundary.

### S2.4 Translation model key (FR-007, R07)
- `addons/base/models/ir_translation.ts`: add `model_name: fields.char({ size: 128 })` (nullable, legacy rows keep empty).
- `repository.ts` `_applyTranslations` (line 652 today): add `AND (model_name = $model OR model_name = '' OR model_name IS NULL)` to the lookup. New writes from the translation sync path set `model_name`.
- Legacy fallback is deliberate: the audit found no production `type:'model'` rows, so the empty-key window is effectively unused, and the fallback avoids breaking any row written before this change (ADR-5).
- Index: extend the existing `(company_id, lang, name, res_id)` index consideration to include model_name; final index shape decided at implementation with a query-plan check, not invented here.

### S2.5 Sync redaction denylist (FR-006, R06)
- Trigger `arsy_capture_sync_event` (migrator.ts): replace the suffix-only strip with a credential denylist. Strip any key matching `password|token|secret|api_key|credential` (case-insensitive) OR ending `_encrypted`/`_hash`, unless the model declares it in a sync allowlist override. Default-deny: a future column named like a credential is stripped automatically.
- `ModelDefinition.syncExclude?: string[]` for model-specific non-credential columns that must never leave the outbox.
- The denylist lives in `constants.ts` next to `RESERVED_COLUMNS` so the lint rule and the trigger share one source. `packages/lint/src/check-architecture.mjs` SYNC_OUTBOX_REDACTION extends from "the two suffix regexes exist" to "the denylist constant exists and the trigger references it".
- Compatibility: `res.users.password` is already a placeholder (`[MANAGED_BY_AUTH_USER]`), and no current flow writes the token columns, so the denylist changes no existing payload content. The redaction test suite extends from nexus.nas-only to res.users token columns.
- Odoo has no outbox equivalent; this is our invariant made fail-closed, not an Odoo import.

## S3 Access layer (ir.model.access + ir.rule)

### S3.1 Models (addons/base)
- `ir.model.access`: `model_name` (char, required), `role` (char, required; maps to principal roles), `perm_read/perm_write/perm_create/perm_unlink` (boolean, default false), `company_id` (integer, default 0; platform-wide grants live at 0).
- `ir.rule`: `model_name` (char, required), `name` (char), `domain` (text, JSON Polish-notation DomainNode, the same shape `search()` already compiles), `roles` (char, comma-separated; empty means global rule), `global` (boolean, default false), `company_id` (integer, default 0).
- Both models are platform configuration: seeded under company 0 via the existing idempotent seed loader, protected from generic CRUD by adding them to `PROTECTED_GENERIC_MODELS`.

### S3.2 checkAccess contract
- `checkAccess(modelName, mode: 'read'|'write'|'create'|'unlink', principal): void` in a new `packages/arsy-orm/src/access.ts`. Throws `AccessDeniedError` (typed, carries model and mode, never row values).
- Resolution: superuser bypass first (existing server-authorized admin path with reason hash and target-tenant audit stays the only bypass); then any matching `ir.model.access` row for the principal's roles grants the permission; no matching grant means deny in enforce mode.
- Principal role source: the auth session already carries a role; implementation maps it to `principal.roles: string[]`. The exact mapping is verified against `packages/arsy-plugin-auth` during S3a and recorded in report.md (marked ASSUMED until then).
- Generic CRUD routes call checkAccess for every model. Named routes opt in via the same helper as they thin out in S4.

### S3.3 Record rules
- Read paths (`find`, `findById`, `count`, `readGroup`, `nameSearch`, `findKeyset`): compile each applicable rule domain with the existing single domain compiler and append as AND to the WHERE clause. Rules only narrow; a rule that fails to compile fails closed (query rejected, error logged), never ignored.
- Write paths: after the tenant-scoped mutation, verify affected rows satisfy the applicable rules within the same transaction; a violation rolls back. This reuses the mutation scope clause machinery instead of a second SQL dialect.
- Global rules apply to every principal; role rules apply when the principal holds one of the listed roles. Odoo semantics: global rules AND together, role rules OR within the same model, then AND with globals.

### S3.4 Rollout (ADR-3)
- `ARSY_ACL_MODE=off|audit|enforce`, `audit` default at merge; after the owner cleared the C-3/C-4 gate the default is now `enforce` (unset fails closed to `enforce`, `audit`/`off` stay explicit opt-ins).
- Audit mode: checkAccess and rule evaluation run, would-denies are logged (model, mode, principal id, rule name), nothing is blocked. This gives real coverage data across the 47 routes before enforcement, without a big-bang break.
- Seed grants cover the current route surface: base read/write for authenticated roles on business models, platform config readable via catalog scope, identity/audit/credential models deny-by-default (matching today's PROTECTED_GENERIC_MODELS intent, extended to ai.model and ai.route writes).

## S4 Placement and adoption

### S4.1 Model constraints (FR-011, R12/R18)
- `ModelDefinition.constraints?: Array<(row, ctx) => void | Promise<void>>` evaluated inside create/updateById/deleteById transactions, after the write payload is resolved, before SQL emission. Throwing rolls back the transaction; the error surfaces as a typed constraint violation.
- First residents: project.task legal_hold state guard (moved from app.ts:1086) and ir.attachment retention guard (moved from the storage DELETE route). The route-level duplicates are removed only after constraint tests prove equivalent behavior, including the 409/403 status mapping at the transport layer.
- Odoo reference: `@api.constrains`. Services in `addons/<name>/services/` remain the home for multi-model workflows (the notify events service is the existing exemplar); constraints cover single-row invariants.

### S4.2 Gateway catalog through the repository (FR-009, R10)
- `/v1/models` and `/v1/gateway/providers` (llm-gateway index.ts:81-88 and :636 today) switch to `BaseRepository.find` with the existing `catalogScope()` pattern (systemScope + company_id IN [0, tenant]) and active/is_healthy filters.
- The raw SELECT inventory in usage_rollup/usage/tools stays as-is for this plan: those are tenant-scoped parameterized aggregates, already verified; moving them is a separate tranche, not bundled (no drive-by edits).

### S4.3 Route thinning tranche 1 (FR-011, R12)
- Scope: project.task routes and storage retention routes only, the two with constraint-backed logic. app.ts keeps transport concerns (parse, scope derivation, status mapping) and delegates to repository/services.
- The remaining 45 routes migrate in later tranches gated by S3 enforce mode; this plan does not commit to a full rewrite.

### S4.4 Introspection adoption (FR-012, R13)
- sdui plugin: the view-metadata response includes `fieldsGet(model)` output (type, label, required, selection options, relation target). The repository method already exists and is tested; this wires the missing consumer.
- `displayNameSpec` declared on core business models (project.task, notify.event, nexus.nas and similar user-facing records). Identity and credential models are excluded deliberately.

## Testing strategy
- Every phase item ships unit tests in `packages/arsy-orm/test/` (PGlite, same style as computed.test.mjs). Hub-level behavior (ACL audit/enforce, catalog endpoints, retention constraints) tests in `apps/arsy/test/`.
- Negative tests are mandatory for each guard: unsafe alias, out-of-set selection, cross-company duplicate, orphan FK, credential column in sync payload, would-deny ACL, rule compile failure.
- No new CI lane: the existing test script and `lint:arch` carry all of it (owner preference).

## Migration and rollout
- All schema changes additive and forward-only, consistent with the existing checksum migration ledger. Constraint additions are gated by validation scans; failures produce reports, never coercions.
- `addons/migrations.ts` MIGRATION_REGISTRY receives the first entries here (S2 backfills: ir.translation.model_name, per-model unique swaps, FK additions after orphan scans). The empty registry today is deliberate; this plan is its first consumer.
- Rollback: ACL mode flag returns to audit/off without schema change. CHECK/FK additions can be dropped by a forward migration if a constraint proves wrong; no destructive down-migrations are introduced.