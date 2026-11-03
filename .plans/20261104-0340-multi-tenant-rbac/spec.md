---
title: "Multi‑Tenant RBAC Framework Phase 1"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 25
parent_issue: 5
---

# SPEC: Multi‑Tenant Role‑Based Access Control

## Context & Goal
- Establish a centralized RBAC service governing permissions across all monorepo applications.
- Support dynamic role definitions per `company_id` with hierarchical inheritance.
- Integrate with existing `@allah/sdk` authentication middleware.

## Requirements
1. **Backend Service** `apps/arsy/src/services/rbac.ts` exposing CRUD API `/v1/rbac/roles` and `/v1/rbac/users`.
2. **Database Schema** `rbac_role`, `rbac_permission`, `rbac_user_role` stored in PGlite with immutable hashes.
3. **SDK Extension** `packages/sdk/src/rbac.ts` providing `hasPermission`, `assignRole`, `listRoles`.
4. **UI Admin Console** `/admin/rbac` in `apps/headquarter` with role editor grid.
5. **Policy Evaluation Engine** performant O(1) lookup via in‑memory cache refreshed on change.
6. **Auditing**: Every permission change logged in `CHRONICLE` with SHA‑256 payload.
7. **Security**: Enforce least‑privilege; default role `viewer` for new tenants.

## Acceptance Criteria
- API returns 200 with correct JSON schema.
- UI allows creating roles, assigning permissions, and mapping users.
- Permission checks within existing services (`/v1/cockpit/*`, `/v1/alerts/*`) respect RBAC.
- All quality gates pass.
- ADR `ADR/2026-11-rbac-framework.md` created.

