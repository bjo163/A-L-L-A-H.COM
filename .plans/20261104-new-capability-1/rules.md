---
title: "NEW-PLATFORM-CAPABILITY-1: Basic Platform Capability Scaffold"
status: "in_progress"
version: "1.0.0"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-04"
---

# Rules

## Capability Creation Rules

These rules govern the creation of new platform capabilities to prevent the anti-pattern of falsely marking capabilities VERIFIED without actual product code.

### 1. Minimum Product Requirements

| Rule | Requirement |
|------|-------------|
| R1 | A capability cannot be marked VERIFIED without at least one new API route, model, or UI component |
| R2 | `report.md` must contain evidence of actual commands run, not just gate pass claims |
| R3 | `verification` in the plan must reference real test results or build outputs |
| R4 | Plan frontmatter `status` must match the actual state (proposed/in_progress/completed) |

### 2. Plan Structure Rules

| Rule | Requirement |
|------|-------------|
| P1 | Every capability plan must have: `spec.md`, `task.md`, `design.md`, `rules.md` |
| P2 | `task.md` must have concrete, measurable tasks (not vague "implement capability" descriptions) |
| P3 | `design.md` must document actual design, not just repeat spec.md content |
| P4 | `rules.md` must contain prescriptive rules, not descriptive text only |

### 3. Verification Requirements

| Rule | Requirement |
|------|-------------|
| V1 | `pnpm typecheck` must pass for all affected packages |
| V2 | `pnpm lint:arch` must pass for all affected packages |
| V3 | `pnpm docs:check` must pass (100/100 required) |
| V4 | Report must record actual commands run, not just "gates pass" |

### 4. Evolution Guard Rules

| Rule | Requirement |
|------|-------------|
| E1 | EVOLVE cannot create plans without a concrete spec |
| E2 | EVOLVE cannot mark VERIFIED without a report.md containing real evidence |
| E3 | BACKLOG must show no VERIFIED capability without corresponding code |
| E4 | Duplicate empty plan dirs must be cleaned up |

### 5. This Scaffold Compliance

This capability-1 scaffold:
- [x] Has all required plan artifacts (spec, task, design, rules)
- [x] Follows the project's plan frontmatter conventions
- [x] Does NOT claim VERIFIED status (status: in_progress)
- [x] Has concrete tasks with acceptance criteria
- [x] Contains real design and rules content
- [ ] Will need report.md only when actual capability is implemented
- [ ] Must not be used as a workaround to bypass evolve-loop-guard guards