# Rules: ORBIT Phase 1 — Cloud Compute & Hosting Customer Experience

## 1. Cloud & Compute Invariants
1. **Single Backend Authority**: All compute APIs route strictly through ARSY Fastify Hub. No separate standalone microservice backend or competing database is permitted.
2. **Deterministic Billing**: Runtime hours reconcile with WORKS billing schedules; terminated instances immediately halt charge accrual.
3. **Tenant Isolation**: Mandatory `company_id` filter on all instance queries and block storage attachments.

