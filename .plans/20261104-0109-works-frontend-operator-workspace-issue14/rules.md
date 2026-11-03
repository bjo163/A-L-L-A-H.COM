# Rules: WORKS Frontend Phase 1 — ISP Operator Workspace (Issue #14)

## 1. Frontend Governance Invariants
1. **UI Purity**: All components must import strictly from `@moonwitness/ui`. No ad-hoc HTML elements or un-themed controls.
2. **Read-Only Session Representation**: Frontend displays session data from authorized API projections; it must never manipulate or invent session state locally.
3. **Tenant Context**: All API requests pass tenant header and session token via `@allah/sdk`.

