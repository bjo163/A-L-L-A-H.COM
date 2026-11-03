# Tasks: ORACLE Phase 1 — Read-Only Network & ISP Analytics Projections (Issue #20)

## 1. Metric Aggregations & Query Projections
- [ ] Implement subscriber & MRR projection queries in ARSY Fastify Hub
- [ ] Implement network bandwidth & session count projections
- [ ] Implement device availability & MTTR uptime calculations

## 2. API Endpoints & Provenance Metadata
- [ ] Register `GET /v1/oracle/isp/overview` (aggregate KPIs)
- [ ] Register `GET /v1/oracle/isp/bandwidth-timeline` (traffic time-series)
- [ ] Attach calculation version, time window, and provenance metadata to all responses

## 3. Testing & Verification Gates
- [ ] Write integration test `apps/arsy/test/oracle_analytics.test.mjs`
- [ ] Verify revenue numbers reconcile strictly with WORKS invoices
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

