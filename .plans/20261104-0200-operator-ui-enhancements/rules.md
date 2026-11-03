---
title: "Operator UI Enhancements Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T02:00:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 22
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All widget data must flow through ARSY Fastify Hub (`apps/arsy`). No direct DB access from UI.
- **Tenant Isolation**: Widget layouts are scoped by `company_id`. Isolation enforced at API layer.
- **Atomic UI**: Every widget component must be imported from `@moonwitness/ui`. No custom CSS‑only components.
- **Zero ORM Overlap**: Only embedded PGlite ORM is used for `operator_widget` table.
- **Content‑Addressed Storage**: Persisted widget definitions stored with SHA‑256 hashes for auditability.

## Security & Compliance
- **Authentication**: Bearer token validated by `@allah/sdk` middleware; token must include role claim.
- **Authorization**: Only `operator` and `admin` roles may read/write widgets.
- **Rate Limiting**: API limited to 100 requests/min per tenant.
- **Audit Logging**: All widget CRUD actions logged in `CHRONICLE` with immutable hash.

## Operational Rules
- **Latency SLA**: API response < 150 ms; SSE updates < 200 ms latency.
- **Performance Monitoring**: Export Prometheus metrics `operator_ui_sse_latency_seconds` and `operator_ui_widget_save_time_ms`.
- **Graceful Degradation**: On API failure, UI shows read‑only cached layout.
- **Testing**: Include load‑test script `scripts/load-test-operator-ui.sh` simulating 300 concurrent users.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with new endpoints and widget specs.
- Add ADR `ADR/2026-11-operator-ui.md` explaining drag‑and‑drop design.
- Ensure `pnpm docs:check` passes.

