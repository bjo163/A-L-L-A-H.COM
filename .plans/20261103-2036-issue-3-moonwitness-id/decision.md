---
title: "Decision: Native Arsy-ORM vs. Drizzle ORM for MoonWitness ID"
date: "2026-11-03"
plan: "20261103-2036-issue-3-moonwitness-id"
status: "approved"
deciders: ["User", "Engineering"]
---

# Decision: Native Arsy-ORM Single Authority

## 1. Context
GitHub Issue #3 suggested Better Auth with Drizzle ORM. However, the system already has a high-performance in-process `@allah/arsy-orm` engine powered by embedded PGlite (WASM PostgreSQL). Introducing Drizzle would create dual ORM overhead, conflicting schema definitions, and migration divergence.

## 2. Decision
- Discard Drizzle ORM.
- Implement all identity, credential, session, and verification models directly using the native `@allah/arsy-orm`.
- Mount authentication endpoints into the single canonical Fastify backend `apps/arsy`.

## 3. Consequences
- **Positive**: Zero ORM overlap, single PostgreSQL connection, unified model registry and automatic DDL migrations.
- **Positive**: Clean repository boundary; `apps/id` remains purely a frontend client.

