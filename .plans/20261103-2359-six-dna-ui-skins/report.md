---
title: "Six DNA UI Skins Verification Report"
status: completed
---

# Six DNA UI Skins Verification Report

## Result

The shared skin foundation and the four approved app assignments are implemented. This does not claim that all six complete runtime experiences are visually verified; the Skin Laboratory and full comparison remain deferred.

## Delivered

- Added typed skin IDs, semantic tokens, deterministic fallback, and SSR-rendered `SkinRoot` for all six DNA worlds.
- Added package-owned recipes for shared controls, cards, inputs, badges, avatars, navigation, and session cards.
- Scoped component and skin-specific recipes to `.mw-skin-root`, with a regression test preventing unscoped selectors.
- Moved the responsive navigation Escape handler to the header so it works when focus remains on the menu button, and returns focus after closing.
- Assigned Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and Jizz / Mycelium. `apps/web` remains excluded.

## Verification evidence

- `pnpm exec tsx --test packages/ui/test/skins.test.tsx`: 5 tests passed, including registry, SSR, contrast, invalid-ID fallback, and root-scoping checks.
- `pnpm exec tsc --noEmit -p packages/ui/tsconfig.json`: passed.
- Production builds passed for Dock, Headquarter, ID, and Jizz.
- Production preview responses returned HTTP 200 and the expected skin ID on all four app roots.
- Headless Edge confirmed the mobile menu opens in Dock, Headquarter, and Jizz, and Escape closes it and restores focus to the menu button. No JavaScript exceptions were recorded.
- A computed-style probe confirmed shared button sizing applies inside `SkinRoot` and does not apply outside it.
- The ID account route rendered its Lunar Chronicles root, but its account loading transition left the navbar menu hit area at 0x0. Its menu interaction was not counted as verified without an authenticated account state.
- Browser network probes also recorded unauthenticated auth-check HTTP 401 responses and favicon HTTP 404 responses; no JavaScript exceptions were recorded.
- Documentation checks, architecture lint, and `git diff --check` passed.

## Verification boundaries

- At a 390px emulated device width, the Headquarter home page's existing four-action row causes the document to extend to 465px. A browser probe using the previous compact button text metrics still measured 429px, indicating the app-local non-wrapping action group is also an overflow source. The page composition was not changed because it is outside this skin-foundation scope.
- Dock and Jizz had no horizontal overflow in the mobile browser checks. The Headquarter page-level overflow remains a known limitation.
- Token contrast tests pass, but rendered visual comparisons for all six worlds, full breakpoint/zoom coverage, and the Skin Laboratory remain pending.
