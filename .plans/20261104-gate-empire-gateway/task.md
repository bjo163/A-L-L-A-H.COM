# GATE Implementation Task List

## Phase 1: Foundation (Scaffold & Config) ✅

- [x] Create `apps/gate/package.json` with correct scripts, deps, workspace config
- [x] Create `apps/gate/tsconfig.json` extending base with path aliases
- [x] Create `apps/gate/next.config.ts` with cacheComponents, partialPrefetching, turbopack
- [x] Create `apps/gate/eslint.config.mjs` extending root
- [x] Create `apps/gate/components.json` (shadcn config)
- [x] Create `apps/gate/public/artwork/imperium-lumen.png` (copy from dock)
- [x] Create `apps/gate/public/brand/emblem.svg` (abstract gate arch + crescent)
- [x] Create `apps/gate/src/app/layout.tsx` (SkinRoot, fonts, metadata, providers)
- [x] Create `apps/gate/src/app/globals.css` (Tailwind v4 + skins.css + custom)
- [x] Create `apps/gate/src/app/loading.tsx`, `error.tsx`, `not-found.tsx`
- [x] Create `apps/gate/src/lib/utils.ts` (cn helper)
- [x] Create `apps/gate/src/lib/auth.ts` (mwClient auth helpers)
- [x] Create `apps/gate/src/lib/content-manifest.ts` (typed manifest loader)
- [x] Create `apps/gate/src/content/manifest.json` (seed from content map)
- [x] Create `apps/gate/src/lib/catalog/id.json` (Indonesian catalog)
- [x] Create `apps/gate/src/lib/catalog/en.json` (English catalog)
- [x] Create `apps/gate/src/lib/translation-catalog.ts` (i18n helper)
- [x] Verify `pnpm --filter @moonwitness/gate typecheck` passes

## Phase 2: Core Components & Navbar ✅

- [x] Extend `packages/ui/src/blocks/endpoints.ts` — add `gate: 3000` to DEV_PORTS and EcosystemAppEndpoints
- [x] Extend `packages/ui/src/blocks/navbar.tsx` — add `'gate'` to currentApp union, add Gate link in nav
- [x] Create `apps/gate/src/components/gate-navbar.tsx` (EcosystemNavbar wrapper with currentApp="gate")
- [x] Create `apps/gate/src/components/ui/transmission-card.tsx` (provenance block, provenance prop required)
- [x] Create `apps/gate/src/components/ui/destination-card.tsx` (unequal visual weight support)
- [x] Create `apps/gate/src/components/ui/story-world-card.tsx` (distinct compositions per world)
- [x] Create `apps/gate/src/components/ui/info-page-shell.tsx` (shared layout for info pages)
- [x] Verify lint:arch passes

## Phase 3: Movement 01 — Hero Arrival (Home) ✅

- [x] Create `apps/gate/src/components/hero-arrival.tsx`
  - Architectural threshold composition
  - Headline: "WHEN THE MOON RISES, WE SHARE MESSAGES." (from catalog)
  - Primary CTA: "Enter the Universe" → /universe
  - Secondary CTA: "Learn the Vision" → /about
  - Skip link accessible
  - MotionFrame effect="enter"
  - Hero image: imperium-lumen.png (priority)
- [x] Create `apps/gate/src/app/page.tsx` (Home = Hero + Closing)
  - Import HeroArrival
  - Import ClosingHorizon (Movement 08)
  - GateNavbar at top
  - Proper metadata

## Phase 4: Movement 08 — Closing Horizon (Home Footer) ✅

- [x] Create `apps/gate/src/components/closing-horizon.tsx`
  - Quiet architectural horizon echoing opening
  - Footer quote: "A brighter humanity is a story we build together."
  - Direct navigation links to all public destinations
  - Legal/privacy/contact links
  - Language switcher

## Phase 5: Movement 02 — Universe Map ✅

- [x] Create `apps/gate/src/app/universe/page.tsx`
- [x] Create `apps/gate/src/components/universe-map.tsx`
  - 5 destinations with unequal visual weight
  - Gate (current, prominent), MoonWitness, Dock, Cockpit (unavailable), Headquarter (restricted), Observatory
  - Semantic list fallback (accessible alternative)
  - Status badges: Available / Unavailable / Restricted
  - RawContainer, RawStack, RawGrid from @moonwitness/ui

## Phase 6: Movement 03 — Explore Index ✅

- [x] Create `apps/gate/src/app/explore/page.tsx`
- [x] Create `apps/gate/src/components/explore-index.tsx`
  - Featured world (Manusia Pulpen) dominant
  - Three supporting worlds distinct compositions
  - Transmissions entry link
  - Knowledge categories (3 tiles, Planned labels)
  - Creative collections (3 tiles, Planned labels)

## Phase 7: Movement 04 — Transmissions Feed ✅

- [x] Create `apps/gate/src/app/transmissions/page.tsx`
- [x] Create `apps/gate/src/components/transmissions-feed.tsx`
  - Featured transmission (large, provenance block, excerpt)
  - Recent transmissions list (empty state honest)
  - Provenance display component (sourceType, reference, edition, translator, author, date, rendering, status)
  - TransmissionCard component reuse

## Phase 8: Movement 05 — Discover Filters ✅

- [x] Create `apps/gate/src/app/discover/page.tsx`
- [x] Create `apps/gate/src/components/discover-filters.tsx`
  - Theme filter (from worlds.category)
  - Format filter (static)
  - Time filter (from transmissions.date)
  - Source/Evidence filter (from provenance.sourceType)
  - Fallback: "No items match. Browse the full index at Explore."

## Phase 9: Movement 06 — Community Portal ✅

- [x] Create `apps/gate/src/app/community/page.tsx`
- [x] Create `apps/gate/src/components/community-portal.tsx`
  - Purpose, participation, guidelines, safety sections
  - Real Dock entry button (Link to dock endpoint + accountPath)
  - No invented member counts/testimonials

## Phase 10: Movement 07 — Journey Next Steps ✅

- [x] Create `apps/gate/src/app/journey/page.tsx`
- [x] Create `apps/gate/src/components/journey-next.tsx`
  - Anonymous state: Continue exploring, Learn participation, Sign in
  - Signed-in state: Verified shortcuts only (Cockpit if implemented, Saved, Account)
  - Session check via mwClient.auth.getCurrentUser()

## Phase 11: Information Pages ✅

- [x] Create `apps/gate/src/app/about/page.tsx` (info-page-shell)
- [x] Create `apps/gate/src/app/sources/page.tsx` (info-page-shell)
- [x] Create `apps/gate/src/app/privacy/page.tsx` (info-page-shell)
- [x] All with noindex metadata

## Phase 12: Polish & QA ✅

- [x] Responsive testing: desktop (≥1024), tablet (768-1023), mobile (≤767)
- [x] Keyboard navigation: all interactive elements reachable, logical Tab order
- [x] Focus visible: 2px solid var(--mw-focus), offset 3px
- [x] Reduced motion: @media (prefers-reduced-motion) disables animations
- [x] Contrast check: text ≥4.5:1, UI ≥3:1
- [x] Touch targets: ≥44×44 CSS px
- [x] Loading states: Suspense boundaries, skeletons
- [x] Empty states: All movements have honest empty messages
- [x] Error states: error.tsx boundaries work
- [x] Restricted states: Headquarter labeled restricted, Cockpit unavailable
- [x] Offline: Service worker or static fallback
- [x] No console errors in dev/build
- [x] No broken links

## Phase 13: Quality Gates ✅

- [x] `pnpm --filter @moonwitness/gate typecheck` → 0 errors
- [x] `pnpm lint:arch` → 100% pass
- [x] `pnpm docs:check` → 100/100
- [x] `pnpm --filter @moonwitness/gate build` → pass

## Phase 14: Documentation & Final ✅

- [x] Create `docs/audits/GATE-LEGACY-RECONCILIATION.md`
- [x] Create `docs/product/GATE-PRODUCT-SPEC.md`
- [x] Create `docs/design/GATE-DESIGN-SYSTEM.md`
- [x] Create `docs/architecture/GATE-ARCHITECTURE.md`
- [x] Create `docs/content/GATE-CONTENT-MAP.md`
- [x] Create `.plans/20261104-gate-empire-gateway/{spec.md,task.md,design.md,rules.md}`
- [x] Review git diff — only intentional changes
