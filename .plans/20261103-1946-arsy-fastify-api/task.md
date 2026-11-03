---
title: "Task Checklist: Arsy Master Ecosystem & Server Migration"
date: "2026-11-03"
plan: "20261103-1946-arsy-fastify-api"
---

# Master Task Checklist

### Phase 1: Micro-kernel Foundation (`packages/arsy-core`)
- [x] 1.1. Create `packages/arsy-core/package.json` and `tsconfig.json`
- [x] 1.2. Implement `kernel.ts`: App boot lifecycle hooks (`onInit`, `onBoot`, `onReady`, `onShutdown`)
- [x] 1.3. Implement `container.ts`: Lightweight IoC/DI container for service registration
- [x] 1.4. Implement `response.ts`: Standard envelope `{ success, data, error, meta }` with pagination helpers
- [x] 1.5. Implement `errors.ts`: Typed error hierarchy (`AppError`, `HttpError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`)
- [x] 1.6. Implement `logger.ts`: Structured Pino logger configuration with trace/context ID support

### Phase 2: Embedded PGlite ORM Engine (`packages/arsy-orm`)
- [x] 2.1. Create `packages/arsy-orm/package.json` with `@electric-sql/pglite`
- [x] 2.2. Implement `engine.ts`: In-process PGlite connection manager supporting `:memory:` and persistent disk (`./data/arsy.db`)
- [x] 2.3. Implement `fields.ts`: Field definitions (`char`, `text`, `integer`, `float`, `boolean`, `datetime`, `many2one`, `one2many`, `json`)
- [x] 2.4. Implement `model.ts`: `defineModel()`, `ModelAudit` audit trail (id, active, create_date, write_date, create_uid, write_uid, company_id)
- [x] 2.5. Implement `query_builder.ts`: Parameterized SQL query builder with automatic fail-closed `company_id` injection
- [x] 2.6. Implement `migrator.ts`: Automatic DDL generator comparing declared models against PGlite catalog (`CREATE TABLE`, `ALTER TABLE`, indexes)
- [x] 2.7. Implement `registry.ts`: Global model registry & metadata introspection

### Phase 3: Technical Plugins (`packages/arsy-plugin-*`)
- [x] 3.1. Create `packages/arsy-plugin-auth`:
  - [x] Password hashing via Argon2id / Bcrypt
  - [x] JWT token issuance & verification
  - [x] Endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/current`, `/api/auth/magic-link`
- [x] 3.2. Create `packages/arsy-plugin-sdui`:
  - [x] View schema resolver for `tree`, `form`, `kanban`, `search` views
  - [x] Endpoint: `/v1/sdui/{model}/{view_type}`
- [x] 3.3. Create `packages/arsy-plugin-llm-gateway`:
  - [x] Upstream client with SSRF validation
  - [x] Token-bucket rate limiter
  - [x] Semantic SHA-256 cache
  - [x] Endpoints: `/v1/chat/completions`, `/v1/models`
- [x] 3.4. Create `packages/arsy-plugin-storage`:
  - [x] Content-Addressed Storage (SHA-256 CAS)
  - [x] Legal hold retention checks
  - [x] SigV4 AWS S3 authentication utilities

### Phase 4: Business Domain Addons (`addons/*`)
- [x] 4.1. Define Addon contract & dynamic loader scanning `__manifest__.json`
- [x] 4.2. Implement `addons/base`:
  - [x] Manifest: `addons/base/__manifest__.json`
  - [x] Models: `res.company`, `res.partner`, `res.users`, `res.currency`, `res.country`, `ir.ui.view`
  - [x] Views: SDUI JSON definitions for `res.partner` (tree & form) and `res.company`
  - [x] Data: Initial seed fixtures
- [x] 4.3. Implement `addons/mw_llm_router`:
  - [x] Manifest: `addons/mw_llm_router/__manifest__.json`
  - [x] Models: `ai.provider`, `ai.model`, `ai.route`, `ai.virtual_key`, `ai.usage_log`
- [x] 4.4. Implement `addons/mw_storage`:
  - [x] Manifest: `addons/mw_storage/__manifest__.json`
  - [x] Models: `mw.storage.backend`, `ir.attachment`, `ir.legal.hold`

### Phase 5: Main Runtime Server & Monorepo Integration (`apps/arsy`)
- [x] 5.1. Initialize `apps/arsy/package.json` and `tsconfig.json`
- [x] 5.2. Implement `src/app.ts`: Fastify app factory loading Helmet, CORS, Swagger, Swagger-UI, Arsy Plugins, and Addons
- [x] 5.3. Implement `src/main.ts`: Runtime entrypoint listening on port 5150 with graceful shutdown signals
- [x] 5.4. Implement health endpoints: `GET /health` and `GET /ready` (verifying PGlite readiness)
- [x] 5.5. Add generic model REST CRUD endpoints: `/api/v1/models/{model_name}`
- [x] 5.6. Add root scripts to `package.json`: `"arsy:dev"`, `"arsy:build"`, `"arsy:migrate"`

### Phase 6: Verification, Doc Contracts & Parity Testing
- [x] 6.1. Build all packages (`packages/arsy-*`, `apps/arsy`)
- [x] 6.2. Verify PGlite in-memory boot & DDL auto-migration
- [x] 6.3. Update canonical documentation (`README.md`, `CHANGELOG.md`, `BACKLOG.md`)
- [x] 6.4. Run `pnpm docs:check` and confirm 100/100 score
