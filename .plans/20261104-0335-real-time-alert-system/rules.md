---
title: "Real-time Alert System Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T03:35:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 24
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All alert broadcasting must route through the ARSY Fastify Hub (`apps/arsy`). No direct client connections to source services.
- **Tenant Isolation**: SSE streams are scoped by `company_id`; events from other tenants are filtered out before emission.
- **Content‑Addressed Storage**: Each alert payload stored in `CHRONICLE` with SHA‑256 hash for immutable audit.
- **Zero ORM Overlap**: Only the embedded PGlite ORM is used for `alert_audit` table.
- **Atomic UI**: All UI components must come from `@moonwitness/ui`; custom HTML elements are prohibited.

## Security & Compliance
- **Authentication**: Bearer token validated via `@allah/sdk` middleware; token must contain tenant claim.
- **Authorization**: Roles `operator` and `admin` may subscribe; other roles denied.
- **Rate Limiting**: Max 200 events/sec per client enforced by token‑bucket limiter.
- **Audit Logging**: Subscription start/stop and each alert emission logged in `CHRONICLE` with immutable hash.

## Operational Rules
- **Latency SLA**: End‑to‑end alert latency < 150 ms under normal load (≤ 500 concurrent operators).
- **Back‑pressure**: `AlertBus` buffers up to 10 k events per tenant; excess events dropped and counted in metric `alert_bus_dropped_events`.
- **Monitoring**: Export Prometheus metrics `alert_sse_latency_seconds`, `alert_bus_queue_size`.
- **Graceful Degradation**: On overload, fallback to batch polling mode (interval ≤ 5 s).
- **Testing**: Include load‑test script `scripts/load-test-alerts.sh` simulating 500 concurrent SSE clients.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with endpoint, SDK method, and event schema.
- Add ADR `ADR/2026-11-alert-system.md` explaining SSE choice.
- Ensure `pnpm docs:check` passes with 100/100.

