# Rules: ISP Integration Phase 1 — Synchronize WORKS Entitlement with SENTINEL Access Policy (Issue #13)

## 1. Integration Invariants
1. **No Shared Table Writes**: Coupling is strictly asynchronous and event-driven via versioned contracts.
2. **Fail-Closed on Unauthenticated**: If entitlement state is ambiguous or unverified, default to `Access-Reject`.
3. **Idempotent Delivery**: Processing duplicate entitlement events must not trigger redundant Disconnect packets to NAS routers.

