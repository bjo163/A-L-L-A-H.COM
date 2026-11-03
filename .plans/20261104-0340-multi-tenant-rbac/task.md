---
title: "Multi‑Tenant RBAC Framework Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 25
parent_issue: 5
---

# TASKS

- [ ] **Backend Service Development**
  - [ ] Create `rbac.ts` service module in `apps/arsy/src/services/` with CRUD functions.
  - [ ] Implement Fastify routes under `/v1/rbac` for roles and user‑role management.
  - [ ] Define PGlite schema migrations for tables `rbac_role`, `rbac_permission`, `rbac_role_permission`, `rbac_user_role`, `rbac_audit`.
  - [ ] Write migration script `scripts/migrate-rbac.ts` and run in CI.
  - [ ] Add unit tests for each endpoint using Jest + Supertest (cover success, validation errors, auth failures).
  - [ ] Add integration test simulating role lookup for 100 concurrent users, asserting <5 ms permission check latency.

- [ ] **Cache Layer Implementation**
  - [ ] Implement in‑process LRU cache (`apps/arsy/src/cache/rbacCache.ts`).
  - [ ] Add cache invalidation hooks on role/permission changes.
  - [ ] Write performance benchmark (`scripts/bench-rbac-cache.sh`) targeting >95 % hit rate.

- [ ] **SDK Extension**
  - [ ] Add `hasPermission`, `assignRole`, `listRoles` in `packages/sdk/src/rbac.ts` with full TypeScript typing.
  - [ ] Generate SDK documentation via Typedoc and verify links.
  - [ ] Write SDK unit tests covering cache hit/miss scenarios.

- [ ] **Admin UI Development**
  - [ ] Create `/admin/rbac` page in `apps/headquarter/pages/admin/rbac.tsx`.
  - [ ] Build `RoleGrid` component using `@moonwitness/ui` `DataGrid` with inline editing of permissions.
  - [ ] Implement `UserAssignmentModal` for assigning roles to users (searchable dropdown).
  - [ ] Add audit trail view component pulling from `CHRONICLE`.
  - [ ] Write component tests (React Testing Library) for grid interactions, modal workflow.

- [ ] **Security & Auditing**
  - [ ] Enforce JWT role middleware on all RBAC routes.
  - [ ] Add rate limiter (100 writes/min per tenant).
  - [ ] Ensure every mutation writes immutable audit entry in `CHRONICLE` with SHA‑256 payload.

- [ ] **Observability**
  - [ ] Export Prometheus metrics: `rbac_permission_check_latency_ms`, `rbac_cache_hit_ratio`.
  - [ ] Add Grafana dashboard JSON (artifact) for RBAC health.

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with RBAC API definitions, SDK types, and permission model.
  - [ ] Add ADR `ADR/2026-11-rbac-framework.md` explaining design choices and trade‑offs.
  - [ ] Verify `pnpm docs:check` passes.

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and address any violations.
  - [ ] Run `pnpm typecheck`.
  - [ ] Perform load test using `scripts/load-test-rbac.sh` (simulate 500 concurrent permission checks).

- [ ] **Deployment**
  - [ ] Extend CI pipeline to run RBAC unit/integration tests.
  - [ ] Deploy RBAC service to staging; run end‑to‑end smoke test with sample tenant.
  - [ ] Gather operator feedback and iterate.

