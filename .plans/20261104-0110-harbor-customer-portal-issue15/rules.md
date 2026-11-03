# Rules: HARBOR Phase 1 — ISP Customer Self-Service Experience (Issue #15)

## 1. Privacy & Boundary Invariants
1. **Zero Internal Exposure**: Never expose NAS shared secrets, internal IP topologies, or operator debug notes to customers.
2. **Customer Identity Binding**: Subscriber identity is derived strictly from the verified session token; never allow URL parameter manipulation to access another subscriber's records.
3. **No Direct Billing Writes**: HARBOR presents data; it does not issue refunds, void invoices, or directly alter subscription periods.

