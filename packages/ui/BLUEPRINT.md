---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-BLUEPRINT"
version: "1.0.0"
owner: "architecture"
status: "approved"
last_verified: "2026-11-05"
---

# Moon UI — Complete Package Blueprint

> **Design target:** a web-native, console-grade visual experience built from six radically distinct worlds, one coherent functional engine, and a disciplined high-fidelity asset and motion pipeline.

This is the complete target blueprint for `packages/ui`. It is not a claim that every proposed component, asset, font, interaction, or 3D scene is already implemented. Current implementation and gaps are explicitly separated below.

---

## 0. Authority, scope, and document hierarchy

### 0.1 Authority

This blueprint governs the shared UI package. Its canonical upstream design references are:

1. `DNA/README.md` and the six individual DNA specifications — creative canon.
2. `DNA/00-ENGINE-CONTRACT.md` — shared functional invariants.
3. `DNA/07-COMPONENT-MAPPING.md` — semantic task-to-world composition mapping.
4. `DNA/08-QUALITY-GATES.md` — design quality and anti-slop checks.
5. `DESIGN.md` — product experience doctrine.
6. `DECISIONS.md` — accepted architecture decisions, especially native-first primitives and one token source.
7. This document — implementation architecture and package roadmap.
8. `README.md` — concise package entrypoint.

If these documents conflict, preserve accepted ADRs and approved DNA canon; record a decision before changing them. Do not silently rewrite history or mark an aspirational requirement as implemented.

### 0.2 Scope

The package owns:
- semantic UI atoms and controls;
- layout-only raw primitives;
- shared interaction and motion primitives;
- reusable experience blocks and compositions;
- six-skin token contracts and visual recipes;
- world artwork rendering primitives and asset metadata contracts;
- typography, icon, emblem, and brand asset integration;
- accessibility, responsive behavior, state parity, and visual quality tests.

Applications own:
- routes, page-specific information architecture, content, domain workflows, and business logic;
- API calls, authorization, and data state;
- orchestration of app-specific scenes from shared package capabilities;
- public asset serving when a shared package path is resolved by an app-specific asset contract.

The package must never own application data fetching, tenant authorization, credentials, or domain-specific business logic.

### 0.3 Truth labels

Every feature and asset must be described using one of these states:
- **Implemented:** source exists and is integrated.
- **Tested:** automated tests cover the stated contract.
- **Visually verified:** rendered in target routes and checked at defined viewports/devices.
- **Proposed:** approved direction, not implemented.
- **Blocked:** cannot proceed without a recorded decision, dependency, or evidence.

A feature may be implemented but not visually verified. Keep those states distinct.

---

## 1. Creative vision — console-grade, but honest to the web

### 1.1 What “PlayStation-grade” means here

It means the craft and coherence associated with premium game interfaces:
- an unmistakable world identity from the first frame;
- cinematic establishing compositions and strong visual hierarchy;
- believable scale, perspective, lighting, material response, and atmospheric depth;
- deliberate camera-like transitions and interaction feedback;
- high-resolution, art-directed assets rather than generic stock imagery;
- tactile controls that respond with precision;
- stable frame pacing and immediate input response;
- careful sound design only when explicitly enabled and useful;
- a complete visual system across loading, empty, error, offline, success, and permission states.

It does **not** mean:
- claiming the browser is a native PlayStation/Xbox engine;
- using real-time 3D everywhere;
- adding perpetual particles, blur, bloom, scan lines, or parallax to every surface;
- replacing semantic DOM text and controls with a canvas;
- sacrificing readability, accessibility, low-end device support, or first-load speed for spectacle.

### 1.2 Core experience model: The World Has Depth

Every substantial experience can use a layered scene model. Not every route needs all layers.

1. **Atmosphere:** distant sky, subtle tonal field, stars/particles only where canonically appropriate.
2. **World plane:** architecture, landscape, observatory, network, poster wall, or instrument environment.
3. **Subject plane:** the meaningful destination, content, or active task.
4. **Interface plane:** legible DOM text, controls, labels, and actionable elements.
5. **Focus plane:** current selection, active route, dialog, or task state.

Rules:
- Keep text and controls on a stable, readable plane.
- Establish one primary focal point and one primary action.
- Use occlusion and overlap sparingly; never hide a control behind decorative art.
- Make depth directional and consistent with the scene's lighting.
- Do not turn every surface into a floating card.
- Background art is not allowed to carry essential information.

### 1.3 A new art-direction concept: “Cinematic Worldstage”

Adopt a reusable art direction called **Cinematic Worldstage**:

- Each app opens on a carefully framed establishing shot rather than a generic dashboard header.
- The scene has one signature architectural/organic/graphic focal object that identifies its DNA.
- Navigation is integrated into the world's spatial metaphor: gates, orbital paths, chapter markers, instrument rails, poster strips, or branching nodes.
- Content arrives as meaningful artifacts inside the scene, not identical rectangular cards.
- A route transition uses a short visual bridge that communicates movement between spaces.
- A persistent quiet interface layer provides orientation and access to core actions without covering the world.
- The scene remains functional with artwork disabled, failed, or not yet loaded.

This is a composition system, not a universal template. Each DNA must interpret it differently.

### 1.4 A new material concept: “Light Has a Source”

Every scene chooses a coherent light story:
- one primary light direction;
- one secondary bounce or rim light;
- a restrained ambient fill;
- shadows that agree with the light source;
- reflective accents only on materials that plausibly reflect;
- no random glow on every border or icon.

Gold should read as metal or warm illumination, not yellow UI paint. Glass should be rare and have edge/refraction cues rather than a translucent rectangle everywhere. Stone should have scale, grain, and shadow. Paper should have print texture and physical edge. Organic membranes should have soft translucency and branching continuity. Technical instruments should use precision and signal hierarchy, not random neon.

### 1.5 A new motion concept: “Establish → Focus → Resolve”

Use three motion beats:
- **Establish:** reveal the world or route context.
- **Focus:** guide attention to the selected object or action.
- **Resolve:** settle quickly into a stable working state.

Motion rules:
- Standard controls respond immediately; never make a user wait for an animation.
- Route transitions are short, interruptible, and do not trap focus.
- Use transform/opacity and clip-path sparingly; avoid continuous heavy blur/filter animation.
- Ambient movement is slow, subtle, optional, and never necessary to understand state.
- Respect `prefers-reduced-motion` at all times.
- The existing VisualEffectsProvider starts paused and follows reduced-motion preference. Keep that safety behavior.

---

## 2. Approved visual canon

### 2.1 Six Master DNA

| DNA | World metaphor | Geometry and composition | Material / light | Motion signature | Exclusions |
|---|---|---|---|---|---|
| **01 IMPERIUM LUMEN** | Monumental Empire of the Light; architectural passage into a vast world | Axial, monumental, symmetrical or deliberately offset; tall portals, deep thresholds, broad negative space | Obsidian, ivory stone, antique gold, lunar dust; warm directional light; restrained crimson only as a narrative accent | Slow reveal, threshold opening, subtle light travel; no constant shimmer | No depiction of ALLAH; no face; no generic gold dashboard; no overdecorated religious iconography |
| **02 LUNAR CHRONICLES** | Living lunar observatory and universe archive | Orbital paths, celestial layers, precise chronology, horizon lines, atlas framing | Deep blue/slate, silver, moonlit white, restrained warm observation marks | Orbit focus, constellation connection, measured chart reveal | No false astronomical data; no invented celestial claims; no face in sacred/cosmic art |
| **03 ROCKSOUL** | Silent storyteller, cinematic chapters, Born to Running | Film frames, chapter cuts, wide stills, asymmetrical editorial rhythm, tactile poster/album-sleeve references | Charcoal, paper, selective crimson, wet reflections, grain, worn print | Film dissolve, cut, chapter advance, subtle handheld energy | No imitation of copyrighted posters/albums; no gratuitous grunge; human figure back-facing when used; preserve quiet storyteller identity |
| **04 NEXUS PARADOX** | Diegetic future-game instruments and spatial command environment | Floating instrument planes, clipped geometry, spatial selector, nested scopes, precise alignment | Graphite, dark teal, signal cyan, restrained technical highlights | Scan/focus/calibration only when meaningful; crisp short transitions | No fake telemetry; no random numbers; no decorative technical labels masquerading as live status |
| **05 RIOT ANARCHY** | Manga, xerox punk, underground print wall | Torn collage, layered posters, halftone fields, asymmetrical cuts, kinetic type | Paper ivory, ink black, selective red/blue, rough print texture | Hard cuts, offset shifts, stamped reveals; short and deliberate | No generic cyberpunk neon; no copyrighted characters or copied manga panels; chaos must retain hierarchy |
| **06 MYCELIUM** | Living, branching, interconnected organism | Organic branching, node clusters, membranes, growth paths, relational maps | Mineral green, deep forest, translucent membrane, soft bioluminescent accents | Growth, connection, gentle propagation; avoid idle pulsation | No random network lines; every relationship must map to real data or be clearly illustrative |

### 2.2 Imperium Lumen accepted palette and typography

The accepted visual direction is **Cosmic Ivory & Antique Gold**; the hero is **Monumental Cosmic Architecture**.

Palette reference:
- Obsidian: `#090A0D`
- Lunar Slate: `#20242B`
- Moon Gold: `#C5A15A`
- Ivory: `#F4F1E9`
- Moon Dust: `#D9D4C8`
- Crimson: `#8E2635` — narrative accent only.

Typography target:
- Cormorant Garamond — display/editorial;
- Inter — body/interface;
- Cascadia Code — technical/numeric.

**Known implementation drift:** the current Imperium registry uses `#11110f`, `#1b1b18`, `#25251f`, `#d3b77b`, Georgia/Arial/Courier stacks. No bundled WOFF/WOFF2/TTF/OTF font files were found in the previous asset inventory. Therefore the approved target and current runtime are not yet identical. Migration must be deliberate:
1. inspect every consuming app and contrast test;
2. add legally distributable font files and license notices;
3. define font-face loading and fallback stacks;
4. map accepted palette values to semantic token roles;
5. preserve success/danger/focus semantics and WCAG contrast;
6. run screenshots and contrast tests across all six worlds;
7. update this section only when the runtime is verified.

Do not force Imperium's palette onto the other five DNAs. Each world keeps its own approved palette.

### 2.3 Shared experience principles

- Distinctive composition, not a repetitive dashboard grid.
- Product identity is preserved across routes and generations.
- One shared functional engine; no behavioral or accessibility fork.
- Honest loading, empty, error, offline, permission, success, and disabled states.
- WCAG AA contrast, keyboard support, semantic HTML, visible focus, screen-reader names, and reduced motion.
- Responsive desktop, tablet, and mobile layouts.
- Original or licensed assets only, with provenance.
- Never depict ALLAH.
- Real-world factual data must be clearly separated from fictional or symbolic narrative.

---

## 3. Technical architecture and ownership

### 3.1 Layer diagram

```
Application routes and domain workflows
        |
        v
World compositions / experience blocks
        |
        v
Semantic components and interaction controls
        |
        v
Native-first primitives + shared behavior
        |
        v
SkinRoot / SkinScope + semantic design tokens
        |
        v
theme.css + skins.css + asset/font manifests
```

### 3.2 Package source layout

| Path | Responsibility |
|---|---|
| `src/components/` | Accessible semantic atoms and controls |
| `src/blocks/` | Reusable task compositions and world-aware blocks |
| `src/primitives/` | Cross-cutting interaction and motion providers |
| `src/raw/` | Layout-only structural helpers |
| `src/skins/` | SkinRoot, registry, identity, scope |
| `src/tokens/` | Public token API |
| `src/lib/` | Internal helpers |
| `src/sfx/` | Optional sound contracts/utilities |
| `src/theme.css` | Tailwind v4 mapping onto runtime skin variables |
| `src/skins.css` | Shared component styling and per-DNA recipes |
| `test/` | Unit, contract, accessibility, asset, and parity tests |

### 3.3 Strict ownership rules

**Tokens and skins**
- Own color, type, spacing, density, geometry, material, motion, identity paths, and browser theme color.
- Do not own app data or domain decisions.

**Raw layout**
- Own structural layout and responsive primitives only.
- No brand styling, business logic, fetching, or authorization.

**Components**
- Own semantic behavior, states, accessibility, and stable `data-slot` hooks.
- No app-specific network requests or business workflows.

**Primitives**
- Own cross-cutting providers and interaction mechanics.
- Native-first; use a library only where a documented requirement needs it.

**Blocks**
- Own reusable sections and task compositions.
- Props in, UI out. No fetching, persistence, or app-specific business logic.

**Applications**
- Own route composition, data, permissions, content, and page-specific narrative.
- Must consume package controls and blocks.
- Must not target private `mw-*` implementation classes or define a parallel token system.

### 3.4 One source of truth

- `SkinRoot` publishes runtime variables.
- `theme.css` maps Tailwind semantic utilities to those variables.
- `skins.css` owns skin-specific visual recipes.
- App CSS must not define competing color, typography, or theme variables.
- App JSX must not paint with arbitrary Tailwind palette hues.
- Shared components expose `data-slot` attributes as supported CSS hooks.
- Icon libraries are imported only by the shared Icon component.
- The route landmark/skip target remains owned by RouteShell.

Related decisions: D-012 and the accepted composition/token decisions in `DECISIONS.md`.

---

## 4. Current implementation inventory

The following reflects the audited `dev` source and is a snapshot, not a permanent guarantee.

### 4.1 Components currently exported

- Button
- Input
- Textarea
- Select
- Form
- Card
- Badge
- Avatar
- Table
- Dialog
- Link
- Skeleton
- Icon
- Emblem
- Checkbox
- ToolRegistryCard
- ToolDetailPanel
- ToolParameterField

### 4.2 Blocks currently exported

- EcosystemNavbar
- Endpoints
- SessionCard
- SoundToggle
- VisualEffectsToggle
- useEcosystemSession
- WorldArtwork
- DestinationCard
- Kicker
- PageHero
- RouteShell
- SectionHeading
- SkipLink
- StatePanel
- StatusMessage
- SkinLaboratory

### 4.3 Raw layout currently exported

- RawContainer
- RawSection
- RawStack
- RawCluster
- RawGrid

### 4.4 Primitives currently exported

- VisualEffectsProvider
- useVisualEffects
- MotionFrame

### 4.5 Skin engine

Six skin IDs are registered:
- `imperium-lumen`
- `lunar-chronicles`
- `rocksoul`
- `nexus-paradox`
- `riot-anarchy`
- `mycelium`

The registry currently contains semantic colors, typography stacks, spacing, geometry, shadows, and motion tokens. `theme.css` maps Tailwind v4 semantic names to the skin variables. `skins.css` already includes per-world geometry and composition selectors; therefore it is incorrect to describe the current skins as color-only. The remaining gap is depth and breadth of world-specific compositions, brand identity, production art, and verified experience parity.

### 4.6 Current art pipeline evidence

- `WorldArtwork` provides original vector-based 1600×900 scenes for six worlds.
- App public directories serve skin hero PNGs and brand emblem SVGs.
- Asset tests check registry paths, SVG/PNG properties, and rendering parity.
- The earlier audit inventory found 10 PNGs and 10 SVGs across seven app asset folders.
- No bundled font files were found in the repository at that audit.
- The prior inventory did not find a dedicated complete cover/episode/transmission library, a full spatial map library, or a complete logo lockup family.

### 4.7 Known defects and documentation gaps to resolve

| ID | Priority | Finding | Required outcome |
|---|---|---|---|
| UI-001 | P1 | Multiple app emblem SVGs were byte-identical despite different DNA identities | Unique, approved emblem for every brand/world; tests must detect accidental duplicates |
| UI-002 | P1 | Approved Cormorant Garamond / Inter / Cascadia Code direction is not bundled; generic system stacks remain | Licensed font assets, font-face setup, fallbacks, font loading strategy, contrast and layout verification |
| UI-003 | P1 | No complete cover / chapter / transmission / world-map asset family | Typed asset catalogue, templates, responsive variants, provenance, safe fallback |
| UI-004 | P1 | Six worlds lack a complete set of signature compositions | Build the DNA-specific composition families in Section 7 |
| UI-005 | P1 | Current Imperium registry differs from previously accepted palette/type target | Reconcile and migrate without losing semantic contrast |
| UI-006 | P2 | Skin Laboratory's shared generic mark does not prove each world identity | Show the real world emblem/wordmark and signature composition for every DNA |
| UI-007 | P2 | Temporary artwork/quantizer files were found in the package root | Move reproducible tools into scripts/tooling or remove; keep generated temp files out of source root |
| UI-008 | P2 | Interaction primitive coverage is incomplete for actual workflows | Add only workflow-backed controls and compositions |
| UI-009 | P3 | Legacy duplicate session-card naming shim exists | Remove only after consumer audit and compatibility check |

The previous CI snapshot had UI tests, contrast, architectural lint, several app builds, and CodeQL passing, but Headquarter and JIZZ builds, typecheck, and Documentation Contract were failing. Re-check current CI before claiming those conditions remain true or are fixed.

---

## 5. Realistic HD artwork and asset production system

### 5.1 Asset classes

Every asset must belong to a named class and have a clear owner.

| Asset class | Examples | Preferred source format | Delivery variants |
|---|---|---|---|
| Brand identity | emblem, wordmark, lockup, favicon, app icon | SVG master | SVG + PNG/ICO where platform requires |
| Hero / world scene | monumental gateway, lunar horizon, ROCKSOUL scene | layered source + SVG/3D source where appropriate | AVIF/WebP responsive crops + SVG for vector scene |
| Covers | chapter, episode, transmission, archive item | layered source file | AVIF/WebP 16:9, 4:5, 1:1 as required |
| Spatial maps | universe map, orbital map, world map, node map | SVG/JSON scene model | responsive SVG/canvas rendering |
| UI iconography | action, navigation, status, tool glyph | SVG/icon registry | SVG |
| Texture/material | stone, brushed metal, paper, rain, membrane | original texture source | compressed WebP/AVIF or procedural CSS |
| Motion | short transition, loop, ambient sequence | source timeline | WebM/MP4/Lottie only if justified |
| Social / share | Open Graph, social card | layered master | 1200×630 PNG/WebP |

### 5.2 Required cover and hero families

Create a versioned asset catalogue and templates for:
- **World hero:** 16:9 cinematic establishing composition; responsive crop safe zones.
- **World cover:** app/world identity image with emblem/wordmark lockup.
- **Chapter cover:** ROCKSOUL / narrative episode identity, title-safe region, chapter number only when grounded.
- **Transmission poster:** MoonWitness message/episode drop, distinct from chapter cover.
- **Archive cover:** Lunar chronicle and celestial archive entry.
- **Spatial map plate:** world/universe/orbit/network view; real coordinates/data must be sourced and labeled.
- **Headquarter scene plate:** Nexus instrument bay / spatial system map.
- **Social preview:** 1200×630 with readable safe area and no baked-in dynamic data.
- **App icon family:** favicon, maskable icon, Apple touch icon, monochrome mark.

Do not force every DNA to use the same poster template. Templates share metadata and safe-area contracts, not visual layout.

### 5.3 Image quality and technical delivery

- Master artwork: 2560px or 3840px long edge when composition and display density justify it.
- Vector scenes: scalable viewBox; avoid unnecessary filters and huge path counts.
- Web delivery: AVIF first where supported, WebP fallback, PNG only for cases that need lossless alpha or tool compatibility.
- Use responsive `srcset`/sizes or framework image optimization; never send a 4K image to a small mobile card by default.
- Keep text, buttons, and dynamic information in HTML, not baked into the art.
- Keep asset file size budgets explicit per class; establish budgets from actual visual tests and device network profiles, not arbitrary universal limits.
- Preserve source, license, creator, date, prompt/brief provenance where applicable, dimensions, crop, variants, checksum, and consuming route.
- Generate dark/light or DNA-specific art as distinct art direction, not simple hue rotation.
- Use a human review step for brand assets and narrative posters.

### 5.4 Logo and emblem system

Each brand/world requires:
- primary emblem;
- primary wordmark;
- horizontal lockup;
- stacked lockup;
- compact mark;
- monochrome positive and inverse versions;
- small-size simplified mark;
- app icon/favicon family;
- social/avatar crop;
- clear-space and minimum-size rules;
- approved color variants and usage restrictions.

The same generic mark must not be reused across unrelated worlds. A shared MoonWitness mark may appear only where the parent brand is intentionally endorsed. The asset test must compare normalized SVG content or stable identity metadata and fail on accidental duplication.

### 5.5 Asset manifest

Introduce a machine-readable manifest (proposed `src/assets/manifest.ts` or JSON, chosen to match current build constraints) with:
- stable asset ID;
- world/DNA ID;
- asset class;
- source and delivered variants;
- dimensions and aspect ratio;
- format and transparency;
- focal point / crop-safe region;
- provenance and license;
- owner and consuming apps/routes;
- alt text or decorative flag;
- fallback;
- last visual verification.

The manifest is metadata, not a place to embed giant binary files. Keep public asset delivery compatible with Next.js and the existing app ownership model until a shared asset-serving strategy is explicitly accepted.

---

## 6. High-fidelity rendering and motion specification

### 6.1 Layer and material model

Each scene may define:
- background atmosphere;
- distant world geometry;
- primary subject;
- foreground frame or silhouette;
- light/shadow overlays;
- interface content plane.

Use physically plausible cues, not physically based rendering claims for a CSS scene. Material recipes:
- **Stone:** broad tonal variation, fine low-contrast texture, crisp edge lighting, contact shadow.
- **Metal / gold:** coherent specular highlight, restrained reflection, dark falloff; avoid flat yellow.
- **Glass:** selective use, clear edge and depth cues, readable contrast behind it; avoid ubiquitous translucent cards.
- **Paper / print:** visible edge, halftone/grain, ink density, registration shift only in Riot.
- **Organic membrane:** layered translucency, smooth contours, subtle internal light, real graph semantics.
- **Technical instrument:** precise borders, alignment, signal hierarchy, and actual status.

### 6.2 Lighting and color grading

- One key light direction per scene.
- Secondary fill/rim light only when it improves separation.
- Maintain a coherent warm/cool relationship within each DNA.
- Bloom is rare and tightly controlled.
- Do not glow every text label, icon, or border.
- Keep text contrast compliant over the worst part of the artwork.
- Do not place important text directly over high-detail image regions without a stable contrast layer.

### 6.3 Motion tiers

| Tier | Use | Implementation |
|---|---|---|
| 0 — Static | reduced motion, low-power, initial fallback | no decorative animation; functional transitions remain instant |
| 1 — Micro | button, focus, selected, toggle feedback | short transform/opacity/border transition |
| 2 — Scene | route/hero/section reveal | one-time staged reveal, interruptible |
| 3 — Ambient | optional slow environmental movement | paused by default or user-controlled; never needed for comprehension |
| 4 — Interactive 3D | a real spatial object/map | opt-in, lazy-loaded, device-aware, keyboard alternative and static fallback |

Never apply tier 3 or 4 as a default to every route.

### 6.4 Performance and quality targets

These are targets to measure, not claims about current performance.

- Standard interaction: aim for stable 60fps on capable desktop hardware.
- Constrained devices: reduce effects and preserve input responsiveness; static/low-motion fallback is valid.
- First content: prioritize text, navigation, and primary action over decorative scene completion.
- Core Web Vitals: measure LCP, CLS, INP on representative routes and real device/network profiles.
- Image pipeline: responsive dimensions, modern formats, lazy loading below the fold, explicit width/height or aspect ratio.
- 3D: dynamic import, no blocking startup, graceful failure, static poster fallback.
- Avoid large continuously animated blur/filter/backdrop-filter surfaces.
- No canvas-only text or controls.
- No forced audio; sound is opt-in and has visible controls.

A performance budget must be recorded per route and asset class before a new 3D or video experience ships.

---

## 7. Six world-specific composition systems

These are the missing signature composition families to build on top of shared semantic atoms. They are not six forks of the same page template.

### 7.1 IMPERIUM LUMEN — Monumental Architecture

Signature compositions:
1. **The Gate:** monumental portal / threshold with a clear entrance action.
2. **The Grand Axis:** spatial destination map arranged around an architectural axis.
3. **The Passage:** transition composition between public spaces.
4. **The Hall of Paths:** editorial destination collection with varied scale, not equal cards.
5. **The Inscribed Record:** content and status treated like an archival inscription.
6. **The Horizon:** wide worldstage hero with deep atmospheric negative space.

Interaction: threshold opening, axial focus, light-guided selection. Avoid literal religious iconography or depicting ALLAH.

### 7.2 LUNAR CHRONICLES — Observatory and Archive

Signature compositions:
1. **Orbital Navigation:** route selection along a meaningful orbit.
2. **Lunar Timeline:** chronology with scale and event density.
3. **Celestial Archive:** archive entries as observation plates.
4. **Observation Chamber:** detail view with focused metadata and evidence.
5. **Universe Atlas:** spatial map with factual/symbolic layers clearly separated.
6. **Phase Ledger:** chronology, phase, and record view.

Interaction: orbit focus, chart reveal, constellation linking. Astronomy must be sourced; narrative symbolism must be labeled.

### 7.3 ROCKSOUL — Cinematic Storytelling

Signature compositions:
1. **Chapter Cover:** film-poster-grade chapter entry.
2. **Filmstrip:** horizontal/vertical sequence of story frames.
3. **Story Timeline:** narrative chronology with intentional pauses.
4. **Transmission Poster:** standalone message/episode artwork.
5. **Track / Story Sleeve:** editorial object for a song or chapter.
6. **Quiet Frame:** a low-noise cinematic reading state.

Interaction: cut, dissolve, chapter advance, film-frame focus. Keep typography expressive but readable. Do not reproduce copyrighted album art or film posters.

### 7.4 NEXUS PARADOX — Spatial Instruments

Signature compositions:
1. **Spatial Selector:** select systems/areas in a spatial field.
2. **Instrument Bay:** task-specific tools arranged as instrument modules.
3. **Sensor Scope:** actual live values only; stale/unavailable states explicit.
4. **System Map:** real nodes and edges, with selection and relationship details.
5. **Command Rail:** compact command/navigation structure.
6. **Calibration State:** loading/initialization that describes a real operation.

Interaction: focus, calibration, scope change, precise signal response. No invented telemetry or fake coordinates.

### 7.5 RIOT ANARCHY — Print and Collage

Signature compositions:
1. **Comic Spread:** two-page or multi-panel editorial spread.
2. **Poster Wall:** layered posters with a clear focal order.
3. **Sticker Layer:** controlled visual annotations and tags.
4. **Kinetic Headline:** bold typography as composition.
5. **Issue Index:** chapter/issue navigation as print artifacts.
6. **Xerox Archive:** archival content with print texture and strong legibility.

Interaction: hard cuts, stamp, panel focus, controlled offset. Anti-design must remain intentional, accessible, and navigable.

### 7.6 MYCELIUM — Living Network

Signature compositions:
1. **Living Network:** real relationships represented as nodes and branches.
2. **Organic Node Map:** interactive network with focus and detail.
3. **Growth Path:** progression through connected stages.
4. **Relationship Graph:** meaningful entity relationships, not random lines.
5. **Membrane Detail:** detail surface with nested information.
6. **Ecosystem Pulse:** only real activity and updates, otherwise static.

Interaction: connection, growth, focus propagation. No fake network activity or meaningless animated pulses.

### 7.7 Composition acceptance

Each composition must document:
- the real task it supports;
- information hierarchy;
- primary/secondary actions;
- loading/empty/error/offline/success states;
- keyboard and touch interaction;
- narrow-screen adaptation;
- motion tiers and reduced-motion behavior;
- data truth requirements;
- asset dependencies and fallbacks;
- screenshot evidence for desktop, tablet, and mobile.

---

## 8. Atomic component and interaction roadmap

Do not implement a large component catalogue blindly. Prioritize the workflows present in apps.

### 8.1 Current foundations

Existing components include Button, Input, Textarea, Select, Form, Card, Badge, Avatar, Table, Dialog, Link, Skeleton, Icon, Emblem, Checkbox, ToolRegistryCard, ToolDetailPanel, and ToolParameterField.

### 8.2 Candidate atoms / primitives

| Candidate | Priority | Real workflow that justifies it |
|---|---|---|
| Switch | P1 | sound/effects, security preferences, feature toggles |
| RadioGroup | P1 | mutually exclusive configuration |
| Tabs | P1 | actual route-local content modes, not navigation replacement |
| Tooltip | P2 | icon-only controls and dense instrument details |
| Popover | P2 | contextual details/actions |
| DropdownMenu | P2 | compact action menus |
| Progress | P2 | real upload/task/quest completion |
| Separator | P2 | semantic grouping in dense interfaces |
| Accordion / Collapsible | P2 | long settings and progressive disclosure |
| Toast / notification region | P2 | transient action feedback with accessible announcement |
| Combobox / Command palette | P2 | search and command workflows with keyboard support |
| Slider | P3 | numeric range controls with clear value and keyboard semantics |
| Calendar / Date picker | P3 | date selection where a workflow requires it |
| Breadcrumb | P3 | deep hierarchy where spatial navigation alone is insufficient |
| Pagination / Virtualized list | P3 | genuinely large result sets |
| Sheet / Drawer | P3 | mobile or contextual detail when dialog is not appropriate |
| Context menu | P3 | only if pointer and keyboard alternatives are both designed |

For every addition, record: native alternative, bundle impact, keyboard model, screen-reader behavior, validation, state parity, and the user task it enables. Native-first remains mandatory.

### 8.3 Required shared component state contract

Where relevant, components support:
- default;
- hover;
- focus-visible;
- pressed/active;
- selected;
- disabled;
- loading;
- success;
- warning;
- error;
- read-only;
- empty;
- offline/unavailable.

Not every component needs every state. Do not invent states that have no semantic meaning.

---

## 9. Branding, logos, icons, and vectors

### 9.1 Identity system

Create an identity package for each world/app with:
- emblem;
- wordmark;
- horizontal/stacked lockups;
- compact/small-size mark;
- monochrome/inverse variants;
- app icon and favicon sizes;
- social/avatar crop;
- safe area, minimum size, background and contrast rules.

### 9.2 SVG/vector rules

- Use SVG for crisp marks, icons, diagram geometry, and scalable vector scenes.
- Set a viewBox and preserve aspect ratio intentionally.
- Avoid embedded raster data in SVG unless specifically justified.
- Keep SVG accessible: decorative art uses `aria-hidden`; meaningful marks have an accessible name.
- Avoid filters that are expensive or inconsistent across browsers.
- Use currentColor for interface glyphs; brand artwork may use its approved palette.
- Optimize paths without losing intentional texture.
- Do not use one world's emblem as a placeholder for another in production.
- Add regression tests for accidental duplicate emblem content and missing brand variants.

### 9.3 Icon language

- All third-party icon imports remain inside the shared Icon implementation.
- Use one consistent stroke/fill family per DNA.
- Use bespoke vectors only for signature metaphors, not for every common action.
- Common actions must remain recognizable and semantically named.
- Never use an icon alone when its meaning is ambiguous; provide accessible name and, where needed, visible label.

---

## 10. Typography system

### 10.1 Roles

- Display: world identity, monumental titles, chapter/cover headlines.
- Heading: route and section hierarchy.
- Body: long-form reading and controls.
- Label: metadata, navigation, concise descriptors.
- Numeric/technical: real coordinates, timestamps, IDs, measurements.

### 10.2 Rules

- Bundle licensed font assets when the accepted design calls for a specific font; never rely on the visitor having it installed.
- Use font-display strategy that avoids invisible text.
- Define fallback stacks and metrics-compatible alternatives.
- Avoid font synthesis for expressive display faces where possible.
- Keep long-form reading comfortable; expressive fonts belong in headings, not every paragraph.
- Numeric typography must support tabular alignment when data comparison needs it.
- Ensure all font files have provenance/license records.
- Test layout shifts and wrapping at narrow widths.

### 10.3 Approved Imperium direction

Cormorant Garamond / Inter / Cascadia Code are the accepted Imperium direction. Current registry does not yet implement that exact bundled stack. Other DNA retain their own typographic identity; do not apply Imperium fonts globally.

---

## 11. Accessibility and responsive behavior

### 11.1 Accessibility

- Semantic HTML first.
- Every control has an accessible name, role, and state.
- Visible focus indicator with sufficient contrast.
- Full keyboard access, including Escape and focus restoration for dialogs/overlays.
- Form errors linked to fields and announced.
- Status messages announced appropriately without excessive live-region noise.
- Meaning never conveyed by color alone.
- Text contrast meets WCAG AA.
- Decorative images and SVG are hidden from assistive technology; meaningful imagery has concise alt text.
- Reduced-motion preference disables non-essential animation.
- Sound is off by default and never required to understand state.
- Touch targets are comfortably operable; do not rely on hover.

### 11.2 Responsive scene design

Do not merely shrink desktop. Redesign composition per breakpoint:
- **Wide desktop:** broad negative space, full scene depth, complex spatial navigation where justified.
- **Laptop:** preserve primary focal point, simplify distant decoration, constrain content width.
- **Tablet:** reduce scene layers, simplify navigation, keep the active object prominent.
- **Mobile:** prioritize task and content; convert spatial maps into accessible list/step alternatives when needed; disable costly parallax; avoid text over busy art.

Every signature composition must have a deliberate mobile layout.

---

## 12. Sound and sensory behavior

- Sound is optional, user-initiated, and off by default.
- Provide a visible toggle and respect browser autoplay restrictions.
- Sound effects should communicate an interaction, not decorate every click.
- Provide mute/pause and do not restart sound unexpectedly after route changes.
- Never use copyrighted music or sound without permission.
- Ensure all information is available without sound.

---

## 13. Skin Laboratory — parity and art-direction proof

The Skin Laboratory at Headquarter `/skin-lab` is the canonical comparison environment.

It must compare the same content and task across all six DNA, including:
1. hero / establishing scene;
2. primary and secondary action;
3. navigation;
4. content composition and data section;
5. form and validation;
6. dialog/overlay;
7. loading, empty, error, offline, and success states;
8. narrow-screen behavior;
9. keyboard/focus and reduced-motion;
10. real emblem/wordmark and signature art.

The shared generic `MW` mark is not sufficient to validate six independent identities. The lab must show the correct brand identity per world.

Parity means same task and semantic outcome, not identical appearance. Every DNA should feel unmistakably different without losing usability.

---

## 14. Asset and visual verification pipeline

### 14.1 Required visual matrix

For every app root skin and each scoped DNA:
- desktop wide (1440px+);
- laptop (1280px);
- tablet portrait and landscape;
- mobile narrow (360px) and common modern mobile widths;
- light/dark only where that DNA explicitly supports both;
- reduced motion;
- artwork blocked/failed;
- slow network / loading state;
- empty and error states;
- keyboard-only path.

### 14.2 Evidence

Keep screenshots and reports in a predictable test/evidence location, not as undocumented source clutter. Each evidence record includes:
- commit SHA;
- route;
- viewport;
- browser;
- device class;
- skin/DNA;
- motion preference;
- asset versions;
- test result and known limitations.

### 14.3 Automated checks

- All skin IDs resolve to a complete token set.
- Contrast tests cover semantic foreground/background and action pairs.
- No app-level private component class targeting.
- No duplicate accidental emblems.
- Every registered hero path resolves in its declared owner apps.
- Asset dimensions, format, transparency, and size stay within class budgets.
- Every route state exists.
- Keyboard and reduced-motion behavior are tested.
- Skin Laboratory comparison uses real identity assets.
- App builds and typechecks are reported separately.

---

## 15. Current gap register and priority

| ID | Priority | Workstream | Definition of done |
|---|---|---|---|
| UI-001 | P1 | Brand identity correction | Unique approved emblem and lockups per brand; duplicate regression test |
| UI-002 | P1 | Typography assets | Licensed fonts, self-hosted loading, fallbacks, token integration, layout/contrast verified |
| UI-003 | P1 | Asset catalogue | Manifest, provenance, cover families, spatial maps, OG and app icon variants |
| UI-004 | P1 | Six signature compositions | At least one high-quality task composition per DNA, plus loading/error/mobile/reduced-motion variants |
| UI-005 | P1 | Accepted palette reconciliation | Imperium palette/type migration or explicit superseding ADR; all six skins pass contrast |
| UI-006 | P2 | Skin Laboratory identity | Correct emblem/wordmark and unique world composition for each skin |
| UI-007 | P2 | Temporary files cleanup | No transient renderer/quantizer artifacts in package root; tooling is reproducible |
| UI-008 | P2 | Workflow-backed primitives | Implement only required Switch, RadioGroup, Tabs, Tooltip, Popover, Menu, Progress, etc. with tests |
| UI-009 | P3 | Legacy export cleanup | Consumer audit, deprecation path, no broken imports |

### Suggested execution order

1. Re-audit current `dev` and capture a baseline.
2. Fix brand identity and duplicate asset defects.
3. Resolve accepted palette and font drift.
4. Define manifest, cover templates, spatial asset contracts, and provenance.
5. Build one signature composition per DNA and improve Skin Laboratory.
6. Expand interaction primitives based on actual application workflows.
7. Clean temporary/legacy files.
8. Run visual certification across all apps and route states.
9. Update root documentation and decision records only when evidence supports it.

---

## 16. Acceptance criteria — final quality bar

A package release is not visually complete until:

### Creative
- [ ] Six DNA are unmistakable without relying only on color.
- [ ] Each world has a unique emblem/wordmark system and signature composition.
- [ ] Imperium Lumen follows the accepted monumental architecture direction and approved palette/type target, or a superseding decision is recorded.
- [ ] No generic dashboard/card-wall composition dominates.
- [ ] No depiction of ALLAH; cosmic/sacred artwork contains no faces.
- [ ] No fake telemetry, false astronomy, fake progress, or meaningless network activity.

### Technical
- [ ] One token source; apps do not define parallel design variables.
- [ ] Components and blocks are exported through stable public entrypoints.
- [ ] Native-first interaction semantics and keyboard behavior work.
- [ ] All route states have honest UI.
- [ ] Asset manifest and provenance are complete.
- [ ] Font files and image assets have documented license/provenance.
- [ ] Duplicate brand artwork is caught by tests.
- [ ] 3D/video is optional, lazy, device-aware, and has a fallback.

### Visual
- [ ] Desktop, laptop, tablet, and mobile screenshots are reviewed.
- [ ] Materials, light direction, scale, and perspective are coherent.
- [ ] Typography remains crisp and readable over all art.
- [ ] Motion is purposeful, interruptible, and reduced-motion safe.
- [ ] No unnecessary glow, blur, particle spam, or perpetual motion.
- [ ] Worldstage still works when media fails or effects are paused.

### Performance and accessibility
- [ ] LCP, CLS, INP and asset transfer are measured on representative routes.
- [ ] Stable interaction frame pacing is verified on target hardware.
- [ ] WCAG AA contrast, keyboard navigation, focus, and screen-reader names pass.
- [ ] No essential content is trapped in canvas or imagery.
- [ ] Sound is opt-in and never required.

### Delivery
- [ ] `pnpm ui:test`, `pnpm ui:contrast`, `pnpm lint:arch`, `pnpm lint`, and `pnpm typecheck` pass.
- [ ] Every consuming app build passes.
- [ ] Skin Laboratory visual parity is reviewed and recorded.
- [ ] Documentation and implementation status agree with the actual commit.

---

## 17. Non-goals and anti-patterns

Do not:
- build six separate component libraries;
- make every section a card;
- use the same hero and page grid for all six worlds;
- apply a universal gold/blue/purple glow treatment;
- add random stars, particles, scanlines, coordinates, meters, or charts;
- invent live data to make a page look active;
- use 3D just to claim a game-like interface;
- bake text or controls into images;
- ship huge 4K art to mobile unnecessarily;
- import icon libraries directly in apps;
- define app-local theme tokens or target private component CSS;
- copy copyrighted games, manga, albums, films, logos, or posters;
- depict ALLAH or imply that an artwork represents ALLAH;
- claim a mockup or generated image is implemented UI;
- mark visual verification complete without rendered evidence.

---

## 18. Change control

- Work on `dev`; do not create branches under the current repository policy.
- Inspect source, consumers, tests, and current CI before changes.
- Record architecture changes in `DECISIONS.md` when they alter accepted boundaries.
- Update this blueprint and README when approved scope changes.
- Keep product vision, implementation, testing, and visual verification as separate statuses.
- Preserve previous narrative and asset provenance; no destructive cleanup without a documented reason.
- A new component, asset family, or rendering technology must solve a real user task and justify its maintenance/performance cost.

**North star:** the user should feel they have entered a distinct, beautifully authored world — but every action remains obvious, every fact remains honest, and the experience remains fast, accessible, and dependable.
