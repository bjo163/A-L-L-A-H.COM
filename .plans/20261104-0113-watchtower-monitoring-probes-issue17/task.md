# Tasks: WATCHTOWER Phase 1 — Monitoring Targets, Probes, Alerts & Incidents (Issue #17)

## 1. Monitoring Data Models
- [ ] Define `watchtower.target` model in `@allah/arsy-orm`
- [ ] Define `watchtower.observation` time-series table in PGlite
- [ ] Define `watchtower.alert` and `watchtower.incident` models

## 2. Probe Runner & Flap Dampener
- [ ] Implement TCP and ICMP socket probe runner
- [ ] Implement consecutive failure threshold logic and deduplication
- [ ] Implement incident state machine (`open`, `acknowledged`, `resolved`)

## 3. Testing & Verification Gates
- [ ] Write unit tests for probe failure and recovery cycles
- [ ] Test alert deduplication under rapid state toggling
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

