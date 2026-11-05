# Tasks: HELIOGRID Phase 1 — Energy & Physical Infrastructure Foundation

## 1. Energy Domain Models (`addons/heliogrid` & `@allah/arsy-orm`)
- [x] Define `heliogrid.site` model linked to `nexus.site`
- [x] Define `heliogrid.inverter` and `heliogrid.battery` models
- [x] Define `heliogrid.telemetry` model for energy power flow logs
- [x] Register models in `@allah/arsy-orm` schema migration registry

## 2. Telemetry Ingestion & Alerting
- [x] Implement `POST /v1/heliogrid/telemetry` batch ingestion endpoint
- [x] Implement low-power threshold alert evaluator
- [x] Export `HeliogridTelemetryRecord` from `@moonwitness/types`
- [x] Add `mwClient.heliogrid` methods in `@allah/sdk`

## 3. Testing & Verification Gates
- [ ] Create automated unit tests for energy calculations in `apps/arsy/test/heliogrid.test.mjs`
- [ ] Verify `pnpm lint:arch` (100% compliant)
- [ ] Verify `pnpm typecheck` (0 errors)
- [ ] Verify `pnpm docs:check` (100/100 pts)