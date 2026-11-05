---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Rules: ORM Odoo-style Standardization

Invariants the implementation must hold. Existing AGENTS.md invariants stay in force; this file adds the plan-specific rules and restates the ones under change.

## SQL and identifiers
- Parameterized values only. Every interpolated identifier (column, sort, aggregate alias, index name, join-table name) passes the single shared `isSafeIdentifier` guard in `constants.ts`. No second copy of the regex.
- Selection option keys and other DDL literals are escaped as SQL literals, never interpolated raw.
- No raw string queries on public surfaces. Gateway catalog reads move to the repository; the remaining tenant-scoped aggregate queries are out of this plan's scope and stay parameterized.

## Errors
- Cleanup paths never mask the original error. The operation error is primary; cleanup failures attach as cause/suppressed and log at warn.
- Guard rejections are typed errors (UnsafeIdentifierError, SelectionValueError, AccessDeniedError, constraint violations) carrying field/model context, never row values.

## Tenant isolation
- Fail-closed scope unchanged: `{companyId}` or explicit `{systemScope:true}`; mutations always pin a concrete company_id derived from the principal, never from the body.
- Record rules only narrow visibility (AND-append). A rule that fails to compile rejects the query; it is never skipped.
- Per-company unique indexes include company_id as the leading column. Platform catalogs keep global uniqueness at company_id 0.
- FK constraints are integrity backstops, not authorization boundaries; tenant filtering stays in repository WHERE clauses.

## Audit and sync
- Every insert/update/delete writes one append-only audit event in the same transaction, field names only. ACL denials and constraint rejections do not create value-bearing audit payloads.
- Superuser bypass stays server-authorized per admin route, requires a reason, records the target tenant. ACL enforce mode adds no new bypass.
- Sync outbox redaction is default-deny: credential-pattern keys and `_encrypted`/`_hash` suffixes are stripped unless explicitly allowed; `syncExclude` removes additional model-specific columns. The denylist constant is lint-locked (SYNC_OUTBOX_REDACTION extension).
- Outbox delivery stays at-least-once with idempotent ack; this plan changes payload content rules only, not delivery semantics.

## Schema evolution
- Migrations stay forward-only and additive; `sync()` never gains drop semantics (sentinel shares the database with a partial model registration).
- CHECK, FK, and unique-swap additions require a zero-violation validation scan first. Violations fail closed with a report (table, field, offending values, counts); no silent coercion, no automatic null-out, no data rewrite.
- Constraint changes land through `addons/migrations.ts` MIGRATION_REGISTRY with checksums, like every other migration.

## Access control
- Default-deny in enforce mode: no `ir.model.access` grant means no permission. Audit mode logs would-denies and blocks nothing; it is a rollout stage, not a permanent configuration.
- ACL and rule models are platform configuration (company_id 0), idempotently seeded, and added to PROTECTED_GENERIC_MODELS so generic CRUD never exposes them.
- Role mapping comes from the verified auth session, never from request input.

## Retention and business rules
- Retention stays fail-closed on legal_hold / active retention_until. After S4.1 the guard lives in one shared model constraint; route duplicates are removed only after equivalence tests pass.
- Business invariants belong in model constraints or addon services, not in route handlers. Routes keep transport concerns only.

## Process
- No new CI lanes, no new automation infrastructure. Verification extends existing test suites, `lint:arch`, and the standard gates (`verify:fast`, `docs:check`, `contract:check`).
- Do not revert, stage, or sweep the concurrent session's uncommitted WIP (migrator defaults fix, heliogrid, .plans cleanup). Commit only this plan's own files.
- Every claim in report.md carries command output or file evidence; no invented estimates, no unmeasured performance numbers.
- Comment policy (antislop-code): comments only for non-obvious constraints; one line, two at most; no narration, no banners, no emoji.