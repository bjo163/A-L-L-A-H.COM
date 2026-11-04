# GATE — Product Specification

**Project:** A-L-L-A-H.COM GATE / Empire Gateway  
**Repository:** bjo163/A-L-L-A-H.COM (branch `dev`)  
**App Directory:** `apps/gate`  
**Port:** 3000 (development)  
**Skin:** IMPERIUM LUMEN via `@moonwitness/ui`  
**Status:** SPECIFIED — ready for implementation  
**Owner:** Product Design / Engineering  
**Last Verified:** 2026-11-04

---

## 1. Product Purpose

GATE is the **definitive public entrance** to the A-L-L-A-H.COM Empire of the Light digital ecosystem. It serves as:

- **Orientation layer:** Introduces the project's identity, vision, and narrative universe (MOONWITNESS XV)
- **Wayfinding layer:** Presents a clear mental model of the ecosystem's destinations and their purposes
- **Discovery layer:** Surfaces real stories, transmissions, and knowledge from the MOONWITNESS universe
- **Invitation layer:** Guides visitors toward meaningful next steps (explore, participate, authenticate) without coercion

GATE is **not**:
- A member dashboard (→ Dock / Cockpit)
- An operational control panel (→ Headquarter)
- An authentication app (→ MoonWitness ID)
- A content archive (→ MoonWitness / World Observatory)
- A generic marketing landing page

---

## 2. Product Boundaries

| Boundary | GATE Owns | GATE Does Not Own |
|---|---|---|
| **Identity** | A-L-L-A-H.COM brand, Empire of the Light descriptor, MOONWITNESS XV narrative intro | Product-specific logos for Dock/Headquarter/ID |
| **Navigation** | Cross-ecosystem wayfinding (via EcosystemNavbar + bespoke sections) | Internal app navigation (each app owns its own) |
| **Content** | Public transmissions, story summaries, ecosystem explanations, onboarding copy | Full story chapters, research corpus, member content, operational data |
| **Auth** | Sign-in/Register entry points (links to ID app), session display in navbar | Identity management, session creation, password reset |
| **Community** | Participation explanation, community guidelines summary, Dock entry | Discussions, circles, contributions, moderation |
| **Operations** | Zero — restricted Headquarter tile labeled as such | Mission control, system observability, governance |

---

## 3. Target Audiences & First Useful Outcomes

| Audience | Primary Need | GATE Delivers |
|---|---|---|
| **Curious visitor** (first-time) | Understand the project without overwhelm | Clear purpose statement, ecosystem map, one relevant destination |
| **Returning reader** | Resume a story or transmission | Direct links to recent/featured transmissions, explore page |
| **Community participant** | Find where/how to participate | Community expectations, real Dock entry link |
| **Creator/contributor** | Understand contribution path | Contribution guidelines summary, Dock entry |
| **Research-minded visitor** | Inspect sources, distinguish evidence from interpretation | Transmissions with provenance, knowledge/explore paths |
| **Member** (signed-in) | Reach personal tools and saved work | Verified shortcuts in Journey section, Cockpit entry |
| **Authorized operator** | Reach ecosystem coordination | Headquarter tile (restricted, redirects to sign-in) |

---

## 4. Information Architecture

### 4.1 Route Map

| Route | Movement | Access | Purpose |
|---|---|---|---|
| `/` | 01 Arrival / 08 Closing | Public | Hero threshold + footer return |
| `/universe` | 02 The Universe | Public | Spatial ecosystem map |
| `/explore` | 03 Explore | Public | Editorial discovery index |
| `/transmissions` | 04 Transmissions | Public | Featured + recent transmissions |
| `/discover` | 05 Discover | Public | Taxonomy filters (theme/format/time/source) |
| `/community` | 06 Community | Public | Participation orientation + Dock link |
| `/journey` | 07 Your Journey | Public + Enhanced (signed-in) | Next steps: public vs authenticated |
| `/about` | Information | Public | Project info, team, canon |
| `/sources` | Information | Public | Source provenance, editions, rights |
| `/privacy` | Information | Public | Data practices, hosting, noindex |

### 4.2 Navigation Model

**Primary (EcosystemNavbar — persistent):**
- A-L-L-A-H.COM brand → Home
- Universe → `/universe`
- Transmissions → `/transmissions`
- Explore → `/explore`
- Community → `/community`
- Sign In / Get ID → ID app (`/login`, `/register`)
- User menu (if signed-in): Account, Sign Out

**Contextual (within page sections):**
- Read transmission → MoonWitness (canonical URL)
- Enter Dock → Dock app (`/account`)
- Open Cockpit → Cockpit app (if implemented, else unavailable)
- Enter Headquarter → Headquarter app (restricted, labeled)

**Mobile:** Collapsible drawer (EcosystemNavbar pattern), all destinations reachable.

---

## 5. Content Architecture

### 5.1 Content Manifest (JSON, adapts XV schema)

```json
{
  "schema": "allah.gate.content-manifest/1",
  "site": { "name": "A-L-L-A-H.COM", "descriptor": "Empire of the Light", "universe": "MOONWITNESS XV" },
  "navigation": [ { "id": "home", "labelEN": "HOME", "labelID": "BERANDA", "href": "/" }, ... ],
  "worlds": [ { "id": "manusia-pulpen", "title": "MANUSIA PULPEN", "category": "origin", ... }, ... ],
  "transmissions": [ { "id": "tx-001", "title": "...", "series": "AngelWithShotgun", "chapter": "01", "status": "published", "provenance": { "source": "personal reflection", "author": "ROCKSOUL", "date": "2026-10-29" }, "href": "/transmissions/tx-001" }, ... ],
  "destinations": [ { "id": "dock", "name": "Dock", "role": "Community", "description": "...", "href": "https://dock.a-l-l-a-h.com/account", "status": "available" }, ... ]
}
```

### 5.2 Content Types & Provenance

| Type | Example | Provenance Required | Display Rules |
|---|---|---|---|
| **Transmission** | AngelWithShotgun Ch.1 | Author, date, series, chapter, content type (personal reflection) | Featured on Home, listed on Transmissions page |
| **Story World** | MANUSIA PULPEN | Category, tagline, body, mockup status, publication state | Cards on Explore/Universe |
| **Character** | ROCKSOUL / AngelWithShotgun | Role, symbolism, traits, no face rule | Codex page (future) |
| **Research/Source** | Qur'an verse, historical report | Exact reference, edition, translator, grading | Knowledge page (future) |
| **Community Guideline** | Participation rules | Version, effective date, moderation policy | Community page |
| **Ecosystem Explanation** | What is Dock? | Author, review date, product owner | Universe/Community pages |

### 5.3 Sacred Content Rules (Enforced)

1. **No depiction** of ALLAH, prophets, angels, or divine figures
2. **Exact provenance** for scripture: surah:ayah, edition, translator, rendering status (full/excerpt/paraphrase)
3. **No generic badges** like "Verified Canonical Revelation" — use source descriptors
4. **Distinguish** creative narrative from research/factual claims
5. **No divine endorsement** implied for software features

---

## 6. User Journeys

### 6.1 First-Time Visitor (Anonymous)

1. **Arrival** — Hero threshold: architectural gate, purpose statement, primary CTA "Enter the Universe"
2. **Universe** — Spatial map: 5 destinations with distinct silhouettes, real status labels
3. **Explore** — Editorial index: story worlds, transmissions, knowledge, timeline
4. **Transmissions** — Featured piece (real, provenance shown) + recent list
5. **Discover** — Filters by theme/format/time (only real metadata)
6. **Community** — What participation means, guidelines, Dock entry button
7. **Journey** — "Continue exploring" or "Sign in for personal workspace"
8. **Closing** — Quiet horizon, footer with real destination links

### 6.2 Returning Reader (Anonymous)

- Deep link to `/transmissions/tx-001` → reads transmission → "Explore more" → `/explore`
- Bookmark `/universe` → returns to spatial map

### 6.3 Signed-In Member

- EcosystemNavbar shows name/email, Sign Out
- Journey section shows verified shortcuts: "Open Cockpit", "Saved transmissions" (if API supports)
- Dock entry goes to `/account` (member area)

### 6.4 Authorized Operator

- Headquarter tile in Universe/Journey shows "Restricted — requires authorization"
- Click → redirects to ID sign-in with `next=/command-center`

---

## 7. Functional Requirements

### 7.1 Core Features (MVP)

| Feature | Spec | Acceptance |
|---|---|---|
| **Hero Arrival** | Architectural gate composition, purpose copy, primary CTA, skip animation | Renders without JS animation; skip link accessible |
| **EcosystemNavbar** | Cross-app links, auth actions, theme/sound toggles, currentApp="gate" | Keyboard accessible, mobile drawer, reduced motion |
| **Universe Map** | 5 destination cards (Gate, MoonWitness, Dock, Cockpit, Headquarter) with unequal visual weight | Distinct silhouettes; semantic list alternative; honest status |
| **Transmissions Feed** | Featured (dominant) + 3 recent; each shows title, series, chapter, provenance, date | Empty state if no published items; no fake items |
| **Explore Index** | Categorized: Stories, Knowledge, Timeline, Creative | Real content only; no empty categories shown as populated |
| **Discover Filters** | Theme, Format, Time, Source (only if metadata exists) | Hidden if no backend; fallback = curated index link |
| **Community Page** | Purpose, guidelines summary, safety, Dock entry button | No invented member counts/testimonials |
| **Journey Page** | Anonymous: explore/sign-in; Signed-in: verified shortcuts only | No invented activity/history |
| **Information Pages** | About, Sources, Privacy — static content, noindex | Real copy; hosting logs disclosed as unverified |
| **Responsive** | Desktop ≥1024, Tablet 768-1023, Mobile ≤767 | No horizontal overflow; touch targets ≥44px; readable text |
| **Accessibility** | WCAG 2.2 AA, keyboard, focus, reduced motion, contrast | All interactive elements reachable; semantic HTML |
| **Performance** | Hero image priority; lazy-load below fold; no render-blocking 3D | LCP < 2.5s target; static fallback for media failure |

### 7.2 Non-Functional Requirements

| Requirement | Spec |
|---|---|
| **Stack** | Next.js 16, React 19, TypeScript strict, Tailwind v4 |
| **UI System** | @moonwitness/ui only (UI_PURITY lint enforced) |
| **API Client** | @allah/sdk only (UNIVERSAL_SDK_CLIENT lint enforced) |
| **Types** | @moonwitness/types for shared contracts |
| **Auth** | Session check via `mwClient.auth.getCurrentUser()`; sign-out via `mwClient.auth.signOut()` |
| **Skin** | IMPERIUM LUMEN via `SkinRoot skin="imperium-lumen"` |
| **Fonts** | Geist Sans + Geist Mono via next/font/google |
| **Motion** | MotionFrame entrance; VisualEffectsProvider respects `prefers-reduced-motion` |
| **SEO** | Metadata per route; Open Graph; canonical URLs; Indonesian-first |
| **i18n** | Indonesian (default) + English; locale catalogs; no hardcoded strings |
| **Build** | `pnpm --filter @moonwitness/gate build` passes; typecheck + lint:arch + docs:check |

---

## 8. Design Direction (Summary)

**Visual Identity:** Cosmic Ivory & Antique Gold / Monumental Celestial Architecture (IMPERIUM LUMEN)

**Composition Grammar per Movement:**
- 01 Arrival: Single architectural threshold, immense horizon, one primary action
- 02 Universe: Spatial relationship map — unequal scale, distinct silhouettes
- 03 Explore: Editorial index — layered, not card grid
- 04 Transmissions: Editorially dominant featured piece + supporting list
- 05 Discover: Taxonomy instrument — hierarchical filters
- 06 Community: Place of participation — expectations, not value cards
- 07 Journey: Clear choice — public exploration vs authenticated work
- 08 Closing: Quiet horizon echoing opening, direct destination links

**Anti-Patterns (Forbidden):**
- Repeated card grids across movements
- Generic SaaS hero + 2 CTAs + feature grid
- Blue/purple gradients, excessive glassmorphism, glow everywhere
- Fake metrics, LIVE badges, invented counts
- HUD labels, fake coordinates, decorative telemetry
- Sacred text as decoration; divine depiction

**Accessibility Baseline:** All movements work without animation; keyboard complete; reduced motion = direct transitions; contrast ≥4.5:1; touch targets ≥44px.

---

## 9. Implementation Phases

| Phase | Scope | Deliverable |
|---|---|---|
| **Phase 1: Foundation** | App scaffold, config, SkinRoot, EcosystemNavbar integration, globals.css, layout.tsx | Running app at localhost:3000 |
| **Phase 2: Hero & Arrival** | Hero threshold component, architectural composition, primary CTA, skip link | Movement 01 complete |
| **Phase 3: Universe Map** | Spatial destination composition, 5 destinations, semantic list fallback | Movement 02 complete |
| **Phase 4: Content Sections** | Explore, Transmissions, Discover, Community, Journey — each distinct composition | Movements 03-07 complete |
| **Phase 5: Closing & Info Pages** | Footer horizon, /about, /sources, /privacy, metadata | Movement 08 + info pages |
| **Phase 6: Polish & QA** | Responsive, a11y, reduced motion, loading/error/empty states, performance | All gates pass |
| **Phase 7: Documentation** | Update specs, arch, design, content, implementation reports | Docs complete |

---

## 10. Acceptance Criteria (Definition of Done)

- [ ] `apps/gate` exists and follows monorepo conventions
- [ ] All 8 movements implemented with distinct compositions
- [ ] EcosystemNavbar integrated with `gate` endpoint and `currentApp="gate"`
- [ ] IMPERIUM LUMEN skin applied via SkinRoot
- [ ] No raw HTML controls (Button, Link, Input, Form, Card, Badge from @moonwitness/ui)
- [ ] No direct fetch (all API via @allah/sdk)
- [ ] No local type redefinitions (shared types from @moonwitness/types)
- [ ] Responsive: desktop, tablet, mobile verified
- [ ] Accessible: keyboard, focus, contrast, reduced motion, semantic HTML
- [ ] Honest states: loading, empty, error, restricted, offline designed
- [ ] No fake data presented as real
- [ ] `pnpm --filter @moonwitness/gate typecheck` passes (0 errors)
- [ ] `pnpm lint:arch` passes (100%)
- [ ] `pnpm docs:check` passes (100/100)
- [ ] `pnpm --filter @moonwitness/gate build` passes
- [ ] Manual QA: no console errors, no broken links, visual consistency
- [ ] Documentation updated (this spec, arch, design, content, implementation reports)
- [ ] Git diff clean (only intentional changes, no secrets, on `dev` branch)

---

**End of Product Specification**