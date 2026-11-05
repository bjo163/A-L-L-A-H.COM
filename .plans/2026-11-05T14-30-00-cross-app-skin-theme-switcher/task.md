---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER_TASK"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# Cross-Application Skin Theme Switcher — Tasks

## Phase 1 — Contract and design
- [ ] **SKIN-001** Reconcile user-selectable skins with the canonical six-world app mapping and active Moon UI master plan.
- [ ] **SKIN-002** Define persistence keying, SSR initialization and fallback behavior without hydration mismatch.
- [ ] **SKIN-003** Define keyboard, screen-reader, contrast and reduced-motion acceptance evidence.

## Phase 2 — Implementation
- [ ] **SKIN-010** Add an SSR-safe preference store scoped to an application identifier.
- [ ] **SKIN-011** Add a reusable selector through public `@moonwitness/ui` exports.
- [ ] **SKIN-012** Apply selected preference through the existing skin-scope mechanism without changing app root assignments.
- [ ] **SKIN-013** Add automated tests for valid IDs, persistence, unavailable storage and keyboard semantics.

## Phase 3 — Integration and verification
- [ ] **SKIN-020** Integrate the shared selector into approved app surfaces without duplicating controls.
- [ ] **SKIN-021** Run `pnpm ui:test`, `pnpm lint:arch`, `pnpm typecheck`, `pnpm ui:contrast` and `pnpm docs:check`.
- [ ] **SKIN-022** Build each affected consumer and review narrow/wide layouts and assistive states.
- [ ] **SKIN-023** Record verified outcomes, commit SHA and CI run in `report.md`; check tasks only after evidence passes.
