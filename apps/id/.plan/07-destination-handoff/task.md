# Task Plan — Destination Orbit — Safe Ecosystem Handoff

Status: `proposed` · Branch: existing `dev` only

## Ordered tasks
- [ ] DO-001 Inspect resolveEcosystemEndpoints, environment defaults, and current URL validation.
- [ ] DO-002 Verify destination ownership and labels against root BLUEPRINT and accepted decisions.
- [ ] DO-003 Define minimal destination metadata using existing types/config; no duplicate authority.
- [ ] DO-004 Refine destination navigation with distinct purpose and role per product.
- [ ] DO-005 Handle missing, malformed, disabled, or unsafe endpoint config without fake availability.
- [ ] DO-006 Verify external-link attributes and allow-list any return path that already exists.
- [ ] DO-007 Add tests for valid, missing, malformed, and disallowed endpoint config.
- [ ] DO-008 Document that destination access is independently authorized and SSO remains unverified.

## Required gates
```bash
pnpm --filter @moonwitness/id typecheck
pnpm --filter @moonwitness/id build
```
Run applicable root checks from AGENTS.md, QUALITY.md, and AUTONOMOUS.md.

## Evidence per task
Record source paths, exact change, focused test, exact command/output, commit SHA, and blocker. Never mark done because code was merely written.

## Completion
- [ ] All acceptance criteria in spec.md verified.
- [ ] Relevant tests and quality gates executed.
- [ ] report.md records reproducible evidence and truthful status.
