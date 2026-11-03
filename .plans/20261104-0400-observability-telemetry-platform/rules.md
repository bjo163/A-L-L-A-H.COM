---
title: "Observability & Telemetry Platform Phase 1: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 27
parent_issue: 5
---

# RULES

## Architectural Invariants
- **Single Backend Authority**: All observability collectors (metrics, traces, logs) must be integrated via the ARSY Fastify Hub (`apps/arsy`). No direct external agents.
- **Tenant Isolation**: Every metric label, trace, and log entry includes `company_id`. Queries are filtered by tenant at API layer.
- **Zero ORM Overlap**: Only the embedded PGlite ORM is used for storing immutable log entries in `CHRONICLE`.
- **Atomic UI**: All UI components for the Observability dashboard must be imported from `@moonwitness/ui`.
- **Content‑Addressed Storage**: Log entries stored with SHA‑256 hash for immutable audit.

## Security & Compliance
- **Authentication**: Bearer token validated via `@allah/sdk` middleware; token must contain tenant claim.
- **Authorization**: Roles `operator` and `admin` may access `/v1/metrics`, `/v1/traces`, and `/observability` UI. Others receive 403.
- **Rate Limiting**: Metrics endpoint limited to 120 requests/min per tenant; trace export limited to 60 requests/min.
- **Audit Logging**: All metric/trace export requests and log ingestion events are recorded in `CHRONICLE` with immutable hash.

## Operational Rules
- **Metrics SLA**: Export latency < 150 ms; scrape interval default 15 s.
- **Tracing SLA**: Span export latency < 200 ms; retention 7 days.
- **Logging SLA**: Ingestion latency < 100 ms; searchable within 300 ms for 10 k entries.
- **Monitoring**: Export Prometheus metrics `observability_metrics_export_seconds`, `observability_traces_export_seconds`, `observability_log_ingest_latency_ms`.
- **Graceful Degradation**: If collector overloads, fall back to batch mode with max 5 s delay.
- **Testing**: Provide load‑test scripts `scripts/load-test-observability.sh` simulating 200 metric collectors and 100 SSE clients.

## Documentation Requirements
- Update `DOCUMENTATION_CONTRACT.md` with new endpoints, SDK methods, and data schemas.
- Add ADR `ADR/2026-11-observability-platform.md` explaining selection of Prometheus + OpenTelemetry.
- Ensure `pnpm docs:check` passes with 100 / 100.

