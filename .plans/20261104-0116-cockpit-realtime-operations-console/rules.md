---
title: "COCKPIT Phase 1 — High-Density Real-Time Operations Console"
status: "proposed"
timestamp: "2026-11-04T01:16:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 21
parent_issue: 5
---

# Rules: COCKPIT Phase 1 — High-Density Real-Time Operations Console

## Antislop Compliance
- UI: All interactive elements must be imported from `@moonwitness/ui`, no raw `<button>` or `<input>` tags in `apps/`
- Code: Strict TypeScript typecheck with no errors (`pnpm typecheck` must pass 100%)
- Architectural: Single ORM (PGlite embedded @allah/arsy-orn), Universal SDK (@allah/sdk protocol), Shared Types (@moonwitness/types contract)

## Documentation Requirements
- All plan files must have complete frontmatter (title, status, timestamp, author, target_branch, target_repo, issue, parent_issue)
- CHANGELOG.md must reflect all merged changes with conventional commit format
- API contracts in @moonwitness/types must not be redefined locally in apps/

## Quality Gate Invariants
- Fail-closed: No uncommitted secrets or untracked bloat
- Tenant isolation: All queries must parameterized with company_id
- Zero ORM overlap: Only PGlite embedded ORM may be used