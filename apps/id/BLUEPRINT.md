---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP-ID-BLUEPRINT"
version: "1.0.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-05"
---

# MoonWitness ID — Product & Technical Blueprint

> **Product thesis:** one canonical identity, one understandable account experience, and one revocable trust boundary for the connected MoonWitness and A-L-L-A-H.COM ecosystem.

This document defines the target product and architecture for `apps/id`. It distinguishes verified implementation from planned capability. It does not authorize production migration, DNS changes, secret rotation, or deployment.

## 1. Product identity

| Attribute | Contract |
|---|---|
| Product | MoonWitness ID |
| Repository | `apps/id` |
| Workspace package | `@moonwitness/id` |
| Category | Identity experience · account center · SSO entry |
| Master DNA | LUNAR CHRONICLES |
| Local port | 3003 |
| Frontend | Next.js 16 · React 19 · TypeScript |
| Identity authority | ARSY |
| Auth implementation | Better Auth hosted by ARSY |
| Client integration | `@allah/sdk` |
| Shared contracts | `@moonwitness/types` |
| Shared UI | `@moonwitness/ui` |

### Mission

MoonWitness ID makes ecosystem identity coherent without centralizing every user workflow into one application. It is the user's secure entry and account-control surface. ARSY owns identity truth and authorization; ID makes those capabilities understandable and usable.

### North-star outcome

A member can establish or access one canonical account, understand which identity is active, see the sessions representing that identity, revoke a session at the authority, and continue to a connected product without creating a second account at every destination.

This outcome is achieved only when cross-application behavior is proven end-to-end across canonical hostnames and the real session policy. A shared login screen or successful local API call alone is insufficient.

## 2. Non-negotiable architecture decisions

1. **ARSY owns identity authority.** ID must not maintain a shadow user database or make authorization decisions from client state.
2. **One canonical identity namespace.** ORM `res.users` is the canonical audit/user identity; Better Auth records are linked through the ARSY adapter.
3. **Principal-derived tenancy.** Tenant context comes from a verified principal. Never trust browser-supplied `company_id`.
4. **Default deny.** Protected ARSY endpoints require a verified principal. Public access is explicit and narrow.
5. **One-time first owner.** Initial superuser onboarding is an ARSY operation, atomic and non-repeatable. No seeded administrator password.
6. **Registration is not privilege escalation.** New registrations receive the regular `user` role.
7. **Session revocation is authoritative.** ARSY enforces revocation; removing a card in the browser is not a security control.
8. **Shared functional UI.** ID uses `@moonwitness/ui`, `@allah/sdk`, and `@moonwitness/types`; it does not fork primitives or shared contracts.
9. **Separate product surfaces.** ID is not Headquarter, Dock, GATE, or a replacement for their workflows.
10. **Evidence over assertion.** `implemented`, `verified`, `released`, and `deployed` are separate states.

Canonical decisions: [../../DECISIONS.md](../../DECISIONS.md) D-001, D-003, D-006–D-008, D-013–D-017.

## 3. Product domain and responsibility

### ID owns

- Sign-in and sign-out experience.
- Regular account registration.
- First-run initial-owner onboarding UI.
- Account overview and identity presentation.
- Current account's session inventory and revocation interaction.
- Identity guidance and ecosystem hand-off.
- Clear communication of authentication and account state.

### ARSY owns

- Canonical user and credential records.
- Better Auth server and adapter.
- Authentication, session issuance, expiry, and revocation.
- Principal resolution and protected-route enforcement.
- Tenant assignment and membership.
- Roles, permissions, and privileged operations.
- One-time onboarding availability and atomic completion.
- Identity persistence, migrations, and audit trail.

### Explicitly outside ID

- Organization administration and cross-tenant policy management.
- ISP subscriber, billing, network, and service lifecycle.
- MOONSKY conversations, provider sessions, channels, and message delivery.
- Headquarter operational command workflows.
- Dock editorial/community publishing.
- Observatory data and research workflows.

ID may link to these experiences. It must not absorb their data or become a second operations console.

## 4. Identity and tenant semantics

### Canonical identity

- `res.users` is the canonical ORM identity referenced by audit fields.
- Better Auth user, credential-account, session, and verification records are persisted through the ARSY-owned adapter.
- Better Auth identity remains linked to the canonical ARSY user; no parallel ID-only user authority is permitted.
- Authentication proves control of an account. It does not automatically grant membership or permission in every application.

### Tenant model — D-008

- Negative non-zero `company_id`: personal tenant, assigned as the negative of the user's positive user ID.
- Positive `company_id`: organization tenant.
- Zero: unassigned/system context; not a normal user tenant.
- A new account receives an isolated personal tenant.
- Organization sharing requires an explicit authorized membership/assignment operation.

The UI may display a safe membership summary when the API contract supports it. It must not derive permissions from the sign of an ID or expose internal tenant IDs as a substitute for authorization.

### Roles

- `system`: technical actor for system-owned writes; not a human login.
- `superuser`: initial/global administrator capability, constrained to explicit ARSY admin routes and audited operations.
- `user`: normal registered account.
- Future roles and permissions must be defined centrally in ARSY and shared types.

A client-side badge, hidden route, or navigation item is never an authorization boundary.

## 5. Route and experience architecture

### Route inventory

| Route | Purpose | Access |
|---|---|---|
| `/` | Identity landing and current-session-aware entry | Public; may read current user |
| `/login` | Email/password authentication | Public |
| `/register` | Regular account creation | Public subject to service policy |
| `/onboarding` | Initial superuser creation | Form only while ARSY confirms availability |
| `/account` | Profile summary, sessions, destinations | Authenticated |

### Route behavior

**Home**
- Explain MoonWitness ID and why the ecosystem uses it.
- Distinguish guest and authenticated states.
- Offer valid next actions only.
- Do not claim sign-in until ARSY confirms the current session.

**Sign-in**
- Accessible email/password form with browser autocomplete.
- Optional device label is descriptive, bounded, and not device attestation.
- Generic credential failure message; avoid account enumeration.
- Loading and disabled state prevent duplicate submission.
- Success routes to account center or a validated return destination.
- Never accept an arbitrary external redirect URL.

**Registration**
- Name, email, password, confirmation.
- UI minimum currently eight characters; service policy is authoritative.
- New account is regular user with isolated personal tenant.
- Do not claim email verification until a complete verification lifecycle exists.

**First-run onboarding**
- Query authoritative setup availability.
- Render form only while ARSY confirms availability.
- Current UI password minimum is twelve characters.
- ARSY enforces one-time completion atomically.
- If setup closes during submission, show a safe conflict and direct the operator to sign in; never retry blindly.
- No seeded account or shared password.

**Account center**
- Load canonical identity and active sessions through the SDK.
- Present only fields returned by typed APIs.
- Identify the current session.
- Revoke selected sessions through ARSY; update the UI only after success.
- Revoking the current session signs out and returns to login.
- Distinguish unavailable session data from an empty session list.

### Global states

Every route accounts for initial loading, empty data, unauthenticated/expired session, authorization denied, network/ARSY unavailable, validation failure, onboarding conflict, success, unexpected error, and not-found.

Use shared `StatePanel`, `StatusMessage`, and shared composition blocks. No raw control primitives or private duplicate design-system components inside the app.

## 6. Authentication and session architecture

### Current request path

```
Browser
  │ Better Auth client / @allah/sdk
  ▼
ARSY Fastify Hub
  ├── Better Auth handler: /api/auth/better/*
  │     ├── email/password authentication
  │     ├── HttpOnly session cookies
  │     └── ARSY-owned Better Auth adapter
  ├── principal resolution + default-deny guards
  ├── canonical res.users / auth.user linkage
  ├── session inventory and revocation routes
  └── @allah/arsy-orm → embedded PGlite
```

ID is the browser-facing experience. ARSY is the security boundary and persistence owner.

### Better Auth configuration verified in source

- Application name: `MoonWitness ID`.
- Base path: `/api/auth/better` under the configured ARSY auth prefix.
- Email/password enabled; minimum length eight characters.
- Password hashing and verification use bcrypt.
- User/session/account/verification fields map to ARSY adapter columns.
- Session cookies are HttpOnly, path `/`, SameSite=Lax; production cookies are Secure.
- Production requires a distinct Better Auth secret of at least 32 characters, public Better Auth URL, and explicit trusted origins.
- Auth startup runs versioned migrations and backfills credential accounts from existing password hashes.

### Cross-app SSO contract

The intended outcome is one identity across the ecosystem. Browser authentication across origins depends on cookie scope, SameSite policy, host topology, CORS, and credential forwarding.

Therefore:
- Do not assume a cookie set by one hostname is automatically available to sibling app hostnames.
- Do not weaken cookie security to make a demo work.
- Define the canonical ARSY auth origin and trusted application origins explicitly.
- Prefer documented SDK/session contracts for consumers.
- Any token exchange or hand-off must be short-lived, audience-bound, and validated server-side; single-use where practical.
- Never place session tokens in query strings, local storage, analytics, or logs.
- Test direct navigation, cross-subdomain navigation, expiry, sign-out, revocation, and CSRF against the real topology.
- If a flow is not verified, describe it as planned or partially integrated—not universal SSO.

### Configuration contract

| Variable | Owner | Purpose |
|---|---|---|
| `BETTER_AUTH_URL` | ARSY runtime | Public ARSY origin used by Better Auth |
| `BETTER_AUTH_SECRET` | ARSY runtime | Distinct Better Auth secret, minimum 32 characters |
| `NEXT_PUBLIC_AUTH_API_URL` | ID browser | Browser-reachable ARSY auth origin; URL only |
| `CORS_ORIGINS` | ARSY runtime | Explicit trusted browser origins |

No production secret belongs in app source, public environment variables, repository docs, or client bundles.

## 7. Security and privacy model

| Threat | Required control |
|---|---|
| Account enumeration | Generic sign-in failure; avoid revealing account existence |
| Credential theft | TLS in production, bcrypt verification, Secure HttpOnly cookies, no token exposure |
| Session replay | Expiry, server-side validation, revocation, no token in URL/storage |
| CSRF / cross-origin abuse | Explicit trusted origins, cookie policy, origin validation, security tests |
| Tenant spoofing | Principal-derived tenant; reject body-supplied tenant authority |
| Privilege escalation | Registration always regular user; privileged actions use explicit ARSY admin routes |
| Duplicate first owner | Atomic one-time onboarding transaction |
| Credential migration damage | Backup, rehearsal on restorable copy, integrity checks |
| Sensitive telemetry | Redact passwords, tokens, secrets, verification values, credential records |
| Session ambiguity | Show only service-confirmed metadata; no device-attestation claim |

Additional requirements:
- Never expose raw auth tables through generic CRUD.
- Never expose password hashes or Better Auth account tokens through SDK responses.
- Never store passwords in browser persistence.
- Do not retain unnecessary IP/device details beyond documented purpose and policy.
- Account deletion, privacy export, consent, and retention require explicit policy before implementation.
- Security reporting follows [../../SECURITY.md](../../SECURITY.md).

## 8. Visual and interaction blueprint — LUNAR CHRONICLES

### World statement

**The Living Universe Archive.** MoonWitness ID is the personal observatory entry point: the quiet place where a member verifies their own presence, sees which sessions are active, and chooses where to continue.

It must feel unlike IMPERIUM LUMEN's monumental gateway, NEXUS PARADOX's operational command environment, MYCELIUM's organic observatory, or a generic fintech login/dashboard.

### Composition grammar

- Editorial observatory composition, not a repeated SaaS card grid.
- Strong typographic hierarchy and controlled negative space.
- A precise identity form paired with an original lunar/celestial scene.
- Account center uses an atlas-like layout: identity anchor, session constellation/list, destination coordinates.
- Security details remain legible; decoration never competes with them.
- Mobile layout prioritizes form and account actions; no horizontal overflow.

### Material and motion

- Lunar cartography, measured lines, orbital arcs, archival coordinates, instrument labels, restrained mineral surfaces.
- Motion is purposeful for orientation or state transitions; no endless ambient animation that drains battery or reduces readability.
- Reduced-motion mode removes nonessential movement.
- Focus, error, success, and revoked states are unmistakable without relying on color alone.
- No borrowed proprietary HUDs, logos, characters, or copied interface compositions.

### Shared engine constraints

- Root skin: `lunar-chronicles`.
- Use `SkinRoot` and shared runtime tokens.
- Use `@moonwitness/ui` controls and composition blocks.
- App CSS owns layout/composition only; no parallel theme, palette, typography system, or private primitives.
- Icons come through the shared icon component.
- Maintain WCAG AA contrast, keyboard navigation, screen-reader semantics, and visible focus.
- Keep shared behavior consistent even when the visual world is distinctive.

Canonical visual authority: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md), [../../DNA/00-ENGINE-CONTRACT.md](../../DNA/00-ENGINE-CONTRACT.md), [../../DESIGN.md](../../DESIGN.md).

## 9. Future capability boundaries

These are target-state candidates, not current routes or capabilities.

| Capability | Product intent | Dependency / boundary |
|---|---|---|
| Profile settings | Edit approved profile fields | ARSY typed contract and audit |
| Email verification | Prove email control | ARSY verification lifecycle and delivery provider |
| Password recovery | Safe recovery and credential rotation | ARSY recovery tokens, expiry, rate limits |
| MFA | Second factor | Threat model, recovery codes, ARSY policy |
| Passkeys | Phishing-resistant authentication | WebAuthn origin/RP configuration and recovery |
| Linked providers | Connect approved identity providers | Provider allowlist and account-linking protections |
| Organization membership | View/accept membership | ARSY membership authority |
| Privacy controls | Export/delete, consent | Legal, retention, audit policy |
| SSO hand-off | Reliable return from any app | Verified cross-origin session or token-exchange contract |

Do not add a feature merely because a dependency supports it. Each capability requires product rationale, abuse analysis, service contract, migration strategy, and end-to-end tests.

## 10. Integration contracts

| Consumer | ID responsibility | Consumer / ARSY responsibility |
|---|---|---|
| GATE | Sign-in destination and account entry | GATE owns public discovery and protected route behavior |
| DOCK | Account entry and shared identity | DOCK owns community/editorial experience |
| HEADQUARTER | Account/session entry and identity hand-off | HEADQUARTER owns operator workflows and server authorization |
| WORLD OBSERVATORY | Shared identity where required | Observatory owns its data and domain permissions |
| MOONSKY | Shared operator identity entry | MOONSKY owns communication runtime; ARSY authorizes operators |
| ARSY | Human-facing identity client | ARSY owns canonical identity and authorization |

Requirements:
- Use shared SDK methods and shared types.
- Re-check authorization on every protected server request.
- Deep links never bypass destination authorization.
- Avoid duplicate login state stores in consumer apps.
- A downstream service outage must not corrupt identity records.

## 11. Operational and quality requirements

### Reliability

- ARSY unavailable: show an unavailable state; do not claim signed-out if status is unknown.
- Session expired: explain and route to sign-in without redirect loops.
- Revocation failure: retain the session and show an actionable error.
- Onboarding race: show setup closed; never retry account creation automatically.
- Partial data: label unavailable fields; never fabricate identity/session details.

### Performance

- Keep auth routes lean; do not load unrelated ecosystem data.
- Keep server-only dependencies and secrets out of browser bundles.
- Optimize artwork and decorative motion.
- Do not block sign-in on nonessential destination discovery.
- Prefer stable server-rendered layout and minimal client state.

### Accessibility

- Programmatic labels and appropriate autocomplete on every field.
- Validation errors associated with fields and announced.
- Status changes announced accessibly.
- Keyboard-only operation and visible, unobscured focus.
- Reduced-motion support and WCAG AA contrast.
- Revoke actions identify the exact session/device affected; no ambiguous icon-only action.

### Quality gates

```bash
pnpm docs:check
pnpm lint:arch
pnpm lint
pnpm typecheck
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
pnpm ui:test
pnpm ui:contrast
```

Run relevant ARSY auth tests and full repository gates for changes to auth, onboarding, sessions, tenancy, cookies, or identity migrations. Never claim a command passed unless it was actually run and its result recorded.

## 12. Verification matrix

| Scenario | Expected result |
|---|---|
| Fresh ARSY database | Setup reports available; no seeded human superuser |
| First owner setup | Exactly one superuser; concurrent/late setup rejected |
| Regular registration | Account has `user` role and isolated personal tenant |
| Duplicate email | Safe failure; no account enumeration |
| Valid sign-in | ARSY issues session; ID reflects authenticated state |
| Invalid sign-in | Generic error; no credential details exposed |
| Current account read | Only authenticated user's identity returned |
| Session list | Only current principal's sessions returned |
| Revoke another session | ARSY invalidates it; consumer access stops |
| Revoke current session | Session invalidated; ID returns to sign-in |
| Expired/revoked cookie | Protected API rejects; UI recovers without loop |
| Cross-app access | Consumer verifies principal and authorization server-side |
| Cross-origin navigation | Works only under explicitly configured and tested session contract |
| ARSY unavailable | Honest unavailable state; no false success |
| Tenant spoof attempt | Body tenant value cannot widen scope |
| Missing production config | ARSY fails closed for required Better Auth settings |

## 13. Delivery phases

1. **Documentation and contract freeze** — align README, blueprint, source routes, ARSY auth contract, and accepted decisions.
2. **Identity journey audit** — verify every route, state, and account/session edge case against source and tests.
3. **SSO topology proof** — define canonical hostnames, cookie behavior, trusted origins, and secure cross-app hand-off; record observed results.
4. **Account lifecycle design** — profile, verification, recovery, MFA, passkeys, membership, and privacy controls as separately scoped capabilities.
5. **LUNAR CHRONICLES refinement** — distinctive composition with no generic-dashboard fallback; preserve shared UI invariants.
6. **Security and regression verification** — abuse cases, tenant isolation, revocation, migrations, accessibility, performance.
7. **Release readiness** — only evidence-backed capabilities marked verified; deployment remains separately authorized.

## 14. Definition of Done

A change to MoonWitness ID is complete only when:
- Product behavior matches this blueprint and accepted ADRs.
- ID contains no duplicate identity authority, direct database access, or client-trusted authorization.
- Auth/session operations use ARSY and typed SDK contracts.
- First-run onboarding and registration role boundaries are tested.
- Session inventory and revocation are tested at the service boundary.
- Cross-app SSO claims match the real tested host topology.
- All route states are implemented and accessible.
- LUNAR CHRONICLES is unmistakable while shared UI behavior remains intact.
- Security, lint, type, build, and relevant integration gates pass.
- Documentation and changelog reflect the actual result.
- Evidence exists before status is promoted to verified, released, or deployed.

## 15. Canonical references

- Product overview: [README.md](README.md)
- Ecosystem architecture: [../../BLUEPRINT.md](../../BLUEPRINT.md)
- Accepted decisions: [../../DECISIONS.md](../../DECISIONS.md)
- Design doctrine: [../../DESIGN.md](../../DESIGN.md)
- LUNAR CHRONICLES DNA: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md)
- DNA engine contract: [../../DNA/00-ENGINE-CONTRACT.md](../../DNA/00-ENGINE-CONTRACT.md)
- Engineering rules: [../../AGENTS.md](../../AGENTS.md)
- Security: [../../SECURITY.md](../../SECURITY.md)
- Documentation ownership: [../../DOCUMENTATION_CONTRACT.md](../../DOCUMENTATION_CONTRACT.md)
