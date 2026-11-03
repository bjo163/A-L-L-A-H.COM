# Rules: PULSE Phase 1 — Network Operation Job Lifecycle (Issue #19)

## 1. Automation Invariants
1. **No External Queues**: Use PGlite and native Node.js async facilities. Do not introduce Redis, BullMQ, or message brokers without an accepted ADR.
2. **Idempotent Operations**: Every job payload must declare an idempotency key to prevent accidental duplicate actions.
3. **Tenant Fairness**: Long-running jobs in one tenant must not starve other tenants' operations.

