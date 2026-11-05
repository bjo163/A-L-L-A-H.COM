---
contract: "DOCUMENTATION_CONTRACT.md"
id: "APP-ID-README"
version: "2.0.1"
owner: "product"
status: "implemented"
last_verified: "2026-11-06"
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

## Expanded product direction — IDENTITY, TRUST & SECRETS CONTROL PLANE

MoonWitness ID evolves into the human-facing **Identity & Secrets Control Plane** for A-L-L-A-H.COM. The user sees one coherent place to manage who they are, which applications/services act for them, which credentials those services use, and which environments receive approved configuration.

This is an approved product direction; it does not assert that the capabilities below already exist.

### Product pillars

1. **Human Identity** — canonical account, profile, login, session and recovery journeys.
2. **Service Identity** — non-human principals for apps, agents, integrations, and automation; ownership, lifecycle, scopes, expiry, disable/revoke.
3. **Personal API Keys** — named keys for an individual, narrow scopes, project/environment binding, expiry, last-used metadata, one-time issuance display, rotation and revocation.
4. **Secrets Vault** — recoverable provider credentials and application secrets encrypted server-side, versioned, masked, audited, and accessed only by authorized runtime services.
5. **Environment Manager** — development/staging/production configuration, variable classification, secret references, version history, redacted diffs, approvals, and deployment hand-off.
6. **Access & Policy** — project membership, service-to-service permissions, scopes, approvals, step-up authentication, and least privilege.
7. **Audit & Security** — credential lifecycle events, access decisions, rotation status, suspicious activity signals backed by actual evidence, and exportable audit records subject to policy.

### Mental model

- **Identity** answers: who or what is acting?
- **Credential** answers: what proof is presented?
- **Secret** answers: what sensitive value must a trusted runtime retrieve?
- **Environment** answers: where may a configuration apply?
- **Policy** answers: who may perform which action, on which resource, under what conditions?
- **Audit** answers: what happened, who/what initiated it, and what authority confirmed it?

These are separate resource types with separate lifecycle and authorization rules. Do not collapse them into a generic “key” table.

### Proposed navigation

- **My Identity** — profile, sessions, security and recovery.
- **Service Identities** — applications, agents, integrations and automation principals.
- **API Keys** — personal/service keys, scopes, expiry, rotation and revocation.
- **Vault** — secret records, versions, access policies and rotation history.
- **Environments** — projects, dev/staging/production, variables and redacted version diffs.
- **Access Policies** — memberships, scopes, approval rules and access requests.
- **Audit Ledger** — searchable, redacted lifecycle and access events.

Expose only sections whose backend contracts and policy gates are implemented. Empty or unavailable capabilities must not masquerade as active management surfaces.

### Authority and custody contract

**ARSY remains the sole authority and secret custody backend.** ID is a UI and orchestration layer, never a second vault.

- ARSY owns schemas, tenant isolation, principal validation, policy evaluation, encryption/decryption, key generation/verification, revocation, rate limits, audit, and retention.
- ID uses typed `@allah/sdk` contracts and `@moonwitness/types`; it never connects directly to the database or secret storage.
- Runtime consumers receive secrets through narrowly scoped server-side injection or retrieval, not through ID browser responses.
- Destination apps validate their own authorization on every protected operation.
- Human credentials, service credentials, personal API keys, provider secrets, environment variables, and cryptographic key material remain distinct classes.

### Secret lifecycle

`DRAFT → CREATED → ACTIVE → ROTATION_DUE → ROTATING → ACTIVE (new version) → REVOKED/EXPIRED`

- Plaintext is displayed only once at creation/rotation if policy explicitly allows it.
- Later reads return metadata, masked fingerprints, version status, and last-used data—not plaintext.
- Rotation creates a new version, validates consumers, allows a bounded overlap where safe, then revokes the old version.
- Revocation is immediate at the authority; cached runtime credentials have bounded TTL and documented invalidation.
- Deleted records follow retention/legal-hold rules; deletion is not a way to erase audit obligations.

### Environment lifecycle

`DRAFT → VALIDATED → REVIEW_REQUIRED → APPROVED → DEPLOY_REQUESTED → DEPLOYED`

- Variables are classified as public, sensitive, or secret; secret is the default.
- Public browser variables are explicitly allowlisted and never contain credentials.
- Values are write-only after submission; diffs show changed names and metadata, never values.
- Environment promotion is explicit and auditable. Production changes may require approval and step-up authentication.
- Deployment adapters receive secret references or short-lived scoped access, never a dump of the whole vault.
- No arbitrary shell execution, uncontrolled file download, or unrestricted environment export.

### Security invariants

- No secret plaintext in browser state, local storage, cookies, URLs, client props, logs, analytics, telemetry, error messages, AI prompts, or agent context.
- No generic CRUD for credential-bearing models.
- Tenant/project ownership is resolved server-side; never trust client-supplied tenant IDs.
- Recoverable secrets use authenticated envelope encryption with managed key-encryption keys and versioned metadata.
- API keys use high-entropy random generation, scoped authorization, expiry, one-time display, secure verifier storage, and constant-time verification where applicable.
- Key encryption material is separated from encrypted data; master keys are not stored in the application database.
- Sensitive actions require explicit confirmation and, when available, step-up authentication.
- Audit events are append-only, redacted, actor/resource/action/outcome tagged, and governed by retention/legal hold.
- AI agents may manage metadata and submit approved workflows, but never receive raw secret values in their context or tool output.

### Existing foundations vs proposed capabilities

| Capability | Repository evidence | Status |
|---|---|---|
| Human auth and account sessions | Better Auth endpoints hosted by ARSY | Existing baseline |
| NAS shared-secret encryption | ARSY master-key encryption; Sentinel decrypts | Existing narrow use |
| AI virtual-key verifier | Changelog reports SHA-256-only persisted verifier | Existing narrow use; review before generalization |
| General-purpose secret vault | No complete end-to-end capability verified | Proposed |
| Personal/service API-key center | No complete ID workflow verified | Proposed |
| Environment versioning and approvals | No complete end-to-end capability verified | Proposed |
| KMS/HSM-backed key hierarchy | Not established by current evidence | Architecture decision required |

The existing NAS encryption mechanism and AI virtual-key hashing must not be copied blindly into a universal vault. Select algorithms and key custody only after threat modeling, implementation inspection, migration design, and operational recovery planning.

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
- Autonomous implementation plans: [MoonWitness ID delivery epic](https://github.com/bjo163/A-L-L-A-H.COM/issues/3)
- Canonical DNA: [../../DNA/02-LUNAR-CHRONICLES.md](../../DNA/02-LUNAR-CHRONICLES.md)
- Shared skin contract: [../../DNA/00-ENGINE-CONTRACT.md](../../DNA/00-ENGINE-CONTRACT.md)
- Ecosystem architecture: [../../BLUEPRINT.md](../../BLUEPRINT.md)
- Accepted decisions: [../../DECISIONS.md](../../DECISIONS.md)
- Engineering rules: [../../AGENTS.md](../../AGENTS.md), [../../AUTONOMOUS.md](../../AUTONOMOUS.md), [../../QUALITY.md](../../QUALITY.md)

When source and documentation disagree, record the evidence and reconcile the contract. Do not silently convert a proposal into an implementation claim.
