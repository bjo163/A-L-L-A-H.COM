---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP-ID-README"
version: "2.0.0"
owner: "product"
status: "implemented"
last_verified: "2026-11-05"
---

# MoonWitness ID
## One identity. A connected universe.

**MoonWitness ID is the personal identity gateway and account-trust experience for the MoonWitness Universe and the wider A-L-L-A-H.COM ecosystem.** It helps a person establish or access one canonical account, understand the identity currently in use, inspect the sessions acting in their name, revoke access, and continue to a connected destination.

ID is deliberately not a generic login template, a second identity backend, or a miniature command center. Its job is narrow and consequential: make identity understandable, access deliberate, and trust revocable.

Its visual world is **LUNAR CHRONICLES**: a personal observatory, a celestial instrument, and a living archive. The metaphor gives the experience memory and atmosphere; it never substitutes for identity evidence, security controls, or factual account state.

## Product thesis

A connected universe should not force people to maintain disconnected identities. At the same time, a shared account must not become an excuse to centralize every workflow in one application.

MoonWitness ID is the human-facing identity surface. **ARSY remains the sole authority** for canonical identity, authentication, session issuance and revocation, tenant context, roles, and authorization. ID consumes supported APIs and typed contracts; it does not create parallel authority.

### The three promises

1. **Identity clarity** — show which account is active and what is known about it.
2. **Trust control** — show the sessions that the authority reports and send revocation to that authority.
3. **Continuity** — provide safe, explicit paths into connected products without implying that authentication grants every permission.

## Product boundaries

| ID owns | ARSY / destination services own |
|---|---|
| Sign-in and sign-out experience | Canonical identity and credential persistence |
| Regular registration experience | Authentication policy and session issuance |
| First-owner setup interface | Atomic one-time onboarding and privileged role creation |
| Account identity summary | Tenant assignment, roles, permissions, authorization |
| Session inventory and revoke interaction | Session validity, expiry, revocation enforcement, audit |
| Destination discovery and hand-off UX | Destination authorization and product data |
| Honest identity guidance | Organization membership policy and domain workflows |

ID must not absorb ISP subscriptions, billing, network operations, MOONSKY conversations, provider sessions, Dock publishing, Headquarter operations, or Observatory research.

## The experience: ARRIVE → IDENTIFY → ENTER → PROTECT → EXPLORE

### 1. ARRIVE — The Observatory Threshold

The home route is an orientation experience, not a marketing landing page or dashboard. It establishes a strong visual landmark, explains the purpose of the identity gateway in a few precise lines, and presents the correct next action for the actual session state.

- Guest: sign in or create an account; first-owner setup is shown only when ARSY confirms availability.
- Authenticated: continue to the personal account space.
- Authority unavailable: explain that identity state cannot currently be confirmed; never guess.
- The first viewport must answer: where am I, what can I do, and what happens next?

### 2. IDENTIFY — The Identity Gate

Login, registration, and initial-owner setup are distinct journeys with a shared visual grammar, not one overloaded form.

- Login: email/password, accessible autocomplete, generic credential failure, clear pending state.
- Registration: regular user only; clear password requirements; no privilege selection.
- Initial owner: only when ARSY reports setup available; server-side atomicity remains authoritative.
- No claim of MFA, passkeys, email verification, recovery, social login, or universal SSO unless implemented and verified end-to-end.

### 3. ENTER — The Personal Orbit

The account home is a personal identity composition with three readable zones:

- **Identity Anchor:** name, email, and only safe identity attributes supplied by the API.
- **Trust Constellation:** a concise view of active sessions and the route to manage them.
- **Destination Orbit:** links to the products this ecosystem exposes, each with a clear purpose.

It is not a wall of statistic cards. Information hierarchy should feel like an atlas: anchor → relationship → destination.

### 4. PROTECT — The Session Archive

Session management is a security workflow, not decoration. Each entry shows only API-supported facts, identifies the current session, and offers a deliberate revoke action. Confirmation and success states must reflect the authority's response. A failed revoke must leave the session visible. Revoking the current session must end the local flow safely.

### 5. EXPLORE — The Destination Orbit

Destinations may include DOCK, HEADQUARTER, WORLD OBSERVATORY, and other approved products. A destination link is a navigation hand-off, not a permission grant. The destination must authorize every protected request. Cross-domain SSO is a separate protocol contract and must not be inferred from shared branding or a working local cookie.

## LUNAR CHRONICLES — visual identity

The visual direction is **THE LUNAR IDENTITY ARCHIVE**.

- Deep observatory: layered midnight surfaces and generous negative space.
- Lunar instrument: precise rules, engraved markers, measured labels, restrained metallic accents.
- Orbital cartography: arcs and spatial relationships used to clarify navigation, not as random wallpaper.
- Living chronicle: editorial typography, archive indexing, dates, and carefully paced narrative.
- Personal scale: quieter and more intimate than GATE; never the monumental Empire entrance or the operational density of HEADQUARTER.

Composition rules:
- Every route has its own composition; do not reuse one centered-card template everywhere.
- Forms remain easy to scan, fill, and submit. Art direction must never reduce legibility.
- One primary action per moment; secondary actions remain visibly secondary.
- Use radial/orbital geometry only where it expresses a real relationship.
- No fake astronomical measurements, random coordinates presented as facts, fake security seals, or decorative status indicators.
- No proprietary game UI imitation. Create original compositions and use assets with clear provenance.
- Motion is purposeful, short, interruptible, and disabled or simplified under `prefers-reduced-motion`.

## Current implementation baseline

This describes repository source inspected on `dev`; it is not a production deployment claim.

| Area | Verified source baseline |
|---|---|
| Package | `@moonwitness/id` |
| Runtime | Next.js 16.4.3 · React 19.3 · TypeScript · ESM |
| Local port | 3003 |
| UI and skin | `@moonwitness/ui`; LUNAR CHRONICLES skin |
| Shared contracts | `@allah/sdk` · `@moonwitness/types` |
| Auth client | Better Auth client; service hosted by ARSY |
| Auth path | `/api/auth/better/*` on ARSY |
| Regular registration | Email/password; current UI minimum 8 characters |
| Initial owner | ARSY onboarding status and one-time creation; current UI minimum 12 characters |
| Account | Identity summary, active sessions, revoke, destination links |
| Session policy | HttpOnly cookies; production Secure; ARSY SameSite=Lax in inspected baseline |
| Tenant and roles | ARSY-controlled; see D-008 and accepted identity decisions |

### Existing routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Session-aware identity arrival | Public; may read current identity |
| `/login` | Email/password sign-in | Public |
| `/register` | Regular account registration | Public subject to ARSY policy |
| `/onboarding` | One-time initial-owner setup | Form only while ARSY confirms availability |
| `/account` | Identity, sessions, destinations | Authenticated |

Future route proposals such as a dedicated `/account/sessions` or `/account/destinations` are not current routes. Add them only when they materially improve the user journey and are supported by the existing routing and authorization architecture.

## Runtime and local development

From repository root:

```bash
pnpm install
pnpm id:dev
```

Open [http://127.0.0.1:3003](http://127.0.0.1:3003).

```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id test
pnpm --filter @moonwitness/id build
```

ARSY owns Better Auth configuration. `BETTER_AUTH_SECRET` is a server secret, must be distinct from JWT secrets, and must never be exposed through `NEXT_PUBLIC_*` variables or committed. Browser-visible auth API configuration may contain an origin URL only.

## Security and truth rules

- ARSY is the only authority for identity, credentials, session state, tenant, roles, and authorization.
- Never trust browser-supplied user, tenant, company, role, or permission identifiers.
- Registration cannot grant superuser or organization access.
- Initial-owner availability and completion are decided atomically by ARSY.
- Session revocation is complete only after ARSY confirms it.
- Never put credentials, tokens, secrets, or session identifiers in URLs, analytics, logs, or user-visible diagnostics.
- Do not expose credential-bearing models through generic CRUD.
- Do not assume cookies work across unrelated registrable domains. Current SameSite=Lax behavior makes real-host verification mandatory.
- Never claim universal SSO, MFA, passkeys, recovery, verification, or provider login from dependency capability alone.
- Distinguish source implemented, locally tested, integration verified, released, and deployed.

## Documentation and execution map

- Product and architecture contract: [BLUEPRINT.md](BLUEPRINT.md)
- Autonomous implementation plans: [.plan/README.md](.plan/README.md)
- Canonical DNA: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md)
- Shared skin contract: [../../DNA/00-ENGINE-CONTRACT.md](../../DNA/00-ENGINE-CONTRACT.md)
- Ecosystem architecture: [../../BLUEPRINT.md](../../BLUEPRINT.md)
- Accepted decisions: [../../DECISIONS.md](../../DECISIONS.md)
- Engineering rules: [../../AGENTS.md](../../AGENTS.md), [../../AUTONOMOUS.md](../../AUTONOMOUS.md), [../../QUALITY.md](../../QUALITY.md)

When source and documentation disagree, record the evidence and reconcile the contract. Do not silently convert a proposal into an implementation claim.
