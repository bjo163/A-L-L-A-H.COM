---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-DECISIONS"
version: "1.0.0"
owner: "engineering"
status: "approved"
---

# Package UI — Decision Log

## D-001 — Package-only execution scope
**Decision:** This plan executes and verifies `packages/ui` only. Application routes, backend services, API contracts, authorization, persistence and app business workflows remain outside scope.

**Reason:** Keep the shared UI engine reusable and prevent domain logic from leaking into the package.

## D-002 — Parent master task ledger remains canonical
**Decision:** `.plans/20261105-moon-ui-master-consolidation/task.md` remains the project-wide task authority. PUI task IDs provide package-level decomposition and map to MU IDs through `coverage-matrix.md`. Any status change must be synchronized.

**Reason:** Avoid competing plans and preserve project-level traceability.

## D-003 — Existing implementation is the baseline
**Decision:** Extend and verify the current package. Do not rebuild existing skin engine, components, blocks, raw primitives, visual-effects provider, Skin Laboratory or procedural SFX engine.

**Reason:** The package already has meaningful implementation; source-backed gaps, not blueprint breadth, determine work.

## D-004 — Six DNA remain fixed
**Decision:** Preserve the six accepted DNA and their approved app mapping. No new skin or reassignment is introduced by this plan.

**Reason:** The package implements the accepted world canon; it does not redefine it.

## D-005 — Native-first and dependency restraint
**Decision:** Prefer semantic HTML/CSS/SVG and current package conventions. Add dependencies only after a measured need, licensing/security/maintenance review, bundle analysis and fallback design.

**Reason:** Preserve performance, accessibility, maintainability and SSR compatibility.

## D-006 — Research features are gated
**Decision:** Intent compiler, evidence surface, scene graph, advanced spatial rendering and specialist foundries remain conditional proposals until a real consumer, data contract, authority boundary and measurable acceptance test exist.

**Reason:** Prevent speculative features from becoming fake implementation claims.

## D-007 — Branch and safety policy
**Decision:** Work only on existing `dev`; never create a branch or modify `main`; preserve all local work and avoid destructive operations.

**Reason:** Follow the repository's current collaboration policy.
