---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DECISIONS"
version: "1.4.0"
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
