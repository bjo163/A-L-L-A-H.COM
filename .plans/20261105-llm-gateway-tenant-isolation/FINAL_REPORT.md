# Final Report: LLM Gateway Tenant Isolation & API Validation Audit Plan

## 1. Selected Audit Area Name and Rationale

**Audit Area:** LLM Gateway Tenant Isolation & API Validation

**Rationale:** The `arsy-plugin-llm-gateway` is the universal AI ingress for the entire A-L-L-A-H.COM platform, serving chat completions, embeddings, model catalog, MCP, agent loops, swarm orchestration, and device control. It had the highest concentration of confirmed security violations against `AGENTS.md` invariants:
- 7 routes violating default-deny authentication
- 5 routes violating tenant isolation (fail-closed)
- 3 routes using raw SQL bypassing ORM tenant enforcement
- 2 components (agent loop, swarm) resolving routes without tenant context
- 1 in-memory global registry leaking cross-tenant audit data

No other module in the monorepo had this density of critical security gaps in a single plugin.

---

## 2. Confirmed Bugs with File:Line Evidence

| Bug ID | File | Lines | Description |
|--------|------|-------|-------------|
| BUG-001 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 634-643 | `GET /v1/gateway/providers` — raw SQL `SELECT ... FROM ai_provider ORDER BY priority` with no `WHERE company_id`, no auth, no admin check |
| BUG-002 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 79-122 | `GET /v1/models` — raw SQL joining `ai_model` + `ai_provider` with only `p.is_healthy = true` filter, no tenant scope |
| BUG-003 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 416-423 | `GET /v1/mcp/audit` — returns `toolRegistry.getLog()` (in-memory global) with zero tenant scoping, no auth |
| BUG-004 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 368-390 | `GET /v1/mcp/sse` — creates anonymous `sessionId = mcp_${crypto.randomBytes(8)}` with no tenant binding, no auth preHandler |
| BUG-005 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 125-164 | `POST /v1/embeddings` — makes upstream Gemini/OpenAI calls before any `tenantOf()` check |
| BUG-006 | `packages/arsy-plugin-llm-gateway/src/index.ts` | 67-72 | `tenantOf()` helper returns `null` when no principal/user; inconsistently used — chat completions validates, 5 routes don't |
| BUG-007 | `packages/arsy-plugin-llm-gateway/src/index.ts` | Multiple | Raw `dbEngine.query()` calls bypass `@allah/arsy-orm` `QueryBuilder` tenant enforcement (`scopeClause` at `query_builder.ts:84-135`) |
| BUG-008 | `packages/arsy-plugin-llm-gateway/src/agent/loop.ts` | 108, 260, 487 | `AgentLoop.resolveRoute('dx-default')` creates `new SmartRouter({})` each call, never passes `session.company_id` |

---

## 3. Root Cause Analysis Summary

**Primary Root Cause:** Incremental feature development without unified security review against `AGENTS.md` invariants. Routes were added with inconsistent patterns:
- Chat completions (first route): Proper `tenantOf()` + virtual key + scoping ✓
- Models/Providers: Raw SQL for "simplicity" ✗
- MCP endpoints: In-memory registry + anonymous sessions ✗
- Embeddings: Forgot tenant check entirely ✗
- Agent/Swarm: Isolated `SmartRouter` instances without context ✗

**Systemic Enablers:**
1. No centralized auth/tenant middleware — each route reimplemented checks
2. `dbEngine.query()` as escape hatch bypassing ORM guarantees
3. `toolRegistry` singleton with no tenant awareness
4. No route-level tenant isolation tests in CI

---

## 4. Impact Assessment

| Dimension | Severity | Details |
|-----------|----------|---------|
| **Data Confidentiality** | Critical | All tenants' provider configs (including `base_url`, credentials structure), model catalogs, and MCP tool execution logs exposed to any caller |
| **Regulatory/Compliance** | Critical | Violates tenant isolation mandate; potential GDPR/PDPA breach for EU/APAC tenants |
| **Attack Surface** | High | Unauthenticated endpoints leak platform topology (providers, models, health status) |
| **Operational Risk** | High | Agent/swarm loops may route to platform defaults instead of tenant's configured models |
| **Reputation** | Critical | Core platform security invariant (default-deny + tenant isolation) broken in AI gateway |

---

## 5. Remediation Strategy Overview

**Phase 1 — Foundation:** Create `src/auth.ts` with `requireTenant`/`requireTenantOrPlatform` preHandlers. Apply to all routes.

**Phase 2 — ORM Migration:** Replace raw SQL in `/v1/models`, `/v1/gateway/providers` with `BaseRepository.find({ scope: { companyId } })`. Add preHandler to `/v1/embeddings`.

**Phase 3 — MCP Hardening:**
- SSE: Add auth, bind sessions to tenant via `Map<companyId, Set<Reply>>`
- Audit: Migrate in-memory log to `mcp_audit_log` DB table with `company_id`, query via ORM
- Message: Verify existing `tenantOf()` usage

**Phase 4 — Agent/Swarm Fix:** Inject shared `SmartRouter` instance into `AgentLoop` and `SwarmCoordinator` constructors. Pass `company_id` to all `resolveRoute()` calls.

**Phase 5 — Tool Registry:** Enforce `companyId` validation in `execute()`, migrate audit to DB.

**Phase 6 — Verification:** Full quality gates + cross-tenant isolation test suite + raw SQL audit.

---

## 6. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Centralized `requireTenant` preHandler | Eliminates inconsistent `tenantOf()` usage; single source of truth for auth |
| ORM repositories over raw SQL | Enforces tenant scope at query builder level; parameterized by design |
| Shared `SmartRouter` instance | Preserves config caching (TTL-based); ensures consistent tenant scoping |
| DB-backed audit log (`mcp_audit_log`) | Durable, queryable, tenant-scoped; replaces leaky in-memory singleton |
| Breaking auth on formerly public routes | Intentional — these were critical security bugs, not features |
| No changes to `router.ts` | Router logic is correct when called with `companyId`; fix is in callers |

---

## 7. Migration Approach

1. **Database**: Add `mcp_audit_log` table via `SchemaMigrator` in `tools/index.ts` init (idempotent)
2. **Auth Middleware**: Create `auth.ts`, apply to chat completions first (baseline verification)
3. **Route Refactor**: One route at a time — models → providers → embeddings → MCP SSE → MCP audit
4. **Agent/Swarm**: Modify constructors, update plugin registration to inject shared router
5. **Tool Registry**: Add validation + DB audit in `execute()`
6. **Verification**: Run full gate suite, cross-tenant tests, raw SQL audit

**Rollback**: Per-task revert if gate fails; changes are incremental and isolated.

---

## 8. Test Plan Coverage

| Test Type | Coverage | Count |
|-----------|----------|-------|
| **Unit Tests** | `requireTenant`, `AgentLoop.resolveRoute`, `SwarmCoordinator.resolveRoute`, `ToolRegistry.execute` validation | 8+ |
| **Integration Tests** | Each fixed route (7): unauthenticated, tenant A, tenant B, platform where applicable | 28+ scenarios |
| **Cross-Tenant Isolation** | Seed 2+ tenants, verify no data leakage on all 7 routes | 7 routes × 2 tenants |
| **Regression Tests** | Chat completions streaming/fallback, device control, virtual key auth, usage/telemetry, MCP message | 5 flows |
| **Raw SQL Audit** | `grep -r "dbEngine\\.query" packages/arsy-plugin-llm-gateway/src --include="*.ts" \| grep -v test` | 1 command |

---

## 9. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking MCP client integrations (SSE auth) | Medium | High | Maintain SSE protocol; document auth requirement; version endpoint if needed |
| Agent loop routing regression | Medium | Medium | Unit test `resolveRoute(companyId)` with mocked router; integration test with real router |
| Performance degradation from ORM overhead | Low | Low | ORM uses prepared statements; router config caching (15s TTL) unchanged |
| Swarm coordinator same bug | Low | Medium | Verified: `coordinator.ts` creates `SmartRouter({})` but passes `mission.companyId` to tools, not router — fixed in Phase 4 |
| Tool registry in-memory log migration | Medium | Medium | Add DB table via `SchemaMigrator`; dual-write during transition; remove memory log after verification |
| Quality gate failures | Low | High | Run gates locally per task; fix before proceeding; no gate modifications allowed |

---

## 10. Quality Gate Compliance

**All implementation must pass:**
- `pnpm docs:check` — 100/100
- `pnpm lint:arch` — Architecture invariants (TENANT_ISOLATION, PARAMETERIZED_QUERIES, etc.)
- `pnpm lint` — ESLint, zero warnings
- `pnpm typecheck` — TS strict mode
- `pnpm ui:test` — Design system contracts
- `pnpm ui:contrast` — WCAG ratios
- All app builds: `dock`, `headquarter`, `id`, `jizz`, `gate`, `arsy`

**No gate weakening permitted.** If a gate fails, the code is fixed — not the gate.

---

## 11. Plan Directory Location

**Plan Directory:** `.plans/20261105-llm-gateway-tenant-isolation/`

**Contents:**
- `spec.md` — Executive summary, problem statement, repository evidence, confirmed bugs, root cause, impact, requirements, scope, acceptance criteria, success metrics, risk assessment
- `design.md` — Current/target architecture diagrams, remediation strategy (6 phases), proposed changes table, testing strategy, backward compatibility, migration plan, rollback plan
- `task.md` — 15 granular tasks (TASK-001 through TASK-015) with objectives, file changes, dependencies, validation, completion criteria; dependency graph; phase summary
- `rule.md` — 12 sections of mandatory guidelines: architectural invariants, TypeScript safety, API validation, build gates, package boundaries, error handling, security, testing, prohibited shortcuts, agent boundaries, migration safety, sign-off requirements