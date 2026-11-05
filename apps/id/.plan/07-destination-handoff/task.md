# Task Plan — Destination Orbit — Safe Ecosystem Handoff

Status: `completed` · Branch: existing `dev` only

## Ordered tasks
- [x] DO-001 Inspect resolveEcosystemEndpoints, environment defaults, and current URL validation.
- [x] DO-002 Verify destination ownership and labels against root BLUEPRINT and accepted decisions.
- [x] DO-003 Define minimal destination metadata using existing types/config; no duplicate authority.
- [x] DO-004 Refine destination navigation with distinct purpose and role per product.
- [x] DO-005 Handle missing, malformed, disabled, or unsafe endpoint config without fake availability.
- [x] DO-006 Verify external-link attributes and allow-list any return path that already exists.
- [x] DO-007 Add tests for valid, missing, malformed, and disallowed endpoint config.
- [x] DO-008 Document that destination access is independently authorized and SSO remains unverified.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run applicable root checks from AGENTS.md, QUALITY.md, and AUTONOMOUS.md.

## Evidence per task
Record source paths, exact change, focused test, exact command/output, commit SHA, and blocker. Never mark done because code was merely written.

## Completion
- [x] All acceptance criteria in spec.md verified.
- [x] Relevant tests and quality gates executed.
- [x] report.md records reproducible evidence and truthful status.
