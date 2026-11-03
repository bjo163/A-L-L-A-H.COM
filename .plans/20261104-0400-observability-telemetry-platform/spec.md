---
title: "Observability & Telemetry Platform Phase 1"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 27
parent_issue: 5
---

# SPEC: Observability & Telemetry Platform

## Context & Goal
- Provide a unified **metrics, logging, and tracing** stack for the entire A‑L‑L‑A‑H.COM ecosystem.
- Enable operators, analysts, and developers to monitor performance, diagnose incidents, and audit actions in real‑time.
- Leverage existing Fastify Hub (`apps/arsy`) as the central collector, and expose standardized SDK hooks.

## Requirements
1. **Metrics Exporter**
   - Integrate `prom-client` into `apps/arsy` to expose `/v1/metrics` (Prometheus format).
   - Export core metrics: request latency, error rates, DB query times, SSE latency, custom business KPIs.
2. **Tracing**
   - Add OpenTelemetry SDK to `apps/arsy` with automatic instrumentation for HTTP, Fastify, and PGlite.
   - Export traces to Jaeger collector (internal service `apps/trace-collector`).
3. **Structured Logging**
   - Replace all `console.log` with `@moonwitness/lint`‑enforced `logger` (pino) calls.
   - Logs must be JSON, include `traceId`, `spanId`, `company_id`, `requestId`.
4. **Central Log Ingestion**
   - Create `CHRONICLE` pipeline: Fastify middleware streams logs to `apps/chronicle` service, stores immutable entries with SHA‑256 hash.
5. **Dashboard UI**
   - New `/observability` page in `apps/headquarter` with panels for **Metrics**, **Traces**, **Log Search**.
   - Use `@moonwitness/ui` chart components (`LineChart`, `HeatMap`), and log table with virtualized scrolling.
6. **SDK Extension**
   - Add `@allah/sdk` methods: `recordMetric(name, value, tags?)`, `startSpan(name)`, `logEvent(event)`.
7. **Security & Tenant Isolation**
   - All observability data scoped by `company_id`. Metrics and traces must be filtered per tenant.
   - RBAC checks (`operator`, `admin`) guard access to `/observability` UI and `/v1/metrics` endpoint.
8. **Documentation & Contracts**
   - Update `DOCUMENTATION_CONTRACT.md` with new endpoints, SDK methods, and data schemas.
   - Add ADR `ADR/2026-11-observability-platform.md` explaining design choices.

## Acceptance Criteria
- Prometheus `/v1/metrics` returns > 50 core metrics and is scrapes-able.
- Jaeger UI shows traces for at least 3 sample requests with < 200 ms latency.
- Logs are searchable via `/observability` UI with filters (time, severity, tenant).
- All quality gates (`pnpm docs:check`, `pnpm lint:arch`, `pnpm typecheck`) pass 100 %.
- ADR and documentation updates are present.

