---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-CAPABILITY-MATRIX"
version: "1.0.0"
owner: "product-architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# MoonWitness ID Capability Matrix

This matrix distinguishes source-supported behavior from product proposals. Production origins and external-provider state were not inspected.

| Initiative | Status | Current evidence | Boundary / next dependency |
|---|---|---|---|
| Security & Trust Center | Partial | Account view reads the current user and active sessions; one session can be revoked. ORM audit records exist, and privileged audit reads are separate. | No member-facing posture summary or security-event endpoint. Define evidence-backed ARSY contract before adding a trust route or score. |
| Universal SSO & Federation | Unsupported | ID uses Better Auth sessions and links to product destinations. | No authorization-code handoff, client registry, redirect policy, federation contract, or tested cross-domain logout was found. Requires protocol and app-owner decisions. |
| Personal Identity Profile | Partial | Current-user read displays identity data; registration and onboarding collect initial credentials. | No typed SDK profile-update method or editable profile/preferences contract was found. Confirm ARSY writable fields and audit rules first. |
| Recovery & Verification | Unsupported | Better Auth email/password sign-in and sign-up are configured; verification model fields exist. | No active email delivery, email verification, or password-reset flow was evidenced in the inspected plugin/config. Do not render recovery controls until authority and delivery are proven. |
| Trusted Devices & Sessions | Partial | Session list includes device name, user agent, IP address, expiry, and current-session indication; revoke-one is supported. | No stable device registry, created/last-seen contract, rename, revoke-others transaction, or anomaly signal. Do not infer identity from user-agent data. |
| Privacy & Data Rights | Unsupported | Tenant, retention, legal-hold, and audit mechanisms exist in other data paths. | No ID consent ledger, personal export, or deletion request API was found. Requires data inventory, policy, and ARSY lifecycle contracts. |
| Lunar Identity Experience | Partial | ID uses the `lunar-chronicles` skin, shared UI controls/composition, route-specific metadata, and loading/error/not-found states. Unit tests cover the principal auth/account states. | No current browser viewport, accessibility, localization, reduced-motion, or visual-regression evidence was run in this slice. |
| Developer & Integration Center | Unsupported | Account UI has destination links and endpoint configuration is environment-driven. | Links are not an authority-backed client registry; no scopes/claims inventory or verified handoff diagnostic exists. |

## Baseline routes and access intent

| Route | Purpose | Access intent |
|---|---|---|
| `/` | Identity status and next action | Guest or signed-in arrival |
| `/login` | Better Auth email/password sign-in | Guest |
| `/register` | Regular account registration | Guest; server enforces first-run/setup policy |
| `/onboarding` | Initial owner setup | Guest only while server reports setup available |
| `/account` | Current identity, sessions, destination links | Authenticated |
| `loading.tsx`, `error.tsx`, `not-found.tsx` | Shared route loading, failure, and missing-route states | Framework route states |

## SDK and ARSY mapping

| ID call | SDK source | Authority behavior |
|---|---|---|
| `getOnboardingStatus` | [`index.ts`](../../packages/sdk/src/index.ts) | Reads setup availability from ARSY. |
| `getCurrentUser` | [`index.ts`](../../packages/sdk/src/index.ts) | Reads current principal profile from ARSY. |
| `getSessions` | [`index.ts`](../../packages/sdk/src/index.ts) | Reads current principal's sessions. |
| `revokeSession` | [`index.ts`](../../packages/sdk/src/index.ts) | Requests one-session revocation from ARSY. |
| `signOut` | [`index.ts`](../../packages/sdk/src/index.ts) | Calls the session sign-out route and clears the local SDK token when applicable. |
| Better Auth client | [`auth-client.ts`](../../apps/id/src/lib/auth-client.ts) | Uses the ARSY Better Auth route; cookies remain server-owned. |

## Origins and cookie evidence

- Development product origins are configured for localhost/127.0.0.1 ports 3000–3004. ARSY CORS and Better Auth trusted origins derive from configuration.
- `BETTER_AUTH_URL` and `CORS_ORIGINS` names are present; production values were not read. No production callback URL or deployed domain can be confirmed from source alone.
- Cookie configuration explicitly sets HttpOnly, SameSite=Lax, Secure in production, and Path `/`. No explicit `Domain` or cookie lifetime override was found. The session record has an expiry; production cookie behavior was not verified against a deployed host.
- ID public configuration names are `NEXT_PUBLIC_AUTH_API_URL`, `NEXT_PUBLIC_ECOSYSTEM_HOSTNAME`, `NEXT_PUBLIC_ECOSYSTEM_ORIGIN`, `NEXT_PUBLIC_ECOSYSTEM_DEV_HOSTNAME`, `NEXT_PUBLIC_ECOSYSTEM_PROTOCOL`, `NEXT_PUBLIC_DOCK_URL`, `NEXT_PUBLIC_HEADQUARTER_URL`, `NEXT_PUBLIC_ID_URL`, `NEXT_PUBLIC_JIZZ_URL`, `NEXT_PUBLIC_GATE_URL`, `NEXT_PUBLIC_MOONSKY_URL`, and `NEXT_PUBLIC_HARBOR_URL`. These are endpoint/host settings, not credentials.

## Explicitly unsupported in current evidence

No active password recovery, email verification delivery, federation handoff, personal profile edit, consent ledger, export/deletion workflow, or member-facing security-event feed was found in the inspected ID/ARSY contracts. Better Auth dependency capabilities alone are not evidence that these flows are configured.
