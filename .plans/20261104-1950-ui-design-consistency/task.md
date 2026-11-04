---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1950-ui-design-consistency-task"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
---

# Task Ledger: UI Design Consistency Wave

Legend: `- [ ]` pending · `- [/]` in progress · `- [x]` done (verified)

## Phase 0 — Baseline and collaboration safety

- [x] T0.1 Baseline recorded green: `lint:arch`, `lint`, `typecheck`, `docs:check` 100/100.
- [x] T0.2 Per-file `git status --porcelain -- <path>` guard before each edit.
- [x] T0.3 Pathspec-only commits, no `--no-verify`. Deviation: the five-app migration landed in one commit because per-app commits would each fail their own gate; see report.md §4.

## Phase 1 — One token source

- [x] T1.1 `packages/ui/src/theme.css` canonical `@theme inline`, exported as `@moonwitness/ui/theme.css`, uniform import order in five apps.
- [x] T1.2 Removed `--background`/`--foreground`, local `@theme inline`, and `.dark` blocks from all five `globals.css` (571 deletions).
- [x] T1.3 headquarter `body { font-family: Arial… }` removed; the skin decides.
- [x] T1.4 Deprecated `tokens` colour object deleted from `packages/ui/src/tokens/index.ts`.
- [x] T1.5 `shadcn/tailwind.css` import dropped everywhere; policy is one stylesheet source.

## Phase 2 — Enforcement as ratchet

- [x] T2.1 `STYLE_PURITY` with measured baseline in `packages/lint/style-baseline.json`.
- [x] T2.2 `INLINE_STYLE_PURITY` for painted inline styles.
- [x] T2.3 `STATE_PARITY` requiring the three route files per app.
- [x] T2.4 `SKIN_ROOT` requiring one valid, unclaimed world per app.
- [x] T2.5 `pnpm ui:test` script and CI step; the design-system tests now run.
- [x] T2.6 `gate:build` script, `verify-gate` CI job, added to `promote-to-main` needs.
- [x] T2.7 AGENTS.md, QUALITY.md, DESIGN.md updated, native-first corrected, D-012 added.
- [x] T2.8 (added during execution) `PALETTE_PURITY` for Tailwind palette hues in app markup; planning figure of eight colour overrides was wrong, measured truth was 99 lines in headquarter and 44 in id.

## Phase 3 — Shared composition blocks

- [x] T3.1 `Kicker`, `PageHero`, `SectionHeading`, `RouteShell`, `StatusMessage`, `DestinationCard` + `DestinationGrid`, `StatePanel` in `packages/ui/src/blocks/`, exported through `blocks/index.ts`.
- [x] T3.2 `skins.css` base rules for all blocks plus a `[data-moonframe-skin]` variant for each of the six worlds; only tokens, no literals.
- [x] T3.3 Markup assertions in `packages/ui/test/components.test.tsx`, including role checks for `StatePanel`.

## Phase 4 — Route-state parity

- [x] T4.1 `error.tsx`, `loading.tsx`, `not-found.tsx` created for dock, headquarter, id from `StatePanel`.
- [x] T4.2 jizz and gate state views switched to `StatePanel`; `jizz-empty*` and `jizz-state*` CSS deleted.
- [x] T4.3 `SkipLink` block plus `mw-skip-link` in `skins.css`; `.skip-link` removed from gate; every layout renders it against `#main-content`.
- [x] T4.4 `StatusMessage` replaced `dock-auth-notice`, `hq-shell__notice`, `remote-agent-control__message`, and gate/ai-gateway/tools/swarm error banners.
- [x] T4.5 Remaining Tailwind colour overrides removed (see report.md §4 for the corrected count).
- [x] T4.6 `STATE_PARITY` baseline deleted, rule now absolute.

## Phase 5 — App migration

- [x] T5.1 id: auth pages, account centre, home rebuilt on the blocks; 239-line stylesheet reduced to layout only.
- [x] T5.2 dock: hero, kicker, section heading, destination grid, route shell replaced by blocks; 315-line stylesheet reduced to 15 lines.
- [x] T5.3 jizz: three duplicate world pages converted; 329-line stylesheet reduced to 21 lines.
- [x] T5.4 gate: 11 route mains, nine components, and 292-line stylesheet converted; 78 painted inline styles eliminated.
- [x] T5.5 headquarter: overview converted, five dashboards moved from palette hues to token utilities, 646-line stylesheet reduced to shell and device-panel rules.
- [x] T5.6 Ratchet baselines emptied: all four style and state rules are absolute.

## Phase 6 — World decisions and proof

- [x] T6.1 One skin per app fixed: dock imperium-lumen, id lunar-chronicles, headquarter nexus-paradox, jizz mycelium, gate rocksoul; `SKIN_ROOT_DUPLICATES` emptied.
- [x] T6.2 DNA/07 gained an implementation-status table naming the real block per row and marking tabs and progress as specification only.
- [x] T6.3 `SkinLaboratory` renders the shared blocks across all six worlds, covering the nine showcase items; 85 lines of private showcase CSS deleted.
- [x] T6.4 `pnpm ui:contrast` measures every skin pair; results in report.md §5.

## Phase 7 — Contract closure

- [x] T7.1 AGENTS.md, QUALITY.md, DESIGN.md, DECISIONS.md (D-015), CHANGELOG.md updated.
- [x] T7.2 This plan folder with spec, task, design, rules, and report.
- [x] T7.3 Final gate run recorded in report.md §6.
