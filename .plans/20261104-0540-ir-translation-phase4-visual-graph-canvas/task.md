---
title: "IR Translation Phase 4: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T04:50:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 32
parent_issue: 29
---

# TASKS: IR Translation Phase 4 — Frontend Visual Graph & IDE Workbench Canvas

- [ ] **1. Visual Graph Lowerer Engine (`packages/arsy-plugin-ir`)**
  - [ ] Implement `GraphLowerer` in `src/lowerers/graph.ts`.
  - [ ] Implement DAG topology calculation and automatic layered layout algorithm.
  - [ ] Synthesize graph ports (input, output, condition branches) based on node kinds.
  - [ ] Fastify endpoint `POST /v1/ir/lower/graph` with layout caching.
  - [ ] Unit test: Verify graph topology and edge resolution in `test/lowerer-graph.test.ts`.

- [ ] **2. Atomic UI Graph Canvas Component (`packages/ui`)**
  - [ ] Implement `<IRGraphCanvas />` in `packages/ui/src/blocks/ir_graph.tsx`.
  - [ ] Implement pan/zoom controls using CSS transforms and pointer gestures.
  - [ ] Implement animated pulse edges for active execution states.
  - [ ] Implement `<IRNodeInspector />` drawer showing node JSON, attributes, and live diagnostics.
  - [ ] Component test: Test selection, inspection drawer trigger, and zoom controls in `test/ir_graph.test.tsx`.

- [ ] **3. Integration in Headquarter & VS Code Extension**
  - [ ] Create `/workflows` canvas view in `apps/headquarter/src/app/workflows/page.tsx`.
  - [ ] Add webview provider in `packages/vscode-extension/src/irGraphWebview.ts`.
  - [ ] Connect live SSE execution events to highlight running nodes in real-time.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 4 visual graph schemas.
  - [ ] Ensure `pnpm docs:check` passes 100/100.
  - [ ] Ensure `pnpm lint:arch` passes.
  - [ ] Ensure `pnpm typecheck` passes.

