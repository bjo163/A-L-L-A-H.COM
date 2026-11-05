---
status: proposed
audit_area: "LLM Gateway Tenant Isolation & API Validation"
---

# Mandatory Guidelines & Invariants

This document establishes non-negotiable rules for the LLM Gateway tenant isolation remediation. All implementation must comply. Violations block merge.

---

## 1. Architectural Invariants (from AGENTS.md)

### 1.1 Default-Deny Authentication
> **Rule**: Every hub route needs a verified principal. Only explicit public allowlist (`/health`, `/ready`, onboarding, non-prod `/docs`) is anonymous.
- **Enforcement**: All `/v1/*` routes in `arsy-plugin-llm-gateway` MUST have `preHandler: [requireTenant]` or `preHandler: [requireTenantOrPlatform]`
- **No exceptions** for "internal" or "debug" routes

### 1.2 Tenant Isolation (Fail-Closed)
> **Rule**: `company_id` on every row, derived from the principal and fail-closed — never taken from the request body.
- **Enforcement**:
  - `requireTenant` derives `companyId` ONLY from `request.principal?.companyId` or `request.user?.company_id`
  - Route handlers MUST NOT read `company_id` from `request.body`, `request.query`, or `request.params`
  - If derivation fails → 403 `TENANT_REQUIRED`

### 1.3 Parameterized Queries Only
> **Rule**: Parameterized values only, plus a column/sort identifier allowlist. No raw string queries; no arbitrary-SQL tool on the public surface.
- **Enforcement**:
  - **ZERO** `dbEngine.query()`, `dbEngine.execute()`, or raw SQL in route handlers
  - All database access via `@allah/arsy-orm` `BaseRepository` methods: `find()`, `findById()`, `create()`, `updateById()`, `delete()`
  - `QueryBuilder` validates column names against model definition (`assertColumn`)
  - `SUPPORTED_OPERATORS` whitelist prevents operator injection

### 1.4 Audit Integrity
> **Rule**: Every model insert/update/delete writes one append-only event in the same transaction; events store changed field names, not values.
- **Enforcement**:
  - Tool registry audit log migrated to `mcp_audit_log` table with `company_id`
  - `BaseRepository` audit context via `SET LOCAL` GUCs (already implemented)
  - No in-memory audit logs for production data

### 1.5 UI Purity (Not directly applicable but enforced)
- No raw HTML elements in gateway plugin (it's a backend plugin)
- SDK client uses `@moonwitness/ui` components

---

## 2. TypeScript Safety Rules

### 2.1 Strict Mode Compliance
- All new files: `"strict": true` in tsconfig (inherited from package)
- **No** `any` types in route handlers — use proper types from `./types.ts`
- **No** `as any` casts to bypass type checks
- **No** `// @ts-ignore` or `// @ts-expect-error` without justification comment

### 2.2 Request/Response Typing
```typescript
// CORRECT: Use Fastify's generics
fastify.post<{ Body: EmbeddingsRequest; Reply: EmbeddingsResponse }>(
  `${prefix}/embeddings`,
  { preHandler: [requireTenant] },
  async (request, reply) => { ... }
)

// WRONG: No generics, implicit any
fastify.post(`${prefix}/embeddings`, async (request, reply) => { ... })
```

### 2.3 Tenant Context Typing
```typescript
// Extend FastifyRequest in auth.ts
declare module 'fastify' {
  interface FastifyRequest {
    tenant?: { companyId: number; isPlatform?: boolean };
  }
}

// In requireTenant:
request.tenant = { companyId };
// Route handlers access: const { companyId } = request.tenant!;
```

### 2.4 Repository Return Types
```typescript
// CORRECT: Explicit generic
const providers = await providerRepo.find<ProviderRecord>({
  scope: { companyId },
  // ...
});

// WRONG: Implicit any[]
const providers = await providerRepo.find({ ... });
```

---

## 3. API Validation Rules

### 3.1 Request Validation
- **All** body/query/params validated before business logic
- Use explicit type guards (see `device_control.ts:isRecord`, `parseId`)
- **No** `request.body as MyType` — validate then narrow

```typescript
// CORRECT
const body = request.body as unknown;
if (!isRecord(body) || typeof body.model !== 'string') {
  reply.status(400).send(fail('VALIDATION_ERROR', 'model is required'));
  return;
}
const { model } = body;

// WRONG
const { model } = request.body as { model: string };
```

### 3.2 Response Shape Consistency
- Success: `ok(data)` → `{ success: true, data }`
- Error: `fail(code, message)` → `{ success: false, error: { code, message } }`
- **Never** throw in route handlers — use `reply.status(xxx).send(fail(...))` and `return`

### 3.3 Streaming Endpoints (SSE)
- Set headers: `Content-Type: text/event-stream; charset=utf-8`, `Cache-Control: no-cache`, `Connection: keep-alive`, `X-Accel-Buffering: no`
- Write format: `event: <name>\ndata: <json>\n\n`
- End with: `data: [DONE]\n\n` (for OpenAI-compatible) or just `reply.raw.end()`
- Clean up intervals/listeners on `request.raw.on('close')` and `request.raw.on('error')`

---

## 4. Build Gates (Must Pass)

### 4.1 Pre-Commit Gates (Local)
```bash
pnpm docs:check      # 100/100 required
pnpm lint:arch       # Architecture invariants
pnpm lint            # ESLint, --max-warnings 0
pnpm typecheck       # TS strict in packages/ui, dock, headquarter, id, jizz, gate
pnpm ui:contrast     # WCAG ratios for every skin's token pairs
```

### 4.2 Pre-Push Gates (CI)
```bash
# All above PLUS:
pnpm ui:test         # Design system component and skin contracts
pnpm dock:build
pnpm headquarter:build
pnpm id:build
pnpm jizz:build
pnpm gate:build
pnpm --filter @allah/arsy build
```

### 4.3 Architecture Lint Specific Rules (packages/lint/src/check-architecture.mjs)
**Must pass without modification:**
- `UI_PURITY` — Raw HTML elements only in packages/ui
- `TENANT_ISOLATION` — defineModel has company_id; raw SELECT on tenant tables has predicate
- `PARAMETERIZED_QUERIES` — No string interpolation in `.query()`/.execute()` template literals
- `UNIVERSAL_SDK_CLIENT` — Browser fetch through @allah/sdk or same-origin route handler
- `SHARED_DATA_CONTRACTS` — No local redefinition of shared type interfaces
- `PALETTE_PURITY` — App JSX never paints with Tailwind palette hue
- `ICON_PURITY` — Third-party icons only via packages/ui/src/components/icon.tsx
- `STYLE_PURITY` — packages/ui/src/theme.css maps Tailwind onto skin tokens
- `NO_PUBLIC_CLIENT_SECRETS` — No 'use client' file reads NEXT_PUBLIC_* secrets
- `STATE_PARITY` — Every app ships error.tsx, loading.tsx, not-found.tsx from StatePanel
- `LANDMARK_PURITY` — Skip-link id="main-content" belongs to RouteShell

---

## 5. Package Boundaries

### 5.1 Import Rules
| From | May Import | May NOT Import |
|------|------------|----------------|
| `arsy-plugin-llm-gateway` | `@allah/arsy-core`, `@allah/arsy-orm`, `@moonwitness/types`, `fastify`, `fp` | `@moonwitness/ui`, `@allah/sdk`, any `apps/*` |
| `arsy-plugin-llm-gateway` internal | Relative imports within `src/` | Parent directory `../` escapes |

### 5.2 Forbidden Patterns
- **No** `import { something } from '@allah/arsy-orm/src/...'` — use package entry points
- **No** `require()` — ESM only
- **No** circular dependencies (enforced by `pnpm lint:arch`)

---

## 6. Error Handling Standards

### 6.1 Error Codes (Use Existing)
| Code | HTTP | Usage |
|------|------|-------|
| `VALIDATION_ERROR` | 400 | Bad request body/query/params |
| `UNAUTHORIZED` | 401 | Missing/invalid authentication |
| `TENANT_REQUIRED` | 403 | No verified tenant (fail-closed) |
| `FORBIDDEN` | 403 | Authenticated but insufficient scope |
| `NOT_FOUND` | 404 | Resource not found in tenant |
| `CONFLICT` | 409 | Optimistic lock failure, state conflict |
| `RATE_LIMITED` | 429 | Virtual key rate limit exceeded |
| `GATEWAY_FALLBACK_EXHAUSTED` | 502 | All upstream providers failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error (log with context) |

### 6.2 Logging
- Use `@allah/arsy-core` `logger` (structured, JSON)
- **Always** include `{ companyId, route, userId }` when available
- **Never** log secrets, tokens, full request bodies
- Error logs: `logger.error({ err, companyId, route }, 'Descriptive message')`

---

## 7. Security Rules

### 7.1 SSRF Protection (Already in `ssrf.ts`)
- All upstream HTTP calls (embeddings, chat completions) go through `fetchWithSsrfGuard()`
- **Never** call `fetch()` directly with user-controlled URLs
- Validate `base_url` before request AND re-check resolved IP

### 7.2 Secret Handling
- **No** secrets in code, logs, error messages, or client responses
- Provider API keys stored encrypted in `ai.provider.encrypted_api_key`
- Decrypt via `decryptSecret()` only in `SmartRouter.getAdapter()` — never in route handlers
- Virtual keys: prefix stored, hash stored, full key **never** logged

### 7.3 Rate Limiting
- Virtual key rate limits enforced in `UsageManager.validateVirtualKey()`
- Per-tenant daily budget (roadmap F1) enforced in chat completions route
- **Do not** add ad-hoc rate limits — use existing infrastructure

### 7.4 Input Sanitization
- Tool arguments validated against JSON Schema (`tool.inputSchema`)
- MCP JSON-RPC params validated in `mcpHandler.handle()`
- **No** `eval()`, `Function()`, or dynamic code execution

---

## 8. Testing Requirements

### 8.1 Unit Test Coverage
- **All** new public functions in `auth.ts`, `tools/index.ts`, `agent/loop.ts`, `swarm/coordinator.ts`
- Mock external dependencies (router, adapters, repos)
- Test error paths (missing tenant, invalid input, DB errors)

### 8.2 Integration Test Coverage
- **Each fixed route** (7 routes): unauthenticated, tenant A, tenant B, platform (where applicable)
- Cross-tenant data isolation: seed data for 2+ tenants, verify scoping
- Streaming endpoints: SSE connection, events, cleanup on disconnect

### 8.3 Test Patterns
```typescript
// Use node:test (not Jest)
import { test } from 'node:test';
import assert from 'node:assert/strict';

// Mock Fastify
const fastify = {
  pg: { query: async () => ({ rows: [] }) },
  // ...
};

// Test auth preHandler
test('requireTenant rejects missing principal', async () => {
  const reply = { status: (c) => ({ send: (p) => { /* assert */ } }) };
  const request = { principal: null, user: null };
  const result = await requireTenant(request, reply);
  assert.equal(result, undefined);
  // assert reply.status(403) called
});
```

---

## 9. Prohibited Shortcuts (Anti-Patterns)

| Shortcut | Why Prohibited | Correct Approach |
|----------|----------------|------------------|
| `dbEngine.query('SELECT * FROM ...')` | Bypasses tenant scope, SQL injection risk | `repo.find({ scope: { companyId } })` |
| `request.body as MyType` | No validation, runtime crashes | Type guard + narrow |
| `tenantOf(request)` inline in route | Inconsistent, forgettable | `preHandler: [requireTenant]` |
| `new SmartRouter({})` in hot path | Loses config cache, no tenant context | Inject shared router instance |
| In-memory global state (`toolRegistry.log`) | Cross-tenant leak, not durable | DB table with `company_id` |
| `console.log()` / `console.error()` | Not structured, not aggregated | `logger.info()/error()` |
| `try { ... } catch { throw err }` in routes | Loses Fastify error handling | `reply.status(xxx).send(fail(...))` |
| Adding route without `preHandler` | Violates default-deny | Every route: `preHandler: [requireTenant]` |
| Skipping `pnpm lint:arch` locally | CI will fail, wastes time | Run before commit |
| Modifying `check-architecture.mjs` to pass | Weakens invariant | Fix code, not linter |

---

## 10. Agent Execution Boundaries

### 10.1 What Agents MAY Do
- Create new files per task specification
- Edit existing files to implement task changes
- Run tests, lint, typecheck, build commands
- Read files for context
- Run grep/glob searches

### 10.2 What Agents MUST NOT Do
- **Modify** `packages/lint/src/check-architecture.mjs` (architecture rules)
- **Modify** `package.json` scripts or dependencies without explicit task
- **Modify** `tsconfig.json` or `tailwind.config.*` without explicit task
- **Disable** any quality gate (`// eslint-disable`, `// @ts-ignore`, skip tests)
- **Commit** changes (user handles git)
- **Push** to remote (user handles deploy)
- **Create** PRs (user handles)
- **Assume** undocumented behavior — if not in code/docs, ask

### 10.3 Verification Before Completion
For each task, agent MUST verify:
1. `pnpm typecheck` passes (no TS errors)
2. `pnpm lint` passes (no ESLint warnings/errors)
3. `pnpm lint:arch` passes (architecture invariants)
4. Related tests pass (unit + integration)
5. No raw SQL in modified route handlers (`grep` audit)
6. No new `any` types introduced

---

## 11. Migration Safety Rules

### 11.1 Database Changes
- All schema changes via `SchemaMigrator` in plugin initialization
- **No** raw `ALTER TABLE` in route handlers
- Backward-compatible: add columns nullable, no destructive changes

### 11.2 Route Changes
- Breaking changes (auth requirement) are **intentional** for security bugs
- Document in `spec.md` Acceptance Criteria
- No silent behavior changes — if response shape changes, it's a bug

### 11.3 Rollback Triggers
If any quality gate fails after changes:
1. Revert only the failing task's changes
2. Do not revert unrelated tasks
3. Re-apply incrementally with more testing

---

## 12. Sign-Off Requirements

Before marking any task complete, the implementation must have:
- [ ] All 4 quality gates pass locally (`docs:check`, `lint:arch`, `lint`, `typecheck`)
- [ ] Task-specific tests written and passing
- [ ] No `grep` violations (raw SQL, `any` types, missing preHandlers)
- [ ] Architecture lint rules pass (especially `TENANT_ISOLATION`, `PARAMETERIZED_QUERIES`)
- [ ] Code follows existing patterns in `device_control.ts` (gold standard for tenant-scoped routes)