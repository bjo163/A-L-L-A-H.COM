---
contract: "DOCUMENTATION_CONTRACT.md"
id: "OBSERVABILITY_MONITORING_SYSTEM_DESIGN"
version: "1.0.0"
owner: "architecture"
status: "proposed"
last_verified: "2026-11-05"
---
# Observability and Monitoring System — Technical Design

Design that satisfies `spec.md` FR-001..FR-010 / NFR-001..NFR-008 using the signals the spec
names (OpenTelemetry, Prometheus-format metrics, a time-series store, a log sink, an alert router,
and a Headquarter dashboard). Nothing here adds a component the spec did not call for.

## High-level architecture

```
 Services (emit)            Collection                Storage / Alerting        Consume
+----------------+        +--------------+         +------------------+     +---------------+
| ARSY Hub       |  OTLP  | OpenTelemetry|  push   | TSDB (Prometheus/ |    | Headquarter   |
| Sentinel       |------->| Collector    |-------->| VictoriaMetrics/  |    | dashboard     |
| Headquarter    | logs/  | (batch, red- | metrics | Mimir)            |    | (real-time    |
| Dock · ID      | metrics| oact, enrich)| traces/ |----+  logs        |    |  health, SLO) |
+----------------+        +--------------+         |    v              |    +---------------+
                                                    | Loki/ES + Grafana |
                                                    | Alertmanager      |
                                                    +------------------+
```

## Signal model (three pillars + correlation)

- **Logs (FR-001)**: JSON with a fixed schema — `timestamp`, `level`, `service`, `traceId`,
  `spanId`, `message`. Correlation IDs are minted at the API gateway and threaded through ARSY to
  the database and back, so any log line can be joined to its trace.
- **Metrics (FR-002/FR-004/FR-005)**: each service exposes a Prometheus-format `/metrics`.
  Business-agnostic RED metrics (rate, errors, duration) per dependency, plus infrastructure
  gauges (DB, Redis, network, CPU, memory, disk).
- **Traces (FR-003)**: OpenTelemetry spans across service boundaries; span context propagates via
  standard trace headers. A request is reconstructable end-to-end.
- A single shared `initObservability(serviceName)` bootstrap (Phase 1) wires all three so a service
  adopts observability with one import (NFR-008, Developer Story 1).

## Per-service integration points

- **ARSY Hub**: Fastify server instrumentation; must coexist with the existing PGlite ORM and Better
  Auth without altering their behavior.
- **Sentinel**: RADIUS daemon counters — auth rate, accounting rate, active sessions.
- **Headquarter / Dock / ID**: Next.js App Router telemetry that does not break existing routing or
  server-component patterns.

## SLOs, error budgets, and alerting (FR-006/FR-007)

- SLOs are declared per critical service against its metrics; error budgets are derived from the
  consumed-failure ratio.
- The alert engine routes SLO-violation and capacity signals through Alertmanager with
  **deduplication → grouping → routing → escalation**, so a single incident fires once.
- Capacity alerts are projected 24–48h ahead of saturation from historical trends.

## Data retention and cost (FR-009/FR-010/NFR-005)

- Configurable retention tiers: short high-resolution window in the hot TSDB, long-term rollups in
  the time-series store, log retention bounded to keep the stack under the cost budget at scale.
- Cardinality is kept bounded (no per-user labels) to protect cost and performance.

## Security and privacy

- Redaction happens **in the collector before storage**: no PII, secret, or token value is ever
  written to a log, span attribute, or metric label (NFR-003, regulatory constraint).
- Tenant isolation boundaries are respected: telemetry never carries cross-tenant identifiers into a
  queryable field, and dashboards honor the same access boundaries as the products.
- GDPR handling: retention windows are configurable and purgeable; logs are treated as personal-data
  carriers and minimized accordingly (NFR-007).

## Reliability and self-observability

- Instrumentation is fail-open: if the collector is unreachable the service degrades to local
  buffering/no-op rather than blocking the request path — observability must never reduce core
  availability (NFR-002) and must stay under the 5% overhead ceiling (NFR-001).
- The stack monitors itself (collector lag, ingestion drops, alert-delivery failures) — NFR-006.

## Deployment

- Runs inside the existing Docker/Coolify model as a collector sidecar/pipeline plus the
  Prometheus/Grafana/Loki/Alertmanager stack, scaled to the 100K+ metrics/sec and 1M+ log
  events/sec target (NFR-004).

## Rejected / deferred

- APM profiling, ML anomaly detection, business/user-behavior analytics, and external third-party
  API monitoring — all explicitly out-of-scope in the spec; not designed here.
