---
contract: "DOCUMENTATION_CONTRACT.md"
id: "HEADQUARTER-COMMAND-CENTER-SPEC"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
target_branch: "dev"
---

# Headquarter command center specification

## Objective

Make `apps/headquarter` a source-backed strategic command center while preserving backend authority in ARSY and avoiding overlap with GATE, DOCK, COCKPIT, ID, Qorpus, and domain applications.

## Scope

- Reconcile navigation and shell metadata, then build verified Overview and project workflows.
- Audit agent/device/mission and AI Gateway/Swarm contracts before changing those surfaces.
- Apply the NEXUS PARADOX design and accessibility requirements to Headquarter.
- Keep task evidence in [task.md](task.md) and [report.md](report.md).

## Constraints

- ARSY remains the authority for authentication, tenant isolation, policy, persistence, and audit.
- Use `@allah/sdk`, `@moonwitness/types`, and `@moonwitness/ui`; do not invent endpoints or data.
- Preserve existing routes unless a tested redirect is part of the change.
- Never expose secrets, workspace paths, local files, or hidden model reasoning.
- Treat cancellation as a request until the server confirms the resulting state.

## Acceptance criteria

1. Navigation has one operational source and every registered route resolves.
2. Overview and workflows show only API-backed values with clear empty, stale, partial, offline, and access-denied states.
3. Tenant and privileged actions are enforced and tested server-side.
4. UI meets the shared design-system, keyboard, focus, reduced-motion, and responsive contracts.
5. Relevant tests, typecheck, build, and root quality gates pass, or remaining blockers are recorded with evidence.

## Current status

Planning and source sampling only. Runtime implementation and full contract audit remain open; see [report.md](report.md).
