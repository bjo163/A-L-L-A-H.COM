---
title: "Observability & Telemetry Platform Phase 1: Task Checklist"
status: "proposed"
timestamp: "2026-11-04T03:40:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 27
parent_issue: 5
---

# TASKS

- [ ] **Metrics Exporter Backend**
  - [ ] Add `prom-client` dependency to `apps/arsy`.
  - [ ] Create `metrics.ts` module exposing `collectDefaultMetrics()` and custom gauges/counters.
  - [ ] Register Fastify route `GET /v1/metrics` returning `prom-client` metrics.
  - [ ] Write unit tests for each metric collector (jest).
  - [ ] Write integration test to ensure `/v1/metrics` is scrapes‑able and contains expected metric names.

- [ ] **OpenTelemetry Tracing**
  - [ ] Install `@opentelemetry/api`, `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-fastify`, `@opentelemetry/exporter-jaeger`.
  - [ ] Initialise tracer in `apps/arsy/src/tracing.ts` with service name `arsy` and export to internal Jaeger collector (`apps/trace-collector`).
  - [ ] Auto‑instrument HTTP, Fastify routes, and PGlite queries.
  - [ ] Add middleware to propagate `traceId` and `spanId` in request headers.
  - [ ] Write end‑to‑end test verifying a trace appears in Jaeger for a sample request.

- [ ] **Structured Logging Refactor**
  - [ ] Replace all `console.*` calls across the repo with `logger` from `pino` (provided by `@moonwitness/lint`).
  - [ ] Ensure logger is instantiated with `base: {company_id, requestId, traceId, spanId}`.
  - [ ] Add unit tests asserting log objects contain required fields.
  - [ ] Run linter rule `no-console` and fix violations.

- [ ] **Central Log Ingestion (CHRONICLE)**
  - [ ] Create Fastify middleware `logIngestion.ts` that streams structured logs to `apps/chronicle` service.
  - [ ] Define `alert_audit` table schema extension `log_entry` with SHA‑256 hash.
  - [ ] Write integration test simulating high‑throughput logging (10k logs/sec) and verify persistence.

- [ ] **Observability UI Dashboard**
  - [ ] Add `/observability` page in `apps/headquarter/pages/observability.tsx`.
  - [ ] Build **Metrics Panel** using `LineChart` & `StatCard` components (show CPU, request latency, SSE latency).
  - [ ] Build **Traces Panel** embedding Jaeger UI via iframe or custom `TraceGraph` component.
  - [ ] Build **Log Search Panel** with virtualized table, filters (time, severity, tenant), and highlight matching text.
  - [ ] Implement client‑side SDK calls to fetch `/v1/metrics` and `/v1/logs/search`.
  - [ ] Write component tests covering data fetching and filter interactions.

- [ ] **SDK Extension**
  - [ ] Add `recordMetric(name:string, value:number, tags?:Record<string,string>)` to `packages/sdk/src/telemetry.ts`.
  - [ ] Add `startSpan(name:string)` returning a span object with `end()`.
  - [ ] Add `logEvent(event:LogEvent)` wrapper to logger.
  - [ ] Generate Typedoc docs for new SDK methods.

- [ ] **Security & RBAC Integration**
  - [ ] Protect `/v1/metrics` and `/observability` UI with RBAC middleware (`operator`, `admin`).
  - [ ] Verify tenancy isolation – metrics returned only for requesting `company_id`.

- [ ] **Documentation & Contracts**
  - [ ] Update `DOCUMENTATION_CONTRACT.md` with new endpoints (`/v1/metrics`, `/v1/traces`, `/v1/logs/search`) and SDK API.
  - [ ] Add ADR `ADR/2026-11-observability-platform.md` detailing why Prometheus + OpenTelemetry were chosen.
  - [ ] Ensure `pnpm docs:check` passes.

- [ ] **Quality Assurance**
  - [ ] Run `pnpm lint:arch` and fix any new violations (e.g., missing import from `@moonwitness/ui`).
  - [ ] Run `pnpm typecheck`.
  - [ ] Load test using `scripts/load-test-observability.sh` simulating 200 concurrent metric collectors and 100 SSE clients.

- [ ] **Deployment**
  - [ ] Extend CI pipeline to build and publish `@allah/sdk` telemetry package.
  - [ ] Deploy observability services to staging; verify Prometheus scrape and Jaeger UI visibility.
  - [ ] Conduct operator walkthrough and collect feedback.

