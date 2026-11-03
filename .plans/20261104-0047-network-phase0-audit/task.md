# Tasks: Network Foundation Phase 0 — Audit Current Repository & Reconcile Architecture (Issue #6)

## 1. Baseline Verification & Worktree Inspection
- [x] Record current git HEAD SHA, branch (`dev`), and worktree status
- [x] Inspect root `package.json`, pnpm workspaces, and package dependencies

## 2. Codebase Capability Inventory
- [x] Inspect existing subscriber/user models (`addons/base`, `auth.*`, `@allah/arsy-plugin-auth`)
- [x] Inspect product/catalog/subscription models across addons
- [x] Inspect transaction/invoice capabilities and audit logging (`@allah/arsy-orm`, `ai_usage_log`)
- [x] Inspect network/device/RADIUS facilities (search for existing UDP/sockets/MikroTik code)
- [x] Inspect background job facilities in ARSY Fastify Hub
- [x] Inspect security/password storage mechanisms (bcrypt/argon2 vs PAP requirements)

## 3. Evidence Matrix & Architecture Reconciliation
- [x] Produce source-path evidence matrix (capability, current owner, path, gap, recommendation)
- [x] Identify documentation vs reality discrepancies
- [x] Assess PGlite workload capacity for RADIUS accounting and telemetry
- [x] Formulate recommended dependency graph for child issues #7 through #20
- [x] Compile comprehensive audit report `report.md`

