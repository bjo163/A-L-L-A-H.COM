---
title: "Multi‑Tenant RBAC Framework Phase 1: Design Specification"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 25
parent_issue: 5
---

# DESIGN

## Backend Service Architecture
- **Service Module** `rbac.ts` lives in `apps/arsy/src/services/`.
- **API Endpoints** (Fastify routes under `/v1/rbac`):
  - `GET /roles` – list all roles for tenant.
  - `POST /roles` – create role with permission list.
  - `PUT /roles/:id` – update role permissions.
  - `DELETE /roles/:id` – delete role (soft‑delete, keep audit.
  - `GET /users/:userId/roles` – fetch user roles.
  - `POST /users/:userId/roles` – assign role to user.
- **Database Schema** (PGlite tables):
  - `rbac_role` (`id`, `company_id`, `name`, `description`, `created_at`).
  - `rbac_permission` (`id`, `company_id`, `resource`, `action`).
  - `rbac_role_permission` (`role_id`, `permission_id`).
  - `rbac_user_role` (`user_id`, `role_id`).
- **Cache Layer**: In‑process LRU cache keyed by `company_id:roleId` for O(1) permission lookup; invalidated on role/permission change.
- **Auditing**: Every mutation writes an immutable entry to `CHRONICLE` table `rbac_audit` with SHA‑256 hash of payload.

## SDK Extension (`packages/sdk/src/rbac.ts`)
- `hasPermission(userId, resource, action): Promise<boolean>` – resolves via cached lookup, falls back to API if miss.
- `assignRole(userId, roleId): Promise<void>`.
- `listRoles(): Promise<Role[]>`.
- Types exported: `Role`, `Permission`, `RBACChange`.
- JSDoc + generated docs via `typedoc`.

## Admin UI (`apps/headquarter/pages/admin/rbac.tsx`)
- **Grid** component (`DataGrid`) listing roles with editable permission checkboxes.
- **User Assignment** modal (search user, assign multiple roles).
- **Audit Trail** view tab showing recent `rbac_audit` entries.
- All UI built from `@moonwitness/ui` primitives: `Table`, `Checkbox`, `Modal`, `Badge`.
- **Accessibility**: Keyboard navigation, ARIA labels for each control.

## Security Model
- **Authentication** via existing `@allah/sdk` middleware.
- **Authorization Middleware** reads user’s roles from JWT claims; calls `hasPermission` to guard each Fastify route.
- **Least‑Privilege Default**: New tenants automatically receive `viewer` role with read‑only permissions.
- **Rate Limiting**: 100 write operations/min per tenant.

## Performance & Scalability
- Cache hit rate target > 95 % for permission checks.
- Cache eviction policy LRU with max 10 k entries per tenant.
- Database indices on `company_id` for all RBAC tables.
- Horizontal scaling: service is stateless; cache can be moved to Redis in future.

---

## Acceptance Criteria (Design)
1. API responses match OpenAPI schema (validated in CI).
2. UI updates reflect role/permission changes without full page reload (optimistic UI).
3. Permission check latency < 5 ms on cache hit.
4. All components imported exclusively from `@moonwitness/ui`.
5. ADR `ADR/2026-11-rbac-framework.md` documented and docs pass.

