# Rules: HELIOGRID Phase 1 — Energy & Physical Infrastructure Foundation

## 1. Physical Infrastructure Invariants
1. **Telemetry Bounds**: Power values must be strictly validated (negative generation or SoC $> 100\%$ are rejected as malformed).
2. **Single Backend Authority**: All energy metrics route through ARSY Fastify Hub; no external broker or competing time-series database is permitted without an approved ADR.
3. **Tenant Isolation**: Mandatory `company_id` filter on all energy site metrics and alert queries.

