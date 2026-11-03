---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ORACLE-PHASE1-RULES"
version: "1.0.0"
owner: "product-architecture"
status: "completed"
last_verified: "2026-11-04"
---
# Rules: ORACLE Phase 1 — Read-Only Network & ISP Analytics Projections (Issue #20)

## 1. Analytics & Provenance Invariants
1. **Strictly Read-Only**: ORACLE creates projections and analytical summaries; it never modifies state in WORKS, SENTINEL, or NEXUS.
2. **Revenue Truth Source**: Revenue must never be derived from network octet counters or session durations; it must strictly come from WORKS invoices.
3. **No Fabricated Telemetry**: Incomplete or stale metrics must explicitly report data coverage percentage and freshness bounds.
