---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP-ID-BLUEPRINT"
version: "2.1.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-06"
---

# MoonWitness ID — Product, Experience & Technical Blueprint

> **Product thesis:** one canonical identity, one understandable account experience, and one revocable trust boundary for the connected MoonWitness and A-L-L-A-H.COM ecosystem.

This blueprint is the product and engineering contract for `apps/id`. It separates verified source baseline, target experience, and future capability. It does not authorize production migration, DNS, proxy, TLS, secret rotation, or deployment.

## 1. Product definition

| Attribute | Contract |
|---|---|
| Product | MoonWitness ID |
| Repository path | `apps/id` |
| Package | `@moonwitness/id` |
| Product category | Identity entry · account center · session governance |
| Master DNA | LUNAR CHRONICLES |
| Experience concept | THE LUNAR IDENTITY ARCHIVE |
| Tagline | One identity. A connected universe. |
| Local port | 3003 |
| Frontend | Next.js 16 · React 19 · TypeScript |
| Identity authority | ARSY |
| Auth client | Better Auth client |
| Auth service | Better Auth hosted by ARSY |
| SDK | `@allah/sdk` |
| Shared types | `@moonwitness/types` |
| Shared UI / skin engine | `@moonwitness/ui` |

### Mission

Make a canonical ecosystem identity usable, understandable, inspectable, and revocable without turning ID into a general-purpose portal or duplicating ARSY.

### North-star journey

`ARRIVE → IDENTIFY → ENTER → PROTECT → EXPLORE`

A member can access one canonical account, understand the identity currently active, inspect sessions known to ARSY, revoke a session at the authority, and navigate to a connected product. Cross-app continuity is considered achieved only after the actual hostname, cookie, callback, origin, and authorization flow passes end-to-end verification.

## 2. Authority and responsibility model

### 2.1 ARSY is the authority

ARSY exclusively owns:
- Canonical identity and credential persistence.
- Better Auth server, adapter, and auth endpoints.
- Session issuance, expiry, validation, and revocation.
- Principal resolution and protected API authorization.
- Tenant assignment and organization membership.
- Role and permission policy.
- Atomic one-time initial-owner onboarding.
- Identity migrations, audit trail, and security events.

ID exclusively owns the human-facing presentation and interaction:
- Sign-in and sign-out UX.
- Regular registration UX.
- Initial-owner setup UX.
- Account identity summary.
- Session inventory and revoke interaction.
- Destination discovery and safe hand-off.
- Accessible, truthful explanations of identity state.

ID must not access ARSY database tables directly, create a shadow user store, or implement an independent authorization engine.

### 2.2 Destination services

DOCK owns discovery and community journeys. HEADQUARTER owns operator and governance workflows. WORLD OBSERVATORY owns observation and research data. MOONSKY owns communication conversations, channels, provider sessions, and delivery. Each service authorizes its own protected requests. ID only links to those products and presents identity data supported by the API.

## 3. Canonical identity, tenant, and role semantics

### Canonical identity
- ORM `res.users` is the canonical identity referenced by audit fields.
- Better Auth user, credential-account, session, and verification records are linked through the ARSY-owned adapter.
- Authentication proves account control; it does not imply product membership or permission.
- No ID-only identity authority is permitted.

### Tenant semantics — D-008
- Negative non-zero `company_id`: personal tenant.
- Positive `company_id`: organization tenant.
- Zero: unassigned/system context, not a normal user tenant.
- New users receive isolated personal tenancy through ARSY.
- Organization sharing requires an explicit authorized membership operation.

ID may display a safe membership summary only when the API contract explicitly supplies it. It must not derive permissions from an ID sign, expose internal tenant IDs as authorization evidence, or accept tenant context from browser state.

### Roles
- `system`: technical actor, not a human login.
- `superuser`: privileged initial/global administrator capability, limited to explicit ARSY routes and audited operations.
- `user`: regular registration role.
- Future roles and permissions are defined centrally by ARSY and shared types.

Client badges, hidden navigation, route guards, and visual states are not authorization boundaries.

## 4. Current source baseline

Inspected on `dev` at ID implementation commit `d7a57dc`, then synchronized with the 57 upstream commits in merge `23c8eab`. This source baseline is not a production deployment claim.
- Package: `@moonwitness/id`, ESM.
- Scripts: `dev` / `start` on port 3003, `build`, `typecheck`, `test`.
- Dependencies include Next.js 16.4.3, React 19.3.0, Better Auth 1.7.16, `@allah/sdk`, `@moonwitness/types`, `@moonwitness/ui`.
- Existing routes: `/`, `/login`, `/register`, `/onboarding`, `/account`.
- Login uses Better Auth email/password client.
- Registration currently checks password confirmation and eight-character minimum; ARSY remains authoritative.
- Initial-owner UI checks onboarding availability through `mwClient.auth.getOnboardingStatus()`; current UI uses a twelve-character minimum.
- Account UI reads current user and sessions through `@allah/sdk`, and calls ARSY-backed revocation.
- Account destination links currently include Dock, Headquarter, and World Observatory.
- Route-specific page titles, associated local validation errors, confirmed revocation handling, and safe destination URL filtering are implemented in the ID UI.
- Current ARSY cookie baseline is HttpOnly, Secure in production, SameSite=Lax.

This baseline is source inspection, not proof of production hostname behavior, end-to-end SSO, or deployment.

## 5. Route contract

| Route | State | Purpose | Access |
|---|---|---|---|
| `/` | EXISTS | Session-aware arrival and orientation | Public; identity read optional |
| `/login` | EXISTS | Email/password authentication | Public |
| `/register` | EXISTS | Regular account creation | Public subject to ARSY |
| `/onboarding` | EXISTS | Initial superuser setup | ARSY availability required |
| `/account` | EXISTS | Identity, sessions, destinations | Authenticated |
| `/account/sessions` | PROPOSED | Dedicated session archive, only if justified | Authenticated |
| `/account/destinations` | PROPOSED | Dedicated destination index, only if justified | Authenticated |

Do not create proposed routes merely to satisfy this table. Prefer improving the existing account composition unless evidence shows a dedicated route materially improves focus, accessibility, or task completion.

### Route state matrix

Every route must handle applicable states:
- Initial loading and pending submission.
- Signed-out, signed-in, and expired-session conditions.
- Empty data and unavailable authority.
- Validation failure and rejected server operation.
- Retryable network/service failure.
- Success only after authoritative confirmation.
- Safe not-found and unauthorized navigation.

Avoid account enumeration. Do not expose raw internal stack traces or credential-provider messages.

## 6. Experience architecture — THE LUNAR IDENTITY ARCHIVE

### 6.1 ARRIVAL — Observatory Threshold (`/`)

Composition:
- One distinctive lunar instrument / atlas landmark; original artwork, not stock galaxy wallpaper.
- Editorial title and a short product explanation.
- One primary action selected from the verified session state.
- Secondary links for sign-in, registration, and initial setup only when applicable.
- Small, legible status/orientation detail; no fake coordinates or false live astronomy.

Behavior:
- Guest sees sign-in as the primary return path and registration as secondary.
- Authenticated user sees a clear continue-to-account path.
- Onboarding appears only after ARSY confirms it is available.
- If ARSY cannot be reached, show an honest unavailable state and retry path.

### 6.2 IDENTITY GATE — Authentication routes

Login, registration, and onboarding share a consistent field, focus, error, and submit language but each gets its own composition and content. Avoid identical generic centered-card pages. Form usability outranks visual effects.

Login:
- Email and password with appropriate autocomplete.
- Generic credential failure.
- Pending state prevents duplicate submission.
- No token or password echo.

Registration:
- Name, email, password, confirmation.
- Clearly explain regular account creation.
- No role, tenant, or privilege selector.
- Server result decides success.

Initial owner:
- Availability is read from ARSY.
- UI is unavailable while status is unknown or closed.
- One submission; ARSY must atomically reject race/late attempts.
- If creation succeeds but automatic sign-in fails, explain that the account exists and direct to login; never retry onboarding automatically.

### 6.3 PERSONAL ORBIT — Account (`/account`)

Three information layers:
1. **Identity Anchor:** name and email; only safe attributes from `UserSubject`.
2. **Trust Constellation:** session count, current session, concise session preview and a clear management action.
3. **Destination Orbit:** approved destination links with distinct roles and short explanations.

The account page is a composed personal space, not a dashboard grid. Use spatial hierarchy, a strong anchor, one primary account action, and a clear distinction between identity facts and navigation. Never display internal user or tenant IDs as decorative status.

### 6.4 SESSION ARCHIVE — Session governance

- Read session inventory from ARSY SDK.
- Identify current session using the server-provided current marker.
- Show only supported device label, IP, expiry, and other approved session fields.
- Revoke action is explicit and keyboard accessible.
- Keep the row visible on failure.
- Remove/update only after server success.
- Current-session revocation signs out locally and routes to login.
- Do not imply global invalidation unless every consumer validates the same ARSY session state.

### 6.5 DESTINATION ORBIT — Ecosystem hand-off

Each destination includes:
- Canonical label and purpose.
- Safe configured URL from approved endpoint resolver.
- Internal/external destination semantics.
- Optional return path only if allow-listed and validated.
- Clear statement that destination permissions are independently checked.

Never construct arbitrary destinations from user input. Never place credentials, bearer tokens, session IDs, or secrets in URLs. Cross-domain SSO requires a separate proven protocol; SameSite=Lax does not imply universal cross-domain session sharing.

## 7. LUNAR CHRONICLES visual system

### Art direction
**THE LUNAR IDENTITY ARCHIVE** — a quiet observatory instrument for a personal identity, not a public Empire monument.

### Visual grammar
- Deep observatory: layered midnight/charcoal surfaces and purposeful negative space.
- Lunar instrument: precise lines, etched ticks, measured labels, controlled metallic highlights.
- Orbital cartography: arcs, rings, coordinate relationships, and constellation connections only when semantically useful.
- Living chronicle: editorial typography, archive numbering, dates, and clear information provenance.
- Personal scale: intimacy and calm; no command-center density.

### Page composition differences
- Arrival: expansive and atmospheric, a single strong landmark.
- Login: focused, low-distraction, immediate form access.
- Registration: more instructional, with visible password expectations.
- Onboarding: deliberate first-owner ceremony without implying mystical privilege.
- Account: anchored identity composition with spatially grouped relationships.
- Session management: instrument/archive list optimized for comparison and precise actions.
- Destination hand-off: a navigable map/index, not another grid of generic cards.

### Type and color
Use the approved LUNAR CHRONICLES tokens and shared skin engine. Use display typography sparingly for page identity, neutral body typography for forms, and monospaced type only for real data such as timestamps. Do not hardcode a parallel palette or introduce app-local primitives.

### Motion
Motion may orient, reveal, confirm, or transition. It must not continuously spin, delay form interaction, obscure status, or be required to understand content. Respect `prefers-reduced-motion`, provide static fallbacks, and avoid audio as a required signal.

### Assets
Original or properly licensed only. Do not copy proprietary PlayStation/Xbox interfaces or unverified legacy MoonWitness assets. A visual effect must not resemble a security seal, biometric scan, verified credential, or astronomical fact unless it is actually such a thing.

## 8. Shared implementation contracts

- Use `@moonwitness/ui` for shared primitives, composition, and skin runtime.
- Use the shared LUNAR CHRONICLES skin; do not create a local token system.
- Use `@allah/sdk` for ARSY identity and session operations.
- Use `@moonwitness/types` for API subject/session types.
- Do not import ARSY database models into the frontend.
- Do not fork shared Button, Input, Form, StatePanel, SessionCard, or destination primitives without a documented gap and a shared-library-first fix.
- Keep server secrets in server runtime only.
- Avoid adding dependencies when platform or workspace capability already covers the requirement.

## 9. Security and privacy requirements

1. Default deny for protected information and operations.
2. ARSY derives principal, tenant, role, and permissions.
3. Regular registration always creates a regular user.
4. Initial owner setup is one-time, atomic, and server-controlled.
5. Session revocation is authoritative and auditable.
6. Cookie settings are configured by ARSY; ID does not attempt to widen cookie scope.
7. Cross-origin requests use explicit trusted origins; no wildcard credentialed CORS.
8. Return URLs and destination hosts are allow-listed.
9. No credentials/tokens/secrets in URL, localStorage, sessionStorage, logs, telemetry, or errors.
10. Do not expose internal user/tenant identifiers without a product requirement.
11. Avoid account enumeration and excessive personal-data disclosure.
12. No production secret, migration, DNS, proxy, or deployment changes in these plans.

### Cross-domain SSO proof checklist

Universal SSO is NOT VERIFIED. To claim it, prove:
- Exact canonical hostnames and registrable-domain topology.
- Cookie attributes and browser behavior.
- Trusted origins and CORS behavior.
- Login initiation, callback state/nonce, and return URL validation.
- Session validation at each destination.
- Logout and revocation propagation.
- CSRF, open-redirect, replay, and token-leakage tests.
- Browser tests on supported desktop/mobile browsers.

If any part is absent, describe the feature as a safe destination hand-off, not universal SSO.

## 10. Accessibility, responsive design, and resilience

- Semantic landmarks and heading order.
- Visible keyboard focus and logical tab order.
- Labels and instructions programmatically associated with fields.
- Errors announced and associated with affected controls.
- Contrast meets WCAG AA for normal text and controls.
- No state communicated only by color, sound, or animation.
- Touch targets are comfortably usable on narrow screens.
- At 320px width, no horizontal page overflow.
- At tablet and desktop, layouts use available space without stretching forms excessively.
- Reduced motion and static alternatives.
- Loading, empty, offline, expired, unauthorized, and error states remain understandable.
- Retry never duplicates a non-idempotent onboarding or registration request.

## 11. Quality gates and definition of done

A plan task is complete only when:
- Actual source and shared contracts were inspected first.
- The smallest responsible scope was changed.
- No duplicate authority, primitives, or invented capability was introduced.
- Acceptance criteria are checked with executable tests or reproducible manual evidence.
- Typecheck, relevant lint/tests, and production build pass.
- Responsive, keyboard, focus, contrast, and reduced-motion checks pass where UI changed.
- Documentation and plan status reflect evidence, not intention.
- The agent reports exact paths, commands, results, and unresolved blockers.

Expected package checks:
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```

Run repository-level gates required by `AGENTS.md`, `QUALITY.md`, and `AUTONOMOUS.md` when relevant. Never report a command as passing unless it was actually executed.

## 12. Delivery phases and dependencies

These phases ship as sub-issues of the [MoonWitness ID delivery epic](https://github.com/bjo163/A-L-L-A-H.COM/issues/3); the table is the index.

| Order | Plan | Outcome | Depends on |
|---:|---|---|---|
| 00 | Contract and baseline audit | Evidence-backed implementation map | None |
| 01 | Lunar visual foundation | Shared skin and composition contract | 00 |
| 02 | Arrival experience | Finished session-aware home | 00, 01 |
| 03 | Authentication journeys | Login and registration quality | 00, 01 |
| 04 | First-owner onboarding | Safe one-time setup UX | 00, 01 |
| 05 | Personal Orbit | Account identity composition | 00, 01 |
| 06 | Session Archive | Clear, authoritative session control | 00, 05 |
| 07 | Destination hand-off | Safe destination discovery and links | 00, 05 |
| 08 | Accessibility and resilience | Consistent quality across routes | 02–07 |
| 09 | Verification and delivery | Final evidence and reconciled docs | 00–08 |

Each plan is deliberately bounded for one small coding-agent run. The agent may proceed without user confirmation inside its scope. If it discovers an authority/security contradiction, missing server contract, production operation, or irreversible data change, it must leave that boundary untouched, record a blocker, and continue independent safe tasks.

## 13. Canonical references

- Product narrative: [README.md](README.md)
- Autonomous tasks: [MoonWitness ID delivery epic](https://github.com/bjo163/A-L-L-A-H.COM/issues/3) (one sub-issue per phase below)
- LUNAR CHRONICLES: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md)
- Shared skin engine: [../../DNA/00-ENGINE-CONTRACT.md](../../DNA/00-ENGINE-CONTRACT.md)
- Ecosystem blueprint: [../../BLUEPRINT.md](../../BLUEPRINT.md)
- Decisions: [../../DECISIONS.md](../../DECISIONS.md)
- Security: [../../SECURITY.md](../../SECURITY.md)
- Engineering rules: [../../AGENTS.md](../../AGENTS.md), [../../AUTONOMOUS.md](../../AUTONOMOUS.md), [../../QUALITY.md](../../QUALITY.md)
