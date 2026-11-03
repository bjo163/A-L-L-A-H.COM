---
title: "MoonWitness ID (apps/id) & Single Native ORM Identity Engine (GitHub Issue #3)"
date: "2026-11-03"
author: "Antigravity Engineering"
status: "proposed"
target: "apps/id, apps/arsy, packages/arsy-plugin-auth, packages/arsy-orm"
issue: "https://github.com/bjo163/A-L-L-A-H.COM/issues/3"
---

# Architecture Specification: MoonWitness ID & Native Arsy-ORM Auth

## 1. Goal
Execute GitHub Issue #3 without ORM overlap:
- Build **MoonWitness ID** (`apps/id`) as the unified account, identity, and SSO center.
- Use **100% `@allah/arsy-orm`** (embedded PGlite PostgreSQL) — **NO Drizzle ORM** and no third ORM.
- Mount all authentication & session lifecycle endpoints directly inside the single canonical backend **`apps/arsy`**.
- Keep `apps/id` strictly as a Next.js 16 frontend consumer with zero private database access.

## 2. Invariants & Acceptance Criteria
1. **Zero ORM Duplication**: `@allah/arsy-orm` is the sole data access layer for all identity, session, and business tables.
2. **Single Canonical Backend**: Only `apps/arsy` exposes authentication endpoints. No parallel Node/Loco auth authority.
3. **Session Revocation**: Remote session revocation in `apps/id` immediately invalidates access on other client apps.
4. **Authentication vs Authorization Separation**: Authentication proves identity; authorization enforces roles, company membership (`company_id`), and app-level permissions.
5. **Contract Compliance**: Pass all build gates and 100/100 score in `pnpm docs:check`.
