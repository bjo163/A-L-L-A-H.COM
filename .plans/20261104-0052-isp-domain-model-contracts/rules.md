# Rules: ISP Product Phase 1 — Canonical Domain Models & Cross-Domain Contracts (Issue #7)

## 1. Domain Separation Invariants
1. **No Shared Database Mutations**: WORKS must never directly write to `sentinel.session` or `sentinel.account`. SENTINEL must never directly write to `isp.invoice` or `res.partner`.
2. **Accounting $\neq$ Revenue**: RADIUS accounting packets are physical usage telemetry and must never be treated as billing invoices or payment records.
3. **Decoupled Identity**: Subscriber PPPoE network credentials (`sentinel.account`) must remain strictly isolated from platform MoonWitness ID / SSO user credentials.
4. **Tenant Isolation**: Every ISP and network model must have a mandatory `company_id` index and fail-closed tenant boundary.

