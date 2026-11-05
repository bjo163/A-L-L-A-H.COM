---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-SPEC"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
target_branch: "dev"
---

# @moonwitness/ui — Core Delivery Specification

## Objective

Audit and improve `packages/ui` against its current source, package contract, six approved Moon UI DNA, consuming applications, and the canonical [Moon UI master plan](../20261105-moon-ui-master-consolidation/spec.md). Deliver only source-backed capabilities with public APIs, tests, and evidence.

## Scope

- Package exports, layer boundaries, skins/tokens, components, blocks, primitives, motion/effects, sound, artwork/assets, documentation, and package-level verification.
- Consumer checks needed to prove package compatibility and avoid private implementation dependencies.
- Task mapping and completion evidence in the [atomic task ledger](task.md), [master ledger](../20261105-moon-ui-master-consolidation/task.md), and [coverage matrix](../20261105-moon-ui-master-consolidation/coverage-matrix.md).

App-specific routes, business workflows, backend services, authentication, persistence, and API contracts remain outside this package plan.

## Requirements

1. Preserve `@moonwitness/ui` as the single shared visual and interaction package.
2. Keep TypeScript/TSX and React 19 peer compatibility; expose supported entrypoints intentionally.
3. Keep presentation values in the package token/skin authority and preserve all six distinct worlds.
4. Keep raw layout structural, components semantic, primitives behavior-focused, and blocks reusable and prop-driven.
5. Provide accessible, keyboard-operable, responsive components with reduced-motion support.
6. Verify asset ownership/provenance and do not claim visual certification without runtime evidence.
7. Record baseline failures as failures, repair verified causes, and synchronize every completed PUI task with its parent MU task.

## Acceptance criteria

- Every completed task has source-backed acceptance evidence and its named verification result in `report.md`.
- Package exports resolve from supported consumer entrypoints; no accidental private import is introduced.
- UI tests, contrast, architecture, typecheck, and applicable consumer builds pass for the delivered changes.
- Visual claims have browser evidence for the relevant skin, viewport, and state.
- The task ledger and coverage matrix agree; the plan is marked completed only after all applicable tasks have evidence or documented dispositions.
