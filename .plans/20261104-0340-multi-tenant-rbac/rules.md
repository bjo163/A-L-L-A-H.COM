---
title: "Multi‑Tenant RBAC Framework Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 25
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All RBAC operations must flow through the ARSY Fastify Hub (`apps/arsy`). No direct DB access from UI or other services.
- **Tenant Isolation**: Role, permission, and user‑role tables are scoped by `company_id`. All queries filter by tenant.
- **Zero ORM Overlap**: Only the embedded PGlite ORM is used for RBAC tables.
- **Atomic UI**: UI components for role management must be imported from `@moonwitness/ui`.
- **Content‑Addressed Storage**: Audit entries stored in `CHRONICLE` with SHA‑256 hash of the mutation payload.

## Security & Compliance
- **Authentication**: Bearer token validated via `@allah/sdk` middleware; token must include tenant claim.
- **Authorization**: Roles `admin` and `operator` may manage RBAC; others are read‑only.
- **Rate Limiting**: 100 write operations per minute per tenant.
- **Audit Logging**: Every create/update/delete mutation writes immutable audit record in `CHRONICLE`.

## Operational Rules
- **Permission Check SLA**: < 5 ms on cache hit, < 20 ms on DB fallback.
- **Cache**: In‑process LRU cache with max 10 k entries per tenant; metric `rbac_cache_hit_ratio` exported.
- **Monitoring**: Prometheus metrics `rbac_permission_check_latency_ms`, `rbac_cache_hit_ratio`.
- **Graceful Degradation**: If cache unavailable, fall back to DB with exponential backoff.
- **Testing**: Load‑test script `scripts/load-test-rbac.sh` simulating 500 concurrent permission checks.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with RBAC API spec, SDK types, and audit model.
- Add ADR `ADR/2026-11-rbac-framework.md` explaining design choices.
- Ensure `pnpm docs:check` passes with 100 / 100.

