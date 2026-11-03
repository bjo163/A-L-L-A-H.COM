# AUTONOMOUS.md
## Autonomous Development Operating Contract

This document defines how an AI agent works toward GOAL.md. It is an operating protocol, not a second product vision.

## Principles
- Own outcomes, not merely individual prompts.
- Understand before changing; preserve before migrating.
- Work independently on ordinary, reversible engineering tasks.
- Do not ask approval for every file edit or routine test.
- Distinguish implemented, verified, released, and deployed.
- Prefer root-cause fixes and complete vertical slices.
- Keep durable records of tasks, decisions, blockers, and evidence.
- After each task, reassess the backlog and continue.

## Mandatory initialization
1. Read GOAL.md, AGENTS.md, and this file.
2. Read LEGACY_RECONCILIATION.md before touching legacy material.
3. Read relevant BLUEPRINT.md, DESIGN.md, QUALITY.md, and DECISIONS.md.
4. Inspect git status, current branch, recent commits, and repository tree.
5. Preserve existing user changes.
6. Inspect manifests, source, tests, configuration, and runtime behavior.
7. Check BACKLOG.md for existing work.

When docs conflict with code, record the discrepancy and use verified implementation for current-state claims.

## Continuous loop
DISCOVER → UNDERSTAND → RECONCILE → AUDIT → PRIORITIZE → PLAN → EXECUTE → VERIFY → DOCUMENT → REASSESS.

Discover sources and code; understand ownership/dependencies; reconcile history; audit gaps and risks; prioritize by impact; define acceptance criteria; implement focused slices; run checks; record evidence; choose the next task. Do not stop after an audit or plan when implementation can safely proceed.

## Priority
- P0 Critical: exploitable security issue, data loss, production-critical outage, release blocker.
- P1 High: broken core workflow, integrity issue, critical missing foundation, integration blocker.
- P2 Medium: important product capability, architecture consolidation, major UX issue.
- P3 Normal: quality, accessibility, performance, maintainability, documentation.
- P4 Opportunistic: nonessential improvement with clear value.

Every task needs a stable ID, problem, outcome, affected area, dependencies, acceptance criteria, and verification method. Label hypotheses as hypotheses.

## Task states
DISCOVERED, READY, IN_PROGRESS, IMPLEMENTED, VERIFIED, RELEASED, BLOCKED, DEFERRED.
IMPLEMENTED means changed; VERIFIED means required checks passed with evidence; RELEASED means an actual release occurred. Never conflate them.

## Implementation and self-healing
Follow root and app-level AGENTS.md. Inspect exact framework versions and local docs. Reuse sound existing capabilities; avoid duplicate modules and needless dependencies. Implement real behavior, not fake success states. Add tests for behavior changes and handle relevant loading, empty, error, offline, success, and authorization states.

When a check fails, capture the failure; determine whether it is caused by the change, baseline, environment, or external dependency; fix the root cause when safe; rerun; record unresolved limitations. Use commands actually defined by manifests. Evaluate applicable Rust formatting, Clippy, tests, frontend lint/build, migrations, API/integration tests, security checks, and end-to-end flows. Never claim skipped or unavailable checks passed.

## Documentation synchronization
Update only affected docs: GOAL (mission), AUTONOMOUS (protocol), AGENTS (engineering rules), LEGACY_RECONCILIATION (provenance), BLUEPRINT (architecture), DESIGN (experience), ROADMAP (strategic stages), BACKLOG (tasks), QUALITY (verification), DECISIONS (accepted decisions), CHANGELOG (actual changes). Avoid mechanical edits and duplicated instructions.

## Git safety and authorization
Routine reversible edits and local tests may proceed without micro-confirmations. Explicit authorization is required for production deployment, destructive data operations, DNS/billing/paid infrastructure changes, force push/history rewrite, branch protection changes, deletion of important branches, deletion/overwriting of original archives or canon, and publication of private information.

Inspect existing branches; do not create unnecessary branches. Preserve unrelated changes. Never force-push or rewrite shared history. Never stage blindly with git add .; inspect the staged diff. Exclude secrets, .env files, local databases, credentials, generated output, and unrelated files. Do not assume dev exists. Do not push automatically merely to satisfy a generic rule; follow actual repository policy and user authorization.

## Continue and stop conditions
Continue while safe, valuable, actionable work and required access exist. Pause for destructive decisions without approval, missing credentials/source, unresolved canon conflicts requiring owner judgment, or material risk to data/security/user work. Continue independent safe tasks while another task is blocked.

## Session handoff
Update BACKLOG.md with completed/verified task IDs, commands and actual results, changed paths, commit references, blockers, and next task. A session ending does not mean the mission is complete.
