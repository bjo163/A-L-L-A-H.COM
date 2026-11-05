---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SSO-DESIGN"
version: "1.0.0"
owner: "architecture"
status: "proposed"
---

# Design — Cross-Application Single Sign-On (SSO)

## Boundary

The authentication infrastructure owns the SSO hub and session synchronization mechanics. Each application supplies its existing auth client and tenant context. The SSO layer integrates with `@moonwitness/ui` SkinRoot to preserve skin preferences and with `@allah/sdk` for core authentication operations. The SSO does not own user data — it synchronizes session state and identity tokens while each app retains its own tenant boundaries.

## Data Contract

- **Session Token:** Opaque JWT or session ID issued by the SSO hub, stored in `localStorage.mw_sso_session`
- **User Identity:** Minimal profile (`email`, `name`, `roles`) propagated from hub; each app enriches with its own tenant data
- **Skin Preference:** Stored per-app under `mw_skin_preference:{appName}`; SSO hub may sync aware preferences but never overrides default skin assignment
- **Tenant Context:** `company_id` derived from principal per app — never taken from request body or SSO hub
- **Swarm Session:** Optional mission ID and agent state shared via hub; each app owns its swarm orchestration logic

### Preference Key Format

```
mw_skin_preference:dock        → dock app skin preference
mw_skin_preference:headquarter  → headquarter app skin preference
mw_skin_preference:jizz         → jizz app skin preference
...
mw_sso_session                 → SSO hub session token (global)
```

## Interaction

### Authentication Flow

1. **Initial sign-in:** User signs in via any app (e.g., dock)
2. **SSO hub validation:** App forwards credentials to SSO hub endpoint `/api/auth/sso/sign-in`
3. **Token issuance:** SSO hub validates credentials, issues JWT, and stores session in `localStorage.mw_sso_session`
4. **Session sync:** Hub broadcasts session update to all open apps via `window.dispatchEvent(new Event('mw:sso-session'))`
5. **App integration:** Each app's `useSsoSession()` hook reads `mw_sso_session` and updates its local Better Auth session
6. **Subsequent app visits:** On app load, `useSsoSession()` checks `mw_sso_session`; if present, auto-logs in user without credential prompt

### Sign-Out Flow

1. **User initiates sign-out** in any app
2. **Local session clear:** App calls Better Auth `signOut()`, clears local `mw_sso_session`
3. **Hub broadcast:** App dispatches `window.dispatchEvent(new Event('mw:sso-signout'))`
4. **Remote session revocation:** Hub revokes server-side session
5. **Cross-app sync:** All open apps receive sign-out event and clear their local sessions
6. **User redirected:** Each app redirects to sign-in or landing page

### Skin Preference Sync

1. **User selects skin** in one app (e.g., dock selects rocksoul)
2. **Local storage update:** `localStorage.setItem('mw_skin_preference:dock', 'rocksoul')`
3. **SkinRoot integration:** `SkinRoot skin="rocksoul"` renders with rocksoul tokens
4. **Cross-app propagation:** On app switch or reload, other apps check `mw_skin_preference:{theirApp}`; if set, they adopt the skin; otherwise use their default
5. **SSR safety:** Server-rendered skin uses app's default; client hydration uses persisted preference

## Integration and Verification

Applications compose the SSO-aware components without native-control duplication or private CSS hooks. Verify:

- Session sync across all 9 apps (dock, headquarter, jizz, gate, harbor, id, moonsky, sentinel, e-isp)
- Sign-out coordination: single sign-out revokes across all apps
- Skin preference persistence and cross-app adoption
- Swarm agent session sharing between apps
- Graceful degradation when SSO hub unavailable
- TypeScript strict mode compliance across all packages
- WCAG AA compliance for auth UI in all skin states
- No hydration mismatches in Next.js App Router

## Open Decisions

1. **Session Storage Mode:** Use `localStorage` (persists across tabs) vs `sessionStorage` (per-tab only) — recommend `localStorage` with explicit per-tab handshake
2. **Sync Mechanism:** `window.dispatchEvent` vs Server-Sent Events vs WebSocket — recommend `dispatchEvent` for simplicity and zero dependencies
3. **Skin Preference Scope:** Per-app scoping with optional cross-app adoption — recommend per-app with user-initiated cross-app apply
4. **Hub Deployment:** Embedded in each app vs standalone microservice — recommend embedded API route per app for minimal deployment complexity

## Technical Decisions

### Architecture Pattern: Token-Based SSO with Client-Side Sync

- **No server session synchronization** — session token stored in `localStorage`, propagated via events
- **Hub as validation gateway** — credentials validated by hub; token issued and stored client-side
- **Tenant isolation preserved** — `company_id` derived per-app from principal, not from hub
- **Opt-in skin sync** — user must explicitly apply skin across apps; defaults preserved
- **Graceful degradation** — if hub unavailable, each app operates in independent mode

### Key Components

1. **`packages/ui/src/hooks/use-sso-session.ts`** — Hook for reading/writing SSO session
2. **`packages/ui/src/components/sso-provider.tsx`** — Provider that wraps app with SSO awareness
3. **`packages/ui/src/lib/sso-session.ts`** — Session management utilities (read, write, clear, subscribe)
4. **`apps/*/src/app/api/auth/sso/route.ts`** — SSO hub API route per application
5. **`packages/ui/src/hooks/use-skin-preference.ts`** — Extended hook that also syncs skin preferences (reuses existing infrastructure)

### Import Pattern

```typescript
// In each app
import { useSsoSession, useSsoSkinPreference } from '@moonwitness/ui';
import { SkinRoot } from '@moonwitness/ui';

// Integration
export default function RootLayout() {
  const { session, signIn, signOut, isSsoAvailable } = useSsoSession();

  return (
    <SkinRoot skin={session?.skin || defaultSkinId}>
      {children}
    </SkinRoot>
  );
}