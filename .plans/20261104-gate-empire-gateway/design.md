# GATE — Design Specification

## Visual Direction: IMPERIUM LUMEN

**Reference:** `DNA/01-IMPERIUM-LUMEN.md`, `DNA/07-COMPONENT-MAPPING.md`, `packages/ui/src/skins/registry.ts`

### Color Palette (CSS Variables via SkinRoot)
| Role | Variable | Value |
|---|---|---|
| Canvas | `--mw-canvas` | `#11110f` |
| Surface | `--mw-surface` | `#1b1b18` |
| Elevated Surface | `--mw-elevated-surface` | `#25251f` |
| Text | `--mw-text` | `#f4f1e8` |
| Muted Text | `--mw-muted-text` | `#c4c0b5` |
| Border | `--mw-border` | `#908b7d` |
| Accent (Antique Gold) | `--mw-accent` | `#d3b77b` |
| Accent Text | `--mw-accent-text` | `#17150f` |
| Focus | `--mw-focus` | `#f3d996` |
| Success | `--mw-success` | `#6ec39a` |
| Danger | `--mw-danger` | `#ff938b` |

### Typography
| Role | Font Stack | Usage |
|---|---|---|
| Display | Georgia, "Times New Roman", serif | Hero headlines, movement titles |
| Heading | Georgia, "Times New Roman", serif | Section headings (h2-h3) |
| Body | Arial, Helvetica, sans-serif | Paragraphs, UI text |
| Label | Arial, Helvetica, sans-serif | Form labels, button text |
| Numeric | "Courier New", monospace | Technical metadata, chapter numbers |

### Spacing & Geometry
| Token | Value | Usage |
|---|---|---|
| `--mw-control-gap` | 0.75rem | Button/icon gaps |
| `--mw-card-padding` | 1.5rem | Card internal spacing |
| `--mw-section-gap` | 2.5rem | Between major sections |
| `--mw-control-radius` | 0.2rem | Button/input radius |
| `--mw-surface-radius` | 0.35rem | Card/surface radius |
| `--mw-border-width` | 1px | Borders |

### Motion
| Token | Value |
|---|---|
| `--mw-motion-fast` | 120ms |
| `--mw-motion-standard` | 220ms |
| `--mw-motion-ambient` | 42s |
| `--mw-motion-easing` | cubic-bezier(0.2, 0.7, 0.2, 1) |

## Movement Compositions

### M01: Arrival / The Gate (`/` Hero)
- **Layout:** Single architectural threshold, near-full viewport
- **Image:** `imperium-lumen.png` (1600×900, priority, object-fit: cover)
- **Typography:** Display font, clamp(2.7rem, 6vw, 5.6rem), tracking -0.055em
- **CTA:** Button variant="gold" size="lg" (architectural seal)
- **Skip Link:** SR-only, focus-visible fixed top-left

### M02: The Universe (`/universe`)
- **Layout:** Spatial relationship map — NOT a card grid
- **Destinations (5):** Unequal visual weight
  1. **Gate** (current) — prominent threshold arch
  2. **MoonWitness** — archive tower silhouette
  3. **Dock** — harbor with moored vessels
  4. **Cockpit** — workspace (unavailable, dimmed)
  5. **Headquarter** — command spire (restricted label)
  6. **Observatory** — observatory dome
- **Fallback:** Semantic `RawStack` list with descriptions + status badges

### M03: Explore (`/explore`)
- **Layout:** Editorial index — layered, not equal cards
- **Featured:** Manusia Pulpen (large, artwork + body + CTA)
- **Supporting (3):** AngelWithShotgun, GGS, Empire — each distinct composition
- **Knowledge/Creative:** 3+3 tiles with "Planned" labels

### M04: Transmissions (`/transmissions`)
- **Layout:** Featured dominant + supporting list
- **Featured:** Large artwork, title, series/chapter, **Provenance Block**, excerpt
- **Provenance Block:** Source type badge + reference + edition/translator + author/date + rendering + status
- **Empty State:** "No published transmissions yet" + link to Explore

### M05: Discover (`/discover`)
- **Layout:** Taxonomy instrument — hierarchical filters
- **Filters:** Theme (4), Format (4), Time (partial), Source (5)
- **Results:** Hidden until backend; fallback curated link

### M06: Community (`/community`)
- **Layout:** Place of participation — expectations, not value cards
- **Sections:** Purpose, Participation, Guidelines, Safety
- **CTA:** Button "Enter Dock" → real Dock endpoint

### M07: Journey (`/journey`)
- **Layout:** Clear choice — public vs authenticated
- **Anonymous:** 3 paths (Explore, Community, Sign In)
- **Signed-in:** Verified shortcuts only (conditional rendering)

### M08: Closing / The Return (Home Footer)
- **Layout:** Quiet horizon echoing opening
- **Quote:** "A brighter humanity is a story we build together."
- **Navigation:** Direct links to all public destinations

## Component Recipes (IMPERIUM LUMEN)

| Component | Recipe |
|---|---|
| **Button** | Architectural seal: `variant="gold"`, `size="lg"`, border-radius 0.2rem, gold border/text |
| **Card** | Recessed bay: `RawContainer` + border `var(--mw-border)`, padding `var(--mw-card-padding)`, surface shadow |
| **Navigation** | Gates: `EcosystemNavbar` + bespoke destination cards (not tabs) |
| **Dialog** | Threshold chamber: `Dialog` with `RawSection` content, focus trap, Esc dismiss |
| **Data Display** | Engraved plane: `RawSection` + `var(--mw-muted-text)`, mono for technical |
| **Empty State** | Quiet space: `RawContainer` centered, muted text, single useful action |

## Responsive Breakpoints

| Context | Width | Adaptation |
|---|---|---|
| Wide Desktop | ≥1440px | Full spatial depth, secondary panels |
| Desktop | 1024-1439px | Preserve hierarchy, reduce depth |
| Tablet | 768-1023px | Recompose regions, region selector for spatial map |
| Mobile | 320-767px | Vertical journey, labeled destinations, hero height reduced, 44px touch targets |

## Accessibility Requirements

- **Semantic HTML:** `main`, `section aria-labelledby`, `nav`, `header`, `footer`
- **Headings:** Sequential h1→h2→h3; no skipped levels
- **Focus:** `:focus-visible` = 2px solid `var(--mw-focus)`, offset 3px
- **Contrast:** Text 4.5:1, UI 3:1 (verified against IMPERIUM LUMEN tokens)
- **Reduced Motion:** `@media (prefers-reduced-motion: reduce)` disables all animations
- **Touch Targets:** ≥44×44 CSS px (Button min-height 44px enforced by UI)
- **Alt Text:** Informative images descriptive; decorative `alt=""`
- **Language:** `lang="id"` root; English pages `lang="en"`
- **ARIA:** Live regions for dynamic content; `aria-current="page"` on active nav

## Asset Requirements

| Asset | Spec | Status |
|---|---|---|
| Hero threshold | 1600×900 WebP, monumental, warm gold on obsidian | Reuse dock's imperium-lumen.png |
| Universe silhouettes | 5 distinct architectural forms, transparent BG | Create (original) |
| Transmission artwork | 1600×900 WebP per transmission | Create (approved only) |
| Emblem | SVG, gate arch + crescent, abstract, no faces | Create (ODR-003) |
| Favicon/OG | 32×32, 1200×630, IMPERIUM LUMEN palette | Derive from emblem |

## Antislop Compliance (Per Technique)

| Technique | Purpose | Verdict |
|---|---|---|
| Monumental hero image | Establish architectural threshold, spatial scale | ✅ Purposeful |
| Gold accent on primary CTA | Brand/interaction emphasis (not success/warning) | ✅ Purposeful |
| Asymmetric Universe map | Spatial relationship hierarchy | ✅ Purposeful |
| Editorial index (Explore) | Content-driven hierarchy | ✅ Purposeful |
| Taxonomy filters (Discover) | Real metadata navigation | ✅ Purposeful |
| Glassmorphism | **Forbidden** as default (max 1-2 per antislop R-10) | ❌ Reject |
| Blue/purple gradients | **Forbidden** (generic AI default) | ❌ Reject |
| Fake LIVE badges | **Forbidden** (truth before immersion) | ❌ Reject |
| HUD labels | **Forbidden** (never write "HUD" in UI) | ❌ Reject |
| Repeated card grids | **Forbidden** (8 distinct compositions required) | ❌ Reject |

---

**This design spec is the implementation reference. All visual decisions must trace to IMPERIUM LUMEN DNA and pass antislop purpose test.**