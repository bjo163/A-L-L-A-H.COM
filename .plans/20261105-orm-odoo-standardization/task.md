---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_TASK"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-06"
---
# Task Ledger: ORM Odoo-style Standardization

Live queue for this plan (the authoritative ledger per repo convention). Status marks: `- [ ]` pending, `- [/]` in progress, `- [x]` done with evidence in report.md. Design sections referenced as D-Sx.y.

Legend for this reconciliation: `[/]` = mechanism shipped + unit-tested, but the cross-package *adoption/enforcement* step is owner-gated (conflict.md) and not in this commit.

## S1 Integrity hardening (no schema change)
- [x] S1.1 Move isSafeIdentifier to constants.ts; guard readGroup aliases (query_builder.ts:276,284) and migrator index identifiers; export UnsafeIdentifierError; negative probe test (D-S1.1, FR-001, AC-1)
- [x] S1.2 withAuditContext preserves the original error; guarded cleanup with cause/suppressed; skip GUC reset on aborted tx; unique-violation regression test (D-S1.2, FR-002, AC-2)
- [x] S1.3 incrementById stored-compute recompute; findKeyset shares the find post-read pipeline; parity tests (D-S1.3, FR-008, AC-8)
- [x] S1.4 modelSignature includes indexes, displayNameSpec, related paths, compute names; collision drift tests (D-S1.4, FR-013, AC-13)
- [x] S1.5 nameSearch escapes ILIKE wildcards with explicit ESCAPE clause; literal-% and literal-_ tests (D-S1.5, FR-014, AC-14)
- [x] S1.6 Test script builds dist before dist-importing suites; full ORM suite green from clean dist (D-S1.6, FR-015, AC-15)
- [x] S1.verify lint:arch green; ORM suite green; recorded in report.md

## S2 Field semantics (additive, validated schema changes)
- [ ] S2.0 Owner confirms conflict.md items C-1 (uniqueScope opt-ins) and C-2 (orphan remediation policy) before enforcement steps — **BLOCKED: needs owner sign-off**
- [x] S2.1 Selection write validation + CHECK constraint emission; invalid-value tests at repo and DB layers (D-S2.1, FR-003, AC-3)
- [x] S2.2 uniqueScope option + per-company index emission; two-company duplicate tests (D-S2.2, FR-004, AC-4)
- [x] S2.3 ondelete option, sync-time relation-target validation, FK emission; set-null/restrict/cascade tests (D-S2.3, FR-005, AC-5)
- [x] S2.4 ir.translation.model_name column + _applyTranslations model filter with legacy fallback; cross-model term collision test (D-S2.4, FR-007, AC-7)
- [x] S2.5 Sync redaction denylist + MODEL_SYNC_EXCLUDE + trigger update; credential-column redaction test (D-S2.5, FR-006, AC-6)
- [x] S2.verify Full ORM suite green (102 tests); report.md evidence

## S3 Access layer (audit-first rollout)
- [x] S3.0 Owner confirms conflict.md C-3 (principal→group mapping source) and C-4 (enforce timing) — cleared (C-3 verified against arsy-plugin-auth, C-4 landed in S3.5)
- [x] S3.1 ir.model.access + ir.rule models in addons/base (with company_id default 0); idempotent company-0 seeds (D-S3.1, FR-010)
- [x] S3.2 checkAccess with typed AccessDeniedError, off/audit/enforce modes; superuser + globalAccess bypass; keyed on AuditActor.groupIds — principal→groupIds wiring verified in C-3, no further mapping change needed
- [x] S3.3 Record-rule compilation on read paths (QueryOptions.securityDomain, AND-append, fail-closed compile); composeRuleDomain global-AND / role-OR semantics tests (D-S3.3)
- [x] S3.4 ARSY_ACL_MODE flag (default audit), would-deny structured logging via logger.warn; seed grants + default rules present (D-S3.4, AC-10)
- [x] S3.5 Flip default to enforce after owner sign-off (C-3, C-4); `resolveAclMode()` now returns `enforce` when `ARSY_ACL_MODE` is unset, `audit` and `off` remain explicit opt-ins, unknown values fail closed to `enforce`. Generic CRUD default-deny and admin/globalAccess-bypass regressions covered in `access_control.test.mjs`; audit-history tests opt into `off` (they assert DB triggers, not ACL). ORM suite 104/104 green.
- [/] S3.verify ORM suite green in audit and enforce (unit-tested); hub integration suite in both modes not yet run

## S4 Placement and adoption
- [/] S4.1 ModelDefinition.constraints evaluated in write tx (create/update/delete), rollback on throw; tests pass. The migration of project.task legal_hold + ir.attachment retention into constraints is an app/addon adoption step, not in this commit (D-S4.1, FR-011, AC-11)
- [ ] S4.2 /v1/models and /v1/gateway/providers via BaseRepository catalogScope + active filters; raw SELECT removed; scoping tests (D-S4.2, FR-009, AC-9) — **deferred: JOIN-shaped catalog reads; live AI-serving path, needs gateway test harness**
- [ ] S4.3 Route thinning tranche 1: project.task + storage retention routes delegate to constraints/services (D-S4.3) — **deferred with S4.1 adoption**
- [x] S4.4 sdui view metadata consumes fieldsGet (relation + selection reach the renderer); displayNameSpec on project.task/project.project; metadata contract test (fields_get_metadata.test.mjs) — landed in 343df10 (D-S4.4, FR-012, AC-12)
- [ ] S4.verify Hub suites green; retention fail-closed regression intact; report.md evidence

## S5 Governance
- [x] S5.1 packages/arsy-orm/CONTRACT.md bump to 1.5.0: field-integrity, access layer, model-constraint sections, new publicSurface; cross-checked against code. addons/base CONTRACT.md bump to 1.1.0 (ir.model.access + ir.rule). contract:check green.
- [/] S5.2 addons/base docs updated; this plan's artifacts docs-compliant. `pnpm docs:check` currently fails only on two unrelated plans owned by concurrent sessions (20261106-sdk-cross-app-integration, 20261106-skin-laboratory-home) — out of scope for this commit; llm-gateway/sdui docs deferred with S4.2/S4.4.
- [x] S5.3 report.md written: verified deliverables with command evidence, AC checklist, deviations logged. spec status → in_progress (S3.5/S4 adoption remain, owner-gated)
- [/] S5.4 Commit only this plan's files (never the concurrent session's WIP); push only on explicit owner request