---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_DECISIONS"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Decisions (ADR): ORM Odoo-style Standardization

## ADR-1: uniqueScope defaults to global, company scope is opt-in
- Decision: `uniqueScope: 'global' | 'company'`, default `'global'`. Models opt into company-scoped uniqueness explicitly; the index swap runs as a validated migration.
- Why: today every unique index is global. Flipping the default would silently change constraint behavior for every existing model, including platform catalogs where global uniqueness is correct.
- Alternatives rejected: (a) default `'company'` everywhere, breaks catalogs and existing duplicates assumptions without owner review; (b) keep global only, leaves the verified cross-tenant rejection defect (R04) unfixed.
- Consequence: per-model opt-in list is an owner decision (conflict.md C-1). The mechanism is generic and tested regardless of which models opt in.

## ADR-2: ondelete defaults follow Odoo convention
- Decision: many2one `ondelete` defaults to `'restrict'` when the field is required, `'set null'` otherwise; explicit option overrides.
- Why: matches Odoo's default behavior, so addon authors carrying Odoo mental models get predictable semantics. Restrict on required fields prevents orphaning a mandatory reference; set null on optional fields preserves rows when a parent is removed.
- Alternatives rejected: (a) no FK at all (status quo), leaves R05 orphan acceptance; (b) `'cascade'` default, risks silent multi-row data loss; (c) FK on every existing column immediately, blocked by possible orphan data, hence the scan-gated rollout.
- Consequence: `set null` on a NOT NULL column is rejected at sync time with a clear error instead of invalid DDL.

## ADR-3: ACL rolls out audit-first, enforce after owner review
- Decision: `ARSY_ACL_MODE=off|audit|enforce`; merge with `audit` default, flip to `enforce` only after the owner reviews real would-deny logs.
- Why: 47 routes plus addon services currently authorize manually. Big-bang default-deny would break unknown flows; audit mode produces the coverage evidence needed to seed correct grants.
- Alternatives rejected: (a) immediate enforce, high regression risk without coverage data; (b) permanent audit-only, leaves R11 (no access layer) effectively unfixed.
- Consequence: enforce timing is an owner gate (conflict.md C-4). Audit mode is a rollout stage, not a permanent configuration (rules.md).
- Status: owner cleared the C-3/C-4 gate (S3.5). `resolveAclMode()` default is now `enforce`; `audit` and `off` remain explicit opt-ins and unknown values fail closed to `enforce`. The audit review across the live route surface is treated as complete.

## ADR-4: sync redaction becomes default-deny denylist, not suffix-only
- Decision: strip keys matching credential patterns (password, token, secret, api_key, credential) plus the existing `_encrypted`/`_hash` suffixes; per-model `syncExclude` adds non-credential exclusions; explicit allowlist override only where a payload genuinely needs such a key.
- Why: the suffix rule fails open for any future credential column that does not follow the naming suffix (R06). res.users is in the default sync set and carries api_key/reset_token/magic_link_token/email_verification_token columns today; they are latent because no flow writes them, but the trigger must not depend on that staying true.
- Alternatives rejected: (a) keep suffix-only, the verified fail-open design; (b) full payload allowlist per model, safest but breaks payload evolution and existing consumers that expect whole rows; the denylist is proportionate to the actual threat.
- Consequence: no current payload content changes (password is already a placeholder, token columns unwritten). The lint rule locks the denylist constant so it cannot silently regress.

## ADR-5: translation model key with legacy empty fallback
- Decision: add `ir.translation.model_name`; reads match `(model_name = $model OR model_name = '' OR model_name IS NULL)`; new writes set the key.
- Why: fixes the verified cross-model collision (R07) without breaking rows written before the key existed. The audit found no production `type:'model'` rows, so the fallback window is effectively unused.
- Alternatives rejected: (a) hard model filter with no fallback, strands any legacy row; (b) backfill by guessing model from res_id, impossible to do reliably (res_id is not globally unique across models), would fabricate data.
- Consequence: the fallback can be removed in a later cleanup migration once the owner confirms no empty-key rows remain.

## ADR-6: constraints live on models, workflows stay in addon services
- Decision: single-row invariants become `ModelDefinition.constraints` evaluated inside the write transaction; multi-model workflows stay in `addons/<name>/services/`.
- Why: Odoo places `@api.constrains` on models and business workflows in services; the repo already has an exemplary service (mw_notify events). This removes the route-level duplication verified in R12/R18 without inventing a new layer.
- Alternatives rejected: (a) keep guards in routes, duplication already produced two independent retention implementations; (b) a new middleware framework, unnecessary abstraction for the actual need.
- Consequence: route thinning is incremental (tranche 1 only in this plan); transport keeps status mapping (403/409) so API contracts do not change.