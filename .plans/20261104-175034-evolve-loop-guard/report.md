---
contract: "DOCUMENTATION_CONTRACT.md"
id: "EVOLVE_LOOP_GUARD"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
---

# Report: Evolve Loop Guard

## Summary

Harden the EVOLVE loop against empty plans and unverified claims. Verified deliverables below are from commands actually run in this session.

## Deliverables

- `AUTONOMOUS.md` section 8 now carries three guards:
  - 8.3 guard: a new evolve plan requires a concrete `spec.md` before creation (a plan titled "New platform capability" with only "implement the capability" acceptance is rejected).
  - 8.5 Verification Guard: `VERIFIED` in BACKLOG requires a `report.md` naming the commands run, exit codes/output, and changed files; a bare "all quality gates passing" claim is unverified.
  - 8.6 Anti-Stacking Guard: no new evolve plan while any evolve plan is `proposed` or `in_progress`.
- `BACKLOG.md`: capability 6-12 moved `VERIFIED` -> `DISCOVERED`, capability 13 moved `READY` -> `DISCOVERED`, each with a one-line evidence-based `Reason`. Added `EVOLVE-LOOP-GUARD` entry (IN_PROGRESS).
- Removed three untracked empty plan dirs whose content was only template files: `2026-11-04T09-47-02-new-platform-capability-12`, `2026-11-04T09-52-05-new-platform-capability-12-new-platform-capability`, `2026-11-04T09-52-59-new-platform-capability-13`. None had been committed to git.
- Plan artifacts in `.plans/20261104-175034-evolve-loop-guard/`: `spec.md`, `task.md`, `design.md`, `rules.md`, `report.md`.

## Quality Gates (commands run in this session)

| Command | Result |
|---|---|
| `pnpm docs:check` | PASS, 100/100 pts. AUTONOMOUS.md and BACKLOG.md PASS. |
| `pnpm lint:arch` | PASS, 100%. All 15 invariants pass. |
| `pnpm typecheck` | FAIL, pre-existing breakage outside this change. Errors in `packages/arsy-plugin-llm-gateway/src/cache.ts` (TS2345, TS2554) and `packages/sentinel-radius` build. Those files are not modified by this plan; `git status` shows them already dirty from other work. This change touches only `AUTONOMOUS.md`, `BACKLOG.md`, and plan artifacts, so the failure is not introduced here. |

## Evidence for the removed dirs

Each removed dir contained only `design.md`, `rules.md`, `spec.md`, `task.md` (plus a `report.md` in one), all empty templates, and none were tracked by git (`git ls-files` returned nothing). They held no code.

## Status

completed for documentation scope. Commit `c5c8f92` made for the docs-only change. Push to `dev` deferred: the pre-push hook runs typecheck plus app builds, which fail on a pre-existing in-flight refactor of the `QueryOptions`/`scope` API in `packages/arsy-orm` with callers in `apps/sentinel/src/server.ts` and `apps/headquarter/src/app/agent/page.tsx` not yet updated. Those files are not part of this plan and are not present in commit `c5c8f92` (the commit carries only docs and passes `docs:check` 100/100 and `lint:arch` 100%). The commit is safe on local `dev` and will be pushed once the owner completes the unrelated refactor.