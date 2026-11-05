---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_REPORT"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
last_verified: "2026-11-06"
---
# Report: ORM Odoo-style Standardization

Verified deliverables and honest deviations for the S1–S5 roadmap. Scope of the shipped code is the ORM
package (`packages/arsy-orm`) and the `base` addon (`addons/base`); the ACL enforcement flip (S3.5) has landed,
while cross-package *adoption* steps remain logged as deferred with their owners' gates.

## Verification evidence

| Command | Result |
|---|---|
| `pnpm --filter @allah/arsy-orm test` | **104 pass / 0 fail** (exit 0) — includes `access_control.test.mjs` (ACL modes incl. the enforce default, record-rule compilation, model constraints) plus the S1/S2 suites (query_safety, selection_validation, unique_scope, many2one_fk, sync_redaction, audit_history, relational, computed, registry_vector, secret_encryption) |
| `npx tsc --noEmit` (packages/arsy-orm) | exit 0 |
| `npx tsc --noEmit` (addons/base) | exit 0 |
| `pnpm contract:check` | **PASS** — addons/base now declares `ir.model.access` + `ir.rule`; arsy-orm publicSurface lists the new access/constraint symbols |
| `pnpm lint:arch` | **PASS** — after adding `company_id` (default 0) to the two ACL models (TENANT_ISOLATION) |
| `pnpm docs:check` | 90/100 — the two failures are `20261106-sdk-cross-app-integration` and `20261106-skin-laboratory-home`, plans owned by **concurrent sessions** (missing rules.md). This plan's artifacts are compliant; not fixed here per commit-scope. |

## Acceptance-criteria status

| AC | State | Evidence |
|---|---|---|
| AC-1 identifier guard | met | readGroup alias + migrator index identifiers routed through the allowlist; negative probe in query_safety |
| AC-2 error not masked | met | withAuditContext attaches cleanup as `cause`, never replaces the original error |
| AC-3 selection reject repo + DB | met | `SelectionValueError` on write + generated `CHECK (… IN (…))` (migrator.ts:261,276) |
| AC-4 uniqueScope per-company | met | partial-unique on `(company_id, field)` (migrator.ts:196); unique_scope tests |
| AC-5 many2one FK + ondelete | met | cascade/set null/restrict tests pass in many2one_fk |
| AC-6 sync redaction | met | fail-closed regex patterns + `MODEL_SYNC_EXCLUDE`; sync_redaction tests |
| AC-7 translation model key | met | `ir.translation.model_name` column + model-filtered lookup with legacy fallback |
| AC-8 increment/keyset parity | met | incrementById recomputes stored computes; findKeyset shares the post-read pipeline |
| AC-9 gateway catalog via repo | **deferred** | see Deviations — `catalogRepo` helper added but `/v1/models` + `/v1/gateway/providers` still raw JOIN reads; live AI-serving path, owner-paced |
| AC-10 audit vs enforce + superuser | met | `resolveAclMode` default `enforce` (unset fails closed; `audit`/`off` explicit opt-ins); `AccessDeniedError` in enforce; `logger.warn{acl_would_deny}` in audit; system + `globalAccess` bypass — covered by access_control tests (S3.5 landed) |
| AC-11 retention as one constraint | **partial** | the `constraints` mechanism + rollback tests ship; migrating `legal_hold`/retention into `project.task`/`ir.attachment` and deleting route duplicates is an adoption step |
| AC-12 fieldsGet → sdui | met | sdui view fallback built from `BaseRepository.fieldsGet()` (relation + selection reach the renderer); `displayNameSpec` on project.task/project.project; `fields_get_metadata.test.mjs` contract test — landed in 343df10 |
| AC-13 signature drift | met | modelSignature covers indexes/displayNameSpec/related/compute names |
| AC-14 nameSearch escaping | met | `%`/`_` treated as literals via ESCAPE clause |
| AC-15 test source hygiene | met | test script builds dist before dist-importing suites; full suite green |

## Key decisions taken while implementing

- **checkAccess keyed on group ids, not role strings.** The mechanism consumes `AuditActor.groupIds?: number[]`
  and treats `group_id = 0` as the base grant for every authenticated principal. conflict.md C-3 (how a live auth
  session is mapped to group ids) is an owner decision; the mechanism is neutral to it and fails closed when no
  grant matches in enforce mode.
- **Record rules as a pure narrowing predicate.** `resolveSecurityDomain(operation, actor)` compiles `ir.rule` rows
  into a `DomainNode` (global AND / role OR) that a caller passes as `QueryOptions.securityDomain`; `buildWhere`
  ANDs it onto the query. It can only narrow, never widen, and throws on a malformed `domain_force` (fail closed).
  Read call sites were not given new mandatory parameters — callers opt in — to avoid signature churn across the
  47-route surface.
- **Constraints abort the write transaction.** `ModelDefinition.constraints` are evaluated inside `withAuditContext`
  before SQL emission for create/update/delete, so the invariant holds even if a route bypasses the handler layer.
  Constraint functions are excluded from `modelSignature` (not serializable).
- **Seed domains are JSON `DomainNode`, not raw SQL.** The `DEFAULT_RULE` entries carry `domain_force` values like
  `["company_id","=",0]` so they run through the same allowlisted compiler; this removes the raw-SQL invariant
  violation the earlier draft introduced.

## Deferred work and its gates

1. ~~**S3.5 enforce flip**~~ — **landed**. Owner cleared the C-3/C-4 gate; `resolveAclMode()` now defaults to
   `enforce` (unset fails closed, `audit`/`off` remain explicit opt-ins). The base seed grants (group_id 0) cover the
   core route surface; models lacking any grant are now default-deny by design.
2. **S4.2 gateway catalog** — `/v1/models` and `/v1/gateway/providers` (`llm-gateway/src/index.ts:92,95,652`) still
   read via raw `dbEngine.query` JOINs. A `catalogRepo(modelName)` helper was added (`index.ts:76`) but is not yet
   wired into those handlers; the conversion needs an expand+filter rewrite that preserves the current unscoped
   global-catalog behavior, plus a gateway catalog scoping test. It is a live AI-serving path, so it is owner-paced.
3. **S4.1/S4.3 legal_hold + retention adoption** — the constraint mechanism is ready; wiring `project.task` and
   `ir.attachment` to it and removing the duplicated route checks belongs with route thinning (owner-paced, needs hub).
4. ~~**S4.4 fieldsGet → sdui**~~ — **landed** in 343df10: the sdui view fallback is built from
   `BaseRepository.fieldsGet()` (relation + selection reach the renderer) and `displayNameSpec` is set on
   `project.task` / `project.project`; covered by `fields_get_metadata.test.mjs`.

## Commit scope

This commit contains only this plan's files under `packages/arsy-orm` and `addons/base` (plus the plan artifacts
under `.plans/20261105-orm-odoo-standardization/`). The concurrent sessions' WIP (skins, i18n, sdk-cross-app,
unrelated `.plans`, and the two docs:check-failing plan dirs) is intentionally excluded. No push without explicit
owner request.
