# Rules: SENTINEL Phase 3 — RADIUS Accounting & Subscriber Session Lifecycle (Issue #12)

## 1. Accounting Invariants
1. **Accounting $\neq$ Invoices**: Acquired session octets and time durations are network usage evidence only. They must never be directly converted to invoices or ledger charges without commercial billing engine mediation.
2. **Idempotency Guarantee**: Retransmitted accounting packets must not increment session byte counts.
3. **No Fabricated Data**: If a NAS restarts without sending Stop packets, mark sessions as `reconciled` with last observed values; never invent fake stop timestamps.

