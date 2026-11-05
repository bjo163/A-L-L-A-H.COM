---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-MASTER-RULES"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
---

# Moon UI Master — Execution Rules

## Authority

- Follow root [AGENTS.md](../../AGENTS.md), [DESIGN.md](../../DESIGN.md), [QUALITY.md](../../QUALITY.md), and [DECISIONS.md](../../DECISIONS.md).
- `packages/ui` owns shared interface components, skins, tokens, assets, effects, and their tests. Apps own routes, data access, authorization, persistence, and product workflows.
- The master [task ledger](task.md) and [coverage matrix](coverage-matrix.md) are canonical. Update mapped records together when work is verified.

## Implementation

- Inspect current source, consumers, tests, and overlapping plans before changing a capability.
- Preserve React 19 and TypeScript/TSX. Extend the native-first component system; add a dependency or primitive only for a documented requirement.
- Use public exports and `data-slot` CSS hooks. Keep theme values in the shared token and skin system; keep app styles free of private `mw-*` selectors and palette literals.
- Keep the six approved DNA identities distinct in composition and material while sharing behavior, semantics, and accessibility.
- Preserve asset provenance and licensing. Do not depict ALLAH or replace approved artwork without a documented decision.
- Respect keyboard use, visible focus, WCAG AA contrast, responsive reflow, and reduced-motion preferences.

## Evidence and delivery

- Mark a task complete only after its stated source and verification evidence passes. Record command output, changed paths, commit, and unresolved limits in the plan report.
- Do not infer visual certification from static tests or implementation. Capture browser evidence for claims requiring runtime inspection.
- Commit only the coherent task files, push to the existing `dev` branch, and monitor the resulting CI run before recording the task as verified.
- Record blockers with evidence and a next action; do not silently defer or claim success.
