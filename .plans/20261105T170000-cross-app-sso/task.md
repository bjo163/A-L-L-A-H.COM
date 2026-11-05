---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SSO"
version: "1.0.0"
owner: "architecture"
status: "proposed"
---

# Task: Implementation Breakdown for Cross-Application SSO

## Implementation Phases

### Phase 1: SSO Hub Foundation (Estimated: 3-4 days)
**Objective:** Establish the SSO hub API endpoint, session management hook, and core types.

**Deliverables:**
- [ ] Create `packages/ui/src/hooks/use-sso-session.ts` — hook for reading/writing SSO session to localStorage
- [ ] Create `packages/ui/src/lib/sso-session.ts` — session management utilities (read, write, clear, subscribe)
- [ ] Create `packages/ui/src/components/sso-provider.tsx` — SSO provider component
- [ ] Create `packages/ui/src/index.ts` — export new hook, provider, and utilities
- [ ] Define TypeScript types and interfaces for SSO session model
- [ ] Create `apps/*/src/app/api/auth/sso/route.ts` — SSO hub API route in each app (9 apps)
- [ ] Write unit tests for `useSsoSession` hook
- [ ] Verify `pnpm typecheck` passes for `@moonwitness/ui`

**Dependencies:**
- `@moonwitness/ui` package structure
- Next.js 16 App Router API routes
- `localStorage` browser API
- `@allah/sdk` auth operations

**Verification:**
- `pnpm typecheck` passes for `@moonwitness/ui`
- Unit tests: 100% hook logic coverage
- No TypeScript errors

**Parallelizable Work:** None (sequential foundation)

---

### Phase 2: SSO Provider and App Integration (Estimated: 4-5 days)
**Objective:** Build the SSO provider component and integrate with each application's layout.

**Deliverables:**
- [ ] Implement `SsoProvider` component in `packages/ui/src/components/sso-provider.tsx`
- [ ] Wrap each app's root layout with `SsoProvider` (dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp)
- [ ] Integrate `useSsoSession` hook with each app's Better Auth session management
- [ ] Implement session sync via `window.dispatchEvent(new Event('mw:sso-session'))`
- [ ] Implement sign-out coordination via `window.dispatchEvent(new Event('mw:sso-signout'))`
- [ ] Integrate skin preference sync with existing `use-skin-preference.ts`
- [ ] Ensure Next.js hydration compatibility: SSO session returns `undefined` on server
- [ ] Add SkinRoot integration that respects persisted skin preference
- [ ] Test skin persistence: reload page, verify preferred skin persists
- [ ] Test default behavior: no preference → default skin renders (no visible change)

**Dependencies:**
- `useSsoSession` hook from `@moonwitness/ui`
- `SkinRoot` component from `@moonwitness/ui`
- Existing Better Auth integration in each app
- Next.js 16 App Router patterns

**Verification:**
- `pnpm typecheck` passes for dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp
- `pnpm dock:build` passes
- `pnpm headquarter:build` passes
- `pnpm jizz:build` passes
- `pnpm gate:build` passes
- `pnpm harbor:build` passes
- `pnpm id:build` passes
- `pnpm moonsky:build` passes
- `pnpm sentinel:build` passes
- No Next.js hydration warnings in production

**Parallelizable Work:** App integrations can be done in parallel across all 9 apps once the foundation is complete.

---

### Phase 3: Swarm Agent Session Sharing (Estimated: 3-4 days)
**Objective:** Enable cross-app swarm agent session sharing via the SSO hub.

**Deliverables:**
- [ ] Extend `useSsoSession` hook to support swarm session sharing
- [ ] Create `packages/ui/src/components/swarm-session-display.tsx` — display and control swarm sessions across apps
- [ ] Implement mission ID and agent state propagation via SSO hub
- [ ] Integrate with existing `@allah/sdk` swarm operations (`swarm.run`, `swarm.stream`)
- [ ] Enable mission continuation across app switches
- [ ] Test swarm session sharing between at least 3 apps (dock, headquarter, jizz)

**Dependencies:**
- `useSsoSession` hook from `@moonwitness/ui`
- `@allah/sdk` swarm operations
- Existing swarm agent implementations in each app

**Verification:**
- Swarm mission started in one app is available in another
- Agent state propagates across app switches
- No TypeScript errors in swarm session code
- `pnpm typecheck` passes across all packages

**Parallelizable Work:** Swarm session code can be developed alongside Phase 2 app integrations.

---

### Phase 4: Audit Logging and Error Handling (Estimated: 2-3 days)
**Objective:** Implement audit logging and comprehensive error handling for all SSO operations.

**Deliverables:**
- [ ] Implement audit log entries for: sign-in, sign-out, session sync, skin preference changes
- [ ] Wrap all localStorage operations in try/catch with graceful fallback
- [ ] Handle `QuotaExceededError` and storage-full scenarios
- [ ] Handle corrupted/invalid session values gracefully (fall back to independent auth)
- [ ] Add console warnings for edge cases (no runtime errors)
- [ ] Document error scenarios and recovery procedures

**Dependencies:**
- All previous phases complete
- Test infrastructure available

**Verification:**
- Error scenarios tested and working (storage full, corrupted values, hub unavailable)
- No console errors in edge cases
- Audit logs capture all authentication events with tenant context

**Parallelizable Work:** Documentation and error handling can overlap with Phase 3.

---

### Phase 5: Testing, Documentation, and Quality Gates (Estimated: 3-4 days)
**Objective:** Comprehensive testing, documentation updates, and quality gate validation.

**Deliverables:**
- [ ] Write end-to-end tests for SSO flow (sign-in → sync → sign-out → verify)
- [ ] Write unit tests for SSO hook, provider, and session utilities
- [ ] Write unit tests for skin preference sync scenarios
- [ ] Write end-to-end tests for swarm session sharing
- [ ] Update `packages/ui` documentation with SSO API
- [ ] Update app AGENTS.md files with SSO integration notes
- [ ] Run full quality gate: `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`, `pnpm ui:test`, `pnpm ui:contrast`
- [ ] Verify no new TODO/FIXME/HACK comments in code
- [ ] Measure bundle size impact (ensure minimal increase)
- [ ] Document the SSO pattern in `.plans/` report

**Dependencies:**
- All previous phases complete
- Test infrastructure available
- Documentation standards

**Verification:**
- `pnpm docs:check` — 100/100 passed
- `pnpm lint:arch` — 0 architectural violations
- `pnpm typecheck` — 0 TypeScript errors across all packages
- `pnpm ui:test` — design system component and skin contracts pass
- `pnpm ui:contrast` — WCAG ratios verified for all skin token pairs
- App builds: all 9 apps pass (`pnpm dock:build`, `pnpm headquarter:build`, etc.)

**Parallelizable Work:** Documentation updates can happen alongside test execution.

---

## Ordered and Independently Executable Tasks

| Task ID | Task | Phase | Owner | Dependencies | Status |
|---------|------|-------|-------|--------------|--------|
| T-001 | Create use-sso-session.ts hook | 1 | UI Team | None | pending |
| T-002 | Create sso-session.ts utilities | 1 | UI Team | T-001 | pending |
| T-003 | Create sso-provider.tsx component | 1 | UI Team | T-001, T-002 | pending |
| T-004 | Write unit tests for useSsoSession hook | 1 | QA Team | T-001, T-002 | pending |
| T-005 | Create SSO API route in apps/dock | 1 | Dock Team | T-003 | pending |
| T-006 | Create SSO API route in apps/headquarter | 1 | Headquarter Team | T-003 | pending |
| T-007 | Create SSO API route in apps/jizz | 1 | Jizz Team | T-003 | pending |
| T-008 | Create SSO API route in apps/gate | 1 | Gate Team | T-003 | pending |
| T-009 | Create SSO API route in apps/harbor | 1 | Harbor Team | T-003 | pending |
| T-010 | Create SSO API route in apps/id | 1 | Id Team | T-003 | pending |
| T-011 | Create SSO API route in apps/moonsky | 1 | Moonsky Team | T-003 | pending |
| T-012 | Create SSO API route in apps/sentinel | 1 | Sentinel Team | T-003 | pending |
| T-013 | Create SSO API route in apps/e-isp | 1 | E-ISP Team | T-003 | pending |
| T-014 | Integrate SsoProvider with apps/dock layout.tsx | 2 | Dock Team | T-005 | pending |
| T-015 | Integrate SsoProvider with apps/headquarter layout.tsx | 2 | Headquarter Team | T-005 | pending |
| T-016 | Integrate SsoProvider with apps/jizz layout.tsx | 2 | Jizz Team | T-005 | pending |
| T-017 | Integrate SsoProvider with apps/gate layout.tsx | 2 | Gate Team | T-005 | pending |
| T-018 | Integrate SsoProvider with apps/harbor layout.tsx | 2 | Harbor Team | T-005 | pending |
| T-019 | Integrate SsoProvider with apps/id layout.tsx | 2 | Id Team | T-005 | pending |
| T-020 | Integrate SsoProvider with apps/moonsky layout.tsx | 2 | Moonsky Team | T-005 | pending |
| T-021 | Integrate SsoProvider with apps/sentinel layout.tsx | 2 | Sentinel Team | T-005 | pending |
| T-022 | Integrate SsoProvider with apps/e-isp layout.tsx | 2 | E-ISP Team | T-005 | pending |
| T-023 | Implement skin preference sync with SSO | 2 | UI Team | T-001, T-003 | pending |
| T-024 | Implement swarm session sharing | 3 | Swarm Team | T-001, T-002 | pending |
| T-025 | Write E2E tests for SSO flow | 5 | QA Team | T-001, T-005, T-014, T-015, T-016, T-017, T-018, T-019, T-020, T-021, T-022 | pending |
| T-026 | Write unit tests for swarm session sharing | 5 | QA Team | T-001, T-002, T-024 | pending |
| T-027 | Run and pass all quality gates | 5 | CI/CD | T-025, T-026 | pending |
| T-028 | Update documentation and reports | 5 | Docs Team | T-027 | pending |

## Dependencies and Execution Order

### Critical Path

```
T-001 → T-002 → T-003 → T-004 → T-005 through T-013 (9 API routes in parallel)
     → T-014 through T-022 (9 app integrations in parallel) → T-027 → T-028
```

### Parallel Workstreams

- **Phase 1 parallel:** T-001, T-002, T-003 can proceed concurrently (hook, utilities, provider design)
- **Phase 2 parallel:** T-005 through T-013 (9 API routes) can run in parallel (each app team works independently)
- **Phase 2 parallel:** T-014 through T-022 (9 app integrations) can run in parallel once API routes are complete
- **Phase 2 parallel:** T-023 (skin preference sync) can start once T-001 and T-003 are visible
- **Phase 3 parallel:** T-024 (swarm session sharing) can start once T-001 and T-002 are complete
- **Phase 4 parallel:** T-025 (E2E tests), T-026 (unit tests), and documentation can overlap
- **Phase 5 parallel:** T-027 (quality gates) requires all integrations complete; T-028 (docs) can start early

### Task Dependencies Blocking

- T-005 through T-013 all require T-003 (SsoProvider component) to be complete
- T-014 through T-022 all require respective T-005 through T-013 (API routes) to be complete
- T-027 requires all app integrations (T-014 through T-022) to be complete
- T-028 requires T-027 (all gates passing) to be complete
- T-023 requires T-001 and T-003 (hook and provider) to be complete
- T-024 requires T-001 and T-002 (hook and utilities) to be complete

### No-Blockers (Can Start Immediately)

- T-001: Hook foundation can start immediately (no dependencies)
- T-002: Utilities can start once hook interface is defined
- T-003: Provider skeleton can start once hook interface is defined
- T-004: Unit tests for hook can start once hook implementation is visible

## Required Files and Affected Modules

### New Files

- `packages/ui/src/hooks/use-sso-session.ts` — SSO session hook
- `packages/ui/src/lib/sso-session.ts` — session management utilities
- `packages/ui/src/components/sso-provider.tsx` — SSO provider component
- `packages/ui/src/index.ts` — export new hook, provider, and utilities

### Modified Files (per app)

- `apps/dock/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/headquarter/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/jizz/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/gate/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/harbor/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/id/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/moonsky/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/sentinel/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/e-isp/src/app/api/auth/sso/route.ts` — SSO hub API route
- `apps/dock/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/headquarter/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/jizz/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/gate/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/harbor/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/id/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/moonsky/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/sentinel/src/app/layout.tsx` — integrate SsoProvider + useSsoSession
- `apps/e-isp/src/app/layout.tsx` — integrate SsoProvider + useSsoSession

### Test Files (New)

- `packages/ui/src/hooks/__tests__/use-sso-session.test.ts` — hook tests
- `packages/ui/src/components/__tests__/sso-provider.test.ts` — provider tests
- `packages/ui/src/lib/__tests__/sso-session.test.ts` — utilities tests

## Testing and Validation Procedures

### Unit Tests

- **useSsoSession hook:**
  - ✅ Reads valid SSO session from localStorage
  - ✅ Returns undefined when localStorage unavailable (SSR)
  - ✅ Writes new session to localStorage on sign-in
  - ✅ Clears session on sign-out
  - ✅ Handles QuotaExceededError gracefully
  - ✅ Handles corrupted/stored non-session values
  - ✅ Session scoping: different apps → different sessions
  - ✅ Event dispatch: `mw:sso-session` and `mw:sso-signout`

- **SsoSession utilities:**
  - ✅ readSession() returns stored session or undefined
  - ✅ writeSession(token) stores session with error handling
  - ✅ clearSession() removes session from localStorage
  - ✅ subscribe(callback) sets up event listener for session changes

- **SsoProvider component:**
  - ✅ Provides session state to wrapped children
  - ✅ Dispatches session events on change
  - ✅ Handles sign-out coordination
  - ✅ Respects reduced-motion preference
  - ✅ Falls back gracefully when localStorage unavailable

### Integration Tests

- **App-level:**
  - ✅ Each app renders default skin when no SSO preference set
  - ✅ Preferred skin persists after SSO sign-in and reload
  - ✅ SkinRoot SSR renders default (no hydration warning)
  - ✅ SSO sign-in in one app auto-logs in user in other open apps
  - ✅ Sign-out from any app revokes session across all apps
  - ✅ Per-app preference scoping works independently
  - ✅ Swarm session sharing between apps

- **Cross-app:**
  - ✅ User signs in via dock → authenticated in headquarter without re-credentials
  - ✅ Skin selected in dock → applies in headquarter (optional, user-initiated)
  - ✅ Swarm mission started in jizz → available in headquarter

### End-to-End Tests

- [ ] User signs in via dock app
- [ ] User navigates to headquarter app → auto-authenticated
- [ ] User selects rocksoul skin in dock
- [ ] Headquarter app shows rocksoul skin on next visit (or via sync)
- [ ] User signs out from dock
- [ ] User is signed out from headquarter, jizz, and all other apps
- [ ] User starts swarm mission in dock
- [ ] Mission state visible in headquarter app
- [ ] SSO hub unavailable → apps fall back to independent auth
- [ ] Clearing localStorage resets to defaults in all apps
- [ ] Reduced motion preference reduces animations across all apps

### Validation Commands

```bash
# Type checking (all packages)
pnpm typecheck

# Architecture lint
pnpm lint:arch

# Documentation check
pnpm docs:check

# UI tests (design system contracts)
pnpm ui:test

# UI contrast verification
pnpm ui:contrast

# App builds (all 9 apps)
pnpm dock:build
pnpm headquarter:build
pnpm jizz:build
pnpm gate:build
pnpm harbor:build
pnpm id:build
pnpm moonsky:build
pnpm sentinel:build
pnpm e-isp:build
```

## Documentation Requirements

### Updated Documentation

- [ ] This task.md (current file) — implementation breakdown
- [ ] `spec.md` — feature specification (already created)
- [ ] `design.md` — technical & UX design (already created)
- [ ] `rule.md` — implementation rules & agent guardrails (to be created)
- [ ] `packages/ui/src/hooks/use-sso-session.ts` — JSDoc documentation
- [ ] `packages/ui/src/lib/sso-session.ts` — JSDoc documentation
- [ ] `packages/ui/src/components/sso-provider.tsx` — JSDoc documentation
- [ ] App AGENTS.md files — update with SSO integration notes
- [ ] `.plans/20261105T170000-cross-app-sso/report.md` — on completion

### CHANGELOG Updates

- [ ] Record SSO hub and session synchronization additions
- [ ] Document breaking changes (none — additive feature only)
- [ ] Note new quality gate requirements

### Developer Notes

- [ ] Pattern guide for adding SSO to future apps
- [ ] Debugging: how to inspect `localStorage.mw_sso_session`
- [ ] Error scenarios and recovery procedures
- [ ] How to test cross-app session sync
- [ ] Swarm session sharing workflow

## Completion Checklist

### Minimum Viable Product (MVP) — Ready when:

- [ ] `use-sso-session.ts` hook created and tested
- [ ] `sso-session.ts` utilities created
- [ ] `sso-provider.tsx` component created
- [ ] SSO API route created in all 9 apps
- [ ] All 9 apps integrate SsoProvider without build errors
- [ ] `pnpm typecheck` passes across all packages (ui, dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp)
- [ ] `pnpm lint:arch` passes with no new violations
- [ ] SSO sign-in in one app auto-logs in user in another app
- [ ] Skin preference persists across page reloads
- [ ] Default skin renders when no SSO preference set
- [ ] Sign-out from any app revokes session across all apps

### Full Implementation — Ready when:

- [ ] All MVP criteria met
- [ ] `pnpm docs:check` passes (100/100)
- [ ] `pnpm ui:test` passes (design system contracts)
- [ ] `pnpm ui:contrast` passes (WCAG ratios for all skins)
- [ ] No hydration warnings in Next.js production builds for any of the 9 apps
- [ ] Bundle size impact minimal (confirmed via analyzer)
- [ ] Accessibility audit: axe-core 0 violations on auth UI in all skin states
- [ ] Report.md completed in `.plans/20261105T170000-cross-app-sso/`
- [ ] All TODO items resolved or documented as out-of-scope

### Extended Success — After completion:

- [ ] Feedback collected from actual users on SSO usability
- [ ] Adoption metrics tracked (>40% target within 30 days)
- [ ] Plan for v2: centralized user profiles, cross-app analytics, unified session management
- [ ] Documentation updated for future app onboarding
- [ ] Swarm agent session sharing validated across all app combinations