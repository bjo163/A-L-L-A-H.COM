---
title: "Arsy: Master Architecture Specification (Micro-kernel, Plugins, Addons, PGlite ORM & Migration)"
date: "2026-11-03"
author: "Antigravity Engineering"
status: "in_progress"
target: "apps/arsy, packages/arsy-*, addons/*, apps/server"
---

# Architecture Specification: Arsy Master Ecosystem

## 1. Goal & Architectural Pillars
Establish **Arsy** as the ultimate, modular TypeScript platform with:
1. **Zero-Daemon Database**: Embedded PostgreSQL v16 running in-process via WebAssembly (`@electric-sql/pglite`), operating in-memory or on disk (`./data/arsy.db`).
2. **Arsy Micro-kernel (`packages/arsy-core`)**: Centralized IoC/DI, lifecycle events (`onInit`, `onBoot`, `onShutdown`), standard response envelope (`{ success, data, error, meta }`), structured Pino logger, and typed error hierarchy.
3. **Arsy Declarative ORM (`packages/arsy-orm`)**: Odoo-style data engine supporting typed field declarations (`char`, `integer`, `boolean`, `many2one`, `one2many`, `json`), `ModelAudit` metadata, automated PGlite DDL migrations, and fail-closed tenant scoping (`company_id`).
4. **Arsy Plugins (`packages/arsy-plugin-*`)**: Technical Fastify plugins providing infrastructure-level capabilities (`auth`, `sdui`, `llm-gateway`, `storage`, `swagger`).
5. **Arsy Addons (`addons/*`)**: Odoo-style business domain modules containing `__manifest__.json`, declarative models, and SDUI views.
6. **Full Parity & Cutover**: Systematic migration of all existing endpoints and data structures from Rust Loco (`apps/server`) to Arsy (`apps/arsy`).

## 2. Invariants & Rules
- **Multi-tenant Isolation**: All ORM queries enforce `company_id` parameterized scoping automatically.
- **Fail-closed Security**: SSRF validation for all external HTTP requests; timing-safe comparisons for tokens/digests.
- **Declarative Schema Integrity**: Model definitions are the single source of truth for database DDL and REST validation.
- **Contract Compliance**: Pass all CI gates and 100/100 score on `pnpm docs:check`.
