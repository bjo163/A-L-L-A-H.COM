# Tasks: CHRONICLE Phase 1 — Bounded Syslog Collector & Normalized Event Foundation (Issue #16)

## 1. Syslog Parser & Collector Daemon
- [ ] Implement RFC 3164 and RFC 5424 parser in `packages/chronicle-syslog`
- [ ] Implement standalone UDP socket collector on port 514
- [ ] Implement bounded memory ring buffer with backpressure and drop counters

## 2. Storage & Normalization Model
- [ ] Register `chronicle.event` model in `@allah/arsy-orm`
- [ ] Implement batch insert worker flushing events to PGlite
- [ ] Implement retention pruning worker (14-day policy)

## 3. Testing & Verification Gates
- [ ] Build packet fuzzing tests with malformed and flood inputs
- [ ] Verify collector graceful start and stop
- [ ] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

