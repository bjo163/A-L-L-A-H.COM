---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP-ID-README"
version: "1.0.0"
owner: "product"
status: "implemented"
last_verified: "2026-11-05"
---

# MoonWitness ID
## One identity. A connected universe.

**MoonWitness ID is the identity and account experience for the MoonWitness Universe and the wider A-L-L-A-H.COM ecosystem.** It gives a person one place to establish an account, enter the ecosystem, understand their identity, and govern the sessions that can act in their name.

It is not a second identity backend, a generic login template, or an administrative dashboard. It is the human-facing identity gateway: the place where access becomes understandable, deliberate, and revocable.

Its world is **LUNAR CHRONICLES** — a living lunar observatory, celestial chronicle, and universe archive. The experience should feel like entering and maintaining one's own point of presence in a vast connected universe: quiet, precise, observant, memorable, and trustworthy. Lunar language is a narrative and visual metaphor; it must never obscure security facts or imply that symbolism is identity evidence.

## Why it exists

A-L-L-A-H.COM unifies the continuing MoonWitness universe and the Empire of the Light ecosystem without erasing their distinct histories or product identities. Accounts must not fragment across applications, and each product must not invent its own password store, user identity, tenant authority, or session policy.

MoonWitness ID gives the ecosystem a coherent identity experience while **ARSY remains the authority** for identity records, authentication endpoints, tenant context, roles, and authorization. ID presents and manages that authority; it does not replace it.

## Product promise

- **One canonical account:** connected applications use the same ecosystem identity contract.
- **Visible access:** people can inspect their account and the sessions associated with it.
- **Revocable trust:** a session is terminated at the authority, not merely hidden in the browser.
- **Safe first ownership:** the initial superuser is created through a one-time setup flow; later registrations cannot claim privileged access.
- **Personal isolation by default:** new accounts receive an isolated personal tenant; organization access requires explicit authorization.
- **A distinct MoonWitness world:** LUNAR CHRONICLES gives identity a recognizable narrative home while using the shared Moon UI engine.

## What ID owns

1. **Identity entry:** sign-in, regular registration, and first-run initial-owner onboarding.
2. **Account home:** the authenticated person's identity summary and account state.
3. **Session governance:** listing active sessions, identifying the current device, and revoking a selected session.
4. **Ecosystem hand-off:** clear links to connected destinations such as Dock, Headquarter, and World Observatory.
5. **Identity guidance:** explain what the account controls, what it does not control, and where a user should go next.

## What ID does not own

- Canonical user, credential, session, role, tenant, or authorization persistence.
- Organization membership policy or privileged cross-tenant authorization.
- ISP subscriptions, network operations, communications, observatory data, or product-specific business data.
- A second authentication API or separate identity service.
- A duplicate operations console for Headquarter.
- Independent provider login systems in every application.

Those responsibilities remain with ARSY and the owning product services. ID consumes documented SDK and typed contracts; it does not reach into database tables or provider internals.

## Core journeys

### First installation — establish the first owner
When ARSY reports that no initial owner exists, the one-time onboarding flow lets the operator create the first superuser using their own credentials. No seeded password or shared administrator account is shipped. Availability and atomic completion are enforced by ARSY, never by a browser flag. A concurrent or late setup attempt must fail safely.

### Returning member — sign in
A member enters an email and password. ID sends the request to Better Auth endpoints served by ARSY, includes a descriptive device label, and reflects the service result. Errors must be understandable without disclosing whether a particular email exists or exposing internal details. Authentication is not automatic authorization to every product.

### New member — register
A person creates a regular account with a name, email, and password. The current UI checks matching passwords and a minimum of eight characters; ARSY remains authoritative. New registrations receive only the regular `user` role and an isolated personal tenant. Organization access is a separate authorized action.

### Account owner — inspect and revoke sessions
The account center reads the canonical identity and active sessions through `@allah/sdk`. Session revocation is sent to ARSY; the UI changes only after service success. Revoking the current session ends the local authenticated flow and returns the person to sign-in.

### Continue into the ecosystem
The account center links to connected applications. A link is not a promise that every user has permission to every destination; each destination must authorize every protected server request.

## Experience principles

- **Calm authority:** security actions are clear and deliberate, never theatrical or manipulative.
- **Human-readable truth:** show only account, session, device, and access states the service can verify.
- **No false assurance:** do not claim universal SSO, email verification, MFA, password recovery, or social login until implemented and end-to-end verified.
- **One task per moment:** sign-in, registration, onboarding, and session management have distinct flows.
- **Honest failure states:** loading, empty, unavailable, expired, rejected, and success states are designed.
- **Accessible by default:** keyboard operation, semantic labels, visible focus, reduced motion, readable contrast, and responsive layouts.
- **Privacy by design:** never expose credentials, session tokens, secrets, or unnecessary personal data in UI, URLs, logs, or analytics.

## LUNAR CHRONICLES — experience identity

LUNAR CHRONICLES is not a purple recolor of a generic SaaS login page. It is the identity archive of the MoonWitness Universe: a quiet observatory, a precise celestial instrument, and a personal record point within a larger living chronicle.

Its visual language may use lunar cartography, orbital notation, measured grids, deep-space negative space, archival indexing, instrument-like details, and restrained motion. It should communicate orientation, continuity, and careful observation.

- The form and account actions remain the primary actionable surfaces.
- Route and security state are immediately legible.
- Artwork is original or properly licensed; do not imitate proprietary game interfaces or reuse legacy assets without provenance.
- Motion communicates state or orientation, respects `prefers-reduced-motion`, and never delays access.
- No visual element impersonates a credential, security seal, verified badge, or real astronomical measurement.

Canonical DNA: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md). Shared doctrine: [../../DESIGN.md](../../DESIGN.md).

## Current implementation

This table describes source inspected on `dev`; it is not a production deployment claim.

| Area | Current implementation |
|---|---|
| App | Next.js 16.4.3 · React 19.3 · TypeScript · pnpm |
| Local port | 3003 |
| Visual world | `lunar-chronicles` via `SkinRoot` |
| UI | `@moonwitness/ui` |
| Client contracts | `@allah/sdk` · `@moonwitness/types` |
| Authentication | Better Auth client; server hosted by ARSY |
| Auth path | `/api/auth/better/*` on ARSY |
| Credentials | Email/password; eight-character minimum in regular registration |
| First-run | One-time ARSY onboarding creates initial superuser |
| Account | Current identity summary and ecosystem destination links |
| Sessions | List and revoke through ARSY SDK methods |
| Cookies | HttpOnly; production Secure; current ARSY SameSite=Lax |
| Tenant | Personal tenant assignment enforced by ARSY; see D-008 |
| Route states | Shared loading, error, and not-found components |

### Current routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Identity landing and session-aware entry | Public; may read current user |
| `/login` | Email/password sign-in | Public |
| `/register` | Regular account registration | Public subject to ARSY policy |
| `/onboarding` | Initial superuser setup | Form only while ARSY reports availability |
| `/account` | Identity summary, sessions, revocation, destination links | Authenticated |

## Runtime configuration

Authentication is configured by ARSY:
- `BETTER_AUTH_URL`: public ARSY origin used by Better Auth.
- `BETTER_AUTH_SECRET`: distinct secret of at least 32 characters; it must not equal the JWT secret.
- `NEXT_PUBLIC_AUTH_API_URL`: browser-reachable ARSY origin; URL only, never a secret.
- `CORS_ORIGINS`: explicit trusted browser origins.

Production ARSY startup fails closed if required Better Auth settings or trusted origins are missing. Never put server secrets in `NEXT_PUBLIC_*` variables or commit real `.env` files.

The current cookie policy is SameSite=Lax. Cross-origin and cross-subdomain SSO must be tested against the actual host topology; do not infer universal SSO merely because the product is called an SSO center.

## Development

From the repository root:

```bash
pnpm install
pnpm id:dev
```

Open [http://127.0.0.1:3003](http://127.0.0.1:3003).

```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```

Run the repository's required documentation, architecture, lint, type, UI, and integration gates before treating a change as complete. See [../../AGENTS.md](../../AGENTS.md), [../../QUALITY.md](../../QUALITY.md), and [../../AUTONOMOUS.md](../../AUTONOMOUS.md).

## Security boundary

- ARSY is the only authority for identity, tenant, role, and authorization.
- Tenant context is derived from a verified principal; never trust browser-supplied `company_id`.
- Regular registration cannot create a superuser.
- Onboarding availability and completion are decided by ARSY, not client state.
- Session revocation is enforced server-side and must invalidate the relevant session across consumers.
- HttpOnly cookies are not readable by application JavaScript.
- Logs, errors, and audit events must not disclose passwords, tokens, secrets, or credential-bearing records.
- Generic CRUD must not expose identity, audit, or credential-bearing models.
- Identity migrations and persistent auth data require a restorable backup, migration rehearsal, and explicit deployment authorization.

Security canon: [../../SECURITY.md](../../SECURITY.md), [../../DECISIONS.md](../../DECISIONS.md) D-008 and D-013–D-015.

## Product boundaries

| Surface | Relationship to ID |
|---|---|
| GATE | Public Empire entrance; directs visitors to identity when needed |
| DOCK | MoonWitness discovery/community; consumes canonical identity where required |
| HEADQUARTER | Command center; uses identity but owns operator workflows |
| ARSY | Canonical identity, auth, session, tenant, role, and authorization authority |
| WORLD OBSERVATORY | Separate product; may consume identity without moving observatory data into ID |
| MOONSKY | Independent communication service; operator identity is authorized through ARSY |

## Roadmap — not current capability claims

Candidates requiring separate design, security analysis, service contracts, and verification:
- Verified email and safe email-change lifecycle.
- Password reset and credential recovery.
- MFA and recovery codes.
- Passkeys / WebAuthn.
- Additional identity providers where justified.
- Trusted-device and session-risk signals.
- Organization membership and invitation experience.
- Consent, privacy export, and account deletion.
- Verified SSO hand-off and return flows across canonical application domains.

Do not claim a capability is available merely because Better Auth or another dependency supports it.

## Source of truth

- Application implementation: this directory.
- Product and technical contract: [BLUEPRINT.md](BLUEPRINT.md).
- Ecosystem architecture: [../../BLUEPRINT.md](../../BLUEPRINT.md).
- Accepted decisions: [../../DECISIONS.md](../../DECISIONS.md).
- Six visual worlds: [../../DNA/README.md](../../DNA/README.md).
- Engineering rules: [../../AGENTS.md](../../AGENTS.md).

When documentation and source disagree, report and reconcile the discrepancy; never silently promote target-state statements into completion claims.
