---
status: proposed
audit_area: "LLM Gateway Tenant Isolation & API Validation"
---

# Architecture Overview

## Current Architecture (Problematic)

```
┌─────────────────────────────────────────────────────────────────┐
│                    arsy-plugin-llm-gateway                      │
├─────────────────────────────────────────────────────────────────┤
│  Fastify Plugin (index.ts)                                      │
│  ├── /v1/chat/completions     ← ✓ tenantOf() + virtual key     │
│  ├── /v1/models               ← ✗ raw SQL, no tenant           │
│  ├── /v1/embeddings           ← ✗ no tenant check              │
│  ├── /v1/gateway/providers    ← ✗ raw SQL, no auth             │
│  ├── /v1/gateway/telemetry    ← ✓ tenantOf() + param query     │
│  ├── /v1/gateway/usage        ← ✓ tenantOf() + param query     │
│  ├── /v1/mcp/sse              ← ✗ no auth, anonymous session   │
│  ├── /v1/mcp/message          ← ✓ tenantOf()                   │
│  ├── /v1/mcp/audit            ← ✗ in-memory, no tenant         │
│  ├── /v1/agent/run            ← ✓ tenantOf()                   │
│  ├── /v1/agent/stream         ← ✓ tenantOf()                   │
│  ├── /v1/swarm/run            ← ✓ tenantOf()                   │
│  ├── /v1/swarm/stream         ← ✓ tenantOf()                   │
│  └── /agent/* (device_control)← ✓ getCompanyContext()          │
├─────────────────────────────────────────────────────────────────┤
│  SmartRouter (router.ts)                                        │
│  ├── resolveRoute(model, companyId?)  ← Correct when called    │
│  ├── executeWithFallback()          ← Uses adapters             │
│  └── config cache (TTL)             ← Per-tenant key           │
├─────────────────────────────────────────────────────────────────┤
│  Agent Loop (agent/loop.ts)                                     │
│  ├── AgentLoop class                ← In-memory sessions       │
│  ├── resolveRoute('dx-default')     ← ✗ NO company_id passed   │
│  └── SmartRouter({}) new each call  ← Loses config cache       │
├─────────────────────────────────────────────────────────────────┤
│  Swarm Coordinator (swarm/coordinator.ts)                       │
│  ├── SmartRouter({}) new each call  ← Same issue               │
│  └── toolRegistry.execute(companyId)← ✓ passes companyId       │
├─────────────────────────────────────────────────────────────────┤
│  Tool Registry (tools/index.ts)                                 │
│  ├── In-memory Map<string, Tool>    ← No tenant awareness      │
│  ├── getLog() returns ALL logs      ← Cross-tenant leak        │
│  └── execute() accepts companyId    ← But not enforced         │
└─────────────────────────────────────────────────────────────────┘
```

## Target Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    arsy-plugin-llm-gateway                      │
├─────────────────────────────────────────────────────────────────┤
│  Fastify Plugin (index.ts)                                      │
│  ├── Auth PreHandler (shared)           ← NEW: centralized     │
│  │   ├── verifyPrincipal(request)      ← From @allah/arsy-core │
│  │   ├── deriveTenant(principal)       ← Fail-closed           │
│  │   └── attachTenant(request)         ← request.tenant = n    │
│  ├── Route Handlers (all use ORM)      ← REFACTOR: no raw SQL  │
│  │   ├── /v1/models      → repo.find({scope:{companyId:t}})   │
│  │   ├── /v1/providers   → repo.find({scope:{companyId:t}})   │
│  │   ├── /v1/embeddings  → validate tenant → adapter call     │
│  │   └── ...                                                        │
│  ├── MCP SSE Handler                   ← REFACTOR: bind tenant │
│  │   ├── auth preHandler               ← Reuse shared          │
│  │   └── sessionMap: tenantId → sessions                         │
│  └── MCP Audit Handler                 ← REFACTOR: DB-backed   │
│      └── repo('mcp.audit').find({scope:{companyId:t}})         │
├─────────────────────────────────────────────────────────────────┤
│  SmartRouter (router.ts) — UNCHANGED (correct when called)      │
├─────────────────────────────────────────────────────────────────┤
│  Agent Loop (agent/loop.ts)                                     │
│  ├── AgentLoop class                                        │
│  ├── resolveRoute(model, companyId)  ← PASS company_id        │
│  └── Reuse router instance              ← Inject SmartRouter  │
├─────────────────────────────────────────────────────────────────┤
│  Swarm Coordinator (swarm/coordinator.ts)                       │
│  ├── resolveRoute(model, companyId)  ← PASS company_id        │
│  └── Reuse router instance              ← Inject SmartRouter  │
├─────────────────────────────────────────────────────────────────┤
│  Tool Registry (tools/index.ts)                                 │
│  ├── execute(companyId) enforced       ← Validate tenant      │
│  └── Audit log → DB table mcp_audit    ← Migrate from memory  │
└─────────────────────────────────────────────────────────────────┘
```

---

# Remediation Strategy

## Phase 1: Centralized Auth & Tenant Middleware (Foundation)

**Create** `packages/arsy-plugin-llm-gateway/src/auth.ts`:
```typescript
// Shared preHandler for all /v1/* routes
export async function requireTenant(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ companyId: number } | undefined> {
  const principal = (request as any).principal;
  const companyId = principal?.companyId ?? (request as any).user?.company_id;
  if (typeof companyId !== 'number' || companyId === 0) {
    reply.status(403).send(fail('TENANT_REQUIRED', 'Verified tenant required'));
    return undefined;
  }
  return { companyId };
}

// Optional: allow platform routes (company_id = 0) for superadmin
export async function requireTenantOrPlatform(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<{ companyId: number; isPlatform: boolean } | undefined> { ... }
```

**Apply** to all routes in `index.ts` via `preHandler: [requireTenant]`.

## Phase 2: Replace Raw SQL with ORM Repositories

**Models Route** (`GET /v1/models`):
```typescript
// BEFORE: dbEngine.query('SELECT ... JOIN ... WHERE p.is_healthy = true')
// AFTER:
const modelRepo = getRepository<ModelRecord>('ai.model');
const providerRepo = getRepository<ProviderRecord>('ai.provider');
const providers = await providerRepo.find({
  scope: { companyId: tenant.companyId },
  filters: [{ field: 'is_healthy', operator: '=', value: true }],
});
const models = await modelRepo.find({
  scope: { companyId: tenant.companyId },
  filters: [{ field: 'provider_id', operator: 'IN', value: providers.map(p => p.id) }],
});
```

**Providers Route** (`GET /v1/gateway/providers`):
```typescript
// BEFORE: dbEngine.query('SELECT ... FROM ai_provider ORDER BY priority')
// AFTER:
const providerRepo = getRepository<ProviderRecord>('ai.provider');
const providers = await providerRepo.find({
  scope: { companyId: tenant.companyId },
  orderBy: 'priority',
});
```

## Phase 3: MCP Endpoints Hardening

### 3a: MCP SSE (`GET /v1/mcp/sse`)
- Add `preHandler: [requireTenant]`
- Store active sessions in `Map<number, Set<Session>>` keyed by `companyId`
- Include `companyId` in session metadata
- On disconnect, clean up from tenant's session set

### 3b: MCP Audit (`GET /v1/mcp/audit`)
- **Migrate** in-memory `toolRegistry.log` to database table `mcp_audit_log`:
  ```sql
  CREATE TABLE mcp_audit_log (
    id BIGSERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    tool_name VARCHAR(255) NOT NULL,
    arguments JSONB NOT NULL,
    result JSONB,
    success BOOLEAN NOT NULL,
    latency_ms INTEGER,
    actor VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX ON mcp_audit_log (company_id, created_at DESC);
  ```
- Register model in `tools/index.ts` or `agent_devices.ts` pattern
- Route uses `repo('mcp.audit_log').find({ scope: { companyId: tenant.companyId } })`

### 3c: MCP Message (`POST /v1/mcp/message`) — Already has `tenantOf()`, verify it uses `requireTenant`

## Phase 4: Embeddings Endpoint

```typescript
fastify.post(`${prefix}/embeddings`, { preHandler: [requireTenant] }, async (request, reply) => {
  const tenant = await requireTenant(request, reply);
  if (!tenant) return;
  // ... existing adapter logic
});
```

## Phase 5: Agent Loop & Swarm Router Injection

### 5a: Agent Loop (`agent/loop.ts`)
```typescript
// Constructor accepts router instance
constructor(private readonly router: SmartRouter) {}

// resolveRoute passes company_id
private async resolveRoute(model: string, companyId: number): Promise<...> {
  return this.router.resolveRoute(model, companyId);
}

// In executeStep:
const resolution = await this.resolveRoute('dx-default', session.company_id);
```

### 5b: Swarm Coordinator (`swarm/coordinator.ts`)
```typescript
constructor(private readonly router: SmartRouter) {}

private async askModel(...) {
  const resolution = await this.router.resolveRoute('dx-default', mission.companyId);
  // ...
}
```

### 5c: Plugin Registration (`index.ts`)
```typescript
// Create shared router instance
const router = new SmartRouter(options);
await router.initialize();

// Pass to agent loop & swarm
const agentLoop = new AgentLoop(router);
const swarmCoordinator = new SwarmCoordinator(router);
```

## Phase 6: Tool Registry Tenant Enforcement

```typescript
// tools/index.ts
execute(name: string, args: unknown, context: { companyId: number; actor: string }): ToolResult {
  if (!context.companyId || context.companyId === 0) {
    throw new Error('Tool execution requires valid companyId');
  }
  // ... existing logic
  // Audit to DB instead of memory
  await this.auditToDB({ companyId: context.companyId, ... });
}
```

---

# Proposed Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/auth.ts` | **NEW** | Centralized auth/tenant preHandlers |
| `src/index.ts` | **REFACTOR** | All routes: add `preHandler: [requireTenant]`, replace raw SQL with ORM repos |
| `src/agent/loop.ts` | **REFACTOR** | Inject `SmartRouter`, pass `company_id` to `resolveRoute()` |
| `src/swarm/coordinator.ts` | **REFACTOR** | Inject `SmartRouter`, pass `company_id` to `resolveRoute()` |
| `src/tools/index.ts` | **REFACTOR** | Enforce `companyId` in `execute()`, migrate audit log to DB |
| `src/mcp.ts` | **REFACTOR** | Ensure `handle()` uses tenant from context |
| `src/agent_devices.ts` | **EXTEND** | Add `mcp_audit_log` model registration |
| `src/types.ts` | **EXTEND** | Add `McpAuditLogRecord` type |

---

# Testing Strategy

## Unit Tests (New)

| Test | Target | Assertion |
|------|--------|-----------|
| `requireTenant` rejects unauthenticated | `auth.ts` | 403 response, `TENANT_REQUIRED` |
| `requireTenant` extracts companyId from principal | `auth.ts` | Returns `{ companyId: 42 }` |
| Model repo query includes company_id scope | `index.ts` models route | SQL contains `"company_id" = $1` |
| Provider repo query includes company_id scope | `index.ts` providers route | SQL contains `"company_id" = $1` |
| AgentLoop.resolveRoute passes company_id | `agent/loop.ts` | Calls `router.resolveRoute(model, 42)` |
| SwarmCoordinator.resolveRoute passes company_id | `swarm/coordinator.ts` | Calls `router.resolveRoute(model, 42)` |
| ToolRegistry.execute throws without companyId | `tools/index.ts` | Throws `Error('Tool execution requires valid companyId')` |

## Integration Tests (New)

| Test | Scenario | Expected |
|------|----------|----------|
| `GET /v1/models` unauthenticated | No cookies/headers | 401/403 |
| `GET /v1/models` tenant A | Auth as tenant A | Only tenant A + platform models |
| `GET /v1/models` tenant B | Auth as tenant B | Only tenant B + platform models |
| `GET /v1/gateway/providers` tenant A | Auth as tenant A | Only tenant A providers |
| `POST /v1/embeddings` no tenant | No auth | 403 before upstream call |
| `GET /v1/mcp/audit` tenant A | Auth as tenant A | Only tenant A audit entries |
| `GET /v1/mcp/sse` tenant A | Auth as tenant A | SSE stream, session bound to tenant A |
| Agent loop runs with tenant context | Create session with companyId=5 | Route resolves with companyId=5 |
| Swarm run with tenant context | Run with companyId=7 | All router calls include companyId=7 |

## Regression Tests (Existing)

- Chat completions streaming + fallback still works
- Device control endpoints unchanged (already correct)
- Virtual key authentication flow unchanged
- MCP message endpoint (JSON-RPC) still works
- Usage/telemetry endpoints still work

---

# Backward Compatibility

## Breaking Changes (Intentional)

1. **`GET /v1/gateway/providers`** — Was public, now requires auth + tenant. **Justification:** Was leaking all tenants' provider configs (critical security bug).
2. **`GET /v1/models`** — Was public, now requires auth + tenant. **Justification:** Was leaking all tenants' models.
3. **`GET /v1/mcp/audit`** — Was public, now requires auth + tenant. **Justification:** Was leaking all tenants' tool executions.
4. **`GET /v1/mcp/sse`** — Was anonymous, now requires auth + tenant. **Justification:** Anonymous SSE streams violate default-deny.
5. **`POST /v1/embeddings`** — Was no tenant check, now requires tenant. **Justification:** Upstream calls without tenant violate fail-closed.

## Non-Breaking (Preserved)

- Chat completions (streaming + non-streaming) — Same API, same behavior
- Virtual key auth (`x-virtual-key` header) — Still works, now also enforces tenant
- Device control (`/agent/*`) — Unchanged, already correct
- Usage/telemetry — Unchanged, already correct
- MCP message (JSON-RPC) — Unchanged, already has tenantOf()

## Migration Path for Consumers

| Consumer | Action Required |
|----------|-----------------|
| Internal apps (`apps/gate`, `apps/dock`, etc.) | Use `@allah/sdk` — already sends cookies/credentials |
| External MCP clients | Add authentication (Bearer token or cookies) before connecting to SSE |
| Embeddings API callers | Include auth credentials (handled by SDK) |
| Agent/Swarm SDK callers | No change — `company_id` passed in request body |

---

# Migration Plan

## Step 1: Database Migration (if needed)
- Add `mcp_audit_log` table via `SchemaMigrator` in `tools/index.ts` initialization
- Run `pnpm --filter @allah/arsy-plugin-llm-gateway db:migrate` (or equivalent)

## Step 2: Deploy Auth Middleware
- Create `src/auth.ts`
- Add `requireTenant` to all routes in `index.ts` (one route at a time, verify)

## Step 3: Refactor Routes to ORM
- Models route → ORM
- Providers route → ORM
- Embeddings route → add preHandler
- MCP audit → DB-backed
- MCP SSE → add preHandler + session binding

## Step 4: Fix Agent Loop & Swarm
- Modify constructors to accept `SmartRouter`
- Update `index.ts` plugin to inject shared router
- Pass `company_id` in all `resolveRoute()` calls

## Step 5: Tool Registry Migration
- Add `companyId` validation in `execute()`
- Migrate audit log to DB
- Update `getLog()` to query DB with tenant scope

## Step 6: Verification
- Run full test suite: `pnpm test`
- Run quality gates: `pnpm lint:arch lint typecheck ui:test ui:contrast`
- Manual penetration test: verify no unauthenticated `/v1/*` access
- Cross-tenant isolation test: tenant A cannot see tenant B's data

---

# Rollback Plan

If critical regression:
1. Revert `index.ts` to previous commit (routes work but insecure)
2. Keep `auth.ts` for future re-application
3. Hotfix specific route causing regression
4. Re-apply incrementally with more testing