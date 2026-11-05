# Delivery Report

## Result

Six distinct, resolution-independent world illustrations are available through the shared UI artwork component and synchronized public previews. The ID login form appears before its hero at mobile widths, and Harbor's hero now matches its ROCKSOUL app skin and metadata.

## Verification

- `pnpm ui:test` — passed, 44 tests.
- `pnpm ui:contrast` — passed, all checked token pairs across six skins.
- `pnpm lint:arch` — passed, 3,047 files scanned.
- `pnpm typecheck` — passed, all TypeScript projects.
- `pnpm id:build` — passed; login, registration, onboarding, account, and root routes built. Next emitted a non-blocking `metadataBase` warning.
- Browser at 320×900 — document client width and scroll width both 305 CSS px; sign-in button spans y=588–632 and is visible.
- Browser at 390×900 — document client width and scroll width both 375 CSS px; sign-in button spans y=564–608 and is visible.
- Browser interactions — mobile navigation opens and closes with Escape; visual-effects and sound toggles change state; an empty sign-in form focuses the required email field; the registration link points to `/register`, whose page rendered successfully.
- Reduced-motion emulation — artwork animation computed to `none` with `0s` duration.

## Environment Notes

The ID hub at port 5150 was unavailable for this browser check, so the onboarding-status request failed and the UI correctly displayed its setup-unavailable state. The browser test server used port 3113, which also caused the hub's cross-origin request to be rejected. Authenticated sign-in was not submitted. No browser page exceptions were observed.

`pnpm --filter @moonwitness/harbor build` compiled but stopped at TypeScript because the unrelated in-progress [ToolResultViewer.tsx](../../packages/ui/src/components/ToolResultViewer.tsx) references `Button` without importing it. That untracked shared-worktree change was left untouched.
