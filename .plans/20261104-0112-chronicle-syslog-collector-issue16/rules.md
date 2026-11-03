# Rules: CHRONICLE Phase 1 — Bounded Syslog Collector & Normalized Event Foundation (Issue #16)

## 1. Observability Invariants
1. **Separation of Concerns**: Pino handles ARSY internal application logging; CHRONICLE handles external network device syslog telemetry. Do not conflate the two.
2. **Bounded Ingestion**: The collector must enforce memory bounds and backpressure; it must drop low-priority logs rather than trigger Node.js process out-of-memory crashes.
3. **No Unapproved Infrastructure**: Do not introduce ClickHouse, Loki, or Elasticsearch without an approved evidence-backed ADR.

