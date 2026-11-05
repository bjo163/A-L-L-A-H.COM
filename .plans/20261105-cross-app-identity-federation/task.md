---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_IDENTITY_FEDERATION_TASKS"
version: "1.0.0"
owner: "platform-architecture"
status: "proposed"
---
# Task: Implementation Breakdown for Cross-Application Identity & Authentication Federation

## Implementation Phases

### Phase 1: Federation Package Foundation (Weeks 1-2)
**Goal**: Create `packages/federation` with core SDK methods and JWT token format.

**Tasks**:
- [ ] Initialize `packages/federation` package structure with pnpm workspace registration
- [ ] Define `FederatedTokenClaims` interface and JWT token format with required claims
- [ ] Implement `tokenManager/` module with JWT creation, validation, and refresh functions
- [ ] Implement `sessionStore/` module with in-memory session storage and PGlite persistence
- [ ] Implement `tenantManager/` module with tenant context and default-deny enforcement
- [ ] Implement `correlationMiddleware/` for Express/Next.js route correlation ID propagation
- [ ] Write unit tests for token manager, session store, and tenant manager
- [ ] Ensure TypeScript strict mode compatibility with 0 errors
- [ ] Generate package documentation and API reference

**Dependencies**: `@allah/types`, `@allah/sdk`, `@moonwitness/types`, PGlite

**Completion Criteria**:
- `packages/federation` package creates successfully with `pnpm typecheck`
- All unit tests pass (100% for federation package)
- JWT token format defined and documented
- Tenant context management with default-deny works

---

### Phase 2: Platform Hub Federation Endpoints (Weeks 3-4)
**Goal**: Implement platform hub endpoints for federation operations.

**Tasks**:
- [ ] Create hub login endpoint `/api/federation/login`
- [ ] Create hub logout endpoint `/api/federation/logout`
- [ ] Create hub session endpoint `/api/federation/session`
- [ ] Create hub refresh endpoint `/api/federation/refresh`
- [ ] Create hub health endpoint `/api/federation/health`
- [ ] Create hub token validation endpoint `/api/federation/tokens/validate`
- [ ] Implement session storage in PGlite with append-only audit events
- [ ] Implement tenant context enforcement in hub routes
- [ ] Write integration tests for all hub endpoints
- [ ] Configure hub CORS for cross-app communication
- [ ] Ensure hub endpoints comply with MoonWitness invariants (no PII, parameterized SQL)

**Dependencies**: `@allah/arsy-orm`, PGlite, `@moonwitness/ui` (for auth screens)

**Completion Criteria**:
- All hub endpoints respond correctly with proper status codes
- Session persistence works with PGlite
- Tenant isolation enforced at hub level
- Health endpoint returns expected metadata
- All invariants preserved (auth, tenant, SQL, retention, SSRF)

---

### Phase 3: Application Integration (Weeks 5-8)
**Goal**: Integrate federation into all 10+ applications (dock, headquarter, e-isp, gate, harbor, jizz, moonsky, sentinel, id).

**Tasks** — Per application:

**dock** (P0):
- [ ] Import `@allah/federation` SDK
- [ ] Replace local auth with federation login/logout
- [ ] Implement cross-app SSO navigation
- [ ] Add auth state change listeners
- [ ] Update UI to use @moonwitness/ui auth components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**headquarter** (P0):
- [ ] Import `@allah/federation` SDK
- [ ] Replace local auth with federation login/logout
- [ ] Implement cross-app SSO navigation
- [ ] Implement tenant context in routes
- [ ] Update UI to use @moonwitness/ui auth components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**e-isp** (P1):
- [ ] Import `@allah/federation` SDK
- [ ] Configure federation with e-isp-specific app_id
- [ ] Implement login/logout flows
- [ ] Add consent propagation
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**gate** (P1):
- [ ] Import `@allah/federation` SDK
- [ ] Replace local auth with federation
- [ ] Implement session management
- [ ] Add tenant context awareness
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**harbor** (P2):
- [ ] Import `@allah/federation` SDK
- [ ] Configure federation settings
- [ ] Implement basic auth flow
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**jizz** (P2 - WORLD OBSERVATORY):
- [ ] Import `@allah/federation` SDK
- [ ] Configure federation for observatory app
- [ ] Implement login/logout
- [ ] Add session management
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**moonsky** (P2):
- [ ] Import `@allah/federation` SDK
- [ ] Configure federation settings
- [ ] Implement auth flow
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**sentinel** (P2):
- [ ] Import `@allah/federation` SDK
- [ ] Configure federation for RADIUS daemon
- [ ] Implement session management
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**id** (P0 - Identity Center):
- [ ] Import `@allah/federation` SDK
- [ ] Enhance existing auth with federation methods
- [ ] Implement ID-N01 through ID-N08 strategic initiatives
- [ ] Add cross-app federation support
- [ ] Update UI components
- [ ] Write app-specific tests
- [ ] Verify TypeScript typecheck passes

**Additional integration tasks**:
- [ ] Update all app Dockerfiles for federation service dependencies
- [ ] Update all app next.config.ts for hub endpoint URLs
- [ ] Update environment variables configuration (.env.example)
- [ ] Create migration guides for each app
- [ ] Run cross-app integration tests (at least dock ↔ headquarter ↔ id)
- [ ] Verify end-to-end SSO flow across 3+ applications

**Dependencies**: Each app's existing auth dependencies, `@allah/federation`, `@moonwitness/ui`

**Completion Criteria**:
- All 10+ applications integrated with federation SDK
- Cross-app SSO works between at least 3 applications (dock, headquarter, id)
- All apps pass `pnpm typecheck` with 0 errors
- All apps pass `pnpm lint:arch` with 100% compliance
- Cross-app integration tests pass end-to-end

---

### Phase 4: Observability, Documentation, and Release (Weeks 9-10)
**Goal**: Add observability, documentation, and prepare for release.

**Tasks**:
- [ ] Implement metrics facade with Prometheus-compatible exposition format
- [ ] Add correlation ID propagation metrics
- [ ] Implement tenant violation tracking
- [ ] Write health endpoint with observability metadata
- [ ] Generate API documentation for `@allah/federation`
- [ ] Create migration guide for existing applications
- [ ] Update BACKLOG.md with new items
- [ ] Create demo scenarios for cross-app SSO
- [ ] Run full quality gate: `pnpm verify:fast`
- [ ] Run full quality gate: `pnpm verify:release`
- [ ] Verify `pnpm docs:check` passes (100/100)
- [ ] Verify `pnpm contract:check` passes across all units
- [ ] Verify `pnpm lint:arch` passes with 100%
- [ ] Verify `pnpm typecheck` passes across all packages and apps
- [ ] Create release branch and tag

**Dependencies**: All packages and apps from previous phases

**Completion Criteria**:
- `pnpm verify:fast` passes locally
- `pnpm verify:release` passes locally
- `pnpm docs:check` passes (100/100)
- `@allah/federation` package published to package registry
- All quality gates pass

---

## Ordered and Independently Executable Tasks

| Task ID | Task | Phase | Owner | Estimated Effort |
|---|---|---|---|---|
| T-01 | Initialize packages/federation package structure | 1 | platform-architecture | 0.5 days |
| T-02 | Define FederatedTokenClaims interface and JWT format | 1 | platform-architecture | 1 day |
| T-03 | Implement tokenManager module (JWT creation/validation/refresh) | 1 | platform-architecture | 2 days |
| T-04 | Implement sessionStore module (in-memory + PGlite persistence) | 1 | platform-architecture | 2 days |
| T-05 | Implement tenantManager module (default-deny enforcement) | 1 | platform-architecture | 1.5 days |
| T-06 | Implement correlationMiddleware for Express/Next.js | 1 | platform-architecture | 1 day |
| T-07 | Write unit tests for federation package | 1 | platform-architecture | 2 days |
| T-08 | Create hub login endpoint | 2 | platform-architecture | 2 days |
| T-09 | Create hub logout endpoint | 2 | platform-architecture | 1.5 days |
| T-10 | Create hub session endpoint | 2 | platform-architecture | 1.5 days |
| T-11 | Create hub refresh endpoint | 2 | platform-architecture | 1.5 days |
| T-12 | Create hub health endpoint | 2 | platform-architecture | 1 day |
| T-13 | Create hub token validation endpoint | 2 | platform-architecture | 1.5 days |
| T-14 | Implement session storage with PGlite audit events | 2 | platform-architecture | 2 days |
| T-15 | Integrate federation into dock app | 3 | dock-team | 3 days |
| T-16 | Integrate federation into headquarter app | 3 | headquarter-team | 3 days |
| T-17 | Integrate federation into e-isp app | 3 | e-isp-team | 2.5 days |
| T-18 | Integrate federation into gate app | 3 | gate-team | 2.5 days |
| T-19 | Integrate federation into harbor app | 3 | harbor-team | 2 days |
| T-20 | Integrate federation into jizz app | 3 | jizz-team | 2.5 days |
| T-21 | Integrate federation into moonsky app | 3 | moonsky-team | 2 days |
| T-22 | Integrate federation into sentinel app | 3 | sentinel-team | 2 days |
| T-23 | Integrate federation into id app (enhance ID-N01 to ID-N08) | 3 | id-team | 4 days |
| T-24 | Run cross-app integration tests (dock ↔ headquarter ↔ id) | 4 | QA-team | 3 days |
| T-25 | Implement metrics facade and Prometheus exposition | 4 | platform-architecture | 2 days |
| T-26 | Generate API documentation and migration guides | 4 | platform-architecture | 2 days |
| T-27 | Run full quality gates and prepare release | 4 | platform-architecture | 3 days |

## Dependencies and Execution Order

**Critical Path**:
1. T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07 (Phase 1 foundation)
2. T-08 → T-09 → T-10 → T-11 → T-12 → T-13 → T-14 (Phase 2 hub endpoints, can start after Phase 1 begins)
3. T-15 → T-16 → T-17 → T-18 → T-19 → T-20 → T-21 → T-22 → T-23 (Phase 3 app integrations, each independent but share Phase 1-2 foundation)
4. T-24 → T-25 → T-26 → T-27 (Phase 4 observability, docs, release, requires Phase 3 completion)

**Parallelizable Workstreams**:
- All app integrations (T-15 through T-23) can run in parallel once Phase 1-2 foundation is complete
- Unit tests (T-07) can run in parallel with hub endpoint development (T-08 through T-14)
- Migration guide documentation (T-26) can start once first app integration completes

**Required Files and Affected Modules**:
- **New files**: `packages/federation/src/`, hub route handlers, app integration files
- **Modified files**: Existing auth files in each app, `@allah/sdk` index.ts, environment configs
- **Affected modules**: `@allah/federation`, `@allah/sdk`, `@allah/arsy-orm`, `@moonwitness/ui`, each app's auth routes

## Testing and Validation Procedures

### Unit Tests
- `packages/federation`: 100% branch coverage for tokenManager, sessionStore, tenantManager
- Hub endpoints: integration tests for each endpoint with various scenarios
- Each app: component tests for auth UI, integration tests for federation SDK usage

### Integration Tests
- Cross-app SSO flow: login in dock → navigate to headquarter → authenticated
- Session propagation: session state consistent across app boundaries
- Tenant isolation: tenant A cannot access tenant B's resources
- Token refresh: automatic refresh before expiry, graceful fallback on failure

### End-to-End Tests
- Full login flow in dock app
- Cross-app navigation maintaining authentication
- User logs out from headquarter → session cleared in dock
- Tenant context propagation across multiple hops
- Hub health check and degradation behavior

### Validation Commands
- `pnpm typecheck` — all packages and apps pass strict mode
- `pnpm lint:arch` — 100% arch invariant compliance
- `pnpm docs:check` — 100/100 required
- `pnpm contract:check` — per-unit CONTRACT.md presence + code cross-check
- `pnpm ui:test` — design system component contracts
- `pnpm ui:contrast` — WCAG ratios for skin token pairs
- `pnpm arsy:build`, `pnpm headquarter:build`, `pnpm dock:build`, `pnpm id:build` — all app builds pass

## Documentation Requirements

- [ ] `packages/federation` package README with API reference
- [ ] Migration guide for each integrated app
- [ ] API documentation generated via TypeDoc
- [ ] Update BACKLOG.md with federation-related items
- [ ] Update ROADMAP.md stage progress if applicable
- [ ] In-app auth documentation (login, logout, session management)
- [ ] Cross-app SSO workflow documentation
- [ ] Tenant isolation policy documentation
- [ ] Health endpoint documentation

## Completion Checklist

- [ ] `packages/federation` package created with core SDK methods
- [ ] Platform hub federation endpoints implemented and tested
- [ ] All 10+ applications integrated with federation SDK
- [ ] Cross-app SSO works end-to-end between at least 3 applications
- [ ] Tenant isolation preserved and default-deny enforced across all apps
- [ ] Correlation ID propagation works across app boundaries
- [ ] Token refresh strategy works with automatic renewal before expiry
- [ ] All quality gates pass: `pnpm verify:fast`, `pnpm verify:release`
- [ ] `pnpm docs:check` passes (100/100)
- [ ] `pnpm lint:arch` passes with 100% compliance
- [ ] `pnpm typecheck` passes across all packages and apps (0 errors strict mode)
- [ ] Documentation generated and published to package registry
- [ ] BACKLOG.md updated with federation items
- [ ] Release branch created and tagged
- [ ] All acceptance criteria from spec.md met