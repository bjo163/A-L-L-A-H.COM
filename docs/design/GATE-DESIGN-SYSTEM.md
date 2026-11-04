# GATE — Design System Specification

**Project:** A-L-L-A-H.COM GATE / Empire Gateway  
**Skin:** IMPERIUM LUMEN (Master DNA 01)  
**Shared UI:** @moonwitness/ui (packages/ui)  
**Status:** SPECIFIED  
**Owner:** Product Design  
**Last Verified:** 2026-11-04

---

## 1. Design DNA: IMPERIUM LUMEN

**World Metaphor:** A monumental empire of light and impossible architecture  
**Core Formula:** Sacred monumentalism (abstract) × impossible architecture × celestial light  
**Emotional Register:** Awe, scale, order, serenity, discovery  
**Experience Metaphor:** Entering and traversing a monumental imperium

### 1.1 Composition Grammar
- Monumental axial compositions, long perspectives, framed horizons, portals, thresholds, nested architectural depth
- One dominant spatial gesture per screen; avoid collage of unrelated monumental objects
- Asymmetry only when balanced by architectural weight, alignment, or deliberate negative space
- Page transitions as passage between named spaces, not repeated fade-in card animations
- Readable content planes preserved; large-scale imagery never competes with actions/information
- Silence and negative space as active design elements

### 1.2 Shape & Material Language
- Architecture: monolithic, geometric, layered, precise, monumental
- Surfaces: stone-like matte, ivory ceramic, dark obsidian, restrained metallic details
- Edges: clean bevels, thin architectural seams, deep reveals, framed apertures
- Depth: long perspective, controlled occlusion, volumetric light (where performance allows)
- **Never:** literal religious ornament as generic decoration

### 1.3 Color & Typography Direction
- **Base:** obsidian (`#11110f`), deep charcoal (`#1b1b18`), luminous ivory (`#f4f1e8`)
- **Accent:** pale gold (`#d3b77b`), restrained champagne, silver-white
- **Light:** warm white or neutral celestial white; no constant bloom
- **Display type:** monumental, high-contrast or refined modern forms with generous tracking (Georgia/serif)
- **Body type:** highly legible neutral sans-serif (Arial/Helvetica)
- **Numeric/technical:** quiet, precise supporting typography (Courier New/monospace)
- **Gold usage:** sparingly; luminous white and deep shadow carry most identity

### 1.4 Navigation & Interaction
- **Metaphor:** thresholds, gates, axes, spatial destinations
- **Primary action:** opening/entering a clearly named destination
- **Secondary:** architectural index or spatial wayfinding layer
- **Dialog:** contained threshold/chamber with clear close/return
- **Progress:** traversal, stages, milestones; never spiritual rank/divine approval
- **Motion:** slow reveal, parallax with restraint, light passing across geometry, portal transitions
- **Reduced motion:** fast, functional alternative always provided

### 1.5 Component Interpretation (per DNA/07-COMPONENT-MAPPING.md)
| Component | IMPERIUM LUMEN Recipe |
|---|---|
| Button | Architectural seal or framed command |
| Card | Recessed architectural bay or elevated stone plane |
| Navigation | Sequence of gates and named destinations |
| Dialog | Threshold chamber with clear close/return |
| Tabs | Adjoining wings or clearly labeled spatial sections |
| Data display | Engraved/inscribed information plane |
| Empty state | Quiet open space with useful next action |

### 1.6 Hard Exclusions (Non-Negotiable)
- Never depict ALLAH, divine form, body, face, or anthropomorphic figure
- Do not claim light/architecture/portal/geometry represents ALLAH
- Do not use Qur'anic text/sacred names as texture, wallpaper, random glyphs, decorative filler
- Do not make gold glow, lens flare, or 3D buildings the entire design
- Do not sacrifice navigation clarity for spectacle
- Do not falsely imply visual progression measures faith/salvation/divine favor

---

## 2. Token Contract (from @moonwitness/ui)

### 2.1 Skin Registry Values (packages/ui/src/skins/registry.ts)

```typescript
'imperium-lumen': {
  colors: {
    canvas: '#11110f',
    surface: '#1b1b18',
    elevatedSurface: '#25251f',
    text: '#f4f1e8',
    mutedText: '#c4c0b5',
    border: '#908b7d',
    accent: '#d3b77b',        // Antique Gold
    accentText: '#17150f',
    focus: '#f3d996',
    success: '#6ec39a',
    danger: '#ff938b',
    dangerText: '#28100e',
  },
  typography: {
    display: 'Georgia, "Times New Roman", serif',
    heading: 'Georgia, "Times New Roman", serif',
    body: 'Arial, Helvetica, sans-serif',
    label: 'Arial, Helvetica, sans-serif',
    numeric: '"Courier New", monospace',
    tracking: '0.015em',
  },
  spacing: {
    density: 'spacious',
    controlGap: '0.75rem',
    cardPadding: '1.5rem',
    sectionGap: '2.5rem',
  },
  geometry: {
    controlRadius: '0.2rem',
    surfaceRadius: '0.35rem',
    borderWidth: '1px',
  },
  material: {
    surfaceShadow: '0 12px 30px rgb(0 0 0 / 0.22)',
    controlShadow: 'inset 0 1px rgb(255 255 255 / 0.08)',
  },
  motion: {
    fastDuration: '120ms',
    standardDuration: '220ms',
    ambientDuration: '42s',
    easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
  },
}
```

### 2.2 CSS Custom Properties (injected by SkinRoot)

Available as `var(--mw-*)` in `packages/ui/src/skins.css`:
- `--mw-canvas`, `--mw-surface`, `--mw-elevated-surface`
- `--mw-text`, `--mw-muted-text`, `--mw-border`
- `--mw-accent`, `--mw-accent-text`, `--mw-focus`
- `--mw-font-display`, `--mw-font-heading`, `--mw-font-body`, `--mw-font-label`, `--mw-font-numeric`
- `--mw-control-gap`, `--mw-card-padding`, `--mw-section-gap`
- `--mw-control-radius`, `--mw-surface-radius`, `--mw-border-width`
- `--mw-surface-shadow`, `--mw-control-shadow`
- `--mw-motion-fast`, `--mw-motion-standard`, `--mw-motion-ambient`, `--mw-motion-easing`

### 2.3 Global Fonts (next/font/google)
- `Geist Sans` → `--font-geist-sans` (UI, body, navigation)
- `Geist Mono` → `--font-geist-mono` (code, technical metadata)

---

## 3. Component Usage Rules (UI_PURITY Enforcement)

### 3.1 Mandatory @moonwitness/ui Imports
| Instead of Raw HTML | Use |
|---|---|
| `<button>` | `<Button>` (variants: default, gold, outline, ghost, destructive; sizes: sm, default, lg, icon) |
| `<a>` | `<Link>` (props: external, underline, current, asChild) or `<Button asChild>` |
| `<input>` | `<Input>` (via Form/FormField) |
| `<select>` | `<Select>` |
| `<textarea>` | `<Textarea>` |
| `<form>` | `<Form>` with `<FormField>` |
| `<label>` | `<FormField label="...">` |
| `<table>` | `<Table>` family (Table, TableHeader, TableBody, TableRow, TableCell, TableCaption) |

### 3.2 Key Component Props

**Button:**
```tsx
<Button variant="default" size="default" enableSfx={true} asChild={false}>
  // asChild: clones child element with button styles + onClick
</Button>
```

**Link:**
```tsx
<Link href="/universe" external={false} underline={false} current={false} asChild={false}>
  // asChild: for Button asChild pattern
</Link>
```

**EcosystemNavbar:**
```tsx
<EcosystemNavbar
  currentApp="gate"
  userName={user?.name}
  userEmail={user?.email}
  onSignOut={handleSignOut}
  showAuthActions={true}
  apps={resolveEcosystemEndpoints(process.env)} // extended with gate: 3000
/>
```

**SkinRoot:**
```tsx
<SkinRoot skin="imperium-lumen" className="min-h-full flex flex-col">
  {children}
</SkinRoot>
```

**MotionFrame:**
```tsx
<MotionFrame effect="enter" className="section-wrapper">
  // effect="enter" → mw-motion-enter animation
</MotionFrame>
```

**Raw Layout Primitives (for semantic structure):**
```tsx
<RawContainer>   // max-width container, centered
<RawSection>     // semantic <section>
<RawStack gap="regular|tight|loose">  // vertical stack
<RawCluster gap="regular|tight|loose"> // horizontal flex wrap
<RawGrid gap="regular|tight|loose">   // responsive grid
```

---

## 4. Movement Compositions (8 Distinct Layouts)

### 4.1 Movement 01 — Arrival / The Gate (`/` Hero)
- **Composition:** Single architectural threshold, full-viewport or near-full
- **Elements:** Monumental silhouette/horizon, A-L-L-A-H.COM identity integrated, one purpose statement, one primary CTA ("Enter the Universe"), quiet secondary ("Learn about the Empire")
- **Animation:** Optional short arrival reveal (MotionFrame), skip link visible
- **Responsive:** Mobile reduces height, keeps CTA visible above fold

### 4.2 Movement 02 — The Universe (`/universe` or Home section)
- **Composition:** Spatial relationship map — **not a card grid**
- **Elements:** 5 destinations as distinct architectural forms (Gate, MoonWitness, Dock, Cockpit, Headquarter) with unequal visual weight; Gate prominent as current
- **Fallback:** Semantic list alternative for keyboard/screen reader
- **Headquarter:** Labeled "Restricted — requires authorization"

### 4.3 Movement 03 — Explore (`/explore`)
- **Composition:** Editorial index — layered discovery, not equal cards
- **Elements:** Story Worlds (featured), Transmissions (recent), Knowledge (categories), Timeline (entry point)
- **Hierarchy:** Dominant featured world, supporting entries visually distinct

### 4.4 Movement 04 — Transmissions (`/transmissions`)
- **Composition:** Editorially dominant featured transmission + supporting list
- **Elements:** Featured: large artwork, title, series/chapter, provenance, excerpt; Supporting: compact list with provenance
- **Empty state:** "No published transmissions yet" + link to archive

### 4.5 Movement 05 — Discover (`/discover`)
- **Composition:** Taxonomy navigation instrument
- **Elements:** Theme filter, Format filter, Time/Timeline, Source/Evidence type (only if real metadata exists)
- **Fallback:** Curated index link if search not implemented

### 4.6 Movement 06 — Community (`/community`)
- **Composition:** Place of participation — expectations, not value cards
- **Elements:** What community is for, meaningful participation looks like, guidelines summary, safety, **real Dock entry button**

### 4.7 Movement 07 — Your Journey (`/journey`)
- **Composition:** Clear choice — public exploration vs authenticated work
- **Anonymous:** Continue exploring, learn participation, sign in when needed
- **Signed-in:** Verified shortcuts only (Cockpit, saved items — if API supports)
- **No invented:** recent activity, reading history, progress, recommendations

### 4.8 Movement 08 — Closing / The Return (Home footer section)
- **Composition:** Quiet architectural horizon echoing opening
- **Elements:** Final editorial line, direct navigation to public destinations (Universe, Transmissions, Explore, Community, Dock, Sign In)
- **Footer:** Legal/privacy, contact (if real), language, accessibility, destination links

---

## 5. Responsive Behavior

| Breakpoint | Composition Adaptation |
|---|---|
| **Wide Desktop (≥1440px)** | Full spatial depth, layered scene, secondary navigation panels |
| **Standard Desktop (1024-1439px)** | Preserve focal hierarchy, reduce secondary depth |
| **Tablet (768-1023px)** | Recompose regions; spatial map → region selector; no compressed sidebars |
| **Mobile (320-767px)** | Vertical editorial journey; spatial map → labeled destinations; hero height reduced; touch targets ≥44px; no hover dependency |

**Mobile-First CSS Pattern:**
```css
/* Base = mobile */
.section { padding: 1.5rem; }
/* Tablet up */
@media (min-width: 768px) { .section { padding: 3rem; } }
/* Desktop up */
@media (min-width: 1024px) { .section { padding: 4rem; } }
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 6. Motion & Sound

### 6.1 Motion Vocabulary (per DNA/08-QUALITY-GATES.md)
| Motion | Duration | Easing | Purpose |
|---|---|---|---|
| Arrival reveal | 2-4s total (staggered) | `cubic-bezier(0.2, 0.7, 0.2, 1)` | Establish place/orientation |
| Scene transition | 280-550ms | same | Communicate movement between spaces |
| Landmark response | 100-180ms | same | Confirm selection/focus |
| Content reveal | 160-260ms | same | Preserve hierarchy opening detail |
| Success feedback | 200-300ms | same | Confirm completed action |

### 6.2 Reduced Motion Requirements
- `prefers-reduced-motion` respected via `VisualEffectsProvider`
- Camera travel/parallax → direct scene change or opacity transition
- No parallax, looping movement, forced zoom when reduced
- Navigation/content fully usable if animation assets fail
- Never delay actionable interface until animation finishes

### 6.3 Sound
- **Off by default** — `SoundToggle` in EcosystemNavbar controls
- Never autoplay with sound
- Optional, user-controlled, licensed
- No sound carries essential information

---

## 7. Accessibility Checklist (Per Movement)

- [ ] Semantic heading hierarchy (h1 → h2 → h3)
- [ ] Keyboard reachable (Tab order logical, no traps)
- [ ] Visible focus (`:focus-visible` = 2px solid `var(--mw-focus)`, offset 3px)
- [ ] Contrast: text ≥4.5:1, UI components ≥3:1
- [ ] Reduced motion: functional equivalent
- [ ] Touch targets ≥44×44 CSS px
- [ ] Alt text: informative images = descriptive; decorative = empty
- [ ] ARIA: landmarks (`<main>`, `<nav>`, `<section aria-labelledby>`), live regions for dynamic content
- [ ] Language: `lang="id"` root; `lang="en"` for English pages
- [ ] Zoom 200%: no clipped essential content, reflow works

---

## 8. Asset Specifications

| Asset | Spec | Source | Fallback |
|---|---|---|---|
| Hero threshold image | 1600×900 WebP, monumental silhouette, warm gold light on obsidian | Reuse `apps/dock/public/artwork/imperium-lumen.png` | CSS gradient + geometric shapes |
| Universe destination silhouettes | 5 distinct architectural forms, 800×600 each, transparent background | Original artwork required | Text labels + geometric icons |
| Transmission featured artwork | 1600×900 WebP per transmission, approved only | XV 5 approved WebPs | Text/surface fallback (designed) |
| Emblem (gate arch + crescent) | SVG, abstract, no calligraphy/faces | Reborn ODR-003 approved | Text "A-L-L-A-H.COM" |
| Favicon | 32×32, 1200×630 OG, IMPERIUM LUMEN palette | Derived from emblem | Simple gold crescent on obsidian |

---

## 9. Antislop Purpose Test (Every Technique)

For each visual technique used in GATE, the purpose must be documented:

| Technique | Purpose in GATE | Ruling |
|---|---|---|
| Monumental hero image | Establish architectural threshold, spatial scale | ✅ Purposeful |
| Gold accent on primary CTA | Brand/interaction emphasis (not success/warning) | ✅ Purposeful |
| Asymmetric layout (Universe) | Spatial relationship hierarchy | ✅ Purposeful |
| Editorial index (Explore) | Content-driven hierarchy | ✅ Purposeful |
| Taxonomy filters (Discover) | Real metadata navigation | ✅ Purposeful |
| Glassmorphism | **Forbidden** as default (max 1-2 elements per antislop R-10) | ❌ Reject |
| Blue/purple gradients | **Forbidden** (generic AI default per antislop) | ❌ Reject |
| Fake LIVE badges | **Forbidden** (truth before immersion) | ❌ Reject |
| HUD labels | **Forbidden** (never write "HUD" in UI) | ❌ Reject |

---

## 10. Implementation Notes

- All styles via `@moonwitness/ui/skins.css` import + Tailwind v4 `@theme inline` mapping
- No arbitrary hex in component markup — use `var(--mw-*)` or component variants
- Component recipes via `className` composition on shared primitives (RawContainer, RawStack, etc.)
- `MotionFrame` wraps each movement for entrance animation
- `VisualEffectsProvider` at SkinRoot level for reduced motion context
- `EcosystemNavbar` provides cross-app nav + auth + theme/sound toggles

---

**End of Design System Specification**