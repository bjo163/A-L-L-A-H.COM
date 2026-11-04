# GATE — Legacy Reconciliation Audit Report

**Project:** A-L-L-A-H.COM GATE / Empire Gateway  
**Active Repository:** bjo163/A-L-L-A-H.COM (branch `dev`, HEAD `f075526`)  
**Historical Repositories (read-only):**
- bjo163/moonwitnessxv (MoonWitness XV)
- bjo163/moonwitness-reborn (MoonWitness Reborn)  
**Audit Date:** 2026-11-04  
**Auditor:** Autonomous Principal Architect (this session)

---

## 1. Source Inventory

### 1.1 Active Repository (A-L-L-A-H.COM)

| Source | Path | Status | Notes |
|---|---|---|---|
| Workspace config | `pnpm-workspace.yaml`, `package.json`, `tsconfig.base.json` | Verified | pnpm 12.16.1, Node 24, TypeScript 5.8 |
| Monorepo apps | `apps/arsy`, `apps/dock`, `apps/headquarter`, `apps/id`, `apps/jizz`, `apps/sentinel`, `apps/server` (retired) | Verified | Next.js 16, React 19, Tailwind v4 |
| Shared packages | `packages/ui` (@moonwitness/ui), `packages/sdk` (@allah/sdk), `packages/types` (@moonwitness/types), `packages/lint`, `packages/arsy-orm` + plugins | Verified | Strict arch lint, UI purity enforced |
| DNA specifications | `DNA/00-ENGINE-CONTRACT.md` through `DNA/08-QUALITY-GATES.md` | Verified | Six Master DNA: IMPERIUM LUMEN, LUNAR CHRONICLES, ROCKSOUL, NEXUS PARADOX, RIOT ANARCHY, MYCELIUM |
| Governance docs | `AGENTS.md`, `AUTONOMOUS.md`, `GOAL.md`, `BLUEPRINT.md`, `DESIGN.md`, `DECISIONS.md`, `BACKLOG.md`, `QUALITY.md`, `LEGACY_RECONCILIATION.md`, `DOCUMENTATION_CONTRACT.md` | Verified | All with frontmatter, cross-linked |
| CI / Quality gates | `.github/workflows`, `pnpm typecheck`, `pnpm lint:arch`, `pnpm docs:check`, `pnpm dock:build` etc. | Verified | 100% pass baseline |

**Uncommitted user changes (preserved):**
- `.plans/20261104-131923-evolve-platform-foundations/task.md`
- `BACKLOG.md`, `apps/dock/package.json`, `apps/id/package.json`, `apps/jizz/package.json`, `packages/ui/package.json`, `pnpm-lock.yaml`
- New files: `packages/ui/src/globals.css`, `postcss.config.cjs`, `shadcn/`, `tailwind.config.js`

### 1.2 MoonWitness XV (bjo163/moonwitnessxv)

| Category | Key Sources | Status |
|---|---|---|
| Master Design | `MASTER_DESIGN.md` (MoonUI v1, verified M19-32, M30-01..03) | Verified |
| Visual Bible | `apps/empire-web/docs/story-universe/VISUAL_BIBLE.md` | Verified (draft spec) |
| Content Manifest | `apps/empire-web/docs/story-universe/contracts/content_manifest.json` | Verified (draft) |
| Design Tokens | `apps/empire-web/docs/story-universe/contracts/design_tokens.json` | Verified (screenshot-inspired) |
| Story Universe | `docs/vision/MASTER_VISION_NARRATIVE_XV.md` (99 chapters + §21A) | Verified |
| Empire Web Pilot | `apps/empire-web` (static pilot, port 3010) | Verified (Vercel withdrawn) |
| MoonUI Components | `packages/moonui` (certified design system) | Verified |
| Decisions (ADRs) | `docs/decisions/` (ADR-0004, 0006, 0007, 0008, 0009, 0010, 0012, 0014, 0016, 0017, 0018, 0020) | Verified |
| Narrative Canon | MYLUFT (origin), ROCKSOUL (silent storyteller), AngelWithShotgun (guardian), GGS Full Moon School (learning), Empire of the Light (universe) | Verified |
| Assets | 5 PNG mockups (1122×1402), 5 approved WebP illustrations | Reference-only; PNGs not production assets |
| Wiki | https://github.com/bjo163/moonwitnessxv/wiki | **Inaccessible** — no public wiki or requires auth |

### 1.3 MoonWitness Reborn (bjo163/moonwitness-reborn)

| Category | Key Sources | Status |
|---|---|---|
| Master Design Constitution | `design/MASTER-DESIGN-CONSTITUTION.md` | Verified |
| Home Blueprint | `design/HOME-BLUEPRINT.md` (8 narrative movements) | Verified |
| Headquarter Spatial Blueprint | `design/HEADQUARTER-SPATIAL-BLUEPRINT.md` | Verified |
| Design DNA | `design/DESIGN-DNA.md` | Verified |
| Design Tokens | `design/DESIGN-TOKENS.md` (maps to existing `packages/ui/styles/tokens.css`) | Verified |
| User Journey | `design/USER-JOURNEY.md` | Verified |
| Vision | `design/VISION.md` | Verified |
| Owner Decisions | `design/OWNER-DECISIONS.md` (ODR-001..007) | Verified |
| Implementation Reconciliation Audit | `design/IMPLEMENTATION-RECONCILIATION-AUDIT.md` (P0/P1/P2 findings) | Verified |
| Responsive & Accessibility QA | `design/RESPONSIVE-ACCESSIBILITY-QA.md` | Verified |
| Information Architecture | `design/INFORMATION-ARCHITECTURE.md` | Verified |
| Interaction, Motion & Sound | `design/INTERACTION-MOTION-SOUND.md` | Verified |
| Apps/web implementation | `apps/web` (Next.js, port 3001, @moonwitness/moonclient, @moonwitness/ui) | Verified |
| Wiki | https://github.com/bjo163/moonwitness-reborn/wiki | **Inaccessible** — no public wiki or requires auth |

---

## 2. Verified Facts (Cross-Repository Consensus)

| Fact | XV Evidence | Reborn Evidence | Active Repo Evidence |
|---|---|---|---|
| **Product name:** A-L-L-A-H.COM (with hyphens) | `content_manifest.json`, `VISUAL_BIBLE.md` | `VISION.md`, `MASTER-DESIGN-CONSTITUTION.md` | `AGENTS.md`, `GOAL.md`, `DESIGN.md` |
| **Brand descriptor:** Empire of the Light | `content_manifest.json` | `VISION.md` §3 | `DESIGN.md` (IMPERIUM LUMEN) |
| **Acronym meaning:** Accountable Life, Learning & Action Hub | `MASTER_VISION_NARRATIVE_XV.md` §00.3 | `VISION.md` | `DECISIONS.md` D-001 |
| **Public entrance role:** GATE / The Gate | `HOME-BLUEPRINT.md` (Primary role) | `VISION.md` §3 (Home = The Gate) | Not yet implemented |
| **Narrative universe:** MOONWITNESS XV | `MASTER_VISION_NARRATIVE_XV.md` | `VISION.md` §3 | `DESIGN.md` (LUNAR CHRONICLES DNA) |
| **Shared UI system:** MoonUI / @moonwitness/ui | `MASTER_DESIGN.md` (MoonUI certified) | `DESIGN-TOKENS.md` (existing tokens authoritative) | `packages/ui` + `DNA/` (Six DNA) |
| **Design direction:** Cosmic Ivory & Antique Gold | `design_tokens.json`, `VISUAL_BIBLE.md` | `DESIGN-TOKENS.md`, `DESIGN-DNA.md` | `DNA/01-IMPERIUM-LUMEN.md` |
| **Typography:** Cormorant Garamond (display), Inter (body), Cascadia Code (mono) | `VISUAL_BIBLE.md` §1.3, `design_tokens.json` | `DESIGN-DNA.md` §3, `DESIGN-TOKENS.md` §6 | `DNA/01-IMPERIUM-LUMEN.md` (Georgia/serif display, Arial body) |
| **Sacred content rules:** No depiction of ALLAH/prophets; provenance mandatory | `VISUAL_BIBLE.md` §0 rules 7-9 | `MASTER-DESIGN-CONSTITUTION.md` §3, §8 | `DESIGN.md` (never depict ALLAH) |
| **Eight narrative movements for Home** | Not explicit (empire-web has 4 sections) | `HOME-BLUEPRINT.md` §3 (01-08) | Not implemented |
| **DOCK as community harbor** | `APPS.md`, `MASTER_DESIGN.md` (public discovery) | `VISION.md` §3, `INFORMATION-ARCHITECTURE.md` | `apps/dock` (port 3001, IMPERIUM LUMEN) |
| **HEADQUARTER as spatial command** | `MASTER_DESIGN.md` (ORBIT, COCKPIT) | `HEADQUARTER-SPATIAL-BLUEPRINT.md` | `apps/headquarter` (NEXUS PARADOX) |
| **COCKPIT as personal workspace** | `MASTER_DESIGN.md` (Cockpit) | `VISION.md` §3 | Not yet implemented as app |
| **MoonWitness ID as SSO** | `MASTER_DESIGN.md` (D00/ARSY) | `INFORMATION-ARCHITECTURE.md` | `apps/id` (port 3003, LUNAR CHRONICLES) |
| **WORLD OBSERVATORY** | Not in XV | Not in Reborn | `apps/jizz` (port 3004, MYCELIUM) |

---

## 3. Reusable Implementation

### 3.1 From Active Repository (Direct Dependencies)

| Component / Pattern | Location | Reusable for GATE |
|---|---|---|
| `EcosystemNavbar` | `packages/ui/src/blocks/navbar.tsx` | Yes — extend with `gate` endpoint |
| `SkinRoot` (skin="imperium-lumen") | `packages/ui/src/skins/root.tsx` | Yes — GATE uses IMPERIUM LUMEN |
| `MotionFrame` | `packages/ui/src/primitives/visual-effects.tsx` | Yes — entrance animations |
| `Link`, `Button`, `Badge`, `Card` | `packages/ui/src/components/` | Yes — all UI controls |
| `resolveEcosystemEndpoints` | `packages/ui/src/blocks/endpoints.ts` | Yes — add `gate: 3000` |
| `@allah/sdk` auth (`mwClient.auth.getCurrentUser()`, `signOut()`) | `apps/dock/src/app/page.tsx`, `apps/id/src/lib/api.ts` | Yes — session check, sign-out |
| `next/font/google` (Geist) | `apps/dock/src/app/layout.tsx` | Yes — consistent font loading |
| `Metadata` export pattern | All app layouts | Yes — SEO/OG |
| `SkinRoot` CSS variables (`--mw-*`) | `packages/ui/src/skins.css` | Yes — design tokens |
| Reduced motion pattern | `apps/dock/src/app/globals.css` | Yes — `@media (prefers-reduced-motion)` |

### 3.2 From MoonWitness XV (Adaptable Patterns)

| Pattern | Source | Adaptation for GATE |
|---|---|---|
| Four-space entry cards (READ/EXPLORE/CREATE/SIGNAL) | `MASTER_DESIGN.md` Dock semantics, `packages/moonui/src/surfaces/dock.tsx` | Replace with GATE's 5+ ecosystem destinations |
| `SpaceGrid` / `SpaceCard` with status words (REAL/PLANNED/DEMO) | `MASTER_DESIGN.md`, MoonUI surfaces | Use for destination cards with honest status |
| Story universe navigation (HOME/STORIES/CHARACTERS/KNOWLEDGE/TIMELINE/ECOSYSTEM/ABOUT) | `content_manifest.json` navigation | Map to GATE's IA: Universe/Transmissions/Explore/Community/Journey |
| Visual Bible composition grammar | `VISUAL_BIBLE.md` §1.4-1.6 | Hero: architectural threshold; sections: distinct compositions |
| Content manifest structure (worlds, pages, routes, metadata) | `content_manifest.json` | Adopt for GATE content map |
| Sacred content provenance rules | `VISUAL_BIBLE.md` §0 rules 7-9 | Enforce in GATE transmission display |

### 3.3 From MoonWitness Reborn (Design Principles)

| Principle | Source | Application to GATE |
|---|---|---|
| Eight narrative movements with distinct compositions | `HOME-BLUEPRINT.md` §3 | **Core GATE structure** — each movement unique |
| Meaning before spectacle (Experience Law 1) | `MASTER-DESIGN-CONSTITUTION.md` §3 | Every visual decision must clarify/orient |
| Truth before immersion (Experience Law 2) | `MASTER-DESIGN-CONSTITUTION.md` §3 | No fake metrics, live badges, invented counts |
| Reverence without appropriation (Law 3) | `MASTER-DESIGN-CONSTITUTION.md` §3 | Sacred refs as editorial content, not decoration |
| Distinct compositions, no repeated card grids | `DESIGN-DNA.md` §8, `HOME-BLUEPRINT.md` §11 | Each movement unique layout |
| Cosmic Ivory & Antique Gold palette | `DESIGN-DNA.md` §3, `DESIGN-TOKENS.md` §3 | GATE visual identity |
| Spatial but usable (Law 5) | `MASTER-DESIGN-CONSTITUTION.md` §3 | Keyboard/touch alternatives for spatial nav |
| Progressive disclosure (Vision §5.7) | `VISION.md` §5 | Reveal depth on demand |
| Owner decisions ODR-001..007 | `OWNER-DECISIONS.md` | Document any GATE exceptions similarly |

---

## 4. Reusable Narrative & Content

### 4.1 Verified Story Universe (XV Canon)

| Story World | Category | Status | Key Details |
|---|---|---|---|
| **MANUSIA PULPEN** | Origin | Draft (mockup completed) | Origin ROCKSOUL; human writing/building; 28-29 Oct 2026 canon |
| **ANGELWITHSHOTGUN** | Guardian | Ongoing (draft) | Guardian alter-ego of ROCKSOUL; back view only; "The Bombs Are Getting Closer Every Day" |
| **GGS FULL MOON SCHOOL** | Learning | Ongoing (draft) | Fictional lunar academy in MYLUFT narrative; lantern-lit gothic |
| **EMPIRE OF THE LIGHT** | Universe | In Development (proposed) | Larger vision; orbital metropolis, golden roundtable |

**Characters:** ROCKSOUL (silent storyteller, hoodie/cape, back view), MYLUFT (origin human, not divine), AngelWithShotgun (guardian, no face).

**Prohibited:** Depicting prophets, angels, ALLAH; using scripture as decoration; fake divine endorsement.

### 4.2 Reborn Vision Content

| Content | Source | Use in GATE |
|---|---|---|
| Product promise: "A world to enter. Stories to receive. Knowledge to examine. Good work to contribute." | `VISION.md` §2 | GATE headline territory |
| North star: Public front door to Empire of the Light | `VISION.md` §1 | GATE mission statement |
| Primary audiences & first useful outcomes | `VISION.md` §4 | GATE user journey design |
| Success definition (visitor explains purpose, distinguishes destinations) | `VISION.md` §7 | GATE acceptance criteria |
| Narrative tone: warm, deliberate, humble, cinematic; Indonesian-first | `VISION.md` §8 | GATE copy strategy |
| Content integrity types (scripture, hadith, scientific, hypothesis, personal, fictional) | `VISION.md` §9 | GATE transmission display rules |

---

## 5. Reusable Design Principles

| Principle | Origin | GATE Application |
|---|---|---|
| **One functional engine, six visual worlds** | `DNA/00-ENGINE-CONTRACT.md` §2, `DECISIONS.md` D-006/D-007 | GATE uses IMPERIUM LUMEN skin via shared @moonwitness/ui |
| **Skin is complete design language, not theme** | `DNA/00-ENGINE-CONTRACT.md` §1 | IMPERIUM LUMEN tokens drive all GATE visual decisions |
| **Monumental axial composition, thresholds, portals** | `DNA/01-IMPERIUM-LUMEN.md` | Hero = architectural gate; sections = named spaces |
| **Light as spatial material, not decorative glow** | `DNA/01-IMPERIUM-LUMEN.md` | Directional light revealing structure |
| **Navigation as gates/spaces, not tabs/cards** | `DNA/01-IMPERIUM-LUMEN.md` | Ecosystem destinations as architectural bays |
| **Component recipes per DNA (not recolored cards)** | `DNA/07-COMPONENT-MAPPING.md` | Button=seal, Card=bay, Nav=gates, Dialog=threshold |
| **Hard exclusions: no divine depiction, no fake metrics, no HUD labels** | `DNA/00-ENGINE-CONTRACT.md` §8, `DESIGN-DNA.md` §11 | Enforced in GATE |
| **WCAG AA, keyboard, reduced motion, responsive** | `QUALITY.md`, `RESPONSIVE-ACCESSIBILITY-QA.md` | Non-negotiable for GATE |
| **Eight movements = eight distinct compositions** | `HOME-BLUEPRINT.md` §3, §11 | GATE IA maps 1:1 to these movements |
| **Owner decisions recorded, not silent overrides** | `OWNER-DECISIONS.md` | Any GATE exception documented in audit |

---

## 6. Conflicting Decisions & Resolution

| Conflict | XV Position | Reborn Position | Active Repo | Resolution for GATE |
|---|---|---|---|---|
| **Home exists as code?** | Empire-web pilot (static, 4 sections) | `dev` branch has 8-movement Home implementation | No `apps/gate` | GATE is NEW app; reconcile 8 movements with IMPERIUM LUMEN skin |
| **Palette: acid green vs gold** | Legacy token names `acid` (green) | Current tokens render gold (Cosmic Ivory & Antique Gold) | `DNA/01-IMPERIUM-LUMEN.md` = gold accent | **Gold** — token names are legacy; rendered values authoritative |
| **Dock vs Gate identity** | Dock = public discovery (moonpunk zine) | Home = The Gate (public front door); Dock = community | `apps/dock` exists (IMPERIUM LUMEN) | **Gate ≠ Dock**: Gate = narrative entrance; Dock = community harbor |
| **Narrative movements** | 4 sections (hero, library, reader, codex) | 8 movements (Arrival, Universe, Explore, Transmissions, Discover, Community, Journey, Closing) | Dock has hero + 3 destinations | **Adopt 8 movements** — more expressive, matches Reborn blueprint |
| **Headquarter public visibility** | ORBIT accepted, not public | Headquarter restricted (role-gated) | `apps/headquarter` exists (NEXUS PARADOX) | **Restricted tile in Gate** (ODR-007) — labeled restricted, redirects to sign-in |
| **Search on Home** | Header search icon (must function or hide) | Search only if real backend | Not in active repo | **Hide search** until real endpoint exists (VISUAL_BIBLE §1.6) |
| **Footer social links** | Illustrative only | Only if official URLs approved | Not in active repo | **Omit** until approved |
| **EST. year** | 2025 in mockups (wrong) | Normalize to 2026 or remove | Not in active repo | **Remove EST.** — no fabricated history |

---

## 7. Decisions That Must Be Preserved

| Decision | Source | Binding on GATE |
|---|---|---|
| D-001: A-L-L-A-H.COM unified home | `DECISIONS.md` | Yes — GATE is the public entrance |
| D-002: Preserve generations without erasure | `DECISIONS.md` | Yes — audit documents this |
| D-003: Unify without forcing one app | `DECISIONS.md` | Yes — GATE distinct from Dock/Headquarter |
| D-006: Six Master DNA approved | `DECISIONS.md` | Yes — GATE uses IMPERIUM LUMEN |
| D-007: One shared runtime skin engine | `DECISIONS.md` | Yes — SkinRoot with imperium-lumen |
| D-008: Personal tenants (negative IDs) | `DECISIONS.md` | Yes — auth integration via @allah/sdk |
| D-009: Retire Rust/Loco server | `DECISIONS.md` | Yes — only Fastify/ARSy backend |
| D-010: Docker-gated production release | `DECISIONS.md` | Yes — local dev only, no deployment |
| MASTER_DESIGN.md: MoonUI sole certified design system | XV | Yes — @moonwitness/ui only |
| MASTER-DESIGN-CONSTITUTION.md: Experience laws 1-10 | Reborn | Yes — all 10 laws apply to GATE |
| HOME-BLUEPRINT.md: 8 movements, distinct compositions | Reborn | Yes — GATE IA structure |
| DESIGN-DNA.md: Antislop purpose test for every technique | Reborn | Yes — antislop DURING mode |
| OWNER-DECISIONS.md: Exceptions recorded explicitly | Reborn | Yes — any GATE exception documented |

---

## 8. Obsolete Architecture (Do Not Replicate)

| Obsolete Pattern | Source | Why Rejected |
|---|---|---|
| MoonWitness XV `packages/moonui` (separate package) | XV | Superseded by `packages/ui` in active repo |
| Empire-web as isolated Vercel project | XV (withdrawn 2026-10-31) | Active repo uses Coolify + monorepo |
| Acid green as primary accent | XV legacy token names | Current tokens = gold; names are compatibility only |
| 13-item header rail (mockup) | XV `MASTER_DESIGN.md` (forbidden) | Reborn `HOME-BLUEPRINT.md` = concise nav |
| Repeated card grids for all Home sections | XV empire-web library | Reborn audit P1 — distinct compositions required |
| Fake LIVE/NOMINAL badges | XV `MASTER_DESIGN.md` (forbidden) | Reborn Constitution Law 2 — truth before immersion |
| Hard-coded English nav labels | Reborn audit P1 | All labels from i18n catalogs (Indonesian-first) |
| Search button without real endpoint | Reborn audit (VISUAL_BIBLE §1.6) | Hide until implemented |
| Footer policy links as plain text | Reborn audit P1 | Only real navigable links |
| Sacred excerpt with generic "Verified Canonical Revelation" badge | Reborn audit P0 | Exact source, edition, verse range required |

---

## 9. Missing Information (Explicitly Unavailable)

| Missing Item | Impact on GATE | Mitigation |
|---|---|---|
| **GitHub Wiki content** (both XV and Reborn) | May contain additional ADRs, design rationale, owner decisions | Proceed with verified repo sources only; document gap |
| **Production artwork assets** (approved WebP/SVG for stories) | GATE hero/section imagery needs original assets | Use existing `apps/dock/public/artwork/imperium-lumen.png` as base; specify missing assets |
| **Exact verse/translation edition** for Al-Fatihah transmission | Reborn audit P0 blocks sacred content display | Omit specific sacred excerpt until provenance verified |
| **Cockpit app implementation** | Referenced in vision but not in active repo | GATE links to `/cockpit` as future; mark unavailable |
| **Community/Dock actual feature set** | Reborn audit P1 — capabilities unverified | GATE describes participation honestly; no invented features |
| **ARSy SDK full surface** (beyond auth) | `repo-arch` teammate auditing | Use known `mwClient.auth` methods; defer other calls |
| **Next.js 16 breaking changes guide** | `repo-arch` teammate auditing | Read `node_modules/next/dist/docs/` before coding |

---

## 10. Final Reconciliation Decisions for GATE

### 10.1 Product Definition
- **GATE** = New Next.js 16 app at `apps/gate`, port 3000
- **Role:** Public entrance (The Gate) — narrative introduction, ecosystem orientation, destination wayfinding
- **Skin:** IMPERIUM LUMEN via `SkinRoot skin="imperium-lumen"`
- **Distinct from:** Dock (community), Headquarter (ops), ID (auth), Jizz (observatory)

### 10.2 Information Architecture (8 Movements → Routes)

| Movement | GATE Route | Purpose | Composition |
|---|---|---|---|
| 01 Arrival / The Gate | `/` (home) | Identity, atmosphere, primary action | Architectural threshold, single focal point |
| 02 The Universe | `/universe` | Ecosystem mental model | Spatial relationship map (unequal scale) |
| 03 Explore | `/explore` | Guided entry to content | Editorial index / layered discovery |
| 04 Transmissions | `/transmissions` | MoonWitness voice | Editorially dominant piece + supporting |
| 05 Discover | `/discover` | Taxonomy navigation | Topic/theme/timeline filters (real metadata only) |
| 06 Community | `/community` | Participation orientation | Expectations + real Dock entry |
| 07 Your Journey | `/journey` | Personal next step | Anonymous: explore; Signed-in: verified shortcuts |
| 08 Closing / The Return | `/` (footer section) | Calm orientation, next actions | Architectural horizon, destination links |

**Additional routes:** `/about`, `/sources`, `/privacy` (information pages, noindex)

### 10.3 Design System Integration
- Extend `packages/ui/src/blocks/endpoints.ts`: add `gate: 3000` to `DEV_PORTS` and `EcosystemAppEndpoints`
- Extend `EcosystemNavbar` `currentApp` union: add `'gate'`
- Use `@moonwitness/ui` exports exclusively (UI_PURITY lint)
- No raw `<a>`, `<button>`, `<input>` — use `Link`, `Button`, `Input`, `Form`
- All API via `@allah/sdk` (UNIVERSAL_SDK_CLIENT lint)
- Shared types from `@moonwitness/types` (SHARED_DATA_CONTRACTS lint)

### 10.4 Content Architecture
- Content manifest JSON (adapt XV `content_manifest.json` schema) for navigation, worlds, pages
- i18n catalogs (Indonesian-first, English) for all visible text
- Sacred content: exact source, edition, verse range, rendering status; no generic badges
- Honest status words: REAL / PLANNED / UNAVAILABLE — no LIVE, no fake counts

### 10.5 Technical Conventions
- Next.js 16 App Router, React 19, Tailwind v4, TypeScript strict
- `cacheComponents: true`, `partialPrefetching: true` in `next.config.ts`
- `@moonwitness/ui/skins.css` import in globals.css
- `Geist` font via `next/font/google`
- `MotionFrame` for entrance animations; `VisualEffectsProvider` for reduced motion
- `EcosystemNavbar` for cross-app navigation + auth actions
- Server Components by default; Client Components only where needed (interactivity)

### 10.6 Quality Gates (Must Pass)
```bash
pnpm --filter @moonwitness/gate typecheck
pnpm lint:arch
pnpm docs:check
pnpm --filter @moonwitness/gate build
```
Plus manual QA: desktop/tablet/mobile, keyboard, reduced motion, loading/error/empty states, no console errors.

---

## 11. Asset Specifications (Missing → Required)

| Asset | Spec | Source | Status |
|---|---|---|---|
| Hero architectural threshold image | 1600×900, WebP, monumental silhouette, warm gold light on obsidian | XV `imperium-lumen.png` exists (81KB) | **Reuse** `apps/dock/public/artwork/imperium-lumen.png` |
| Universe spatial map illustration | 1600×900, distinct silhouettes for 5 destinations | XV mockups (reference only) | **Create** — specify as original artwork |
| Transmission featured artwork | 1600×900 per transmission, approved only | XV 5 approved WebPs (limited) | **Use approved only**; fallback = text/surface |
| Story world cover images | 3:4 aspect, back-view characters, no faces | XV `VISUAL_BIBLE.md` §1.5 | **Create** per world; license verified |
| Emblem (gate arch + crescent) | SVG, abstract, no calligraphy/faces | Reborn ODR-003 approved | **Create** `apps/gate/public/brand/emblem.svg` |
| Favicon / OG image | 32×32, 1200×630, IMPERIUM LUMEN palette | Active repo patterns | **Create** from emblem |

---

**End of Audit Report**  
*All sources verified against local repository checkouts. Inaccessible wikis explicitly noted. No fabricated claims.*