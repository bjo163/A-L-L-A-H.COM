---
status: proposed
audit_area: "LLM Gateway Tenant Isolation & API Validation"
---

# Task Plan: LLM Gateway Tenant Isolation & API Validation

## Phase 1: Foundation — Centralized Auth & Tenant Middleware

### TASK-001: Create `src/auth.ts` with shared preHandlers
- **Objective**: Centralize authentication and tenant derivation logic
- **Files**: `packages/arsy-plugin-llm-gateway/src/auth.ts` (NEW)
- **Changes**:
  - Export `requireTenant(request, reply)` → returns `{ companyId }` or sends 403
  - Export `requireTenantOrPlatform(request, reply)` → for superadmin routes
  - Use `@allah/arsy-core` `fail()` for consistent error format
  - Derive `companyId` from `request.principal?.companyId` or `request.user?.company_id`
  - Fail-closed: reject if not a safe integer > 0
- **Dependencies**: None
- **Validation**: Unit test `requireTenant` with mocked request/reply
- **Completion**: File exists, exports two functions, passes unit test

### TASK-002: Add `requireTenant` preHandler to chat completions route (baseline verification)
- **Objective**: Verify existing correct route still works with new middleware
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Import `requireTenant` from `./auth`
  - Add `preHandler: [requireTenant]` to `POST /v1/chat/completions`
  - Remove inline `tenantOf()` call (now in preHandler)
  - Access `companyId` via `(request as any).tenant?.companyId` or similar pattern
- **Dependencies**: TASK-001
- **Validation**: Integration test — chat completions still stream/fallback correctly
- **Completion**: Route works, `pnpm lint:arch` passes

---

## Phase 2: Replace Raw SQL with ORM Repositories

### TASK-003: Refactor `GET /v1/models` to use ORM with tenant scope
- **Objective**: Eliminate raw SQL, enforce tenant isolation on model catalog
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Add `preHandler: [requireTenant]`
  - Import `getRepository` helper (or replicate from `device_control.ts`)
  - Query `ai.provider` with `scope: { companyId: tenant.companyId }`, filter `is_healthy=true`
  - Query `ai.model` with `scope: { companyId: tenant.companyId }`, filter `provider_id IN (...)`
  - Combine routes + models in response (same shape as before)
  - Keep fallback hardcoded models only on genuine DB error (not empty result)
- **Dependencies**: TASK-001
- **Validation**:
  - Integration test: tenant A sees only tenant A + platform models
  - `grep -n "dbEngine\\.query" index.ts` shows this route removed
  - `pnpm lint:arch` passes (TENANT_ISOLATION, PARAMETERIZED_QUERIES)
- **Completion**: Route returns 200 with scoped data, no raw SQL

### TASK-004: Refactor `GET /v1/gateway/providers` to use ORM with tenant scope
- **Objective**: Eliminate raw SQL, enforce tenant isolation + auth on provider catalog
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Add `preHandler: [requireTenant]`
  - Query `ai.provider` with `scope: { companyId: tenant.companyId }`, orderBy `priority`
  - Return same shape: `{ id, name, slug, provider_type, base_url, priority, is_healthy }`
- **Dependencies**: TASK-001
- **Validation**:
  - Integration test: unauthenticated → 403, tenant A sees only tenant A providers
  - `grep` confirms raw SQL removed
  - `pnpm lint:arch` passes
- **Completion**: Route returns 200 with scoped data, no raw SQL

### TASK-005: Add `requireTenant` preHandler to `POST /v1/embeddings`
- **Objective**: Enforce tenant check before any upstream API calls
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Add `preHandler: [requireTenant]` to embeddings route
  - Move existing adapter logic inside tenant-validated block
  - No other logic changes
- **Dependencies**: TASK-001
- **Validation**: Integration test — unauthenticated → 403 before upstream call
- **Completion**: Route validates tenant first, then proceeds

---

## Phase 3: MCP Endpoints Hardening

### TASK-006: Harden `GET /v1/mcp/sse` — add auth + tenant-bound sessions
- **Objective**: Eliminate anonymous SSE streams, bind to tenant
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Add `preHandler: [requireTenant]`
  - Access `tenant.companyId` from request
  - Store active SSE connections in `Map<number, Set<Reply>>` keyed by companyId
  - Include `companyId` in session metadata for debugging
  - Clean up on `request.raw.on('close')` and `request.raw.on('error')`
- **Dependencies**: TASK-001
- **Validation**: Integration test — unauthenticated → 403; authenticated tenant A → stream works
- **Completion**: SSE requires auth, sessions tracked per tenant

### TASK-007: Create `mcp_audit_log` model and migrate tool registry audit to DB
- **Objective**: Replace in-memory global audit log with tenant-scoped DB table
- **Files**:
  - `packages/arsy-plugin-llm-gateway/src/tools/index.ts` (modify)
  - `packages/arsy-plugin-llm-gateway/src/agent_devices.ts` (extend for model registration)
  - `packages/arsy-plugin-llm-gateway/src/types.ts` (add type)
- **Changes**:
  - Add `McpAuditLogRecord` type in `types.ts`
  - Register `mcp.audit_log` model in `agent_devices.ts` (follow `registerAgentDeviceModels` pattern)
  - In `tools/index.ts`:
    - Initialize `SchemaMigrator` to create table on plugin load
    - `execute()`: after tool execution, `await repo('mcp.audit_log').create({ companyId: context.companyId, tool_name, arguments, result, success, latency_ms, actor: context.actor })`
    - `getLog()`: `return repo('mcp.audit_log').find({ scope: { companyId }, orderBy: 'id', orderDirection: 'DESC', limit: 100 })`
- **Dependencies**: TASK-001 (for `requireTenant` in audit route)
- **Validation**:
  - Unit test: `execute()` writes to DB with correct companyId
  - Integration test: `GET /v1/mcp/audit` returns only tenant's entries
  - `pnpm lint:arch` passes
- **Completion**: Audit log in DB, scoped by tenant, in-memory log removed

### TASK-008: Harden `GET /v1/mcp/audit` — add auth + tenant-scoped DB query
- **Objective**: Enforce auth and tenant isolation on audit endpoint
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - Add `preHandler: [requireTenant]`
  - Replace `toolRegistry.getLog()` with `repo('mcp.audit_log').find({ scope: { companyId: tenant.companyId }, ... })`
  - Return same response shape: `{ audit: [...], total: N }`
- **Dependencies**: TASK-001, TASK-007
- **Validation**: Integration test — unauthenticated → 403; tenant A sees only tenant A logs
- **Completion**: Route uses DB, scoped, authenticated

---

## Phase 4: Agent Loop & Swarm Router Injection

### TASK-009: Modify `AgentLoop` to accept `SmartRouter` instance and pass `company_id`
- **Objective**: Fix agent loop route resolution to use tenant context
- **Files**: `packages/arsy-plugin-llm-gateway/src/agent/loop.ts`
- **Changes**:
  - Constructor: `constructor(private readonly router: SmartRouter) {}`
  - `resolveRoute(model: string, companyId: number)`: pass `companyId` to `this.router.resolveRoute(model, companyId)`
  - `executeStep()`: call `this.resolveRoute('dx-default', session.company_id)`
  - `executeStepWithCallbacks()`: same
  - Remove `new SmartRouter({})` instantiation in `resolveRoute()`
  - Update `runAgent()` and `streamAgent()` to pass router (or use singleton from index.ts)
- **Dependencies**: TASK-001 (for context), TASK-011 (for router injection)
- **Validation**: Unit test — `resolveRoute` called with correct companyId; integration test — agent runs with tenant context
- **Completion**: AgentLoop uses injected router, passes companyId

### TASK-010: Modify `SwarmCoordinator` to accept `SmartRouter` instance and pass `company_id`
- **Objective**: Fix swarm route resolution to use tenant context
- **Files**: `packages/arsy-plugin-llm-gateway/src/swarm/coordinator.ts`
- **Changes**:
  - Constructor: `constructor(private readonly router: SmartRouter) {}`
  - `askModel()`: call `this.router.resolveRoute('dx-default', mission.companyId)` instead of `new SmartRouter({})`
  - Remove local `SmartRouter` instantiation
- **Dependencies**: TASK-011 (for router injection)
- **Validation**: Unit test — `resolveRoute` called with mission.companyId; integration test — swarm runs with tenant context
- **Completion**: SwarmCoordinator uses injected router, passes companyId

### TASK-011: Update plugin registration to create shared router and inject into AgentLoop/SwarmCoordinator
- **Objective**: Wire up shared router instance for reuse and config caching
- **Files**: `packages/arsy-plugin-llm-gateway/src/index.ts`
- **Changes**:
  - After `await router.initialize()`, create:
    ```typescript
    const agentLoop = new AgentLoop(router);
    const swarmCoordinator = new SwarmCoordinator(router);
    ```
  - Update route handlers to use these instances:
    - `/v1/agent/run` → `agentLoop.createSession()` / `runAgent()`
    - `/v1/agent/stream` → `agentLoop.streamSessionEvents()`
    - `/v1/swarm/run` → `swarmCoordinator.run()`
    - `/v1/swarm/stream` → `swarmCoordinator.run()` with SSE callback
  - Remove `runAgent`/`streamAgent` imports from `agent/loop.ts` (or keep for SDK compatibility but route through instances)
- **Dependencies**: TASK-009, TASK-010
- **Validation**:
  - Integration test: agent run/stream works with tenant context
  - Integration test: swarm run/stream works with tenant context
  - Router config cache shared (verify TTL behavior)
- **Completion**: Shared router injected, agent/swarm use tenant-scoped routing

---

## Phase 5: Tool Registry Tenant Enforcement

### TASK-012: Enforce `companyId` validation in `ToolRegistry.execute()`
- **Objective**: Prevent tool execution without valid tenant context
- **Files**: `packages/arsy-plugin-llm-gateway/src/tools/index.ts`
- **Changes**:
  - In `execute(name, args, context)`: add guard `if (!context.companyId || context.companyId === 0) throw new Error('Tool execution requires valid companyId')`
  - Ensure all call sites pass `companyId` (chat completions, agent loop, swarm, MCP message)
- **Dependencies**: TASK-007 (audit migration)
- **Validation**: Unit test — `execute()` throws without companyId; integration test — tools fail gracefully with 403
- **Completion**: Tool execution requires and validates companyId

---

## Phase 6: Verification & Quality Gates

### TASK-013: Run full quality gate suite
- **Objective**: Ensure all architectural invariants pass
- **Files**: N/A (command execution)
- **Changes**: Run `pnpm docs:check lint:arch lint typecheck ui:test ui:contrast`
- **Dependencies**: All previous tasks
- **Validation**: All commands exit 0
- **Completion**: All quality gates green

### TASK-014: Cross-tenant isolation integration test suite
- **Objective**: Verify no data leaks between tenants
- **Files**: New test file(s) in `packages/arsy-plugin-llm-gateway/test/` or similar
- **Changes**:
  - Create two test tenants (companyId: 1, 2)
  - Seed providers, models, audit logs for each
  - Test each route: tenant 1 cannot see tenant 2's data
  - Test unauthenticated access → 401/403
- **Dependencies**: TASK-013
- **Validation**: All isolation tests pass
- **Completion**: Test suite exists, passes, covers all 7 fixed routes

### TASK-015: Raw SQL audit — confirm zero `dbEngine.query` in route handlers
- **Objective**: Verify no raw SQL escape hatches remain
- **Files**: N/A (grep audit)
- **Changes**: Run `grep -r "dbEngine\\.query" packages/arsy-plugin-llm-gateway/src --include="*.ts" | grep -v test | grep -v ".d.ts"`
- **Dependencies**: TASK-003, TASK-004
- **Validation**: Command returns empty (no matches in route handlers)
- **Completion**: Zero raw SQL in production route handlers

---

## Task Dependency Graph

```
TASK-001 (auth.ts)
    ├── TASK-002 (chat completions baseline)
    ├── TASK-003 (models route)
    ├── TASK-004 (providers route)
    ├── TASK-005 (embeddings route)
    ├── TASK-006 (MCP SSE)
    ├── TASK-007 (audit log DB) ← TASK-008 (audit route)
    ├── TASK-009 (AgentLoop) ← TASK-011 (plugin wiring)
    ├── TASK-010 (SwarmCoordinator) ← TASK-011 (plugin wiring)
    └── TASK-012 (ToolRegistry enforcement)

TASK-011 depends on: TASK-009, TASK-010

TASK-013 (quality gates) depends on: ALL previous
TASK-014 (isolation tests) depends on: TASK-013
TASK-015 (raw SQL audit) depends on: TASK-003, TASK-004
```

---

## Completion Criteria Summary

| Phase | Tasks | Success Signal |
|-------|-------|----------------|
| 1. Foundation | 001-002 | `auth.ts` exists, chat completions works with preHandler |
| 2. ORM Refactor | 003-005 | Models/providers/embeddings use ORM, `pnpm lint:arch` passes |
| 3. MCP Hardening | 006-008 | SSE + audit authenticated & scoped, audit in DB |
| 4. Agent/Swarm | 009-011 | Shared router injected, tenant context passed to `resolveRoute()` |
| 5. Tool Registry | 012 | `execute()` validates companyId, audit in DB |
| 6. Verification | 013-015 | All quality gates green, isolation tests pass, zero raw SQL |