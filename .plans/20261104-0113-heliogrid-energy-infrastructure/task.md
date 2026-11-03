# Tasks: HELIOGRID Phase 1 — Energy & Physical Infrastructure Foundation

## 1. Energy Domain Models (`addons/heliogrid` & `@allah/arsy-orm`)
- [ ] Define `heliogrid.site` model linked to `nexus.site`
- [ ] Define `heliogrid.inverter` and `heliogrid.battery` models
- [ ] Define `heliogrid.telemetry` model for energy power flow logs
- [ ] Register models in `@allah/arsy-orm` schema migration registry

## 2. Telemetry Ingestion & Alerting
- [ ] Implement `POST /v1/heliogrid/telemetry` batch ingestion endpoint
- [ ] Implement low-power threshold alert evaluator
- [ ] Export `HeliogridTelemetryRecord` from `@moonwitness/types`
- [ ] Add `mwClient.heliogrid` methods in `@allah/sdk`

## 3. Testing & Verification Gates
- [ ] Create automated unit tests for energy calculations in `apps/arsy/test/heliogrid.test.mjs`
- [ ] Verify `pnpm lint:arch` (100% compliant)
- [ ] Verify `pnpm typecheck` (0 errors)
- [ ] Verify `pnpm docs:check` (100/100 pts)

