---
title: "IR Translation Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T04:20:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 29
parent_issue: 5
---

# TASKS: IR Translation Phase 1 — Canonical Semantic AST & Multi-Target IR Schema

- [ ] **1. Type Contracts & Canonical AST Specs (`packages/types`)**
  - [ ] Define `MoonIRNode`, `MoonIRTree`, `MoonIRKind` in `packages/types/src/ir/ast.ts`.
  - [ ] Define `IRDiagnostic`, `IRCompilationResult`, `IRLoweringTarget` in `packages/types/src/ir/compilation.ts`.
  - [ ] Implement node integrity hashing helper (`computeIRHash`) using SHA-256 in `packages/types/src/ir/hash.ts`.
  - [ ] Export all IR definitions through root `packages/types/src/index.ts`.

- [ ] **2. Core Compilation Engine (`packages/arsy-plugin-ir`)**
  - [ ] Scaffold `packages/arsy-plugin-ir` with `package.json`, `tsconfig.json`, and dependencies.
  - [ ] Implement `IRParser` in `src/parser.ts` to convert incoming raw definitions into typed AST.
  - [ ] Implement `IRValidator` in `src/validator.ts` with checks:
    - [ ] Schema structural conformance.
    - [ ] Cycle/recursion detection in child hierarchies.
    - [ ] Binding variable resolution assertions.
  - [ ] Implement `IROptimizer` in `src/optimizer.ts` for tree pruning and dead code elimination.
  - [ ] Write unit test suite covering 50+ diverse AST shapes in `test/parser.test.ts` and `test/validator.test.ts`.

- [ ] **3. Fastify Hub Integration (`apps/arsy`)**
  - [ ] Register `@allah/arsy-plugin-ir` into Fastify plugin pipeline in `apps/arsy/src/server.ts`.
  - [ ] Expose `POST /v1/ir/compile` with tenant token authentication.
  - [ ] Expose `POST /v1/ir/validate` with validation telemetry tracking.
  - [ ] Write integration test verifying Fastify endpoints with Supertest.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with IR translation schemas.
  - [ ] Verify `pnpm docs:check` passes 100/100.
  - [ ] Verify `pnpm lint:arch` passes.
  - [ ] Verify `pnpm typecheck` passes.

