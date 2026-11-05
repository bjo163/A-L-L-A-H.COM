---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-IDENTITY-FEDERATION-RULES"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
---

# Cross-App Identity Federation — Rules

## Authority

- Follow root [AGENTS.md](../../AGENTS.md), [DESIGN.md](../../DESIGN.md), [QUALITY.md](../../QUALITY.md), and [DECISIONS.md](../../DECISIONS.md).
- `packages/ui` owns shared interface components, skins, tokens, assets, effects, and their tests. Apps own routes, data access, authorization, persistence, and product workflows.
- The master [task ledger](task.md) and [coverage matrix](coverage-matrix.md) are canonical. Update mapped records together when work is verified.

## Implementation

- Inspect current source, consumers, tests, and overlapping plans before changing a capability.
- Preserve React 19 and TypeScript/TSX. Extend the native-first component system; add a dependency or primitive only for a documented requirement.
- Use public exports and `data-slot` CSS hooks. Keep theme values in the shared token and skin system; keep app styles free of private `mw-*` selectors and palette literals.
- Keep the six approved DNA identities distinct in composition and material while sharing behavior, semantics, and accessibility.

## Evidence and delivery

- Mark a task complete only after its stated source and verification evidence passes. Record command output, changed paths, commit, and unresolved limits in the plan report.
- Do not infer visual certification from static tests or implementation. Capture browser evidence for claims requiring runtime inspection.
- Commit only the coherent task files, push to the existing `dev` branch, and monitor the resulting CI run before recording the task as verified.