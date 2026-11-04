---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DECISIONS"
version: "1.5.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-04"
---
# DECISIONS.md

Accepted ADRs only. Proposals / unresolved → [BACKLOG.md](BACKLOG.md). Arch context → [BLUEPRINT.md](BLUEPRINT.md).

## Template

```
### D-XXX — Title
- status    : PROPOSED | ACCEPTED | SUPERSEDED
- date      :
- context   :
- decision  :
- alternatives:
- rationale :
- consequences:
- related   :
```

---

### D-001 — A-L-L-A-H.COM is the unified home
- status: ACCEPTED
- decision: A-L-L-A-H.COM is the unified continuation of MoonWitness + Empire of the Light.
- rationale: Consolidation and evolution — not an isolated replacement.

### D-002 — Preserve generations and provenance
- status: ACCEPTED
- decision: Reborn, XV, and earlier must be reconciled without silent erasure.
- consequences: Follow [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md) before migration/archive/retirement.

### D-003 — Unify without forcing one application
- status: ACCEPTED
- decision: Share foundations where justified. Preserve clear product boundaries.
- rationale: Avoid fragmentation and over-centralization.

### D-004 — One actionable backlog
- status: ACCEPTED
- decision: [BACKLOG.md](BACKLOG.md) = canonical task tracking. [ROADMAP.md](ROADMAP.md) = strategic only.

### D-005 — Evidence-based completion
- status: ACCEPTED
- decision: `IMPLEMENTED` ≠ `VERIFIED` ≠ `RELEASED` ≠ `DEPLOYED`. Each state requires distinct evidence.

### D-006 — Six Master DNA for MoonFrame
- status: ACCEPTED — 2026-11-03
- context: Ecosystem needs recognizably distinct visual identities without fragmenting shared UI behavior.
- decision: Six DNA approved: IMPERIUM LUMEN · LUNAR CHRONICLES · ROCKSOUL · NEXUS PARADOX · RIOT ANARCHY · MYCELIUM. Each owns: world metaphor · composition · shape/material · typography · color roles · navigation · motion · component recipes · exclusions. One shared functional engine.
- alternatives: Single theme + color variants · separate component libs per skin · fewer generic SaaS themes.
- rationale: Preserve A-L-L-A-H.COM + MoonWitness identities, protect ROCKSOUL canon, create orthogonal experimental worlds.
- consequences: Canonical specs → `DNA/`. Runtime tracked in [BACKLOG.md](BACKLOG.md). No primitive-library migration implied.
- related: SKIN-001 · D-007

### D-007 — One Shared Runtime Skin Engine
- status: ACCEPTED — 2026-11-03
- context: Six DNA must shape shared components without fragmenting shared behavior, accessibility, or business logic.
- decision: All six skin IDs + tokens + recipes in `packages/ui/`. Apps select typed skin at SSR root. Deterministic IMPERIUM LUMEN fallback.
- alternatives: Global style switch · client-only detection · six independent component libraries.
- consequences: Dock→IMPERIUM LUMEN · Headquarter→NEXUS PARADOX · ID→LUNAR CHRONICLES · World Observatory→MYCELIUM. ROCKSOUL + RIOT ANARCHY reserved for future. Skin Laboratory pending.
- related: MOONFRAME-SIX-DNA-UI-SKINS · D-006

### D-008 — Isolated Personal Tenants for New Accounts
- status: ACCEPTED — 2026-11-04
- context: New accounts need tenant assignment without sharing one default tenant that would expose devices.
- decision: Personal tenant ID = negative of user's positive user ID. Positive IDs = orgs. Zero = unassigned. Device-control APIs: accept non-zero safe integers.
- alternatives: Block registration until admin assigns org tenant · central tenant registry before personal tenants.
- rationale: Existing integer `company_id` + user sequence provides distinct per-account IDs without collisions.
- consequences: New accounts isolated by default. Org sharing requires explicit admin assignment. Tenant-scoped queries must treat ID as opaque non-zero key.
- related: WINDOWS-VSCODE-LOCAL-AGENT

### D-009 — Retire the Rust/Loco Server
- status: ACCEPTED — 2026-11-04
- context: Arsy Fastify is the canonical backend, while the unused Rust/Loco app and Dockerfile fail production builds and diverge from the active Compose stack.
- decision: Remove `apps/server/`, its Cargo manifests, Rust sources, Dockerfile, and standalone CI. Keep its retirement rationale here and its source history in Git.
- alternatives: Repair and continue maintaining both backend stacks.
- rationale: One backend authority reduces deploy complexity and prevents stale Rust builds from blocking production.
- consequences: Production Docker builds contain only Arsy and the web applications. Rust history remains recoverable from Git.
- related: [LEGACY_RECONCILIATION.md](LEGACY_RECONCILIATION.md), [Coolify deployment plan](.plans/20261104-1200-production-release-docker-gate/spec.md)

### D-010 — Docker-Gated Production Release
- status: ACCEPTED — 2026-11-04
- context: Production images must be built and published by GitHub Actions, while Coolify deployment is triggered by its own GitHub webhook integration.
- decision: Build and publish every root Compose service on GitHub after CI promotion. Coolify independently reacts to GitHub webhooks and pulls the GHCR images. Create a GitHub release only after all image builds and pushes pass.
- alternatives: Call Coolify's deployment endpoint from GitHub Actions using Coolify credentials.
- rationale: Coolify already owns the repository webhook integration, so GitHub Actions does not need Coolify credentials or a duplicate deploy request.
- consequences: A failed image blocks the GitHub release, but Coolify's webhook may start deployment before the images publish. Compose pulls the GHCR image tags.
- related: [Production deployment](README.md#production-deployment), [Docker-gate plan](.plans/20261104-1200-production-release-docker-gate/spec.md)

### D-011 — MOONSKY as an Independent Communication Service
- status: ACCEPTED — 2026-11-04
- context: The historical `bjo163/moonsky` repository already contains a Fastify communication runtime, PostgreSQL/Drizzle persistence, WhatsApp (Baileys) and Telegram adapters, webhook/event infrastructure, and an operator console. ARSY is the canonical backend authority, but provider sessions and message delivery have different runtime and persistence needs from ARSY business logic.
- decision: Integrate MOONSKY into the A-L-L-A-H.COM monorepo as an independently deployable communication service at `apps/moonsky`, with its own communication API/runtime, PostgreSQL persistence, provider-session storage, and dedicated operator console. ARSY remains authoritative for user identity, tenant membership, authorization, business data, and ecosystem policy. MOONSKY owns channel connections, provider sessions, conversations, messages, routing, webhooks, delivery lifecycle, and communication operations. HEADQUARTER shows aggregate communication health and deep-links to MOONSKY; it does not absorb the operator inbox or channel configuration UI. Consumer apps use documented typed APIs/SDK contracts and never access provider internals or MOONSKY tables directly.
- alternatives: Move all communication logic into ARSY addons; keep MOONSKY as an unrelated standalone repository; embed the full operator console in HEADQUARTER.
- rationale: Preserve independent provider lifecycle, fault isolation, scaling, persistence, and operator workflows without creating a second identity/business authority or fragmenting the ecosystem repository.
- consequences: MOONSKY runtime and PostgreSQL remain separate services within the monorepo. Operator authentication and tenant authorization must integrate with ARSY; static broad service keys and standalone production operator identity are not accepted as the final ecosystem model. MOONSKY UI must use the shared `@moonwitness/ui` engine. Baileys remains an unofficial WhatsApp Web adapter behind a provider-neutral contract; an official WhatsApp Business provider can be added separately. No production data migration or deployment is authorized by this decision.
- UI ownership clarification (locked): **MOONSKY Console** is the independently usable, full operator workspace and owns inbox, message composition, pairing/session repair, channel configuration, routing, automation, webhook operations, and delivery diagnostics. **HEADQUARTER** is the ecosystem command surface and owns aggregate health, metrics, alerts, recent activity summaries, and deep-links into the relevant Console context. Headquarter may show compact summaries or narrowly scoped safe actions, but must not fork inbox state, duplicate operator workflows, or become a second communication control plane. Both surfaces use shared ecosystem identity/navigation and the shared UI/skin engine; MOONSKY Console remains operable if Headquarter is unavailable, while Headquarter degrades gracefully if MOONSKY is unavailable. Standalone means independent runtime and operator capability—not disconnected identity, branding, or navigation.
- related: [MOONSKY Integration Plan](.plans/20261104-moonsky-integration/spec.md), D-003, D-007, D-008

### D-012 — Native-First Primitives and One Token Source
- status: ACCEPTED — 2026-11-04
- context: `DESIGN.md` declared Base UI as the primitives engine, but `@moonwitness/ui` implements `Select`, `Dialog`, `Table`, and `Form` on native elements, and `@base-ui/react` was declared without a single import. At the same time every app carried a second token system: shadcn `--background`/`--foreground` plus a local `@theme inline` block, alongside the 32 skin tokens that `SkinRoot` publishes. Utilities and skin classes were styling the same surface from two unrelated sources of truth.
- decision: Primitives are native-first. Keyboard behaviour, focus, and screen-reader semantics that the platform already provides (`<select>`, `<dialog>` with `showModal()`, `<table>`, `<form>`) are not reimplemented. Base UI is introduced only inside `packages/ui`, only where native cannot meet a documented requirement, and each use carries the reason. Appearance has one source: `packages/ui/src/theme.css` maps Tailwind colour and font utilities onto the runtime skin tokens, and applications define no colour, type, or theme variables of their own.
- alternatives: Adopt Base UI for every interactive primitive to match the old document; keep both token systems and document the split; move styling to CSS-in-JS.
- rationale: Native elements arrive with tested accessibility and cost nothing in the bundle, while a single token source makes the selected world the only place appearance is decided, which is what the six DNA contract requires.
- consequences: `STYLE_PURITY` and `INLINE_STYLE_PURITY` ratchet rules can now be enforced, because there is one place a style finding is wrong. Apps cannot theme a surface with an inline colour and expect the skin to follow. Any future Base UI use must be justified in the package, not in an app.
- related: D-007, [DESIGN.md](DESIGN.md), [packages/ui/src/theme.css](packages/ui/src/theme.css), [packages/lint/style-baseline.json](packages/lint/style-baseline.json)

### D-013 — Canonical ORM Identity and Required Audit Actors
- status: ACCEPTED — 2026-11-04
- context: ORM audit columns were nullable and unaffiliated with authentication identities, so writes could not reliably identify an actor. New installations also lacked a defined system identity and first-run administrator bootstrap.
- decision: `res.users` is the canonical ORM identity. Schema sync provisions exactly one idempotent `system` user with `system_key='bot'`; that identity supplies audit UIDs for system-owned/default writes. First-run onboarding atomically creates the initial `superuser`, and regular registration remains available only after onboarding completes. Every persisted model row requires `create_uid` and `write_uid` references to `res.users`; repository writes require an explicit actor, while database triggers cover direct SQL writes.
- alternatives: Keep audit UIDs nullable; use auth-table IDs as audit actors; seed a reusable superuser credential.
- rationale: A single identity namespace makes audit references consistent across ORM and authentication, while provisioning the bot avoids null or fabricated actor IDs and onboarding avoids shipping a shared privileged credential.
- consequences: Existing databases are migrated by backfilling invalid/missing audit references to the system bot before enforcing non-null foreign keys. Applications must pass an authenticated user actor or the explicit system actor to repository writes. The initial superuser credentials are supplied during first-run onboarding and are not seeded.
- related: D-008, [BLUEPRINT.md](BLUEPRINT.md), `packages/arsy-orm`, `packages/arsy-plugin-auth`

### D-014 — Explicit Global Admin and Append-Only Audit History
- status: ACCEPTED — 2026-11-04
- context: The initial superuser identity existed, but did not yet grant explicit global access or provide an immutable record of model changes.
- decision: A verified `superuser` may use dedicated `/v1/admin/*` routes for cross-tenant access. Every operation names one non-zero target tenant and supplies a reason; the event stores a SHA-256 reason hash, actor, target, request ID, model, record, and operation. Generic CRUD always blocks identity, audit, and credential-bearing models. A current superuser may promote an active account or demote another superuser only if at least one active superuser remains. Database triggers append one event for every insert, update, and delete in the same transaction, and overwrite caller-supplied audit UIDs. Events store changed field names only; before/after values are not retained.
- alternatives: Grant global access by converting every superuser request to `systemScope`; expose identity models through generic CRUD; store complete before/after snapshots; retain only latest-writer UIDs.
- rationale: Explicit tenant-bound admin routes make the privilege exception reviewable, while field-name-only events avoid copying credentials or business data into history.
- consequences: PGlite triggers prevent application-level update/delete/truncate of audit events, but an operator controlling the embedded database process or files can alter the database and is outside this guarantee. No automatic purge is configured; event retention remains indefinite until an approved retention and legal-hold policy exists. Cross-tenant reads and writes are available only for models enabled in `GENERIC_MODEL_ALLOWLIST`, with identity, audit, and credential-bearing models excluded.
- related: D-008, D-013, [BLUEPRINT.md](BLUEPRINT.md), `packages/arsy-orm`, `apps/arsy`

### D-015 — Default-Deny Trust Boundary with Principal-Derived Tenancy
- status: ACCEPTED — 2026-11-04
- context: Ultra-review found routes reachable anonymously, a raw-SQL tool without auth, tenant taken from the request body, and secret/SSRF/RADIUS gaps.
- decision: A root `onRequest` guard requires a verified principal on every route except an explicit public allowlist (`/health`, `/ready`, onboarding/sign-in, non-production `/docs`). The tenant is resolved from the principal and the request fails closed when none exists; body `company_id` is never trusted. The arbitrary-SQL tool is removed; the MCP surface exposes only named, tenant-scoped tools. Added on top: fixed-window rate limits, a strict CSP, CORS that fails closed in production, loopback-by-default binding, hashed virtual keys, persisted KDF salt with the plaintext fallback removed, post-resolution SSRF checks, RADIUS password verification, session expiry/revocation, and SHA-256 digest validation before any storage path is formed.
- alternatives: Keep allow-by-default and add per-route auth; trust a body `company_id` and validate it softly; leave the raw-SQL tool behind an env flag.
- rationale: Deny-by-default and fail-closed tenancy make a forgotten guard a hard failure rather than a silent data leak.
- consequences: Breaking change for any caller relying on anonymous access or body-supplied tenancy; deployment must set `HOST` to expose the hub. Covered by `apps/arsy/test/trust_boundary.test.mjs` and `packages/arsy-orm/test/query_safety.test.mjs`.
- related: D-013, D-014, [SECURITY.md](SECURITY.md), `apps/arsy`, `packages/arsy-orm`, `packages/sentinel-radius`

### D-016 — Collapse Duplicate ORM Module Instances with globalThis Singletons
- status: ACCEPTED — 2026-11-04
- context: Under source resolution the hub loaded two copies of `@allah/arsy-orm`, each with its own `modelRegistry` and `dbEngine`, so addon models registered into one copy were invisible to the other ("model not registered").
- decision: Back the `modelRegistry` and `dbEngine` singletons with `globalThis` keyed by `Symbol.for('@allah/arsy-orm.<name>')`, so duplicate module copies share one instance. A bundled build already de-duplicates; the singleton makes the source path behave identically.
- alternatives: Force a single module copy via bundler-only resolution; pass the engine explicitly everywhere; alias the package in every tsconfig.
- rationale: Process-wide `Symbol.for` identity is the smallest change that guarantees one registry and one database regardless of how many copies of the package are imported.
- consequences: The singleton is process-scoped; tests that need isolation boot one hub per process. The ORM now exposes `singleton.ts` as an internal detail.
- related: D-013, D-017, `packages/arsy-orm/src/singleton.ts`

### D-017 — One Hub Application Per Test Process
- status: ACCEPTED — 2026-11-04
- context: The hub boots a single in-memory PGlite per process, so multiple test files sharing a process contend over one database and its onboarding state.
- decision: Each hub test file builds and owns exactly one application instance (and thus one in-memory database); the runner uses `--test-force-exit` so an open handle cannot hang the suite.
- alternatives: A shared external Postgres fixture; truncating tables between files; one giant test file.
- rationale: One-app-per-process gives clean isolation without external services and matches the embedded-database runtime model.
- consequences: Test files cannot share already-authenticated state; each authenticates what it needs (helpers `buildAuthenticatedApp` / `authenticateSecondTenant`).
- related: D-016, `apps/arsy/test/helpers.mjs`

### D-015 — One Composition Vocabulary and an Absolute Style Ratchet
- status: ACCEPTED — 2026-11-04
- context: Five applications each carried their own kicker, hero, section heading, route shell, status banner, destination card, and empty state. The same vocabulary existed six times over, one world was claimed by two apps, three apps had no route states at all, and literal colour lived in app CSS (52 lines in headquarter alone) and in Tailwind palette utilities in app markup (99 lines), which no skin can re-theme. The first ratchet rule shipped with a broken hex pattern (`#\h{3,8}` matches `#hhh`, never a real colour), so its own baseline under-counted findings.
- decision: The composition vocabulary exists once, as props-only blocks in `packages/ui/src/blocks/` (`Kicker`, `PageHero`, `SectionHeading`, `RouteShell`, `StatusMessage`, `DestinationCard`, `DestinationGrid`, `StatePanel`, `SkipLink`), styled in `skins.css` with a variant per world. Applications keep only their own layout. One world per application is now real: dock IMPERIUM LUMEN, headquarter NEXUS PARADOX, id LUNAR CHRONICLES, jizz MYCELIUM, gate ROCKSOUL, with RIOT ANARCHY proven only in the Skin Laboratory. `STYLE_PURITY`, `INLINE_STYLE_PURITY`, `PALETTE_PURITY`, and `STATE_PARITY` have empty baselines: a new literal, painted inline style, palette hue, or missing route state fails the gate immediately.
- alternatives: Keep per-app hero copies and enforce consistency by review; keep the ratchet open-ended so migration can stall; give each app two worlds and drop the six-DNA claim; leave the broken hex pattern in place because the gate already reported PASS.
- rationale: A rule that cannot fail is not enforcement; the previous gate reported 100% compliance over 24 violations, and the same class of bug hid the hex pattern. Absorbing the vocabulary into the package is what lets the six worlds differ in composition while sharing behaviour, accessibility, and state.
- consequences: Adding a world-level visual change now means editing one `[data-moonframe-skin]` block instead of five apps. Applications cannot introduce a one-off hero, an unstyled state, or a palette colour without a failing gate. Measured contrast for every skin pair is available with `pnpm ui:contrast`; the tightest ratio in the set is 4.99:1 (ROCKSOUL accent text on accent), which clears WCAG AA for normal text.
- related: D-007, D-012, [DNA/07-COMPONENT-MAPPING.md](DNA/07-COMPONENT-MAPPING.md), [DESIGN.md](DESIGN.md), [QUALITY.md](QUALITY.md)
