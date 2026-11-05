---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-05"
---
# ORM Odoo-style Standardization

## Objective
Standardize `@allah/arsy-orm` field semantics, access control, and business-logic placement toward Odoo conventions, and fix the verified defects from the 2026-11-05 ultra-review audit (findings R01 to R19). The ORM already ships Odoo-style primitives (Polish-notation domains, `search`, `readGroup`, `nameSearch`, `fieldsGet`, compute/related fields, archive, manifest loader). This plan hardens them, enforces them at the database layer, and drives adoption in consumers.

## Problem Statement
The audit verified three gap classes:
1. **Field integrity is declarative only.** Selection values are not validated at write time and have no CHECK constraint. Unique indexes are global, not per-tenant. many2one fields emit no foreign key, no ondelete behavior, and no relation-target validation. (R03, R04, R05)
2. **No access-control layer.** There is no `ir.model.access` / `ir.rule` equivalent anywhere in the repo (grep: zero matches). Authorization is manual per route plus a `PROTECTED_GENERIC_MODELS` denylist that misses `ai.model` and `ai.route`. (R11)
3. **Primitives exist but are barely adopted.** `.compute()` appears only in ORM tests, `displayNameSpec` in one addon, `readGroup` in one call site, `fieldsGet` has zero consumers. Business logic lives in 47 routes inside `apps/arsy/src/app.ts` instead of model methods or addon services. (R12, R13)

Plus confirmed defects: unvalidated `readGroup` alias interpolation (R01), cleanup masking original errors in `withAuditContext` (R02), suffix-based sync redaction that fails open for future credential columns (R06), translation lookup without a model key (R07), write/read parity gaps in `incrementById` and `findKeyset` (R08, R09), raw unscoped SQL in gateway catalog endpoints (R10).

## Evidence Base
- Full read of all 14 `packages/arsy-orm/src` modules plus CONTRACT.md v1.4.0 (claims verified accurate against code).
- ORM test suite: 62/62 pass, exit 0. `tsc --noEmit`: exit 0.
- Empirical PGlite probe confirmed: selection accepts invalid values, unique rejects cross-tenant duplicates, many2one accepts orphan ids, readGroup alias reaches SQL unescaped, cleanup masks the original unique-violation error.
- Consumer map: app.ts (47 routes), addons manifest loader, llm-gateway, auth, storage, sdui, sentinel, notify, lint arch rules.
- Concurrency caveat: another agent session holds uncommitted WIP (migrator DEFAULT emission fix, heliogrid addon, .plans cleanup). This plan builds on the current file state and must not revert or sweep that WIP. The earlier "defaults not emitted" finding was invalidated after re-reading the fixed migrator.

## Scope
Included:
- `packages/arsy-orm`: query builder, repository, migrator, registry, fields, sync trigger redaction.
- `addons/base`: `ir.translation` model key, new ACL models and seed data.
- `packages/arsy-plugin-llm-gateway`: catalog reads move to repository scope.
- `apps/arsy/src/app.ts`: phased thinning, starting with constraint-backed routes.
- `packages/arsy-plugin-sdui`: consume `fieldsGet` for view metadata.
- Tests in existing suites; `packages/lint` arch rule extensions.

Excluded (deliberate):
- No ORM replacement, no framework migration, no event sourcing, no message broker.
- No new CI lanes or automation. Verification extends the existing test suites and `lint:arch` only (owner preference: thin CI).
- No UI changes. No full one-pass rewrite of app.ts; routes migrate incrementally.
- Sentinel boot path is untouched: its partial model registration is safe while `sync()` stays additive-only (R19). This plan keeps sync additive-only.
- PBKDF2 iteration raise (R17) is tracked as a separate crypto decision, not bundled here, because it changes envelope compatibility.

## Functional Requirements
- FR-001: Every interpolated SQL identifier (columns, sorts, aggregate aliases, index fields) passes one shared allowlist guard. Trace: R01.
- FR-002: Audit-context cleanup never replaces or masks the original operation error. Trace: R02.
- FR-003: Selection fields reject out-of-set values at write time and carry a DB CHECK constraint. Trace: R03.
- FR-004: Unique constraints support per-company scope (`uniqueScope: 'company'`), opt-in per model, with a migration path from the global index. Trace: R04.
- FR-005: many2one fields validate their relation target at sync time and support FK emission with `ondelete` semantics. Trace: R05.
- FR-006: Sync outbox payloads strip credential-bearing columns by default (denylist plus per-model `syncExclude`), fail-closed for new secret-looking columns. Trace: R06.
- FR-007: Model-field translations are keyed by model, with a legacy fallback for rows written before the key existed. Trace: R07.
- FR-008: `incrementById` recomputes stored computes; `findKeyset` applies the same expand/compute/related resolution as `find`. Trace: R08, R09.
- FR-009: Gateway catalog endpoints read through `BaseRepository` with platform-catalog scope and active filters; no raw SQL on those paths. Trace: R10.
- FR-010: An `ir.model.access` + `ir.rule` layer enforces model permissions and record rules, default-deny in enforce mode, rolled out audit-first. Trace: R11.
- FR-011: Business rules move from routes into model constraints and addon services; retention becomes one shared constraint instead of per-route duplicates. Trace: R12, R18.
- FR-012: `fieldsGet` feeds the sdui view-metadata endpoint; `displayNameSpec` is declared on core business models. Trace: R13.
- FR-013: `modelSignature` covers indexes, displayNameSpec, related paths, and compute method names so definition drift is caught. Trace: R15.
- FR-014: `nameSearch` escapes ILIKE wildcards in user input. Trace: R16.
- FR-015: Test suites run against one consistent source state; dist-based suites build before running. Trace: R14.

## Non-Functional Requirements
- Tenancy stays fail-closed: every mutation pins a concrete company_id derived from the principal; record rules may only narrow visibility, never widen it.
- Audit stays append-only, same-transaction, field names only. ACL checks and constraint rejections must not write value-bearing audit payloads.
- Migrations stay forward-only and additive. Constraint additions (CHECK, FK, unique swap) require a data-validation pass first and fail closed with a violation report instead of coercing data.
- No measurable regression target is invented here; the existing 62-test suite plus new phase tests is the gate. Performance-sensitive paths (config cache T13, batching T14) keep their current behavior.

## Phases
- S1 Integrity hardening (R01, R02, R08, R09, R14, R15, R16): small, behavior-preserving fixes plus test hygiene. No schema change.
- S2 Field semantics (R03, R04, R05, R07, R06): selection CHECK, uniqueScope, FK/ondelete, translation model key, redaction denylist. Schema changes, additive and validated.
- S3 Access layer (R11): ACL models, seeds, checkAccess, record-rule compilation, audit-mode then enforce-mode rollout.
- S4 Placement and adoption (R10, R12, R13, R18): constraint hooks, gateway catalog repository reads, route thinning tranche 1, fieldsGet/displayNameSpec adoption.
- S5 Governance: CONTRACT.md bump, per-unit docs, lint arch extensions, report.md with verified evidence.

Dependencies: S1 before S2 (shared identifier guard and error semantics feed the migrator work). S2 before S3 (ACL seeds use the hardened write path). S3 audit mode before S4 route thinning (thinned routes delegate to ACL-checked services). S5 runs alongside each phase, finalized at the end.

## Acceptance Criteria
- AC-1: A probe alias containing SQL metacharacters is rejected at compile time with a typed error; all existing readGroup call sites still pass. (FR-001)
- AC-2: A forced unique violation surfaces the original Postgres error, not "current transaction is aborted". (FR-002)
- AC-3: Writing an out-of-set selection value fails at the repository and at the DB layer; existing valid rows migrate without loss. (FR-003)
- AC-4: A model opted into `uniqueScope: 'company'` accepts the same unique value in two companies and rejects duplicates within one. (FR-004)
- AC-5: An orphan many2one id is rejected when FK is enabled; ondelete behavior matches the declared option in tests. (FR-005)
- AC-6: A sync payload for a row carrying `api_key`/`*_token` columns contains none of those keys; lint arch locks the denylist. (FR-006)
- AC-7: Two models sharing a term key and res_id resolve their own translations independently. (FR-007)
- AC-8: incrementById and findKeyset parity tests pass against the same expectations as updateById and find. (FR-008)
- AC-9: `/v1/models` and `/v1/gateway/providers` return only active, catalog-scoped rows via repository calls; grep shows no raw SELECT on those paths. (FR-009)
- AC-10: In audit mode every would-deny is logged with model, mode, principal; in enforce mode generic CRUD default-denies without an ACL grant; superuser bypass still requires reason and records target tenant. (FR-010)
- AC-11: legal_hold retention is enforced by one shared constraint for project.task and ir.attachment; the duplicated route checks are removed only after the constraint tests pass. (FR-011)
- AC-12: sdui metadata includes fieldsGet output; at least the core business models declare displayNameSpec. (FR-012)
- AC-13: Registry collision tests catch index/displayNameSpec/compute-name drift. (FR-013)
- AC-14: nameSearch treats `%` and `_` in input as literals. (FR-014)
- AC-15: `pnpm --filter @allah/arsy-orm test` builds dist first when a suite imports dist; full suite green; `pnpm verify:fast` green. (FR-015)

## Open Decisions
See decision.md (ADRs) and conflict.md (items needing owner confirmation before S2/S3 enforcement).