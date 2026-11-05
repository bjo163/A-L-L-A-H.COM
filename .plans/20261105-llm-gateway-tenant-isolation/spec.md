---
status: proposed
audit_area: "LLM Gateway Tenant Isolation & API Validation"
selected_at: "2026-11-05"
monorepo: "rocksoul-dx"
---

# Executive Summary

**Selected Audit Area:** LLM Gateway Tenant Isolation & API Validation

This plan addresses critical security gaps in the `arsy-plugin-llm-gateway` Fastify plugin where multiple API routes fail to enforce the **default-deny authentication** and **tenant isolation** invariants mandated by `AGENTS.md`. The LLM gateway serves as the universal ingress for all AI operations (chat completions, embeddings, model catalog, MCP, agent loops, swarm orchestration, device control) across the entire A-L-L-A-H.COM platform. Seven confirmed vulnerabilities allow cross-tenant data exposure, unauthorized provider configuration access, and tenant-scoped operation bypass.

**Root Cause Pattern:** Routes use raw SQL (`dbEngine.query()`) or in-memory registries (`toolRegistry.getLog()`) that bypass the `@allah/arsy-orm` `QueryBuilder`'s mandatory `company_id` scope enforcement. The `tenantOf()` helper is inconsistently applied — some routes validate its return value, others proceed with `null` tenant.

**Impact:** Any authenticated user (or unauthenticated caller for public routes) can:
- Enumerate all tenants' LLM provider configurations (`/v1/gateway/providers`)
- Access all tenants' model catalogs (`GET /v1/models`)
- Read all tenants' MCP tool execution audit logs (`/v1/mcp/audit`)
- Establish MCP SSE streams without tenant binding (`/v1/mcp/sse`)
- Invoke embeddings without tenant verification (`/v1/embeddings`)
- Execute agent loops that resolve routes without tenant context (`agent/loop.ts`)

---

# Problem Statement

The `arsy-plugin-llm-gateway` plugin (`packages/arsy-plugin-llm-gateway/src/index.ts`) defines 15+ routes under `/v1/*`. Per `AGENTS.md` invariants:
- **Auth**: "Default-deny: every hub route needs a verified principal. Only an explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`) is anonymous."
- **Tenant**: "`company_id` on every row, derived from the principal and fail-closed — never taken from the request body."
- **SQL**: "Parameterized values only, plus a column/sort identifier allowlist. No raw string queries; no arbitrary-SQL tool on the public surface."
- **Audit**: "Every model insert/update/delete writes one append-only event in the same transaction; events store changed field names, not values."

**Confirmed violations:**
1. **Zero tenant scoping on provider catalog** — `GET /v1/gateway/providers` returns all providers across all tenants via raw SQL with no `WHERE company_id`
2. **Zero tenant scoping on model catalog** — `GET /v1/models` joins `ai_model` + `ai_provider` without filtering by tenant
3. **Zero tenant scoping on MCP audit log** — `GET /v1/mcp/audit` returns `toolRegistry.getLog()` with no tenant filter
4. **MCP SSE streams lack tenant binding** — `GET /v1/mcp/sse` creates anonymous session IDs
5. **Embeddings endpoint skips tenant check** — `POST /v1/embeddings` makes upstream calls before any tenant validation
6. **Inconsistent `tenantOf()` usage** — Some routes check for `null`, others don't
7. **Agent loop resolves routes without tenant context** — `agent/loop.ts` creates new `SmartRouter({})` instances and calls `resolveRoute('dx-default')` without passing `company_id`

---

# Repository Evidence

## File: `packages/arsy-plugin-llm-gateway/src/index.ts`

### Vulnerability 1: `/v1/gateway/providers` (Lines 634-643)
```typescript
fastify.get(`${prefix}/gateway/providers`, async () => {
  const res = await fastify.pg.query(
    'SELECT id, name, slug, provider_type, base_url, priority, is_healthy FROM ai_provider ORDER BY priority'
  );
  return ok(res.rows);
});
```
**Evidence:** Raw SQL with no `WHERE company_id`. No auth preHandler. No admin check. Returns all tenants' provider configs including `base_url`, `provider_type`, `priority`.

### Vulnerability 2: `GET /v1/models` (Lines 79-122)
```typescript
const models = (await dbEngine.query(
  'SELECT m.model_id, m.name, p.slug as provider_slug, p.name as provider_name FROM ai_model m JOIN ai_provider p ON m.provider_id = p.id WHERE p.is_healthy = true'
)) as Array<{ model_id: string; name: string; provider_slug: string; provider_name: string }>;
```
**Evidence:** Raw SQL joins `ai_model` + `ai_provider` with only `p.is_healthy = true` filter. No `company_id` predicate. Falls back to hardcoded models on error, masking the bug.

### Vulnerability 3: `/v1/mcp/audit` (Lines 416-423)
```typescript
fastify.get(`${prefix}/mcp/audit`, async () => {
  try {
    const log = toolRegistry.getLog();
    return ok({ audit: log, total: log.length });
  } catch (err: any) {
    return fail('MCP_AUDIT_ERROR', err.message);
  }
});
```
**Evidence:** `toolRegistry.getLog()` returns in-memory array with zero tenant scoping. No auth. No tenant check.

### Vulnerability 4: `/v1/mcp/sse` (Lines 368-390)
```typescript
fastify.get(`${prefix}/mcp/sse`, async (request, reply) => {
  const sessionId = `mcp_${crypto.randomBytes(8).toString('hex')}`;
  reply.raw.write(`event: endpoint\ndata: ${sessionId}\n\n`);
  // ... keep-alive interval
  return reply;
});
```
**Evidence:** Creates anonymous `sessionId` with no tenant identity. No `tenantOf(request)` call. No auth preHandler.

### Vulnerability 5: `/v1/embeddings` (Lines 125-164)
```typescript
fastify.post<{ Body: { model: string; input: string | string[]; encoding_format?: 'float' | 'base64' } }>(`${prefix}/embeddings`, async (request, reply) => {
  const body = request.body || ({} as any);
  const { model, input, encoding_format } = body;
  // ... directly tries GeminiAdapter then OpenAiAdapter
  // NO tenantOf() check before upstream calls
});
```
**Evidence:** Makes upstream API calls to Gemini/OpenAI before any tenant validation. `tenantOf()` never called.

### Vulnerability 6: `tenantOf()` helper inconsistency (Lines 67-72)
```typescript
const tenantOf = (request: FastifyRequest): number | null => {
  const principal = (request as any).principal;
  if (typeof principal?.companyId === 'number') return principal.companyId;
  const companyId = (request as any).user?.company_id;
  return typeof companyId === 'number' ? companyId : null;
};
```
**Evidence:** Returns `null` when no principal AND no `user.company_id`. Used in chat completions (validates), but NOT used in `/v1/models`, `/v1/gateway/providers`, `/v1/mcp/audit`, `/v1/mcp/sse`, `/v1/embeddings`.

### Vulnerability 7: Raw SQL bypasses ORM tenant enforcement
The `@allah/arsy-orm` `QueryBuilder.buildSelect()` (in `packages/arsy-orm/src/query_builder.ts:84-135`) enforces:
```typescript
private scopeClause(scope: TenantScope | undefined, params: unknown[]): string[] {
  if (scope === undefined) throw new TenantScopeRequiredError(this.model.name);
  if (isSystemScope(scope)) return [];
  params.push(tenantCompanyId(scope));
  return [`"company_id" = $${params.length}`];
}
```
But `dbEngine.query()` in index.ts bypasses this entirely.

## File: `packages/arsy-plugin-llm-gateway/src/agent/loop.ts`

### Vulnerability 8: Agent loop resolves routes without tenant context (Lines 108, 260, 487)
```typescript
const resolution = await this.resolveRoute('dx-default'); // L108, L260
// ...
private async resolveRoute(model: string): Promise<{ targetChain: Array<{ adapter: any; model: any }> }> {
  const router = new SmartRouter({}); // NEW instance each call, empty options
  return router.resolveRoute(model); // company_id NOT passed
}
```
**Evidence:** `AgentSession` has `company_id` (L26, L55) but it's never passed to `resolveRoute()`. `SmartRouter.resolveRoute()` defaults to platform tenant (company_id=0) only.

## File: `packages/arsy-plugin-llm-gateway/src/router.ts`

### Supporting Evidence: `resolveRoute()` scoping logic (Lines 127-145)
```typescript
const visibleCompanyIds = typeof companyId === 'number' && companyId !== 0 ? [0, companyId] : [0];
// ...
const routeRows = await this.repo<RouteRecord>('ai.route').find({
  scope: { systemScope: true },
  filters: [
    { field: 'company_id', operator: 'IN', value: visibleCompanyIds },
    { field: 'alias', operator: '=', value: requestedModelOrAlias },
  ],
  limit: 1,
});
```
**Evidence:** Router correctly scopes to `[0, companyId]` when `companyId` provided. But callers in `index.ts` and `agent/loop.ts` omit it.

---

# Confirmed Bugs

| ID | Route / Component | Bug Type | Severity | Evidence Location |
|----|-------------------|----------|----------|-------------------|
| BUG-001 | `GET /v1/gateway/providers` | Missing tenant scope, missing auth, raw SQL | Critical | index.ts:634-643 |
| BUG-002 | `GET /v1/models` | Missing tenant scope, raw SQL | Critical | index.ts:79-122 |
| BUG-003 | `GET /v1/mcp/audit` | Missing tenant scope, missing auth, in-memory registry | Critical | index.ts:416-423 |
| BUG-004 | `GET /v1/mcp/sse` | Missing tenant binding, missing auth | High | index.ts:368-390 |
| BUG-005 | `POST /v1/embeddings` | Missing tenant check before upstream calls | High | index.ts:125-164 |
| BUG-006 | `tenantOf()` inconsistent usage | Inconsistent validation | Medium | index.ts:67-72 (definition), multiple call sites |
| BUG-007 | Raw SQL bypasses ORM tenant enforcement | Architecture violation | Critical | index.ts: multiple `dbEngine.query()` calls |
| BUG-008 | Agent loop route resolution without tenant | Logic error, cross-tenant routing | High | agent/loop.ts:108, 260, 487 |

---

# Root Cause Analysis

**Primary Root Cause:** The LLM gateway plugin was developed incrementally without a unified security review against the `AGENTS.md` invariants. Routes were added with different patterns:
- Chat completions: Uses `tenantOf()` + virtual key auth + proper scoping ✓
- Models/Providers: Uses raw SQL for "performance" or "simplicity" ✗
- MCP endpoints: Uses in-memory registry + anonymous sessions ✗
- Embeddings: Forgot tenant check entirely ✗
- Agent loop: Creates isolated `SmartRouter` instances without context ✗

**Systemic Issues:**
1. **No centralized auth/tenant middleware** — Each route reimplements checks
2. **Raw SQL as escape hatch** — `dbEngine.query()` bypasses ORM guarantees
3. **In-memory global state** — `toolRegistry` singleton has no tenant awareness
4. **No route-level test coverage for tenant isolation** — Tests exist for SDK transport but not gateway route authorization

---

# Impact Assessment

| Dimension | Impact |
|-----------|--------|
| **Data Confidentiality** | Critical — All tenants' provider configs, model catalogs, MCP audit logs exposed |
| **Regulatory/Compliance** | Critical — Violates tenant isolation mandate; potential GDPR/PDPA breach |
| **Attack Surface** | High — Unauthenticated endpoints leak platform topology |
| **Operational Risk** | High — Agent loops may route to wrong tenant's models |
| **Reputation** | Critical — Core platform security invariant broken |

---

# Requirements

### Functional Requirements
- [ ] FR-001: All `/v1/*` routes in `arsy-plugin-llm-gateway` enforce default-deny authentication
- [ ] FR-002: All routes derive `company_id` from verified principal (never request body)
- [ ] FR-003: All database queries use `@allah/arsy-orm` `BaseRepository` with proper `scope`
- [ ] FR-004: `toolRegistry` audit log scoped to requesting tenant
- [ ] FR-005: MCP SSE streams bind to authenticated tenant session
- [ ] FR-006: Agent loop passes `company_id` to `SmartRouter.resolveRoute()`
- [ ] FR-007: Embeddings endpoint validates tenant before upstream calls

### Non-Functional Requirements
- [ ] NFR-001: Zero raw `dbEngine.query()` calls in route handlers (use ORM)
- [ ] NFR-002: All routes pass `pnpm lint:arch` (TENANT_ISOLATION, PARAMETERIZED_QUERIES checks)
- [ ] NFR-003: No regression in chat completions streaming/fallback behavior
- [ ] NFR-004: MCP protocol compliance maintained (SSE + message endpoints)

---

# Scope

## In Scope
- `packages/arsy-plugin-llm-gateway/src/index.ts` — All route handlers
- `packages/arsy-plugin-llm-gateway/src/agent/loop.ts` — Agent loop route resolution
- `packages/arsy-plugin-llm-gateway/src/swarm/coordinator.ts` — Swarm route resolution (verify)
- `packages/arsy-plugin-llm-gateway/src/tools/*` — Tool registry tenant scoping
- `packages/arsy-plugin-llm-gateway/src/mcp.ts` — MCP handler tenant context

## Out of Scope
- `packages/arsy-plugin-llm-gateway/src/router.ts` — Router logic is correct when called properly
- `packages/arsy-plugin-llm-gateway/src/adapters/*` — Provider adapters (no tenant logic)
- `packages/arsy-plugin-llm-gateway/src/device_control.ts` — Already uses `getCompanyContext()` correctly
- `packages/sdk/*` — Client SDK (consumes gateway, doesn't enforce)
- Other apps (`apps/arsy`, `apps/gate`, etc.) — They consume gateway via SDK

---

# Acceptance Criteria

| AC ID | Criterion | Verification |
|-------|-----------|--------------|
| AC-001 | `GET /v1/gateway/providers` returns 401 unauthenticated, 403 no tenant, 200 only requesting tenant's providers | Integration test + `pnpm lint:arch` |
| AC-002 | `GET /v1/models` returns only models visible to requesting tenant (platform + tenant) | Integration test |
| AC-003 | `GET /v1/mcp/audit` returns 401/403 appropriately, audit log filtered by tenant | Integration test |
| AC-004 | `GET /v1/mcp/sse` requires auth, binds session to tenant | Integration test |
| AC-005 | `POST /v1/embeddings` validates tenant before any upstream call | Integration test |
| AC-006 | Agent loop `resolveRoute()` receives and uses `company_id` | Unit test + integration test |
| AC-007 | Zero raw `dbEngine.query()` in route handlers | `grep -r "dbEngine\\.query" packages/arsy-plugin-llm-gateway/src --include="*.ts" | grep -v test` returns empty |
| AC-008 | All quality gates pass: `pnpm docs:check lint:arch lint typecheck ui:test ui:contrast` | CI pipeline |

---

# Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Tenant isolation violations | 0 | Architecture lint (`TENANT_ISOLATION` rule) |
| Raw SQL in route handlers | 0 | `grep` audit + `PARAMETERIZED_QUERIES` rule |
| Unauthenticated `/v1/*` routes | 0 (except explicit allowlist) | Integration test suite |
| Cross-tenant data leakage vectors | 0 | Manual penetration test + code review |
| Build gate pass rate | 100% | CI pipeline |

---

# Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing MCP client integrations | Medium | High | Maintain SSE protocol, add tenant header, version endpoint |
| Agent loop routing regression | Medium | Medium | Unit test `resolveRoute(companyId)` with mocked router |
| Performance degradation from ORM overhead | Low | Low | ORM uses prepared statements; config caching in router |
| Swarm coordinator same bug | Low | Medium | Verify `coordinator.ts` uses proper tenant context (preliminary check: it creates `SmartRouter({})` but passes `mission.companyId` to tool registry, not to router) |
| Tool registry in-memory log architecture | Medium | Medium | Migrate audit log to DB table with `company_id` column |