---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SSO"
version: "1.0.0"
owner: "architecture"
status: "proposed"
--

# Specification: Cross-Application Single Sign-On (SSO)

## Feature Overview

The Cross-Application Single Sign-On (SSO) feature provides users with a unified authentication experience across all applications in the A-L-L-A.H.COM monorepo. Currently, each application (dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp) maintains independent authentication sessions, requiring users to sign in separately for each app. This feature introduces a centralized authentication hub with session synchronization, enabling users to authenticate once and remain authenticated across all applications while preserving tenant isolation and security invariants.

## Problem Statement

**Current State:**
- Each application independently manages authentication via the `@allah/sdk` MoonWitness client
- Users must sign in separately for each application (dock, headquarter, jizz, etc.)
- No shared session state between applications
- Sign-out from one app does not affect other apps
- No cross-app user identity propagation
- Multiple credential prompts degrade user experience

**Motivation:**
- Improve user experience by enabling single sign-on across the ecosystem
- Maintain tenant isolation and security per the MoonWitness invariants
- Reduce credential fatigue for users navigating multiple applications
- Enable consistent user identity and permissions across all apps
- Support shared LLM agent sessions and swarm orchestration across apps

## Objectives

- [x] Provide a centralized authentication hub that serves as the source of truth for user sessions
- [x] Synchronize authentication state across all applications in the monorepo
- [x] Maintain per-application tenant isolation (each app can enforce its own permissions)
- [x] Support `prefers-redacted-motion` and accessibility across all apps
- [x] Integrate with existing `@allah/sdk` authentication flows
- [x] Enable cross-app swarm agent sessions and mission sharing
- [x] Fall back gracefully when SSO infrastructure is unavailable
- [x] Preserve existing MoonFrame skin preferences across app switches

## Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-001 | Users can sign in once and be authenticated across all applications without re-entering credentials |
| FR-002 | Authentication state is synchronized in real-time across all open applications |
| FR-003 | Each application maintains its own tenant context and permission boundaries |
| FR-004 | Sign-out from any application revokes the session across all apps |
| FR-005 | User identity (email, name, roles) is propagated to all integrated applications |
| FR-006 | Skin preferences selected in one application persist when switching to another |
| FR-007 | Cross-app swarm agent sessions are shareable across the monorepo |
| FR-008 | Graceful degradation: when SSO hub is unavailable, each app falls back to independent auth |
| FR-009 | All authentication operations are audit-logged with tenant context |
| FR-010 | SSO session respects `prefers-reduced-motion` settings across apps |

## Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-001 | SSO authentication latency < 200ms (token validation and session sync) |
| NFR-002 | Session synchronization does not block app initialization or render performance |
| NFR-003 | No introduction of new external dependencies beyond `@allah/sdk` and existing infrastructure |
| NFR-004 | TypeScript strict mode compatible across all packages |
| NFR-005 | WCAG AA compliant authentication UI across all skin states |
| NFR-006 | Session sync overhead < 50ms per app switch |
| NFR-007 | Zero hydration warnings in Next.js App Router when using SSO-aware components |
| NFR-008 | Audit logs retain authentication events for 90 days with immutable storage |

## Scope

### In-Scope

- Centralized authentication hub service (API route or server function)
- Session synchronization mechanism using shared storage (localStorage/sessionStorage with server validation)
- SSO-aware `SkinRoot` integration that preserves skin preferences across apps
- Cross-app user identity propagation with tenant isolation
- Sign-out coordination across all applications
- Swarm agent session sharing for multi-app orchestration
- Audit logging of all authentication events
- Graceful fallback to per-app authentication when SSO hub unavailable
- TypeScript types and interfaces for all new APIs
- Documentation and quality gate compliance

### Out-of-Scope

- Modifying existing authentication flows within individual apps (sign-in/sign-up patterns remain unchanged)
- Centralized user database or user management system
- Social login integration (OAuth, Google, GitHub) — existing per-app flows remain
- Single database for all user data — tenant isolation is preserved
- Real-time collaborative features beyond session sync and agent sharing
- Changing the existing Better Auth or middleware authentication architecture
- Server-side session storage replacement (localStorage/sessionStorage based)

## User Stories

### Story 1: Single Sign-On Across Apps
**User:** "I want to sign in once and have access to all apps in the A-L-L-A.H.COM ecosystem without re-entering my credentials."
- **Action:** User signs in through the dock app
- **Expected:** User is automatically authenticated in headquarter, jizz, and all other apps
- **State:** Session is synchronized; skin preference from dock carries over

### Story 2: Cross-App Skin Consistency
**User:** "I selected the rocksoul skin in the dock app and want it to apply when I visit headquarter."
- **Action:** User selects rocksoul skin in dock
- **Expected:** Headquarter app renders with rocksoul tokens on next visit (or immediately if SSO sync is active)
- **Persistence:** Skin preference stored per-app under `mw_skin_preference:{appName}` with cross-app awareness

### Story 3: Swarm Agent Session Sharing
**User:** "I'm running a swarm agent in the dock app and want to continue it in the headquarter app."
- **Action:** User starts a swarm mission in one app
- **Expected:** Mission state and agent session are available in other apps via the SSO hub
- **Use Case:** Multi-device workflow without re-authentication

### Story 4: Sign-Out from Any App
**User:** "I want to sign out from all applications when I'm done working."
- **Action:** User clicks sign out in any one app
- **Expected:** Session is revoked across all apps; user is redirected to sign-in page in each
- **Security:** No lingering sessions in any application

### Story 5: Graceful Degradation
**User:** "If the SSO hub is temporarily unavailable, I should still be able to use each app independently."
- **Action:** SSO hub is down or network error occurs
- **Expected:** Each app continues using its independent authentication; user sees warning but can proceed
- **No Breaking:** App functionality is not blocked

## Dependencies and Constraints

### Dependencies

- `@allah/sdk` — existing SDK with auth operations (`signIn`, `signOut`, `getCurrentUser`, `getSessions`)
- `@moonwitness/ui` — SkinRoot, skinRegistry, SkinId types for cross-app skin persistence
- Next.js 16 App Router — all applications use this pattern
- `localStorage` / `sessionStorage` — browser-based session synchronization
- Existing API routes `/api/auth/` pattern in each app
- MoonWitness ecosystem invariants (STYLE_PURITY, PALETTE_PURITY, TENANT_ISOLATION)

### Constraints

- Must not break existing authentication flows in any application
- Must maintain per-application tenant isolation (company_id on every row, fail-closed)
- Must respect the 6-skin limit defined in the design system
- Must work with Next.js server components and client components
- Must not cause hydration mismatches in Next.js App Router
- Must be TypeScript-first with strict type checking
- Must not introduce new external npm dependencies
- All auth operations must be audit-logged with tenant context

### Ecosystem and Roadmap Alignment

- Aligns with MoonWitness vision of "six worlds, one engine" with shared authentication
- Supports the existing SDK auth infrastructure without replacing it
- Enables future capabilities: centralized user profiles, cross-app agent orchestration, unified analytics
- Consistent with the MoonFrame Six DNA architecture pattern
- No conflict with existing quality gates (docs:check, lint:arch, typecheck, ui:test, ui:contrast)

## Acceptance Criteria

- [ ] Central authentication hub API endpoint is operational and returns validated session tokens
- [ ] Session synchronization works across dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel apps
- [ ] Sign-out from any application revokes session across all open apps
- [ ] User identity (email, name, roles) propagates to all integrated applications
- [ ] Skin preferences persist and synchronize across app switches
- [ ] Cross-app swarm agent sessions are shareable
- [ ] Graceful fallback when SSO hub is unavailable (per-app auth continues)
- [ ] All quality gates pass: `pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`, `pnpm ui:test`, `pnpm ui:contrast`
- [ ] Zero TypeScript errors across all packages
- [ ] Zero architectural invariant violations
- [ ] Accessibility: WCAG AA compliant auth UI in all skin states

## Success Metrics

- **Adoption Rate:** Percentage of users who use SSO within first 30 days (target: >40%)
- **Session Retention:** Percentage of users who maintain authenticated state across app switches (target: >80%)
- **Sign-Out Compliance:** 100% of sign-out actions revoke sessions across all apps
- **Zero Hydration Errors:** 0 skin-related Next.js hydration warnings in production
- **Type Safety:** 0 TypeScript errors across all packages
- **Accessibility Score:** WCAG AA compliance confirmed via automated testing
- **Performance:** Session sync completes within 50ms; auth latency < 200ms

### Technical Success

- All quality gates pass without new failures
- No regression in existing authentication tests
- SSO works across mobile, desktop, and tablet breakpoints
- Error handling for corrupted/storage-full scenarios
- Audit logging captures all authentication events with tenant context