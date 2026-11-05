---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS-APP-SESSION-SYNC-TASKS"
version: "1.0.0"
owner: "engineering"
status: "proposed"
target_branch: "dev"
---

# Cross-application session synchronization tasks

Status: `[ ] pending` · `[~] in progress` · `[x] verified complete` · `[!] blocked` · `[-] not applicable with evidence`

## Phase 0 — reconcile proposal and current contracts
- [ ] **SYNC-0001** Read root instructions and inspect current SDK, shared types, auth routes, and app session flows.
- [ ] **SYNC-0002** Verify each proposed type/method against existing exported contracts and avoid duplicate definitions.
- [ ] **SYNC-0003** Resolve the proposed six skin names against the canonical six `@moonwitness/ui` SkinId values.
- [ ] **SYNC-0004** Verify an actual preference persistence API and tenant authorization boundary before proposing writes.
- [ ] **SYNC-0005** Reconcile SSRF validation with the existing server-side endpoint resolver and DNS/IP recheck requirements.
- [ ] **SYNC-0006** Record explicit conflicts, scope, and acceptance tests before implementation.

## Phase 1 — contract implementation (blocked on Phase 0)
- [ ] **SYNC-0101** Add only missing, source-backed shared types with compile-time tests.
- [ ] **SYNC-0102** Add only SDK methods backed by existing authorized server routes.
- [ ] **SYNC-0103** Add SSRF regression tests for hostname resolution and private/loopback addresses if resolver work is approved by evidence.
- [ ] **SYNC-0104** Verify supported apps build and quality gates pass.
- [ ] **SYNC-0105** Update report with exact evidence and commit.

No task is complete from proposal text alone. The source audit must resolve the conflicts recorded in [spec.md](spec.md) before Phase 1.
