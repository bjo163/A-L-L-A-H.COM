# Rules: Network Foundation Phase 0 — Audit Current Repository & Reconcile Architecture (Issue #6)

## 1. Audit Invariants
1. **Zero Runtime Modifications**: Phase 0 is an observational and analytical audit. Do not introduce migrations, new packages, dependencies, or runtime alterations.
2. **Path & Evidence Integrity**: Every stated capability or gap must point to a verifiable file path, test file, or git diff. Do not fabricate or infer capability from documentation alone.
3. **No Unapproved Infrastructure**: Do not propose Redis, Kafka, RabbitMQ, ClickHouse, or external PostgreSQL without an accepted evidence-backed ADR.
4. **Tenant Isolation**: All proposed models must adhere to strict multi-tenant isolation via `company_id`.

