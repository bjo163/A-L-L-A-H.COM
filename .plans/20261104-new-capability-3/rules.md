---
title: "NEW-PLATFORM-CAPABILITY-3: Authentication Guard Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Rules

## Guard Creation Rules

These rules govern the creation of new authentication guards to prevent the anti-pattern of falsely marking guards VERIFIED without actual product code.

### 1. Minimum Product Requirements

| Rule | Requirement |
|------|-------------|
| R1 | A guard cannot be marked VERIFIED without actual middleware and token validation logic |
| R2 | `report.md` must contain evidence of actual guard commands run, not just gate pass claims |
| R3 | Guard must integrate with at least one app's auth system (apps/id, apps/headquarter) |
| R4 | Guard must not have security vulnerabilities (no hardcoded secrets, proper input validation) |

### 2. Plan Structure Rules

| Rule | Requirement |
|------|-------------|
| P1 | Every guard plan must have: `spec.md`, `task.md`, `design.md`, `rules.md` |
| P2 | `task.md` must have concrete, measurable tasks (not vague "implement guard") |
| P3 | `design.md` must document actual guard design, not just repeat spec.md |
| P4 | `rules.md` must contain prescriptive rules, not descriptive text only |

### 3. Verification Requirements

| Rule | Requirement |
|------|-------------|
| V1 | `pnpm typecheck` must pass for guard-related packages |
| V2 | `pnpm lint:arch` must pass for guard-related packages |
| V3 | `pnpm docs:check` must pass (100/100 required) |
| V4 | Report must record actual commands run, not just "gates pass" |

### 4. This Scaffold Compliance

This guard-3 scaffold:
- [x] Has all required plan artifacts (spec, task, design, rules)
- [x] Follows the project's plan frontmatter conventions
- [x] Does NOT claim VERIFIED status (status: in_progress)
- [x] Has concrete tasks with acceptance criteria
- [x] Contains real design and rules content
- [ ] Will need report.md only when actual guard is implemented
- [ ] Must not be used as a workaround to bypass evolve-loop-guard guards