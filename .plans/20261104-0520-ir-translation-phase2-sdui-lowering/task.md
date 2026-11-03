---
title: "IR Translation Phase 2: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T04:30:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 30
parent_issue: 29
---

# TASKS: IR Translation Phase 2 — SDUI Lowering Compiler & Hydration Runtime

- [ ] **1. SDUI Lowering Compiler Implementation (`packages/arsy-plugin-ir`)**
  - [ ] Implement `SDUILowerer` class in `src/lowerers/sdui.ts`.
  - [ ] Implement node-to-component mappings:
    - [ ] `container` mapping to Flex / Grid / Split layouts.
    - [ ] `data_binding` mapping to live telemetry chips and tables.
    - [ ] `action` mapping to atomic buttons with parameterized action payloads.
  - [ ] Implement recursive tree traversal and token-to-CSS variable mapping for active DNA skins.
  - [ ] Add Fastify endpoint `POST /v1/ir/lower/sdui` with response schema caching.
  - [ ] Unit test: Verify accurate lowering across 20+ template archetypes in `test/lowerer-sdui.test.ts`.

- [ ] **2. Universal Client SDK Hydration (`packages/sdk`)**
  - [ ] Implement `createSDUIRuntime()` in `packages/sdk/src/sdui/runtime.ts`.
  - [ ] Implement dynamic property evaluation and context injection in `src/sdui/evaluator.ts`.
  - [ ] Implement client action dispatcher forwarding mutations via `@allah/sdk` authenticated requests.
  - [ ] Unit test: Test event subscription, action triggers, and mock SSE data feeds in `test/sdui-runtime.test.ts`.

- [ ] **3. UI Atomic Container Integration (`packages/ui`)**
  - [ ] Implement `<SDUIView />` component in `packages/ui/src/blocks/sdui_view.tsx`.
  - [ ] Add component mapping registry resolving SDUI component tags to atomic components (`Card`, `Button`, `Table`, `Badge`).
  - [ ] Implement fallback error boundary card for unmapped or malformed tags.
  - [ ] Add visual regression test using React Testing Library in `test/sdui_view.test.tsx`.

- [ ] **4. End-to-End Verification & Documentation**
  - [ ] Mount `<SDUIView />` in an experimental route in `apps/headquarter/src/app/sdui-preview/page.tsx`.
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 2 artifacts.
  - [ ] Ensure `pnpm docs:check` passes 100/100.
  - [ ] Ensure `pnpm lint:arch` passes.
  - [ ] Ensure `pnpm typecheck` passes.

