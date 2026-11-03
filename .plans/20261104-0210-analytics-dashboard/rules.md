---
title: "Analytics Dashboard Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T02:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 23
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All analytics aggregation must be served through the ARSY Fastify Hub (`apps/arsy`). No direct DB queries from UI.
- **Tenant Isolation**: Metrics and exported reports are scoped by `company_id`. Filtering enforced at API level.
- **Zero ORM Overlap**: Only the embedded PGlite ORM is used for the `analytics_metric` table.
- **Atomic UI**: All chart components must come from `@moonwitness/ui`. Custom SVG canvases are prohibited.
- **Content‑Addressed Storage**: Exported CSV/JSON files are stored with SHA‑256 hashes for audit traceability.

## Security & Compliance
- **Authentication**: Bearer token validated via `@allah/sdk` middleware; token must include role `analyst` or `admin`.
- **Authorization**: Role‑based access to aggregation endpoints; `analyst` can read, `admin` can export.
- **Rate Limiting**: API limited to 120 requests/min per tenant.
- **Audit Logging**: All export actions logged in `CHRONICLE` with immutable hash.

## Operational Rules
- **Latency SLA**: Aggregation response < 150 ms; SSE updates < 200 ms.
- **Performance Monitoring**: Export Prometheus metrics `analytics_api_latency_seconds` and `analytics_export_time_ms`.
- **Graceful Degradation**: On aggregation failure, UI shows cached snapshot with stale‑warning badge.
- **Testing**: Provide load‑test script `scripts/load-test-analytics.sh` simulating 400 concurrent users.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with new endpoints (`/v1/analytics/summary`, `/v1/analytics/export`, `/v1/analytics/stream`).
- Add ADR `ADR/2026-11-analytics-dashboard.md` detailing aggregation design and why SSE was chosen.
- Ensure `pnpm docs:check` passes with 100/100.

