---
title: "IR Translation Phase 3: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T04:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 31
parent_issue: 29
---

# TASKS: IR Translation Phase 3 — PGlite SQL Lowerer & Query Planner

- [ ] **1. Core SQL Lowerer Implementation (`packages/arsy-plugin-ir`)**
  - [ ] Implement `SQLLowerer` class in `src/lowerers/sql.ts`.
  - [ ] Implement query AST lowerer for `SELECT`, `WHERE`, `ORDER BY`, `LIMIT/OFFSET`.
  - [ ] Implement mutation lowerer for `INSERT`, `UPDATE`, `DELETE` operations.
  - [ ] Implement strict parameter extraction preventing raw SQL concatenation.
  - [ ] Implement automated tenant filtering (`company_id`) injection across all referenced models.
  - [ ] Unit test: Verify SQL lowering and parameter isolation in `test/lowerer-sql.test.ts`.

- [ ] **2. PGlite Execution Bridge (`packages/arsy-orm`)**
  - [ ] Implement `executeIRQuery()` bridge method in `@allah/arsy-orm`.
  - [ ] Connect parameterized output directly to PGlite instance without intermediary formatting.
  - [ ] Add query timeout guards (default: 5,000ms max execution time).
  - [ ] Integration test: Execute lowered queries against in-memory PGlite database in `test/ir-orm-bridge.test.ts`.

- [ ] **3. Fastify Hub Route & Security Gate (`apps/arsy`)**
  - [ ] Add route `POST /v1/ir/execute-query` with tenant context resolution.
  - [ ] Add AST safety validator forbidding dangerous operations (`DROP`, `ALTER`, `TRUNCATE`).
  - [ ] Route query execution audit hashes to `CHRONICLE`.

- [ ] **4. Documentation & Verification**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` matrix with Phase 3 artifacts.
  - [ ] Ensure `pnpm docs:check` passes 100/100.
  - [ ] Ensure `pnpm lint:arch` passes.
  - [ ] Ensure `pnpm typecheck` passes.

