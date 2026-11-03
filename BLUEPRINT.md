---
contract: "DOCUMENTATION_CONTRACT.md"
id: "BLUEPRINT"
version: "1.0.0"
owner: "architecture"
status: "implemented"
last_verified: "2026-11-03"
---
# BLUEPRINT.md
## Unified Product & System Architecture

This is the target architecture, not a declaration that every component already exists. Reconcile it continuously with actual code and verified runtime behavior.

## Product architecture
A-L-L-A-H.COM is the central home of the MoonWitness and Empire of the Light ecosystem. It should provide coherent identity, navigation, shared platform capabilities, integration contracts, and product experiences while allowing independent deployment boundaries where justified.

## Product domains to validate

| Domain | Responsibility to investigate |
|---|---|
| A-L-L-A-H.COM / Empire of the Light | Central identity, entrypoint, ecosystem navigation |
| MoonWitness | Universe, narratives, research, timelines, creative works, archives |
| MoonWitness Reborn | Historical generation and its source/assets to reconcile |
| MoonWitness XV | Historical/current generation and its source/assets to reconcile |
| Moon UI | Shared design system and interface foundations |
| Headquarter | Central operational/administrative experience; validate scope |
| Dock | Community/user-facing portal; validate scope |
| Cockpit | Control/management experience; validate scope |
| Qorpus | Knowledge corpus, ingestion, retrieval, and content organization; validate scope |

These are working hypotheses. Audit actual requirements and implementations before freezing boundaries.

## Architecture layers
- Experience: public/authenticated experiences, product-specific interfaces, shared navigation, responsive accessible UI.
- Applications: domain-specific workflows, explicit ownership, stable API contracts, no duplicated business logic.
- Platform services: evaluate identity/access, users/organizations, content/media, search/knowledge, notifications, AI routing/usage, audit logs, observability, configuration.
- Data: authoritative ownership, explicit schemas/migrations, tenant isolation, provenance, retention, backup/recovery.
- Infrastructure: reproducible local/CI/staging/production environments, health checks, secrets, networking, storage, deployment and rollback.

Implement shared services only when reuse and ownership justify them.

## Current repository baseline
The repository has a Rust/Loco server under apps/server/ and a Next.js web application under apps/web/. Verify exact versions, routes, modules, endpoints, and capabilities from current manifests and source. Correct unsupported README/changelog claims.

## Delivery and deployment
GitHub Actions builds and publishes server and web images to GHCR on pushes to `main`. The root Compose deployment consumes those images, and a successful publish triggers Coolify through its deployment URL and API token. Production image selection is controlled by `IMAGE_PREFIX` and `IMAGE_TAG`; Coolify must have read access to GHCR when packages are private.

## Integration contracts
Every cross-application integration defines producer/consumer, data ownership, schema/API/event version, authentication/authorization, error/retry/idempotency/timeout behavior, observability, compatibility, migration, and tests. Do not rely on undocumented shared-database assumptions.

## Architecture decisions
Before adding a service, application, database, framework, or abstraction: identify the user outcome; inspect existing capability; compare alternatives and operational cost; define ownership; record accepted decisions in DECISIONS.md; add work to BACKLOG.md.

Architecture is progressively realized when product boundaries and data ownership are clear, integration contracts are tested, provenance is preserved, and end-to-end user journeys work reliably.
