---
title: "Shared UI Audit Remediation Tasks"
status: "in_progress"
timestamp: "2026-11-04T15:41:09+07:00"
---

# TASK: Shared UI Audit Remediation

Implementation is underway. Keep the per-app visual identities intact.

## Phase 0 - Make the UI gate complete and migrate app bypasses

- [x] Add architecture-gate regression coverage for forbidden `mw-*` component classes in app JSX and CSS; keep legitimate `--mw-*` token references and `packages/ui` definitions allowed.
- [x] Expand `UI_PURITY` to check the documented private-class policy across JSX and CSS.
- [x] Migrate Gate JSX occurrences to `Card`, `Link` props, `RawStack`, and a shared `Skeleton` component.
- [x] Replace Headquarter/ID CSS selectors that targeted private `.mw-*` internals with public `data-slot` hooks.
- [x] Re-run `pnpm lint:arch`; no raw controls or private UI classes remain in the five React apps.

## Phase 1 - Close shared control API defects

- [x] Test FormField label/hint/error wiring with `Input`, `Textarea`, and `Select`.
- [x] Connect context description IDs, render direct hints, and propagate required state.
- [x] Test Link `external`, `target`, `rel`, new-tab messaging, and child composition.
- [x] Align external-link behavior between `Link` and `LinkButton`.
- [x] Compose child/wrapper click handlers and block activation when a composed Button is disabled; preserve child refs.
- [x] Run focused shared UI tests and `tsc --noEmit -p packages/ui/tsconfig.json`.

## Phase 2 - Align shared dialog behavior

- [x] Replace the Skin Laboratory hand-built overlay with the shared native `Dialog` primitive.
- [x] Verify focus entry, Escape dismissal, and focus restoration on Headquarter `/skin-lab`.
- [ ] Verify backdrop-click dismissal policy in a browser; the integrated browser did not expose a reliable outside-click event.
- [x] Add dialog markup regression coverage and preserve its skin styling.

## Phase 3 - Establish one token/CSS source of truth

- [x] Trace the Tailwind CSS imports and verify the npm package subpath export.
- [x] Keep `tokens/index.ts` as a compatibility export and deprecate its static palette in favor of selected skin tokens.
- [x] Remove unreferenced duplicate `shadcn/tailwind.css` snapshots and the unexported UI global stylesheet. Keep npm stylesheet dependencies where apps import them.
- [ ] Rebuild Dock, ID, and Jizz after CSS cleanup to confirm package styles resolve.

## Phase 4 - Close app coverage and verify the ecosystem

- [x] Add `apps/gate/` to `AGENTS.md` and document the public `data-slot` CSS hooks.
- [x] Re-run the architecture gate; all five React apps contain zero raw controls or private UI classes.
- [x] Run `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`, and builds for Dock, Gate, Headquarter, ID, and Jizz.
- [x] Check representative routes in all five apps at 320px; no horizontal overflow was measured. Check Headquarter at 640px with reduced motion enabled; its route animation is disabled.
- [ ] Verify true 200% browser zoom and run axe checks on representative routes.
- [ ] Record only observed test and browser results in the implementation report after all phases complete.

## Dependencies

```text
Phase 0 --> Phase 4
Phase 1 --> Phase 2 --> Phase 4
Phase 3 --------------> Phase 4
```

Phase 0 establishes enforcement and removes current bypasses before later verification. Phase 1 and Phase 3 can proceed independently. Phase 2 depends on the shared dialog API being stable. Phase 4 depends on all implementation phases.
