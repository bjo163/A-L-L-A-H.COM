---
title: "Rules & Constraints: MoonWitness ID"
date: "2026-11-03"
plan: "20261103-2036-issue-3-moonwitness-id"
---

# Invariants, Security Rules & Constraints

## 1. Single Authority & No Second Backend
- **Rule 1.1**: `apps/arsy` is the sole authentication and identity backend in the repository.
- **Rule 1.2**: `apps/id` is strictly a client frontend. It must NEVER have a direct database connection, private PostgreSQL instance, or token signing keys.

## 2. Zero ORM Duplication
- **Rule 2.1**: No Drizzle ORM, Prisma, or SeaORM in Node.js services. All database operations MUST use the native `@allah/arsy-orm` backed by embedded PGlite.
- **Rule 2.2**: No dual schema definitions. Model declarations in `packages/arsy-orm` are the single source of truth for tables and fields.

## 3. Strict Separation of Authentication vs. Authorization
- **Rule 3.1**: Authentication identifies *who* the user is (valid credentials, valid session).
- **Rule 3.2**: Authorization determines *what* the user can access (`company_id`, role permissions, addon licenses). Successful login NEVER implies automatic permission to any ecosystem app.

## 4. Session Security & Revocation
- **Rule 4.1**: Passwords must be hashed using salt + Argon2id or Bcrypt (minimum factor 10).
- **Rule 4.2**: Session revocation in `apps/id` must immediately invalidate the session token on `apps/arsy`, rendering any other client relying on that session unauthorized.
- **Rule 4.3**: Sensitive credentials, password hashes, and session secrets must never leak into client bundles, error responses, or telemetry logs.

## 5. Anti-Slop & Quality
- **Rule 5.1**: Zero placeholder stub files. Every route, view, and component must be fully implemented with real types.
- **Rule 5.2**: Keyboard accessible (Tab, Enter, Escape), responsive across mobile and desktop, bilingual support (ID/EN).
