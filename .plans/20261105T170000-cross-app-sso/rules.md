---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SSO"
version: "1.0.0"
owner: "architecture"
status: "proposed"
---

# Rule: Implementation Rules & Agent Guardrails for Cross-Application SSO

## Mandatory Architectural Invariants

### INV-001: Tenant Isolation Invariant
- **Rule:** Every authenticated request must enforce `company_id` on every row, derived from the principal and fail-closed — never taken from the request body.
- **Enforcement:** `pnpm lint:arch` must pass with `TENANT_ISOLATION` check.
- **Violation:** Using `company_id` from request body, query params, or SSO hub payloads.
- **Exception:** None — tenant isolation is non-negotiable.

### INV-002: Skin Purity Invariant
- **Rule:** No application CSS may target private `mw-*` class names. All skin styling must come from the 6 approved token sets in `@moonwitness/ui`.
- **Enforcement:** `pnpm lint:arch` must pass with `STYLE_PURITY` and `PALETTE_PURITY` checks.
- **Violation:** Targeting `.mw-canvas` or any private class from outside `packages/ui/src/theme.css`.
- **Exception:** None — skin-token usage is the only permitted approach.

### INV-003: Six-Skin Limit
- **Rule:** Only the 6 approved skin IDs may be used: `imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, `mycelium`.
- **Enforcement:** TypeScript `SkinId` type (union of the 6 strings) is the only accepted type for skin values.
- **Violation:** Adding a 7th skin ID, using a skin name as a string literal not from the registry, or dynamic skin names not in the approved list.
- **Exception:** None — the design system explicitly limits to 6 worlds.

### INV-004: SkinRoot Ownership
- **Rule:** Each application must use `<SkinRoot>` from `@moonwitness/ui` — no hand-rolled skin providers or context wrappers.
- **Enforcement:** Import `SkinRoot` exclusively from `@moonwitness/ui`, never from other packages or internal re-exports.
- **Violation:** Creating a new `<SkinProvider>`, wrapping `SkinRoot` with custom context, or using a different skin context provider.
- **Exception:** None — SkinRoot is the sole skin entry point.

### INV-005: No Hydration Mismatch
- **Rule:** Server-side rendered skin must not cause Next.js hydration mismatches.
- **Enforcement:** `useSsoSession()` must return `undefined` on the server (localStorage unavailable), allowing `SkinRoot` to use its default skin. Client-side hydration must match.
- **Violation:** Reading `localStorage` on the server, or causing a client-side skin change that differs from the server-rendered skin.
- **Exception:** None — hydration stability is non-negotiable in Next.js App Router.

### INV-006: SSO Session Isolation
- **Rule:** SSO session token is a global identifier, but tenant context remains per-app. No app may access another app's `company_id` or tenant data via SSO.
- **Enforcement:** SSO hub validates `company_id` per app request; apps reject SSO sessions that don't match their tenant context.
- **Violation:** App using another app's `company_id` derived from SSO hub session.
- **Exception:** None — tenant boundaries are absolute.

### INV-007: Auth Audit Logging
- **Rule:** Every authentication operation (sign-in, sign-out, session sync, token refresh) must write one append-only audit event with tenant context.
- **Enforcement:** Audit logs stored in write-once, content-addressed storage at `data/storage/<digest>`.
- **Violation:** Authentication operation without audit event, or audit event missing `company_id`.
- **Exception:** None — audit is mandatory.

## Coding Conventions and Repository Standards

### CC-001: TypeScript-First Development
- All new files must be TypeScript strict-compliant.
- `SkinId` must be used as a type, never a plain string.
- Interfaces and hooks must have full JSDoc documentation.
- `noImplicitAny: true`, `strict: true` in tsconfig.

### CC-002: Naming Conventions
- Hooks: `use-` prefix (e.g., `useSsoSession`)
- Components: PascalCase (e.g., `SsoProvider`)
- Constants: `UPPER_CASE` (e.g., skin registry keys)
- Files: `kebab-case` or `camelCase` consistent with existing patterns
- Directories: `kebab-case` (e.g., `use-sso-session`, `sso-provider`)

### CC-003: Import Style
- Absolute imports from `@moonwitness/ui` for shared utilities
- Relative imports within the same package only when absolutely necessary
- No wildcard imports (`import * as x`) for specific exports
- Group imports: external → internal → local

### CC-004: Comment Standards
- No generic AI-slop comments (antislop-code rule).
- All public APIs must have JSDoc documenting: purpose, params, returns, throws.
- Inline comments only for non-obvious logic, never stating the obvious.
- TODO/FIXME/HACK comments are prohibited outside of `.md` documentation files (enforced by `packages/lint/src/check-architecture.mjs`).

### CC-005: Error Handling Patterns
- All localStorage operations must be wrapped in try/catch.
- Errors must be swallowed gracefully (fall back to default, never crash).
- Console warnings for edge cases but no runtime errors.
- Use `/* eslint-disable */` only for known, lint-suppressed patterns with explanation.

## Package Boundaries and Dependency Rules

### PB-001: `@moonwitness/ui` Package Owns SSO Infrastructure
- **Responsibility:** SSO session hook, provider, session utilities, skin preference integration, SSO Provider component.
- **Dependency Rule:** No other package may re-export or modify SSO types from outside `@moonwitness/ui`.
- **Violation:** Another package defining its own `SsoSession` type or session management logic.
- **Exception:** None — SSO infrastructure is centralized in `@moonwitness/ui`.

### PB-002: Application Packages Depend on `@moonwitness/ui`
- **Responsibility:** dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp integrate SSO via `@moonwitness/ui` APIs.
- **Dependency Rule:** Apps must not import SSO logic from each other or from external packages.
- **Violation:** dock importing SSO logic from headquarter, or any app implementing its own SSO session hook.
- **Exception:** None — centralized SSO infrastructure prevents fragmentation.

### PB-003: No New External Dependencies
- **Rule:** SSO components and hooks must not introduce new npm dependencies.
- **Enforcement:** Pure React + TypeScript implementation. No `framer-motion`, `radix-ui`, `classnames`, or similar.
- **Violation:** Adding `npm install framer-motion` or similar for SSO animations.
- **Exception:** `classnames` may be used if already a dependency of `@moonwitness/ui` (verify first).

### PB-004: LocalStorage API Guarded
- **Rule:** All `localStorage` accesses must guard against unavailable/storage-full scenarios.
- **Enforcement:** try/catch around every localStorage read/write, fallback to default on error.
- **Violation:** `localStorage.setItem()` called without try/catch, or assuming localStorage is always available.
- **Exception:** None — browser environments vary; must be defensive.

### PB-005: Server-Side localStorage Guard
- **Rule:** No `localStorage` access in server components or server functions.
- **Enforcement:** `useSsoSession()` returns `undefined` on server; apps use default skin and independent auth on SSR.
- **Violation:** `localStorage` called in `layout.tsx` server component, `page.tsx` server component, or API route.
- **Exception:** None — localStorage is client-side only.

## Reusability and Modularity Requirements

### RM-001: SsoProvider is Framework-Agnostic (Within React)
- **Rule:** SsoProvider must work as a standalone React component without framework-specific assumptions.
- **Enforcement:** No Next.js route handlers, no Remix data loading, no Gatsby queries inside the component.
- **Violation:** Using `useNavigation`, `useNavigationState`, or other Next.js Router hooks inside SsoProvider.
- **Exception:** None — keep component framework-agnostic.

### RM-002: useSsoSession is Testing-Friendly
- **Rule:** The hook must be unit-testable without requiring a full browser environment for basic logic.
- **Enforcement:** Abstract localStorage behind a mockable interface; tests can provide mock localStorage.
- **Violation:** Direct `window.localStorage` calls that cannot be mocked in Jest without jsdom.
- **Exception:** Use `global.localStorage` in test environment (jsdom provides this).

### RM-003: Session Key Format is Stable
- **Rule:** The session key format `mw_sso_session` must not change between plan versions without a major version bump.
- **Enforcement:** Use the exact key format; any change requires migration logic documented in report.md.
- **Violation:** Changing the key format from `mw_sso_session` to something else without a migration script.
- **Exception:** Major version bump (e.g., 1.0.0 → 2.0.0) allows format changes with migration.

### RM-004: Event Naming Convention
- **Rule:** All SSO events must use `mw:sso-` prefix for uniqueness.
- **Enforcement:** `window.dispatchEvent(new Event('mw:sso-session'))`, `window.dispatchEvent(new Event('mw:sso-signout'))`.
- **Violation:** Using generic event names like `session` or `signout` without prefix.
- **Exception:** None — collision avoidance with other libraries.

## Naming Conventions

### NC-001: Session Keys
- Global SSO session: `mw_sso_session` (single key for all apps)
- Per-app skin preference: `mw_skin_preference:{appName}` where `{appName}` is the lowercase app directory name
- Example: `mw_skin_preference:dock`, `mw_skin_preference:headquarter`, `mw_skin_preference:jizz`

### NC-002: Event Names
- Session update: `mw:sso-session`
- Sign-out coordination: `mw:sso-signout`
- Skin preference sync: `mw:sso-skin-preference` (optional)
- Swarm session sync: `mw:sso-swarm-session` (optional)

### NC-003: Hook and Component Names
- Hook: `useSsoSession` (verb-noun pattern, camelCase)
- Provider: `SsoProvider` (PascalCase, descriptive of function)
- Utilities: `ssoSession` (camelCase, utility functions)
- Constant: `SSO_SESSION_KEY = "mw_sso_session"` (UPPER_CASE with prefix)

### NC-004: File Names
- Hook: `use-sso-session.ts` (kebab-case, descriptive)
- Utilities: `sso-session.ts` (kebab-case, descriptive)
- Provider: `sso-provider.tsx` (kebab-case, descriptive)
- API Route: `apps/*/src/app/api/auth/sso/route.ts` (standard Next.js pattern)

## API and Database Rules

### AR-001: useSsoSession Return Type
```typescript
function useSsoSession(): {
  session: SsoSession | undefined;
  setSession: React.Dispatch<React.SetStateAction<SsoSession | undefined>>;
  signIn: (credentials: SsoSignInCredentials) => Promise<SsoSession>;
  signOut: () => Promise<void>;
  isSsoAvailable: boolean;
  skinPreference: SkinId | undefined;
  setSkinPreference: (skin: SkinId) => void;
}
```

### AR-002: SsoSession Interface
```typescript
interface SsoSession {
  id: string;           // Session identifier
  userId: string;       // User identifier
  email: string;        // User email
  name: string;         // User name
  roles: string[];      // User roles (no tenant-specific roles)
  expiresAt: string;    // ISO timestamp
  issuedAt: string;     // ISO timestamp
  companyId: number;    // Derived per-app, not from session
  skinPreference: SkinId | undefined;  // Optional cross-app skin preference
}
```

### AR-003: SsoSignInCredentials Interface
```typescript
interface SsoSignInCredentials {
  email: string;
  password: string;
  deviceName?: string;
}
```

### AR-004: SSO API Route Contract (apps/*/src/app/api/auth/sso/route.ts)
```typescript
POST /api/auth/sso/sign-in
  Request: { email: string, password: string, deviceName?: string }
  Response: { session: SsoSession, token: string }

POST /api/auth/sso/sign-out
  Request: { sessionId: string }
  Response: { message: string }

GET /api/auth/sso/session/{sessionId}
  Response: { session: SsoSession }
```

### AR-005: Session Token Format
- JWT with `sub`, `email`, `name`, `roles`, `exp`, `iat` claims
- No tenant-specific claims (`company_id` not in token)
- Signed by SSO hub secret key
- Short-lived (1 hour) with refresh capability

## UI/UX and Design-System Consistency

### UX-001: SSO Provider Visual Design
- **Pattern:** Invisible provider — no UI rendered by `SsoProvider` component
- **Integration:** Wraps entire app; no visual component added
- **Validation:** No impact on component tree depth or render performance

### UX-002: Sign-In/Sign-Out UI Consistency
- **Rule:** SSO sign-in uses the same UI as per-app sign-in (Better Auth components)
- **Enforcement:** No custom auth UI; leverage existing `@moonwitness/ui` form controls
- **Violation:** Building custom auth forms instead of using `Button`, `Input`, `Card` from `@moonwitness/ui`
- **Exception:** None — design system consistency is mandatory

### UX-003: Focus and Keyboard Navigation
- **Rule:** SSO components (if any) must be fully keyboard accessible.
- **Implementation:**
  - Focus trap within any SSO modals (none required)
  - Tab/Shift+Tab cycles through existing auth controls
  - Enter/Space activates selection
  - Escape closes overlay and returns focus to trigger
  - Focus-visible style on all focusable elements
- **Validation:** axe-core passes focus-visible checks

### UX-004: Reduced Motion Respect
- **Rule:** Users with `prefers-reduced-motion` must experience reduced animation.
- **Implementation:**
  - SSO session sync uses `transition: none` or reduced-duration values
  - No automatic cycling or auto-play of session sync indicators
  - Motion is decorative, not functional — content remains accessible without motion
- **Validation:** Test with `@media (prefers-reduced-motion: reduce)` in DevTools

### UX-005: Accessibility Standards
- **Rule:** Meet WCAG AA for all SSO integration points.
- **Requirements:**
  - ARIA-label on SSO trigger (if any — usually invisible)
  - Focus-visible indicator meets 3:1 contrast ratio against background
  - Color contrast of auth UI meets AA (already verified by design system)
  - Role="dialog" or role="menu" appropriately used
  - Escape key dismisses dialog
  - Focus returns to opening element on close

## Security and Privacy Requirements

### SEC-001: No Sensitive Data in Session Token
- **Rule:** SSO session token stores only minimal user identity — no tokens, secrets, user identifiers, or PII beyond email/name.
- **Enforcement:** Type validation ensures only valid SsoSession values are stored.
- **Violation:** Storing anything other than a SsoSession-compatible object in the session.
- **Exception:** None — data minimization principle.

### SEC-002: localStorage is Client-Side Only
- **Rule:** Session logic acknowledges localStorage is browser-specific and not shared across devices.
- **Enforcement:** Server returns undefined; client handles persistence.
- **Violation:** Assuming localStorage persists across devices or browsers.
- **Exception:** None — localStorage is ephemeral.

### SEC-003: No XSS Risk from Stored Values
- **Rule:** Session values are from TypeScript type, not user input, so no injection risk.
- **Enforcement:** Validate stored value against `SsoSession` type before accepting.
- **Violation:** Using stored value directly without type validation.
- **Exception:** None — type safety prevents injection.

### SEC-004: Privacy by Default
- **Rule:** No SSO session is stored until the user actively makes a selection (signs in).
- **Enforcement:** Session is `undefined` by default; only set on user sign-in.
- **Violation:** Session automatically set on component mount without user action.
- **Exception:** None — user consent required.

### SEC-005: Token Security
- **Rule:** SSO session tokens are signed JWTs with short expiration (1 hour).
- **Enforcement:** Token signature validation on server; refresh mechanism available.
- **Violation:** Long-lived tokens, unsigned tokens, or tokens without expiration.
- **Exception:** None — security best practices.

### SEC-006: Cross-App Token Validation
- **Rule:** Each app validates SSO token against its own tenant context.
- **Enforcement:** App checks `company_id` in token matches derived principal; rejects if mismatch.
- **Violation:** App accepts token without validating tenant context.
- **Exception:** None — tenant isolation enforced at consumption.

## Testing and Quality Requirements

### TQ-001: Unit Test Coverage Minimum
- **Hook `useSsoSession`:** 100% branch coverage for all code paths
  - Valid session read
  - Undefined return (no localStorage / localStorage unavailable)
  - Session write success
  - QuotaExceededError catch
  - Corrupted value handling
  - Event dispatch: session and signout
  - Skin preference sync
  - Swarm session sharing

- **Utilities `sso-session`:** 100% statement coverage for all functions
  - readSession(), writeSession(), clearSession(), subscribe(), unsubscribe()
  - Error handling for all edge cases

- **Component `SsoProvider`:** 100% statement coverage for render and interaction paths
  - Provides session state to children
  - Dispatches session events on change
  - Handles sign-out coordination
  - Hydration compatibility

### TQ-002: Integration Test Coverage
- Each app (dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp) renders default skin when no SSO preference
- Each app persists and recalls user session after reload
- Per-app tenant isolation: dock session does not affect headquarter tenant
- SSO sign-in in one app auto-logs in user in other open apps
- Sign-out from any app revokes session across all apps
- Swarm session sharing between apps
- Skin preference sync between apps (optional)
- SSO integrates without breaking existing auth flows

### TQ-003: Accessibility Test Coverage
- axe-core automated scan: 0 violations
- Keyboard-only navigation complete (no mouse needed)
- Screen reader compatible (ARIA labels, roles)
- Focus-visible states present and discernible
- Reduced motion media query honored

### TQ-004: Performance Test Coverage
- SSO session resolution completes within 50ms
- Bundle size impact < 1KB gzip compressed
- No layout shift on skin change
- Re-render is confined to SkinRoot and descendants
- Session sync latency < 200ms (token validation and session sync)

### TQ-005: Quality Gate Compliance
- `pnpm typecheck` — 0 TypeScript errors across all packages
- `pnpm lint:arch` — 0 architectural invariant violations
- `pnpm docs:check` — 100/100 passed
- `pnpm ui:test` — design system component and skin contracts pass
- `pnpm ui:contrast` — WCAG ratios verified for all 6 skin token pairs
- App builds: `pnpm dock:build`, `pnpm headquarter:build`, `pnpm jizz:build`, `pnpm gate:build`, `pnpm harbor:build`, `pnpm id:build`, `pnpm moonsky:build`, `pnpm sentinel:build`, `pnpm e-isp:build` all pass

## Performance Constraints

### PC-001: SSO Session Latency
- **Requirement:** SSO session resolution and session sync must complete within 200ms.
- **Measurement:** Performance.mark timing from sign-in request to session propagation.
- **Acceptable:** < 200ms on typical devices (desktop, modern mobile).
- **Unacceptable:** > 500ms, causing perceptible delay or layout flash.

### PC-002: Initial Bundle Impact
- **Requirement:** SSO provider, hook, and utilities must not increase initial bundle size by more than 1KB (gzip).
- **Measurement:** `source-map-explorer` or `next build` analyzer comparison.
- **Acceptable:** < 1KB increase to gzip-compressed JS.
- **Unacceptable:** > 5KB increase, or any increase to CSS bundle.

### PC-003: No Layout Shift on Skin Change
- **Requirement:** Skin change must not cause cumulative layout shift (CLS).
- **Implementation:** SkinRoot token swap must be height/width stable across all 6 skins, or use `visibility: hidden` + `transition` pattern.
- **Validation:** Lighthouse CLS score unaffected by skin changes.

### PC-004: SSR Hydration Performance
- **Requirement:** Next.js must not produce hydration warnings related to skin or SSO.
- **Implementation:** `useSsoSession` returns `undefined` on server; SkinRoot uses default on first render.
- **Validation:** `next build` and `next start` produce 0 hydration warnings in logs.

### PC-005: Cross-App Sync Latency
- **Requirement:** Session sync between open apps must complete within 50ms.
- **Measurement:** Time from `window.dispatchEvent` in one tab to `useSsoSession` update in another.
- **Acceptable:** < 50ms on desktop browsers.
- **Unacceptable:** > 100ms, causing perceptible delay.

## Backward Compatibility Requirements

### BC-001: Existing Authentication Flows Unchanged
- **Rule:** When no SSO session is set, each app must authenticate identically to before this feature.
- **Verification:** Compare screenshots/output of dock (imperium-lumen), headquarter (nexus-paradox), jizz (mycelium) before and after deployment.
- **Violation:** Default authentication rendering changes without a preference being set.
- **Exception:** None — backward compatibility is mandatory.

### BC-002: No Breaking Changes to Existing APIs
- **Rule:** No existing public API may be removed or modified in a breaking way.
- **Enforcement:** All new additions (hook, component, API route) are additive only; existing exports remain unchanged.
- **Violation:** Removing or renaming existing `BetterAuth` integration, changing `@allah/sdk` auth operations.
- **Exception:** Minor version patch may include bug fixes to existing APIs.

### BC-003: TypeScript Compatibility
- **Rule:** All packages must maintain TypeScript strict compatibility.
- **Enforcement:** `pnpm typecheck` passes before and after changes.
- **Violation:** New TypeScript errors introduced by the feature.
- **Exception:** None — strict mode is a hard gate.

### BC-004: Downlevel Support (Next.js 16)
- **Rule:** Feature must work with Next.js 16 App Router (the version used in this monorepo).
- **Enforcement:** Tested with `pnpm dock:build`, `pnpm headquarter:build`, `pnpm jizz:build`, etc.
- **Violation:** Feature requires Next.js 17+ features (e.g., `next` config changes, new router APIs).
- **Exception:** None — monorepo locks to Next.js 16.

### BC-005: Per-App Default Skins Preserved
- **Rule:** Each app retains its configured default skin when no SSO skin preference is set.
- **Verification:** dock→imperium-lumen, headquarter→nexus-paradox, jizz→mycelium, etc.
- **Violation:** Default skin assignment changed without user preference.
- **Exception:** None — app-specific defaults are mandatory.

## Forbidden Patterns and Anti-Patterns

### FP-001: Direct localStorage Without Guarding
```typescript
// FORBIDDEN — no error handling
const session = localStorage.getItem('mw_sso_session');
setSession(session as SsoSession);
```

**Why:** Crashes if localStorage unavailable (SSR, private browsing, quota exceeded).

**Allowed:**
```typescript
// ALLOWED — guarded
let session: SsoSession | undefined;
try {
  session = localStorage.getItem('mw_sso_session') as SsoSession;
} catch {
  // swallow, use undefined
}
setSession(session);
```

### FP-002: Server-Side localStorage Access
```typescript
// FORBIDDEN — localStorage unavailable on server
const session = localStorage.getItem('mw_sso_session');
SkinRoot skin={session?.skinPreference};
```

**Why:** Next.js SSR runs on server where localStorage is undefined.

**Allowed:**
```typescript
// ALLOWED — returns undefined on server
const [session, setSession] = useSsoSession();
// SkinRoot renders default when session is undefined (on server)
SkinRoot skin={session?.skinPreference || defaultSkinId};
```

### FP-003: Global Session Token Without Tenant Validation
```typescript
// FORBIDDEN — tenant isolation violation
const { companyId } = session;  // company_id from SSO token
```

**Why:** SSO token doesn't contain company_id; each app must derive it from principal.

**Allowed:**
```typescript
// ALLOWED — per-app tenant derivation
const companyId = deriveCompanyIdFromPrincipal(principal);  // app-specific logic
// SSO token only provides user identity, not tenant context
```

### FP-004: Using Session Token Strings Instead of SsoSession Type
```typescript
// FORBIDDEN — no TypeScript safety
const session = userSelectedSession;  // string, not SsoSession type
```

**Why:** No compile-time validation, typos, no autocomplete, runtime errors.

**Allowed:**
```typescript
// ALLOWED — typed
const session: SsoSession = userSelectedSession;  // SsoSession is interface type
```

### FP-005: Hard-Coded Event Names Without Prefix
```typescript
// FORBIDDEN — not maintainable, risk of collision
window.dispatchEvent(new Event('session'));
window.dispatchEvent(new Event('signout'));
```

**Why:** Violates event naming convention, risk of collision with other libraries.

**Allowed:**
```typescript
// ALLOWED — prefixed
window.dispatchEvent(new Event('mw:sso-session'));
window.dispatchEvent(new Event('mw:sso-signout'));
```

### FP-006: Introducing New External Dependencies
```typescript
// FORBIDDEN — violates no-new-dependencies rule
import { useDisclosure } from '@nextui/core';  // new dependency
```

**Why:** Bloat, maintenance burden, potential conflicts.

**Allowed:** Use only React APIs and `@moonwitness/ui` exports.

### FP-007: SSO Session in Server Components
```typescript
// FORBIDDEN — localStorage unavailable on server
function ServerComponent() {
  const session = localStorage.getItem('mw_sso_session');
  return <div>{session?.email}</div>;
}
```

**Why:** Next.js SSR runs on server where localStorage is undefined.

**Allowed:**
```typescript
// ALLOWED — client component only
'use client';

function ClientComponent() {
  const { session } = useSsoSession();
  return <div>{session?.email}</div>;
}
```

### FP-008: Storing Tenant Context in SSO Token
```typescript
// FORBIDDEN — tenant context in token violates isolation
const token = jwt.sign({ email, companyId, ... });  // companyId in token
```

**Why:** SSO token should not contain tenant-specific data; each app derives company_id independently.

**Allowed:**
```typescript
// ALLOWED — user identity only
const token = jwt.sign({ email, name, roles, exp, iat });  // no tenant data
```

## Agent Execution Boundaries

### AE-001: Planning-Only Operation
- **Rule:** This plan document is for architectural planning only.
- **Enforcement:** Do NOT modify production source code during planning phase.
- **Violation:** Creating actual component files, modifying layout.tsx, or writing production code.
- **Exception:** Plan creation phase (this task) is allowed; implementation phase requires separate authorization.

### AE-002: Preserve Existing Conventions
- **Rule:** Must not overwrite, rename, or discard existing plan directories without cause.
- **Enforcement:** New plans get new timestamped directory names; existing plans preserved.
- **Violation:** `rm -rf .plans/old-plan` or overwriting existing plan files.
- **Exception:** User explicitly requests cleanup of old plans.

### AE-003: Git and Branch Workflow
- **Rule:** Plan directories should not be committed unless explicitly requested.
- **Enforcement:** `.gitignore` may include `.plans/` or specific plan directories.
- **Violation:** Committing `.plans/` changes without user authorization.
- **Exception:** If `.plans/` is tracked in git and user requests commit.

### AE-004: Validation Before Completion Claim
- **Rule:** Before marking any task as complete, must verify the quality gates pass.
- **Enforcement:** Run `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check` for affected packages.
- **Violation:** Claiming completion without running verification commands.
- **Exception:** User explicitly waives verification (rare).

### AE-005: Cross-Repository Contract Preservation
- **Rule:** MoonWitness ecosystem invariants must be preserved across all packages.
- **Enforcement:** `STYLE_PURITY`, `PALETTE_PURITY`, `TENANT_ISOLATION`, `CLIENT_SECRETS` invariants remain intact.
- **Violation:** Any invariant weakened or bypassed by the feature.
- **Exception:** None — invariants are non-negotiable.

## Git and Branch Workflow Requirements

### GW-001: Plan Directory Naming
- **Format:** `YYYYMMDD-HHMMSS-descriptive-slug`
- **Example:** `20261105T170000-cross-app-sso`
- **Enforcement:** All plan directories follow this convention.
- **Violation:** Random names, missing timestamps, non-descriptive slugs.

### GW-002: Plan Files Must Not Contain Sensitive Data
- **Rule:** No API keys, secrets, tokens, or credentials in plan documents.
- **Enforcement:** Review all `.md` files before committing.
- **Violation:** Accidental inclusion of sensitive data in spec/design/task/rule documents.

### GW-003: Task Status Updates
- **Rule:** Task list (`task.md`) must be updated live during execution.
- **Enforcement:** Mark tasks as `in_progress` when work begins, `completed` when done.
- **Violation:** Leaving tasks as `pending` after work is done, or marking complete without verification.

### GW-004: No Duplicate Plans
- **Rule:** Cannot create a plan directory that already exists for this feature.
- **Enforcement:** Check `.plans/` before creating new directory.
- **Violation:** Creating `20261105T170000-cross-app-sso` when it already exists.

## Validation Requirements Before Marking Tasks Complete

### VR-001: TypeScript Verification
- [ ] `pnpm typecheck` passes for `@moonwitness/ui`, dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp
- [ ] No new `type` or `any` errors introduced
- [ ] All new TypeScript types are correctly exported and importable

### VR-002: Architecture Lint Verification
- [ ] `pnpm lint:arch` passes with 0 architectural violations
- [ ] `TENANT_ISOLATION` invariant maintained
- [ ] `STYLE_PURITY` invariant maintained
- [ ] `PALETTE_PURITY` invariant maintained
- [ ] No new TODO/FIXME/HACK comments in code files

### VR-003: Documentation Verification
- [ ] `pnpm docs:check` passes (100/100)
- [ ] All four plan documents (spec, design, task, rule) are synchronized and consistent
- [ ] No contradictory information across documents
- [ ] Cross-references between documents are valid

### VR-004: Build Verification
- [ ] `pnpm dock:build` passes
- [ ] `pnpm headquarter:build` passes
- [ ] `pnpm jizz:build` passes
- [ ] `pnpm gate:build` passes
- [ ] `pnpm harbor:build` passes
- [ ] `pnpm id:build` passes
- [ ] `pnpm moonsky:build` passes
- [ ] `pnpm sentinel:build` passes
- [ ] `pnpm e-isp:build` passes
- [ ] No Next.js hydration warnings in build output

### VR-005: Accessibility Verification
- [ ] axe-core scan: 0 violations on SSO integration points
- [ ] Keyboard navigation tested and working
- [ ] Focus-visible states present
- [ ] Reduced motion media query honored

### VR-006: Bundle Size Verification
- [ ] gzip-compressed bundle impact < 1KB
- [ ] Measured via Next.js bundle analyzer or source-map-explorer

### VR-007: Functional Verification
- [ ] SSO sign-in in one app auto-logs in user in another app
- [ ] Sign-out from any app revokes session across all apps
- [ ] Skin preference persists across page reloads
- [ ] Default skin renders when no preference set
- [ ] Swarm session sharing between apps
- [ ] SSO session resolves within 200ms
- [ ] Session sync between tabs within 50ms

### VR-008: Error Scenario Verification
- [ ] localStorage unavailable gracefully handled (falls back to default)
- [ ] Corrupted session value falls back to default
- [ ] Quota exceeded handled without crash
- [ ] Console warnings for edge cases (no runtime errors)
- [ ] SSO hub unavailable falls back to per-app auth
- [ ] Mismatched tenant context rejects session

### VR-009: Cross-Browser/Device Verification
- [ ] Works in Chrome, Firefox, Safari (latest versions)
- [ ] Works on desktop and mobile breakpoints
- [ ] Reduced motion tested via DevTools device toolbar
- [ ] Works in incognito/private browsing modes
- [ ] Works with localStorage disabled (falls back gracefully)

### VR-010: Audit Logging Verification
- [ ] Audit events captured for sign-in, sign-out, session sync
- [ ] Each audit event contains `company_id` derived from principal
- [ ] Audit logs stored in write-once content-addressed storage
- [ ] No PII in audit logs beyond user identity (email, name, roles)