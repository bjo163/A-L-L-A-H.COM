# Tasks: CHRONICLE Phase 1 — Bounded Syslog Collector & Normalized Event Foundation (Issue #16)

## 1. Syslog Parser & Collector Daemon
- [x] Implement RFC 3164 and RFC 5424 parser in `packages/chronicle-syslog`
- [x] Implement standalone UDP socket collector on port 514
- [x] Implement bounded memory ring buffer with backpressure and drop counters

## 2. Storage & Normalization Model
- [x] Register `chronicle.event` model in `@allah/arsy-orm`
- [x] Implement batch insert worker flushing events to PGlite
- [x] Implement retention pruning worker (14-day policy)

## 3. Testing & Verification Gates
- [x] Build packet fuzzing tests with malformed and flood inputs
- [x] Verify collector graceful start and stop
- [x] Run `pnpm lint:arch`, `pnpm typecheck`, `pnpm docs:check`

