---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BACKLOG"
version: "1.0.0"
owner: "product-management"
status: "implemented"
last_verified: "2026-11-03"
---
# BACKLOG.md
## Single Source of Actionable Work

Statuses: `DISCOVERED`, `READY`, `IN_PROGRESS`, `IMPLEMENTED`, `VERIFIED`, `RELEASED`, `BLOCKED`, `DEFERRED`. Priority: P0 critical, P1 high, P2 medium, P3 normal, P4 opportunistic.

## Initial audit tasks

### DOC-001 â€” Reconcile documentation with implementation
- Priority: P1
- Status: READY
- Outcome: Current-state claims in README, BLUEPRINT, CHANGELOG, and app docs match source, manifests, tests, and workflows.
- Acceptance: Audit claims; correct unsupported statements; verify CI paths and commands; record gaps as tasks.
- Verification: File/path and command checks plus documentation review.

### LEG-001 â€” Inventory MoonWitness legacy sources
- Priority: P1
- Status: DISCOVERED
- Outcome: Traceable inventory of accessible and inaccessible historical sources.
- Acceptance: Record exact source, generation, provenance, status, relationships, access limitations, and disposition.
- Verification: Source references are reviewable.

### LEG-002 â€” Reconcile Reborn and XV
- Priority: P1
- Status: DISCOVERED
- Dependencies: LEG-001
- Outcome: Evidence-backed map of shared, unique, superseded, conflicting, and missing material.
- Acceptance: Compare trees, docs, history, assets, issues; preserve unique content; document conflicts; propose reversible migration.
- Verification: Reviewable source-to-destination reconciliation matrix.

### ARCH-001 â€” Validate product boundaries and ownership
- Priority: P1
- Status: DISCOVERED
- Outcome: Validated responsibilities and integration boundaries for the ecosystem.
- Acceptance: Purpose, domain/data owner, and integration contract documented for each product or decision not to separate it.

### ENG-001 â€” Verify build and CI baseline
- Priority: P1
- Status: BLOCKED
- Outcome: Reproducible backend, frontend, migration, test, and CI baseline.
- Acceptance: Inspect actual scripts/workflows; run available checks; fix broken CI wiring after confirming commands; record environmental limitations.
- Verification: In GitHub Actions run `41627858271`, Rust `cargo check` and `cargo test` passed. Web and extension jobs failed during `pnpm/action-setup` because the root `package.json` does not specify `packageManager`; promotion to `main` was skipped. Set the pnpm version in the workflow or root manifest, then record a passing run.

### DEP-001 â€” Publish container images before Coolify deployment
- Priority: P1
- Status: BLOCKED
- Outcome: GitHub Actions publishes versioned server and web images to GHCR and triggers Coolify; production Compose pulls those images.
- Acceptance: Publish on pushes to `main`, preserve a commit-specific rollback tag, and fail clearly if required Coolify secrets are absent.
- Verification: Compose configuration is valid and the web image published. Production workflow run `41626988966` failed building the server because Rust found `llm_gateway` at both `src/controllers/llm_gateway.rs` and `src/controllers/llm_gateway/mod.rs`; Coolify deployment was skipped. The corrected dev branch passes Rust checks and tests, but promotion is blocked by `ENG-001`. Resume after CI promotes the fix and the production server image builds successfully.

## Task template

### [ID] â€” Outcome-focused title
- Priority:
- Status:
- Problem:
- Expected outcome:
- Evidence/source:
- Dependencies:
- Acceptance criteria:
- Verification:
- Result/evidence:

## Rules
One stable ID per task; merge duplicates; roadmap stays strategic; distinguish evidence from hypothesis; update status only when its definition is met; record blockers and next action.
