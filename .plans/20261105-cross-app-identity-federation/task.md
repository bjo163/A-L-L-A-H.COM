# Cross-App Identity Federation & Session Synchronization

## Implementation Phases

### Phase 1: SDK Enhancements (Week 1-2)
- [ ] Add `verifyCrossAppAuth` method to `@allah/sdk`
- [ ] Add `syncSessionToApps` method to `@allah/sdk`
- [ ] Add `getCurrentTenant` method to `@allah/sdk`
- [ ] Update SDK types in `@moonwitness/types`
- [ ] Run SDK typecheck and lint

### Phase 2: Auth Middleware (Week 2-3)
- [ ] Create shared auth middleware for Next.js apps
- [ ] Implement session detection logic
- [ ] Add tenant validation middleware
- [ ] Integrate with existing Better Auth flows
- [ ] Test middleware with each app

### Phase 3: API Endpoints (Week 3-4)
- [ ] Implement `/api/auth/cross-app/verify` endpoint
- [ ] Implement `/api/auth/cross-app/sync` endpoint
- [ ] Implement `/api/auth/cross-app/status` endpoint
- [ ] Add request validation and error handling
- [ ] Connect endpoints to SDK methods

### Phase 4: UI Components (Week 4-5)
- [ ] Create `AuthButton` component
- [ ] Create `SessionStatus` component
- [ ] Create `ConnectAccount` component
- [ ] Create `ReAuthModal` component
- [ ] Integrate components into each app

### Phase 5: Audit Logging (Week 5-6)
- [ ] Implement structured auth event logging
- [ ] Add tenant context to all auth logs
- [ ] Configure log aggregation
- [ ] Create log-based metrics and alerts

### Phase 6: Documentation and Cleanup (Week 6-7)
- [ ] Update SDK documentation
- [ ] Update app integration guides
- [ ] Run full test suite
- [ ] Verify typecheck across all packages
- [ ] Clean up any temporary code

## Ordered and Independ Executable Tasks

### Task 1: SDK Method Additions
**Description**: Add three new methods to the MoonWitnessClient class in `@allah/sdk/src/index.ts`:
- `verifyCrossAppAuth(targetApp: string)`
- `syncSessionToApps(targetApps?: string[])`
- `getCurrentTenant()`

**Dependencies**: None (can work in isolation)
**Affected Files**: `packages/sdk/src/index.ts`, `packages/types/src/**`
**Testing**: SDK unit tests, typecheck

### Task 2: Auth Middleware Core
**Description**: Create shared auth middleware that can be used by all Next.js apps:
- Session detection from cookies/localStorage
- Tenant ID extraction and validation
- Cross-app session check
- Auto-authentication trigger

**Dependencies**: Task 1 (SDK methods needed)
**Affected Files**: `apps/*/middleware.ts` (or equivalent), `packages/ui/src/blocks/`
**Testing**: Manual test in each app, typecheck

### Task 3: API Endpoints Implementation
**Description**: Implement the three new API routes:
- `POST /api/auth/cross-app/verify`
- `POST /api/auth/cross-app/sync`
- `GET /api/auth/cross-app/status`

**Dependencies**: Task 1 (SDK methods), Task 2 (middleware)
**Affected Files**: `apps/*/api/auth/cross-app/route.ts`, `packages/sdk/src/index.ts`
**Testing**: Integration tests, manual API testing

### Task 4: UI Component Development
**Description**: Develop the auth UI components for cross-app awareness:
- `AuthButton` with sign-in/sign-out toggle
- `SessionStatus` displaying user and tenant info
- `ConnectAccount` for manual sync across apps
- `ReAuthModal` for session renewal

**Dependencies**: Task 2 (middleware ready)
**Affected Files**: `packages/ui/src/components/auth/`, `apps/*/page.tsx`
**Testing**: UI tests, visual regression, accessibility

### Task 5: Audit Logging Implementation
**Description**: Add structured logging for all authentication events:
- Login/logout events with tenant context
- Cross-app sync events
- Session expiry and re-auth events
- Security events (token tampering, tenant mismatch)

**Dependencies**: Task 3 (API endpoints)
**Affected Files**: `packages/*/lib/logging/`, `apps/*/lib/logger.ts`
**Testing**: Log verification, metric checks

### Task 6: Integration and Testing
**Description**: Integrate all components and run comprehensive tests:
- Typecheck all packages (`pnpm typecheck`)
- Run lint:arch (`pnpm lint:arch`)
- Run docs check (`pnpm docs:check`)
- Test cross-app auth flow end-to-end
- Verify no breaking changes to existing auth

**Dependencies**: All previous tasks
**Affected Files**: All packages and apps
**Testing**: Full test suite, integration tests

## Dependencies and Execution Order

### Hard Dependencies (must complete in order)
1. Task 1 → Task 2 (SDK methods needed for middleware)
2. Task 2 → Task 3 (middleware needed for API endpoints)
3. Task 3 → Task 4 (API endpoints needed for UI integration)
4. Task 4 + Task 5 → Task 6 (UI + logging for final testing)

### Parallelizable Workstreams
- **Phase 1 (SDK)**: Can run independently of app changes
- **Phase 4 (UI)**: Can start once middleware (Task 2) is stable
- **Phase 5 (Logging)**: Can run alongside Phase 3 (API endpoints)

### Required Files and Affected Modules

| Task | Required Files | Affected Modules |
|---|---|---|
| 1 | `packages/sdk/src/index.ts`, `packages/types/` | SDK, Types |
| 2 | `apps/*/middleware.ts`, `packages/ui/src/blocks/` | All apps, UI blocks |
| 3 | `apps/*/api/auth/cross-app/route.ts`, `packages/sdk/` | All apps, SDK |
| 4 | `packages/ui/src/components/auth/`, `apps/*/page.tsx` | UI, All apps |
| 5 | `packages/*/lib/logging/`, `apps/*/lib/logger.ts` | All packages, All apps |
| 6 | All packages and apps | Full monorepo |

## Testing and Validation Procedures

### Unit Tests
- SDK method tests: `pnpm test -- packages/sdk`
- Middleware tests: `pnpm test -- apps/dock` (etc.)
- API route tests: Integration test suite

### Integration Tests
- End-to-end cross-app auth flow
- Session sync between apps
- Tenant isolation verification
- Error scenario testing

### Validation Gates (must pass before task completion)
1. `pnpm typecheck` - TypeScript strict mode passes
2. `pnpm lint:arch` - Architectural invariants preserved
3. `pnpm docs:check` - Documentation 100/100
4. `pnpm ui:contrast` - WCAG ratios for auth components
5. `pnpm arsy:build` - Arsy ORM builds successfully
6. No breaking changes to existing auth flows

## Completion Checklist

### Phase 1 Complete (SDK)
- [ ] `verifyCrossAppAuth` method implemented and tested
- [ ] `syncSessionToApps` method implemented and tested
- [ ] `getCurrentTenant` method implemented and tested
- [ ] SDK typecheck passes

### Phase 2 Complete (Middleware)
- [ ] Auth middleware created for all 9 apps
- [ ] Session detection works across all apps
- [ ] Tenant validation working
- [ ] No breaking changes to existing auth

### Phase 3 Complete (API Endpoints)
- [ ] `/api/auth/cross-app/verify` endpoint tested
- [ ] `/api/auth/cross-app/sync` endpoint tested
- [ ] `/api/auth/cross-app/status` endpoint tested
- [ ] Error handling implemented

### Phase 4 Complete (UI Components)
- [ ] `AuthButton` component developed and tested
- [ ] `SessionStatus` component developed and tested
- [ ] `ConnectAccount` component developed and tested
- [ ] `ReAuthModal` component developed and tested
- [ ] Components integrated into all apps

### Phase 5 Complete (Audit Logging)
- [ ] Auth events logged with structured JSON
- [ ] Tenant context included in all logs
- [ ] Log aggregation configured
- [ ] Metrics and alerts operational

### Phase 6 Complete (Documentation & Cleanup)
- [ ] SDK documentation updated
- [ ] App integration guides updated
- [ ] Full test suite passes
- [ ] Typecheck across all packages passes
- [ ] Lint:arch passes (100%)
- [ ] Docs:check passes (100/100)

### Overall Completion
- [ ] All acceptance criteria from spec.md met
- [ ] All success metrics target met
- [ ] No critical or blocking bugs
- [ ] Ready for production deployment review