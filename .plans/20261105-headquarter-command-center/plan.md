---
title: "Headquarter NEXUS PARADOX readiness"
status: "ready"
target_branch: "dev"
created: "2026-11-05"
---
# Master plan

## Objective
Make apps/headquarter a trustworthy strategic command center without duplicating GATE, DOCK, COCKPIT, ID, ARSY, Qorpus, or domain-service responsibilities.

## Source-backed audit
- App uses Next.js 16.4.3 / React 19.3.0 / TypeScript, port 3002.
- Existing surfaces: Overview, AI Gateway, Agent Studio, Swarm Ops, Tool Registry, Knowledge, Projects navigation, Skin Laboratory.
- src/lib/nav-registry.ts declares Overview and six modules including Projects.
- headquarter-shell.tsx has a separate six-entry array omitting Projects.
- src/app/page.tsx has a separate five-module array, also omitting Projects.
- Skin Laboratory is a utility, not a strategic module.
- Agent Studio has streaming and remote device/mission controls; cancellation, event lifecycle and tenant permissions need deeper audit.
- DESIGN.md maps Headquarter to NEXUS PARADOX. COCKPIT plan owns live NOC dispatch. Root BLUEPRINT.md keeps ARSY as backend authority.
- Documentation baseline only: no runtime code changed and no tests/build run.

## Non-goals
No wholesale rewrite before contract audit. No duplicate backend/database/SDK/auth/agent runtime/design system. No live NOC panels, local workspace path exposure, extension policy bypass, route removal without compatibility, or speculative autonomous approvals in P0.

## Dependency order
00 source/contracts → 01 navigation/shell → 02 executive Overview → 03 projects/portfolio → 04 agent governance → 05 AI Gateway/Swarm → 06 tools/knowledge → 07 decisions/audit (API gap decision first) → 08 NEXUS design/accessibility/performance → 09 integration/security/release.

Read-only audits may run concurrently only with separate output files. Do not parallelize dependent implementation phases.

## Completion
Check tasks only with evidence. Update report.md after each phase with changed files, commit, tests, outcomes, limitations and next gate. Docs/mockups alone do not complete runtime work.
