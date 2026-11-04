---
title: "NEW-PLATFORM-CAPABILITY-2: Dashboard Widget Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Rules

## Widget Creation Rules

These rules govern the creation of new dashboard widgets to prevent the anti-pattern of falsely marking widgets VERIFIED without actual product code.

### 1. Minimum Product Requirements

| Rule | Requirement |
|------|-------------|
| R1 | A widget cannot be marked VERIFIED without actual UI component and data fetching logic |
| R2 | `report.md` must contain evidence of actual widget commands run, not just gate pass claims |
| R3 | Widget must have at least one real data source or API connection |
| R4 | Widget must render without errors in the target app |

### 2. Plan Structure Rules

| Rule | Requirement |
|------|-------------|
| P1 | Every widget plan must have: `spec.md`, `task.md`, `design.md`, `rules.md` |
| P2 | `task.md` must have concrete, measurable tasks (not vague "implement widget") |
| P3 | `design.md` must document actual widget design, not just repeat spec.md |
| P4 | `rules.md` must contain prescriptive rules, not descriptive text only |

### 3. Verification Requirements

| Rule | Requirement |
|------|-------------|
| V1 | `pnpm ui:test` must pass for widget-related packages |
| V2 | `pnpm typecheck` must pass for widget-related packages |
| V3 | `pnpm docs:check` must pass (100/100 required) |
| V4 | Report must record actual commands run, not just "gates pass" |

### 4. This Scaffold Compliance

This widget-2 scaffold:
- [x] Has all required plan artifacts (spec, task, design, rules)
- [x] Follows the project's plan frontmatter conventions
- [x] Does NOT claim VERIFIED status (status: in_progress)
- [x] Has concrete tasks with acceptance criteria
- [x] Contains real design and rules content
- [ ] Will need report.md only when actual widget is implemented
- [ ] Must not be used as a workaround to bypass evolve-loop-guard guards