# Rules: WORKS Phase 1 — ISP Commercial Foundation & Billing Lifecycle (Issue #9)

## 1. Commercial & Access Separation Invariants
1. **Decoupled Access Authority**: WORKS controls *entitlement* (what customer paid for); SENTINEL controls *access enforcement* (RADIUS protocol). WORKS must never mutate SENTINEL session or account tables directly.
2. **Idempotent Transitions**: Subscriptions must handle duplicate activation/suspension signals safely without corrupting validity periods.
3. **No Live Payments in Phase 1**: Payment gateway integration remains an abstract interface. Real payment collection or production billing activation is blocked.
4. **Tenant Isolation**: Mandatory `company_id` filter on all commercial plans, subscriptions, and invoices.

