---
contract: "DOCUMENTATION_CONTRACT.md"
id: "20261104-1950-ui-design-consistency-report"
version: "1.0.0"
owner: "engineering"
status: "completed"
last_verified: "2026-11-04"
---

# Report: UI Design Consistency Wave

Only commands that were actually run appear here, with the output they produced.

## 1. Final gate run

```
$ pnpm ui:test
  tests 35
  pass 35
  fail 0

$ pnpm docs:check
  - Frontmatter & Metadata:   35 / 35 pts
  - Relative Link Integrity:  25 / 25 pts
  - Change Matrix & Plans:    20 / 20 pts
  - Antislop Conformance:     20 / 20 pts
  TOTAL COMPLIANCE SCORE:     100 / 100 pts (Threshold: 100 pts)
  Documentation Contract Validation PASSED (100% compliant).

$ pnpm lint:arch
  All Architectural Invariants PASSED (100% compliant).
    ✓ Style Purity: token-driven app styles within baseline
    ✓ Inline Style Purity: painted inline styles within baseline
    ✓ State Parity: error, loading and not-found routes present
    ✓ Skin Root: every app renders one valid, unclaimed world
    ✓ Palette Purity: markup colours come from skins, not the Tailwind palette

$ pnpm lint            # eslint . --max-warnings 0
  (no output, exit 0)

$ pnpm typecheck
  All TypeScript projects passed. Strict mode is enabled in 7 of 25.
```

Five application builds, run individually after the migration:

```
dock => OK   id => OK   jizz => OK   gate => OK   headquarter => OK
```

## 2. Token source proof (Phase 1)

The production stylesheet emitted for dock was inspected rather than assumed:

```
$ # apps/dock/.next/static/chunks/<hash>.css
var(--mw-canvas)  = 6
oklch(            = 0
--color-background = 0
```

After the block work, the same method on dock's chunk:

```
.mw-hero = 27   .mw-route = 7   .mw-section-heading = 11   .mw-destination = 23
.mw-status = 27 .mw-state = 31 .mw-kicker = 6   color-mix = 24   clip-path = 5
```

Every block rule reached the bundle, and no colour literal was emitted for them.

## 3. Browser verification (Phases 4 and 5)

Real Chrome against `pnpm dock:dev` (port 3001) and `pnpm id:dev` (port 3003), reading computed styles and the focus chain:

```
dock /no-such-route
  skip link href  #main-content            text "Skip to main content"
  landmark        MAIN / id=main-content / tabindex=-1
  state panel     role=status kind=error "Problem" / "Page not found" / cause / next / "Back to entry"

Tab press 1       document.activeElement = body          (first Tab focuses the page)
Tab press 2       active = A.mw-skip-link  :focus=true  top: 16px  outline: solid
Enter             location.hash = #main-content
                  active = MAIN.mw-route

dock /
  h1 ["A platform with room to explore."]
  headings H2 "Choose a destination", H3 x3
  destinations http://localhost:3002, :3003/account, :3004, all rel="noopener noreferrer"
  card computed  border-radius 5.6px, padding 24px, border color-mix(--mw-border 36%)
  legacy dock-hero/dock-destination/dock-kicker/dock-page/dock-auth-notice nodes: 0
  Tailwind palette utilities in DOM: 0

id /login
  h1 count 1 (MoonWitness ID), h2 count 1 (hero statement)
  hero height 432px, media mix-blend-mode screen at opacity 0.5, scrim present
  inputs: email/password/device each resolved by label[for]
  palette utilities in DOM: 0

id /
  headings H1 "MoonWitness ID" → H2 "Session governance" → H3 x4, no skipped level
  internal links: /login /register /account only   (dead /sessions /devices /security removed)
  destination cards 3, section heading 1, hero present, skip link present
```

The embedded IDE browser could not be used for the focus check: `document.hasFocus()` returned false there, so `:focus` never matched. That is also why the reveal rule uses `:focus` rather than `:focus-visible`.

## 4. Corrections to the plan's own numbers

- Phase 4 assumed 8 remaining Tailwind colour overrides. The planning scan used a non-recursive glob and missed two directory levels; the measured truth was 99 lines in headquarter and 44 in id, all inside page markup, which no existing rule covered. A `PALETTE_PURITY` ratchet rule was added before migrating those apps, and its baseline is now empty.
- `STYLE_PURITY` matched hex with `#\h{3,8}`. In JavaScript `\h` is the letter `h`, so hex literals were never matched and headquarter's real 52 literal lines were reported as 20. With the pattern fixed, the same measurement loop ran to zero per app.
- `INLINE_STYLE_PURITY` missed `borderTop`, `outline`, `fill`, and `stroke` paint keys, so gate's count rose from 78 to the full 78-plus lines it should have caught; all of them are now gone.
- Per-app commits (plan T0.3) were not achievable: while the other process held a red `typecheck` (arsy-orm tenant scope, then headquarter agent page), no commit could pass the pre-commit hook. Once the tree went green, the accumulated five-app migration was committed by the concurrent process as `84e58e6 "Update project"`, which also pushed it to `origin/dev`. Phases 5 and 6 therefore live in that commit rather than in five of their own; the state is verified above, the intended granularity was not achieved.
- Gate's route states were first written in English, which conflicted with the app's `lang="id"` and its translation catalog. They were rewritten in Indonesian, and `StatePanel` gained a `label` prop so an app with its own language policy can translate the kind label.

## 5. Measured contrast (Phase 6)

```
$ pnpm ui:contrast
skin              text/canvas  muted/canvas  muted/surface  accent-text/accent  accent/surface  success/canvas  danger/canvas  focus/canvas
imperium-lumen    16.74 PASS   10.40 PASS     9.50 PASS       9.41 PASS          8.90 PASS       8.94 PASS      8.82 PASS     13.66 PASS
lunar-chronicles  16.16 PASS   10.85 PASS     9.62 PASS      11.01 PASS         10.45 PASS       9.76 PASS      8.73 PASS     11.47 PASS
rocksoul          15.79 PASS   10.15 PASS     9.26 PASS       4.99 PASS          3.18 PASS      10.11 PASS      8.83 PASS     12.33 PASS
nexus-paradox     16.97 PASS   11.41 PASS    10.13 PASS       8.69 PASS          7.85 PASS      10.31 PASS      8.66 PASS     12.17 PASS
riot-anarchy      14.01 PASS    9.18 PASS    10.33 PASS       6.87 PASS          6.27 PASS       6.11 PASS      6.99 PASS      5.46 PASS
mycelium          15.14 PASS   10.58 PASS     9.11 PASS       8.82 PASS          7.82 PASS       9.78 PASS      8.32 PASS     10.64 PASS
```

Text pairs clear 4.5:1 in all six worlds. Non-text pairs clear 3:1. The tightest pair in the set is ROCKSOUL's accent text on accent at 4.99:1, which still clears AA for normal text but is the first place to look if the crimson changes.

## 6. Remaining work

- Tabs and progress remain specification in DNA/07; no shared block exists yet.
- `PALETTE_PURITY` does not see raw hex in `.tsx` data structures. Headquarter's swarm role colours were only found because they were painted inline.
- Four throwaway migration helpers were committed by the concurrent process (`scripts/tmp-skip-targets.mjs`, `scripts/tmp-rename-target.mjs`, `scripts/tmp-gate-shell.mjs`, `scripts/tmp-hq-palette-map.mjs`). They are one-off and should be deleted; the `DeleteFile` tool fails on this workspace root, so they were left in place rather than removed through the shell.
- `packages/lint/src/check-architecture.mjs` still carries an uncommitted hunk from the other process (a `PARAMETERIZED_QUERIES` false-positive fix). It is not part of this wave and was left untouched.
