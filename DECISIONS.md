---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DECISIONS"
version: "1.2.0"
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
- context: Six DNA must shape shared components without forking interaction, accessibility, or business behavior.
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
