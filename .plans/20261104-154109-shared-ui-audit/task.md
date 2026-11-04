---
title: "Shared UI Audit Remediation Tasks"
status: "proposed"
timestamp: "2026-11-04T15:41:09+07:00"
---

# TASK: Shared UI Audit Remediation

Implementation remains unstarted. Run tasks in dependency order; keep the per-app visual identities intact.

## Phase 0 — Make the UI gate complete and migrate app bypasses

- [ ] Add architecture-gate regression coverage for forbidden `mw-*` component classes in app JSX and CSS; keep legitimate `--mw-*` token references and `packages/ui` definitions allowed.
- [ ] Expand `UI_PURITY` to check the complete documented private-class policy, not only four selected class prefixes.
- [ ] Migrate the 15 Gate JSX occurrences to `Card`, `Link` props, `RawStack`/`RawGrid`, or a new shared `Skeleton` component as appropriate.
- [ ] Replace the 9 Headquarter/ID CSS selectors that target private `.mw-*` internals with app-owned public classes or supported shared variants.
- [ ] Re-run `pnpm lint:arch` and verify all five React apps have zero control or private-class violations.

## Phase 1 — Close shared control API defects

- [ ] Add failing tests for FormField label/hint/error wiring with `Input`, `Textarea`, and `Select`.
- [ ] Correct field context so generated description IDs are used by controls; ensure direct hint props render a matching description node or remove the unsupported prop.
- [ ] Add `required` state propagation if the field wrapper advertises a required field, and verify native/ARIA semantics do not contradict each other.
- [ ] Add Link tests for `external`, `target`, `rel`, accessible new-tab messaging, and `asChild`.
- [ ] Make `Link` and `LinkButton` use one consistent external-link contract.
- [ ] Add Button `asChild` tests proving child handlers/ref behavior are preserved and disabled composition is safe; implement the narrowest contract that passes those tests.
- [ ] Run focused `packages/ui` tests and `pnpm --filter @moonwitness/ui build`.

## Phase 2 — Align shared dialog behavior

- [ ] Replace the Skin Laboratory hand-built overlay with the shared `Dialog` primitive, preserving its visual treatment through the supported class/slot API.
- [ ] Verify focus placement, Escape dismissal, backdrop dismissal policy, focus restoration, and keyboard interaction.
- [ ] Add regression tests for the dialog behavior and update its skin styles only as needed.

## Phase 3 — Establish one token/CSS source of truth

- [ ] Trace the resolved `shadcn/tailwind.css` import for Dock, ID, Jizz, and the UI package CSS entry.
- [ ] Decide whether `tokens/index.ts` is a supported cross-app API, a compatibility alias to skin tokens, or obsolete; record and implement one canonical ownership model.
- [ ] Remove only proven unused duplicate `shadcn/tailwind.css` snapshots and the unexported/unreferenced UI global stylesheet, if safe; do not remove the npm stylesheet dependency where an app still consumes it.
- [ ] Build each app affected by CSS import or token changes and compare emitted styles for regressions.

## Phase 4 — Close app coverage and verify the ecosystem

- [ ] Add `apps/gate/` to the app map and relevant UI guidance in `AGENTS.md`/`DESIGN.md`.
- [ ] Re-run the architecture gate and confirm all five React apps still contain zero prohibited raw controls or hand-written primitive classes.
- [ ] Run `pnpm docs:check`, `pnpm lint`, `pnpm typecheck`, and builds for Dock, Gate, Headquarter, ID, and Jizz.
- [ ] Run browser accessibility checks on representative routes: keyboard/focus, Escape, reduced motion, 320px viewport, 200% zoom, and axe.
- [ ] Record only observed test and browser results in the implementation report after all phases complete.

## Dependencies

```text
Phase 0 ──> Phase 4
Phase 1 ──> Phase 2 ──┤
Phase 3 ──────────────┘
```

Phase 0 establishes enforcement and removes current bypasses before later verification. Phase 1 and Phase 3 can then proceed independently. Phase 2 depends on the shared dialog API being stable. Phase 4 depends on all implementation phases.
