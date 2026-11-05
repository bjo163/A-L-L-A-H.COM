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


---

# PART II — THE MOON UI CREATIVE INTERFACE ENGINE

## 19. Expanded mission: from component library to creative engine

Moon UI is the **Creative Interface Engine** for A-L-L-A-H.COM and the MoonWitness ecosystem. It is responsible for the complete visual language and production system through which applications become recognizable worlds.

It must provide more than reusable React components. It must provide:
1. a semantic visual grammar;
2. six world-specific art directions;
3. a complete atomic-to-composition hierarchy;
4. identity, logo, icon and vector systems;
5. artwork, cover, avatar and media production contracts;
6. skin, token, material and typography systems;
7. motion, effect and transition systems;
8. loading, progress, feedback and state experiences;
9. original sound-effect language;
10. asset registry, provenance and delivery pipeline;
11. generators and preview laboratories;
12. automated and human visual certification.

The engine is complete only when an application can compose a distinctive world from shared foundations without inventing a parallel component, palette, asset convention, motion system, or identity language.

## 20. Moon UI architecture: the complete hierarchy

The architecture is a layered production grammar. A higher layer composes lower layers; it must not bypass their contracts.

```
WORLD / APP EXPERIENCE
  ├── World composition and page scene
  │     ├── Blocks and templates
  │     │     ├── Components and media objects
  │     │     │     ├── Atoms
  │     │     │     ├── Primitives
  │     │     │     └── Raw layout
  │     ├── Skin recipe and semantic tokens
  │     ├── Artwork / brand / icon / vector assets
  │     ├── Motion / effects / transitions
  │     ├── SFX / sensory behavior
  │     └── Loading / empty / error / offline / success states
  └── Data and domain state supplied by the application
```

### 20.1 The package domains

| Domain | Responsibility | Output |
|---|---|---|
| `atoms` | Smallest semantic visual units | typography roles, marks, dividers, indices, status |
| `raw` | Layout-only structure | stack, cluster, grid, container, flow |
| `primitives` | Interaction and runtime mechanics | focus, portal, overlay, selection, motion |
| `components` | Accessible reusable controls and objects | inputs, buttons, menus, media, data controls |
| `blocks` | Reusable task-level sections | hero, route shell, inspector, timeline, state panels |
| `compositions` | Signature multi-block world scenes | gate, orbit, filmstrip, instrument bay, poster wall, network |
| `templates` | Complete repeatable page archetypes | archive detail, chapter reader, world entry, operator workspace |
| `skins` | Six complete world grammars | tokens, identity, type, shape, materials, motion, SFX |
| `effects` | Visual atmosphere and scene effects | depth, grain, light, parallax, reveal |
| `motion` | Named transition and choreography contracts | enter, focus, settle, route transition |
| `sfx` | Original interface audio | interaction and ambient cues |
| `assets` | Asset metadata, lookup and resolution | typed manifest, variants, fallbacks |
| `foundry` | Asset production tools and specifications | avatar, logo, icon, cover, artwork generators |
| `lab` | Preview, compare and certify | Skin Laboratory, asset preview, motion/sound test |
| `tokens` | Single design-value authority | semantic and DNA token exports |

The existing package may keep its current physical directory names where they already satisfy architecture. New directories must not be created simply to make the tree look comprehensive. Introduce a new module only with clear ownership and public API.

## 21. Atomic design and component universe

### 21.1 Atom family

Atoms are the smallest reusable visual and semantic units. They are not miniature branded widgets.

**Typography atoms**
- DisplayText, Heading, BodyText, Label, Caption, Eyebrow, Kicker, Overline, MonoText, NumericText, InlineCode, QuoteMark, DropCap.
- Text roles define semantic purpose, not arbitrary font-size aliases.
- Display and narrative roles may vary by DNA; body readability and semantic hierarchy remain stable.

**Signal and metadata atoms**
- StatusMark, SignalDot, IndexMark, SequenceNumber, Counter, Timestamp, SourceNote, MetadataPair, RankMark, DataValue, UnitLabel.
- Only real states/data may be represented as live indicators.

**Line and frame atoms**
- Hairline, Divider, Rule, Frame, CornerMark, Bracket, Notch, Rail, Track, AxisLine, ConnectorLine, OrbitArc, PathSegment, PanelGutter, RegistrationMark.
- Line geometry has a tokenized stroke scale, cap, join, dash, opacity and semantic role.

**Surface atoms**
- Surface, InsetSurface, RaisedSurface, EdgeLight, TextureLayer, MaterialPlate, BackdropPlane.
- Surface is a material primitive, not a mandate to put every item inside a card.

**Identity atoms**
- EmblemMark, Wordmark, BrandLockup, AvatarFrame, IconFrame, RoleSigil, Monogram.
- Identity assets must resolve through the brand registry, not arbitrary text glyphs.

**State atoms**
- FocusRing, SelectionMark, ActiveRail, ProgressSegment, LoadingMark, ValidationMark, EmptyGlyph.
- State atoms must have accessible text or a semantic parent.

### 21.2 Raw layout primitives

The raw layer is deliberately brand-neutral:
- RawContainer, RawSection, RawStack, RawCluster, RawGrid;
- RawInline, RawFlow, RawColumns, RawMasonry (only if deterministic and accessible);
- RawCenter, RawBleed, RawAspect, RawSpacer, RawDivider;
- RawViewport, RawScrollRegion, RawStickyRegion, RawSplitPane.

Raw primitives own layout and responsive mechanics only. They must not import skin-specific artwork, brand marks, domain state, or business data.

### 21.3 Interaction primitives

Native-first behavior primitives:
- FocusScope and FocusReturn;
- PortalRoot and LayerManager;
- DismissableLayer;
- RovingFocus;
- SelectionGroup;
- Pressable and ToggleState;
- ScrollLock;
- ReducedMotion;
- MotionPreference;
- Presence;
- ResizeObserver adapter;
- VisuallyHidden;
- Announcer / LiveRegion;
- OutsideInteraction;
- KeyboardShortcut;
- PointerIntent.

Use native browser semantics first. Add a dependency only when a documented accessibility or interaction requirement cannot be reliably met with platform primitives. Every primitive requires keyboard, touch, screen-reader and cleanup tests.

### 21.4 Complete component taxonomy

This is the long-term component universe. It is intentionally broad, but implementation priority is driven by real application workflows.

**Actions and navigation**
- Button, IconButton, Link, LinkButton, ButtonGroup, SplitButton, ToggleButton, MenuButton, BackButton, Breadcrumb, Pagination, Tabs, NavigationRail, NavigationList, WorldSwitcher, CommandPalette.

**Text and form controls**
- Input, Textarea, SearchField, Select, Combobox, Autocomplete, Checkbox, CheckboxGroup, Radio, RadioGroup, Switch, Toggle, Slider, RangeSlider, NumberField, PinInput, DatePicker, TimePicker, DateRangePicker, FileUpload, Dropzone, FormField, Fieldset, FormMessage.

**Menus and disclosure**
- Menu, DropdownMenu, ContextMenu, Menubar, Accordion, Collapsible, Tooltip, Popover, HoverCard, Disclosure, Sheet, Drawer, Dialog, AlertDialog, Modal, CommandSurface.

**Feedback and status**
- Badge, StatusBadge, StatusMark, Progress, ProgressRing, Meter, Spinner, Skeleton, Toast, ToastRegion, NotificationItem, NotificationCenter, InlineAlert, Banner, EmptyState, ErrorState, OfflineState, PermissionState, SuccessState.

**Data and information**
- Table, DataTable, DataList, DescriptionList, KeyValue, Stat, Metric, Timeline, ActivityFeed, Tree, TreeItem, Listbox, VirtualList, LogStream, CodeBlock, DiffView, CopyButton, DataInspector.

**Media and identity**
- Avatar, AvatarGroup, AvatarStack, AvatarFrame, ProfileIdentity, Emblem, Logo, BrandLockup, Icon, IconButton, Image, ImageFrame, Artwork, Cover, MediaStage, VideoPoster, AudioControl, SoundToggle.

**Spatial and visual**
- WorldMap, UniverseAtlas, OrbitMap, NodeGraph, RelationshipGraph, Pathway, SceneMarker, FocusReticle, Viewport, MiniMap, SpatialSelector, InstrumentPanel, ScopeFrame, Filmstrip, Poster, ComicPanel, PrintSpread, OrganicNode.

**Utility**
- Separator, ScrollArea, Scrollbar, Portal, VisuallyHidden, AspectRatio, Resizer, Splitter, DisclosureTrigger, Anchor, FocusBoundary, ErrorBoundary.

Do not implement duplicate components with different names. Prefer variants only when semantics are identical; use distinct components when keyboard or accessibility contracts differ.

### 21.5 Component definition of done

Every public component must specify:
- semantic HTML element and accessible role;
- required/optional props and controlled/uncontrolled behavior;
- keyboard interaction and focus management;
- touch/pointer interaction;
- state matrix and validation behavior;
- responsive behavior;
- all six skin recipes or an explicit skin exclusion;
- reduced-motion and sound behavior if relevant;
- test coverage and visual fixture;
- package export and API documentation;
- consumer migration note when changing a public contract.

## 22. Blocks, compositions and templates

### 22.1 Shared task blocks

- PageFrame, RouteShell, AppHeader, EcosystemNavbar, NavigationConstellation;
- PageHero, CinematicHero, Kicker, SectionHeading, ContentRail, EditorialSpread;
- DestinationCard, DestinationGrid, DestinationField, WorldSwitcher;
- SearchSurface, FilterWorkbench, SortBar, CommandSurface;
- DetailInspector, MetadataPanel, KeyValuePanel, ActivityTimeline;
- StatePanel, StatusMessage, EmptyStateScene, ErrorScene, OfflineScene, PermissionScene, SuccessScene;
- LoadingWorld, TransitionCurtain, SceneBoundary, MediaStage;
- ToolRegistry, ToolDetailPanel, ToolParameterField;
- SkinLaboratory, AssetLaboratory, MotionLaboratory, SoundLaboratory.

### 22.2 World compositions

**IMPERIUM LUMEN**
- MonumentalGate, GrandAxis, ThresholdPassage, HallOfPaths, InscribedRecord, HorizonStage, ArchitecturalDestinationField.
- Composition should express vast scale, measured order, axial geometry and controlled antique-gold light.

**LUNAR CHRONICLES**
- OrbitalNavigation, LunarTimeline, CelestialArchive, ObservationChamber, UniverseAtlas, PhaseLedger, ConstellationIndex.
- Astronomy must use sourced values; symbolic narrative is clearly differentiated from observation.

**ROCKSOUL**
- ChapterCover, Filmstrip, StoryTimeline, TransmissionPoster, TrackSleeve, QuietFrame, NarrativeReader, ChapterEndCard.
- Keep the silent storyteller canon; human figures are back-facing where appropriate; no copied album/film artwork.

**NEXUS PARADOX**
- SpatialSelector, InstrumentBay, SensorScope, SystemTopology, CommandRail, CalibrationScene, SignalInspector, OperationTimeline.
- No invented telemetry, coordinates, activity, or instrument readouts.

**RIOT ANARCHY**
- ComicSpread, PosterWall, StickerLayer, KineticHeadline, IssueIndex, XeroxArchive, PanelNavigator, PrintCaption.
- Controlled visual disorder with a clear reading order and accessible panel navigation.

**MYCELIUM**
- LivingNetwork, OrganicNodeMap, GrowthPath, RelationshipGraph, MembraneDetail, EcosystemPulse, BranchInspector, RootNavigator.
- Every connection represents real data or is explicitly labeled illustrative.

### 22.3 Templates

Templates are page-level archetypes assembled from blocks and compositions:
- WorldEntranceTemplate;
- DestinationExplorerTemplate;
- ArchiveIndexTemplate and ArchiveDetailTemplate;
- ChapterIndexTemplate and ChapterReaderTemplate;
- TransmissionIndexTemplate and TransmissionDetailTemplate;
- InstrumentWorkspaceTemplate;
- NetworkExplorerTemplate;
- ProfileIdentityTemplate;
- SettingsWorkbenchTemplate;
- SearchResultsTemplate;
- Empty/Error/Offline/Permission templates.

A template is not a route and must not fetch application data. Apps supply content, state, permissions and actions.

## 23. The six skin systems — full contract

A skin is a complete world definition, not a palette switch. Each registry entry must eventually provide:

1. stable skin ID, display name, world narrative and canonical app usage;
2. emblem, wordmark and identity asset references;
3. semantic colors: canvas, surface, elevated, text, muted, border, focus, accent, success, warning, danger, info;
4. typography roles: display, heading, body, label, mono, numeric;
5. spacing, density, sizing, radius, border and stroke scales;
6. shape language and geometry primitives;
7. material recipes and shadow/elevation model;
8. component variants and interaction state recipes;
9. block and signature composition recipes;
10. motion durations, easing, transition and ambient policy;
11. effects allowlist and performance tier;
12. SFX profile, volume policy and opt-in behavior;
13. hero, cover, artwork and loading scene references;
14. responsive adaptations and reduced-motion fallback;
15. explicit exclusions and anti-patterns.

### 23.1 World identity matrix

| DNA | Geometry | Signature material | Line language | Motion | Sound character |
|---|---|---|---|---|---|
| Imperium Lumen | monumental, axial, portal geometry | ivory stone, obsidian, antique metal | architectural axes, measured seams | threshold reveal, slow focus | restrained tonal arrival, soft confirmation |
| Lunar Chronicles | orbital, circular, precise | lunar glass, silver, deep slate | orbit arcs, phase ticks | orbit focus, constellation trace | delicate signal, quiet observation |
| ROCKSOUL | cinematic frame, editorial cuts | paper, charcoal, wet reflective surfaces | film marks, chapter rules | cut, dissolve, film advance | tactile click, muted cinematic cue |
| Nexus Paradox | instrument planes, clipped geometry | graphite, technical glass, signal surfaces | rails, calibration ticks, traces | focus, calibrate, resolve | precise short electronic cues |
| Riot Anarchy | asymmetry, collage, torn panels | ink, paper, xerox texture | registration offsets, panel gutters | hard cut, stamp, offset | dry print/stamp-like cues |
| Mycelium | branching, biomorphic, membrane forms | organic translucent layers, mineral surfaces | roots, filaments, growth paths | connection and growth | soft organic tonal cue |

The sound character is a creative target, not permission to imitate a known game's signature sound.

### 23.2 Skin parity contract

The same task has the same semantics and outcome in all six skins. Its appearance, composition, density, navigation metaphor and motion may differ. Skin Laboratory must prove that difference using real world identities, not a generic mark.

## 24. MoonWitness Avatar Studio

Avatar Studio is a first-class identity creation capability. It should support both user-selected imagery and original generated artwork while respecting identity, consent and canon.

### 24.1 Avatar families
- Portrait: stylized, illustrated, photo-derived only with user permission.
- Silhouette: anonymous, back-facing, low-detail identity.
- Sigil: abstract personal mark, non-human symbol or geometric identity.
- Role avatar: community/crew/team role without impersonating a real person.
- World frame: skin-specific border, material, badge and crop treatment.
- Group identity: stacked avatars or shared emblem with accessible participant list.

### 24.2 Generator inputs and outputs

Input schema (conceptual):
- avatar family;
- target skin/world;
- visual style and material;
- palette role;
- silhouette/crop and focal point;
- optional user-provided reference image;
- content safety constraints;
- output sizes and transparent-background requirement;
- provenance and consent record.

Output package:
- high-resolution master;
- 1024, 512, 256, 128 and 64 pixel variants as appropriate;
- square and circular-safe crops;
- transparent PNG/WebP where required;
- metadata and alt text;
- stable asset ID, checksum, generation/edit history and approval state.

### 24.3 Safety and identity
- Never create or imply an avatar representing ALLAH, a prophet, or a sacred being.
- Never claim a generated avatar is a verified photograph or real identity.
- User-provided likeness is processed only for the user's requested purpose and consent.
- Provide initials/emblem fallback and a way to replace or remove the avatar in the consuming application.
- Generation happens in an explicit creation workflow, never automatically during profile rendering.

## 25. Brand, logo, icon and vector foundry

### 25.1 Brand architecture

Build identity families for:
- parent ecosystem brand;
- each of the six DNA worlds;
- each application/product where a distinct product identity is approved;
- MoonWitness universe and its narrative sub-series where canonical.

Each identity family must contain:
- primary emblem;
- primary wordmark;
- horizontal and stacked lockups;
- compact mark and small-size mark;
- monochrome positive and inverse;
- light/dark safe versions;
- favicon and maskable app icon;
- social/avatar crop;
- clear-space, minimum size and placement rules;
- source master and export variants.

No emblem may be copied across unrelated worlds as a placeholder. A shared parent endorsement is allowed only when explicitly designed as a lockup.

### 25.2 Icon families

- Action icons: edit, delete, open, close, search, filter, sort, copy, share, save, refresh, back, forward.
- Navigation icons: world, gate, archive, chapter, instrument, network, settings, profile.
- Status icons: success, warning, danger, info, offline, loading, locked, verified, pending.
- Data icons: date, time, location, source, attachment, activity, signal.
- DNA sigils: bespoke marks that identify a world but do not replace semantic action icons.

All icons must have stable names, viewBox, stroke/fill policy, baseline alignment, size scale, accessible treatment and render tests. Third-party icon packages remain encapsulated inside the shared Icon component.

### 25.3 Vector language

Vector primitives include:
- portal and architectural geometry;
- orbital arcs, rings and phase marks;
- film frames, perforations and cut marks;
- instrument rails, scope reticles and signal traces;
- collage shapes, panel borders and print-registration marks;
- organic roots, branches, membranes and node links.

Vector scenes must be responsive, performant, keyboard-independent where decorative, and have static or semantic alternatives where interactive. Avoid unbounded filters, giant path counts and embedded raster blobs.

## 26. Artwork, media and cover foundry

### 26.1 Asset families

1. World hero and establishing scene.
2. World identity cover.
3. App hero and route scene.
4. MoonWitness universe/observatory atlas.
5. ROCKSOUL chapter and episode cover.
6. Transmission and message poster.
7. Lunar archive and observation plate.
8. Nexus system/instrument scene.
9. Riot issue, poster, comic and xerox plate.
10. Mycelium organism, graph and growth scene.
11. User/community avatar and identity media.
12. Loading, arrival and transition artwork.
13. Social/Open Graph and application icon.
14. Material texture, decal, border and overlay assets.

### 26.2 Artwork brief contract

Every production brief records:
- asset ID, world, application and intended route;
- narrative purpose and focal subject;
- camera/framing, lens language, perspective and scale;
- composition layers and negative space;
- lighting direction, color grade and material response;
- DNA exclusions and sensitive-content constraints;
- aspect ratios and crop-safe zones;
- output resolution and delivery formats;
- title-safe and UI-safe regions;
- source/provenance/license and approval owner;
- alt text or decorative classification;
- fallback and responsive derivatives.

### 26.3 Resolution policy

- Master output: target 2560px or 3840px long edge only where detail and intended display justify it.
- Responsive derivatives: generate real crops/resizes; do not rely on browser upscaling.
- 4K is a source/delivery option, not a blanket requirement.
- AVIF/WebP for photographic/painted art; SVG for clean vector work; PNG only when lossless alpha or compatibility requires it.
- Do not bake dynamic labels, dates, counters or controls into artwork.
- Keep image decode, memory and transfer budgets measured on target devices.

## 27. Lines, geometry and graphic grammar

Lines are a first-class art-direction system. They include more than separators:
- semantic divider and grouping rule;
- editorial baseline and column rule;
- architectural axis and threshold seam;
- orbital ring, trajectory and ephemeris tick;
- film perforation, frame boundary and edit marker;
- technical rail, calibration tick, scope grid and signal path;
- collage edge, print registration and comic gutter;
- organic branch, root, filament and growth path.

Every line primitive defines stroke width, cap, join, dash, opacity, scaling, responsive behavior, animation policy and accessibility. Motion on lines must indicate progress, traversal or connection—not imply activity when none exists.

## 28. Effects and motion engine

### 28.1 Effect catalogue
- AtmosphereField;
- DepthField;
- ParallaxField;
- LightSweep;
- EdgeLight;
- ReflectionPass;
- GrainLayer;
- HalftoneLayer;
- ChromaticOffset;
- ScanTrace;
- RevealMask;
- FocusBloom (strictly limited);
- ParticleField (rare, sparse, pausable);
- PortalTransition;
- OrbitTransition;
- FilmCutTransition;
- CalibrationTransition;
- PrintStampTransition;
- GrowthTransition.

Effects are named, composable and scoped. Each declares skin allowlist, intensity, performance tier, reduced-motion fallback and pause behavior.

### 28.2 Motion primitives
- MotionFrame, Presence, MotionGroup, Stagger, SharedElementTransition;
- Enter, Exit, Reveal, FocusShift, SelectionTravel, SceneTransition;
- ScrollReveal only when it does not impair reading or navigation;
- spring/physics behavior only when it improves tactile feedback and remains interruptible.

### 28.3 Motion governance
- User input must never wait for decorative animation.
- No continuous high-cost blur or backdrop-filter animation.
- No random movement or unbounded particle systems.
- Honor prefers-reduced-motion; manual ambient toggle cannot override it.
- Test route interruption, back navigation, focus retention and low-power mode.

## 29. Loading, waiting, progress and transition system

Loading is a family of distinct experiences, not one spinner reused everywhere.

| Pattern | Use | Visual identity |
|---|---|---|
| WorldArrival | First entry to a world | world-specific scene reveal |
| PassageLoader | Route transition | threshold/curtain/cut transition |
| OrbitLoader | Lunar archive or observation load | orbital progress motif |
| FilmAdvanceLoader | ROCKSOUL chapter sequence | film-frame advance |
| CalibrationLoader | Nexus instrument initialization | measured calibration sequence |
| PrintRevealLoader | Riot content reveal | panel/print registration |
| GrowthLoader | Mycelium relationship resolution | branching growth |
| Spinner | Small indeterminate operation | compact accessible motion mark |
| Skeleton | Known content layout is loading | shape-matched placeholder |
| Progress / ProgressRing | Measurable determinate work | actual percentage/value |
| StreamIndicator | Incremental content arrival | subtle live status |
| OfflineScene | Network unavailable | explicit offline and retry actions |

Rules:
- Never fabricate progress.
- Never hold a user behind a cinematic intro when the task can be used immediately.
- Provide timeout, cancel, retry or fallback where the operation supports it.
- Announce meaningful loading state accessibly.
- Spinner has an accessible label and respects reduced motion.
- Skeletons must match the final content geometry and avoid excessive shimmer.
- WorldArrival is skippable and does not repeat on every internal navigation.

## 30. Moon UI Sound and SFX foundry

### 30.1 Sound taxonomy
- Focus: optional focus/hover cue.
- Action: select, confirm, cancel, open, close.
- Navigation: enter, exit, transition.
- State: success, warning, error, unavailable.
- Narrative: transmission arrival, archive unlock, chapter advance.
- Ambient: optional world atmosphere, disabled by default.

### 30.2 SFX metadata contract

Every sound records:
- stable sound ID and semantic event;
- skin/world profile;
- source asset and format;
- duration and loudness target;
- loop/one-shot behavior;
- volume ceiling and mix group;
- mute and preference behavior;
- provenance/license;
- fallback/no-audio behavior;
- accessibility note.

No copyrighted soundtrack, copied game UI sound, or recognizable imitation of a proprietary signature. Sound is off by default, never autoplayed, never the only way to communicate state, and must be stoppable immediately.

## 31. Asset registry, generator and foundry workflow

### 31.1 Typed asset classes
- brand, logo, emblem, icon, sigil;
- avatar, profile, group identity;
- hero, world scene, cover, chapter, transmission, archive plate;
- texture, material, decal, frame, border, overlay;
- vector scene, map, graph, diagram;
- motion, video poster, animation;
- sound effect and ambient loop;
- loading, empty, error, offline and success illustration.

### 31.2 Registry metadata
Every asset has:
- immutable asset ID and version;
- world/DNA and application ownership;
- class, format, MIME type, dimensions, aspect ratio and file size;
- source master and generated variants;
- crop/focal point and safe areas;
- alt text/decorative flag;
- creator, provenance, license and attribution;
- creation/modification timestamps;
- approval and review status;
- consuming routes and component references;
- checksum and fallback.

### 31.3 Generator contracts
A generator is a repeatable authoring workflow, not a magic runtime dependency. Provide:
- LogoFoundry;
- IconFoundry;
- VectorSceneFoundry;
- AvatarStudio;
- ArtworkStudio;
- CoverStudio;
- SkinComposer;
- TokenInspector;
- MotionStudio;
- SFXStudio;
- LoadingSceneStudio;
- AssetInspector.

Each generator has a preview, explicit input contract, constraints, output specification, provenance record, approval step, and export validation. Generative AI may create source candidates; deterministic package code validates, transforms and serves approved outputs. Do not generate artwork on every page render.

## 32. Skin Laboratory and Creative Foundry

The current Skin Laboratory should evolve into a unified **Creative Foundry** with dedicated workbenches:

1. **Skin Lab:** compare all six worlds on the same task and states.
2. **Component Lab:** inspect every component variant, state and keyboard path.
3. **Atom Lab:** typography, lines, geometry, surfaces and signal marks.
4. **Brand Lab:** emblem, logo lockup, favicon and app icon previews.
5. **Icon Lab:** semantic icon families, sizes, strokes and contrast.
6. **Avatar Lab:** avatar families, crops, frames, safety and output variants.
7. **Artwork Lab:** hero, cover, chapter, transmission and spatial artwork.
8. **Motion Lab:** transitions, timing, interruption and reduced-motion.
9. **Effects Lab:** depth, atmosphere, grain, parallax and device tiers.
10. **Sound Lab:** SFX audition, mute, volume, duration and licensing.
11. **Loading Lab:** world arrival, spinner, skeleton, progress and offline.
12. **Asset Lab:** metadata, provenance, missing files, variants and duplicates.

The Foundry is a development/design tool. It must not expose unapproved generator controls or internal asset management to public users by accident.

## 33. Package organization target

Preserve current public entrypoints and evolve toward this conceptual structure:

```
packages/ui/
  src/
    atoms/
    raw/
    primitives/
    components/
    blocks/
    compositions/
    templates/
    skins/
    tokens/
    assets/
      manifest/
      resolvers/
      validators/
    brand/
      emblems/
      wordmarks/
      lockups/
    icons/
      semantic/
      worlds/
    vectors/
      geometry/
      scenes/
      lines/
    avatar/
      contracts/
      frames/
      fallbacks/
    artwork/
      contracts/
      covers/
      scenes/
    effects/
    motion/
    loading/
    sfx/
    foundry/
    lab/
    lib/
    theme.css
    skins.css
  test/
    unit/
    contract/
    accessibility/
    assets/
    visual/
    performance/
  README.md
  BLUEPRINT.md
```

This is a target vocabulary, not an instruction to move every current file immediately. Avoid disruptive mass relocation. Keep compatibility exports, migrate incrementally, and update import paths only with consumer tests.

## 34. Naming, API and versioning rules

- Public component names are PascalCase; hooks begin with `use`; CSS/data slots are stable and namespaced.
- Asset IDs are stable, descriptive and independent of file paths.
- Skin IDs remain the six canonical kebab-case IDs.
- Generator outputs are immutable versions; never silently overwrite a released identity asset.
- Public exports are explicit; no deep imports into private implementation paths.
- Props are semantic and typed; avoid boolean-prop explosions and arbitrary style escape hatches.
- Use variants for meaningful presentation options, not for arbitrary one-off styling.
- Breaking API changes require a migration note and consumer verification.
- Keep runtime asset manifests deterministic and free of filesystem discovery at request time.

## 35. Expanded implementation roadmap

### Wave 0 — Audit and freeze contracts
- Reconfirm source inventory, exports, consumer imports, DNA assignments and current CI.
- Approve the expanded taxonomy and mark each item implemented/proposed.
- Define asset IDs, manifest schema, generator boundaries and ownership.
- Resolve current duplicate emblem, font, palette and temporary-file defects.

### Wave 1 — Identity and visual atoms
- Complete six world identity systems and application lockups.
- Build icon/sigil library and vector line grammar.
- Implement typography, metadata, status, frame, divider, marker and focus atoms.
- Build Brand Lab and Atom Lab.

### Wave 2 — Core interaction components
- Complete action, form, navigation, disclosure, feedback and data primitives.
- Establish keyboard, screen-reader, touch, reduced-motion and state parity.
- Build Component Lab and public API docs.

### Wave 3 — Blocks and six world compositions
- Complete shared task blocks and state scenes.
- Build at least two high-value signature compositions per world.
- Build responsive templates and route-state fixtures.
- Certify all six worlds in Skin Lab.

### Wave 4 — Asset and generator foundries
- Ship asset manifest, resolver, provenance, licensing and variant pipeline.
- Build Logo, Icon, Vector, Avatar, Artwork and Cover Foundries.
- Produce real hero, cover, chapter, transmission, archive and spatial map families.
- Establish human approval and regeneration workflow.

### Wave 5 — Motion, effects, loading and sound
- Ship named motion/effect contracts and device-aware tiers.
- Build seven world-specific loading/arrival identities plus generic spinner/skeleton/progress.
- Build SFX taxonomy, original library and Sound Lab.
- Verify reduced-motion, no-audio and low-power fallbacks.

### Wave 6 — Certification and adoption
- Migrate applications to package-only visual primitives.
- Remove duplicate app-local visual systems and accidental duplicate assets.
- Capture desktop/tablet/mobile and reduced-motion screenshots.
- Run accessibility, performance, asset, contrast, app-build and documentation gates.
- Publish a truthful completion matrix and changelog.

## 36. Definition of complete — Creative Interface Engine

Moon UI is considered complete only when all of the following are true:

**Identity**
- Six independent world identities have emblem, wordmark, lockups, app icons and social variants.
- No accidental duplicate identity asset exists.
- Every app has an approved brand-to-DNA mapping.

**Atoms and controls**
- Atomic typography, line, geometry, metadata, status and identity vocabulary is implemented.
- Required interaction components are accessible and tested.
- All public exports are documented and stable.

**Compositions**
- Shared task blocks cover all real app workflows.
- Each DNA has signature compositions and page templates.
- Loading, empty, error, offline, permission and success states are complete.

**Media**
- Artwork, covers, spatial scenes, avatars and icon/vector families have manifests, variants and provenance.
- The Avatar Studio has explicit consent and safety boundaries.
- No artwork or asset falsely represents ALLAH or sacred entities.

**Skin and effects**
- Each skin defines full visual grammar, not only colors.
- Motion and effects are named, scoped, device-aware and reduced-motion safe.
- No fake telemetry, random activity or meaningless decoration.

**Audio**
- Original SFX are optional, licensed, documented and off by default.
- All information remains available without sound.

**Foundry**
- Skin, Component, Atom, Brand, Icon, Avatar, Artwork, Motion, Effects, Sound, Loading and Asset Labs exist and are usable by maintainers.
- Generated outputs pass deterministic validation and explicit approval.

**Quality**
- Accessibility, visual regression, responsive, performance, contrast and asset-integrity gates pass.
- Every consuming app builds and uses the shared engine.
- Documentation status matches actual implementation and verification evidence.

---

## 37. Explicit non-goals

- A single universal component that tries to express every world through dozens of booleans.
- Six duplicated component libraries.
- Runtime AI generation for every avatar, icon or artwork request.
- An asset dump with no provenance, manifest or review.
- Sound imitation of proprietary games or copyrighted music.
- 3D/WebGPU for ordinary forms, tables and text.
- Decorative fake data, telemetry, progress, maps or network graphs.
- A public asset-generation console exposed without authorization.
- A new dependency when native browser semantics already solve the task.
- Moving all package files in one disruptive refactor just to match a proposed folder tree.

**Final doctrine:** Moon UI is a world-building and interface-production engine. Its atoms provide precision; its primitives provide reliable behavior; its components provide semantics; its blocks provide tasks; its compositions provide identity; its skins provide complete worlds; its foundries provide original media; its effects and sound provide atmosphere; and its verification system protects quality. One engine, six worlds, one unmistakable creative language.


---

# PART III — PREMIUM PLATFORM PARITY AND EXPERIENCE ENGINEERING

## 38. Competitive ambition: breadth without template sameness

Moon UI must reach the practical coverage of a mature premium UI platform and exceed it in coherent world identity, cinematic composition, asset governance and narrative experiences. This is a capability benchmark, not permission to copy a commercial template's source, layout, artwork, sound, or signature design.

The quality target combines:
- breadth of production-ready controls and patterns;
- depth of application archetypes;
- exceptional visual craft;
- dependable accessibility and responsive behavior;
- real operational workflows;
- coherent identity across all six worlds;
- disciplined performance and maintainability.

A visually spectacular landing page cannot compensate for missing form states, weak keyboard behavior, absent data patterns, or broken mobile navigation.

## 39. Application archetypes and shell system

Moon UI must provide multiple shell archetypes. They share runtime foundations but must not collapse into one universal dashboard.

### 39.1 Shell family

| Shell | Purpose | Signature composition |
|---|---|---|
| Empire Gateway | Public world entry and discovery | Monumental worldstage and destination passages |
| Community Dock | Community participation | Social stream, identity rail, conversation canvas |
| Operations Cockpit | Focused system control | Instrument planes, command rail, detail inspector |
| Headquarter | Strategic and governance view | Spatial overview, decision context, linked workstreams |
| MoonWitness Archive | Narrative and source exploration | Timeline, archive shelves, chapter navigation |
| Immersive Reader | Long-form story and media | Reading canvas, chapter rail, quiet focus mode |
| Identity Center | Personal identity and access | Profile stage, avatar, sessions and permission surfaces |
| Knowledge Observatory | Search and linked knowledge | Search field, source graph, reference navigator |
| Creative Foundry | Design and media production | Workbenches, asset stage, preview and inspector |
| Instrument Workspace | Diagnostics and configuration | Scope, log stream, controls and evidence panel |
| Map & Network Explorer | Geographic and relationship data | Spatial canvas, layers, legend and detail inspector |
| Settings Workbench | Preferences and account management | Grouped settings, change review and confirmation |

### 39.2 Shell contract

Every shell defines:
- global and local navigation ownership;
- page frame and content bounds;
- primary/secondary action hierarchy;
- responsive transformation at phone, tablet, laptop, desktop and ultrawide;
- focus order and skip paths;
- scroll ownership and sticky behavior;
- loading, empty, error, offline, forbidden and success scenes;
- optional density and quiet/focus modes;
- skin adaptation and world-specific composition;
- route transition and history behavior.

Shells compose blocks and templates. They do not own API calls, authentication policy, business rules or application-specific state.

## 40. Full product capability matrix

A premium-grade platform must cover complete user journeys across these domains.

### 40.1 Application and navigation
- public, authenticated, immersive, operational and editorial shells;
- global search, command palette, recent items and contextual actions;
- hierarchical breadcrumbs, tabs, side navigation, mobile sheets and spatial navigation;
- deep-link, back/forward, route pending and unsaved-change behavior.

### 40.2 Forms and workflow
- inline forms, multi-step wizard, conditional sections and repeatable field groups;
- validation summary, field-level errors, async validation and server conflict;
- autosave, dirty state, review-before-submit, confirmation and receipt;
- upload queue, resumable progress where supported, cancellation and retry.

### 40.3 Data and analysis
- sortable/filterable/searchable tables, column visibility and saved views;
- charts, time series, distributions, heatmaps, sparklines and accessible data summaries;
- timeline, audit log, graph, map, topology and comparison;
- export, pagination, virtualized collections and large-data loading.

### 40.4 Content and knowledge
- editorial index/detail, long-form reading, references and footnotes;
- markdown/rich text, code, diff, math, media embeds and table of contents;
- archive, chapter, transmission, issue, release notes and knowledge base;
- media gallery, image lightbox, video, audio, waveform and transcript.

### 40.5 Identity and community
- profile, avatar, membership, role, permission and access request;
- inbox, threads, comments, mentions, reactions, announcements and activity;
- invite, accept, assign, suspend and revoke flows;
- privacy controls, session management and account recovery.

### 40.6 Operations and security
- command surface, job queue, job detail, logs, status and diagnostics;
- integration setup, connection test, credential rotation and revoke;
- secret masking, reveal confirmation, copy controls, expiry and audit trail;
- rate limits, expired sessions, permission denied and maintenance experiences.

### 40.7 Commerce patterns (optional)
- plan comparison, entitlement, checkout summary, invoice, payment state and subscription history.
- Implement only when a real product flow exists. Never imply payment has happened when it has not.

### 40.8 Spatial and media experiences
- map canvas, map layers, route, legend, coordinate display and point inspector;
- node graph, relationship explorer, orbit, constellation and topology;
- image/video/audio, transcript, caption, playlist, cover and fullscreen stage.

## 41. Advanced component catalog

The following extends the component universe from Part II. Avoid duplicate semantics: a pattern may be a block or recipe instead of a new component when it has no independent API or accessibility contract.

**Charts and visualization**
ChartFrame, LineChart, AreaChart, BarChart, StackedBarChart, PieChart, DonutChart, ScatterPlot, BubblePlot, Heatmap, Histogram, Sparkline, Axis, GridLines, Legend, ChartTooltip, ThresholdBand, RangeBand, DataSummary.

**Rich content and documentation**
RichText, MarkdownRenderer, TableOfContents, Footnote, Citation, Callout, PullQuote, DropCap, CodeEditorFrame, DiffViewer, SyntaxBlock, MathBlock, MediaEmbed, SourceReference.

**Communication**
Thread, Message, MessageComposer, MentionPicker, ReactionBar, CommentAnchor, ActivityComposer, InboxRow, ConversationHeader, ParticipantList, TypingIndicator (only when backed by real state).

**Workflow and approvals**
Stepper, Wizard, ReviewPanel, ApprovalRail, TaskQueue, JobStatus, AuditEvent, RetryPanel, ConflictResolver, UnsavedChangesDialog, ActionReceipt, BulkActionBar.

**Identity and security**
PasswordField, PasskeyPrompt, SessionList, PermissionMatrix, RoleBadge, AccessRequest, RecoveryCodeList, SecretReveal, CopySecret, ExpiryNotice, SecurityEvent, DeviceSessionCard.

**Search and command**
GlobalSearch, SearchResults, RecentItems, QuickActions, CommandGroup, KeyboardHint, SearchFilter, SavedSearch, MobileNavigationSheet.

**Calendar and time**
CalendarGrid, Agenda, DateRangePicker, TimeZoneSelect, RelativeTime, EventMarker, ScheduleTimeline, AvailabilityGrid.

**Files and assets**
FileCard, FileList, UploadQueue, UploadProgress, AssetPicker, AssetPreview, MetadataEditor, VersionHistory, CropWorkbench, FocalPointEditor.

**Spatial and map**
MapCanvas, MapLegend, LayerControl, CoordinateReadout, RouteLine, NodeInspector, GraphLegend, Minimap, ViewportControls, SpatialSearch.

**Media**
VideoFrame, AudioPlayer, Waveform, Transcript, CaptionTrack, Gallery, Lightbox, FullscreenStage, MediaMetadata, PlaybackTimeline.

**Operational feedback**
InlineValidation, FieldErrorSummary, ConnectionStatus, SyncStatus, SaveIndicator, UndoToast, ConflictBanner, MaintenanceNotice, RateLimitNotice, SessionExpiredScene.

## 42. Interaction recipes and journey contracts

Moon UI must document complete journeys as reusable recipes. Each recipe includes initial state, intermediate states, completion, cancellation, retry, permission denial, timeout and recovery.

| Journey | Stages |
|---|---|
| Search and inspect | Search → filter → sort → inspect → act |
| Create a record | Create → validate → review → confirm → receipt |
| Publish media | Upload → progress → process → preview → approve → publish |
| Manage membership | Invite → accept → assign role → suspend/revoke |
| Curate an asset | Select → crop → preview → approve → export |
| Explore archive | Open → navigate timeline → read → follow reference |
| Operate a job | Monitor → inspect logs → retry/cancel → verify |
| Manage integration | Configure → test → connect → rotate/revoke credential |
| Explore spatial data | Select layer → inspect point → open detail |
| Process notification | Receive → open source → mark read → manage preference |

A journey is not complete if it only documents the happy path.

## 43. Cinematic realism and game-grade visual craft

The phrase “PlayStation quality” is a craft target, not a promise that a web UI will render like a native console game. The web platform has real constraints. Moon UI should selectively use game-art techniques where they materially improve the experience.

### 43.1 Visual fidelity ladder

| Tier | Technique | Appropriate use |
|---|---|---|
| F0 — Precision | typography, spacing, vector, clean surfaces | forms, text, dense controls |
| F1 — Crafted 2D | layered illustration, texture, deliberate light | identity, editorial, media |
| F2 — Cinematic 2.5D | parallax planes, perspective, atmospheric depth | gateway, world entrance, story stage |
| F3 — Real-time scene | WebGL/WebGPU/3D scene with static fallback | selected hero, map, spatial showcase |
| F4 — Offline-rendered master | high-resolution pre-rendered art/video | hero plates, covers, chapter artwork |

Default to the lowest tier that achieves the intended result. Do not add real-time 3D to ordinary settings, tables or forms.

### 43.2 Realism principles
- **Scale:** use foreground, middle distance and background to establish believable depth.
- **Lighting:** define key, fill, rim and ambient contribution; avoid arbitrary glow.
- **Material:** distinguish stone, metal, glass, paper, ink, water and organic membrane by roughness, reflectance, translucency and texture.
- **Camera:** define focal length feel, perspective, horizon, framing and depth-of-field restraint.
- **Atmosphere:** use fog, haze, dust, rain or particles only when they serve the scene and remain subtle.
- **Composition:** preserve focal hierarchy, negative space, text-safe areas and mobile crop anchors.
- **Motion:** establish, focus, resolve; use motion to communicate navigation and state.
- **Consistency:** art direction must be repeatable across scenes, not dependent on one lucky image prompt.

### 43.3 Rendering and performance
- Prefer pre-rendered 2D/2.5D assets for broad device compatibility.
- Use CSS transforms and opacity for common transitions; avoid layout-thrashing animation.
- Use WebGL/WebGPU only behind capability detection, lazy loading and a static fallback.
- Avoid permanent high-cost blur, excessive backdrop filters, giant shadow stacks and unbounded particles.
- Respect device pixel ratio without blindly rendering 4K textures on mobile.
- Use responsive image sources, modern codecs, correct dimensions, lazy loading and decode-aware transitions.
- Measure LCP, CLS, INP, memory, GPU cost and bundle size on representative devices.
- A scene must degrade gracefully when GPU acceleration is unavailable.

## 44. Responsive, accessibility and internationalization system

### 44.1 Responsive modes
Design deliberate compositions for compact phone, large phone, tablet, laptop, desktop and ultrawide. Breakpoints are content-driven. Components must not assume hover, wide pointer or fixed viewport height. Provide touch-sized controls and alternate navigation.

### 44.2 Accessibility
- semantic HTML first; correct accessible names, descriptions and roles;
- full keyboard operation and visible focus;
- screen-reader announcements for asynchronous state changes;
- contrast verified for every skin and interactive state;
- reduced motion and no-motion modes;
- non-color state differentiation;
- captions/transcripts for media;
- data chart summaries and table alternatives;
- accessible validation summary and error focus;
- zoom/reflow support and logical reading order.

### 44.3 Internationalization
- translation-ready labels and message catalogs;
- locale-aware date, number, currency and relative time;
- variable text length and font fallback;
- right-to-left layout readiness where a consuming app requires it;
- no text embedded in reusable artwork unless the asset is explicitly language-specific.

## 45. Data visualization and truthful information design

- A visualization must state what data it represents and its units.
- Distinguish observed, estimated, simulated and illustrative values.
- Never invent telemetry, locations, user activity, progress, uptime or network relationships.
- Provide empty, partial, stale, loading, error and permission states.
- Provide textual summaries and accessible alternatives.
- Use consistent scales and avoid misleading axes.
- Large datasets require pagination, aggregation or virtualization.
- Real-time views must show source and freshness where relevant.

## 46. Asset production and delivery pipeline

Brief → concept → art direction approval → source/master → derivatives → optimization → metadata → integrity checks → visual review → approval → release → usage tracking.

Asset quality gates:
- correct dimensions and aspect ratio; valid MIME and decodable file;
- SVG sanitization, bounded complexity and no broken external references;
- correct alpha/color profile; crop/focal point verified on phone, desktop and ultrawide;
- contrast and text-safe area; file-size/decode budget;
- alt text/decorative semantics; license/provenance;
- duplicate detection, stable ID and fallback for critical assets.

Resolution profiles:
- UI glyphs: vector masters with crisp small-size rendering.
- Brand marks: SVG masters plus platform raster exports.
- Avatars: square masters with circular-safe crops.
- Covers: portrait and landscape derivatives.
- Hero scenes: wide master with art-directed device crops.
- Textures: seamless or bounded atlas assets.
- Audio: short normalized one-shot effects plus source master.
- Motion: optimized sequence with poster and reduced-motion fallback.

## 47. Theme, density and customization model

Separate independent axes: DNA skin; color mode; density (comfortable, compact, touch); motion (full, reduced, off); sound (muted or enabled); contrast (standard or high). Do not multiply combinations into separate skins. App overrides must be token-scoped and never mutate global package state.

## 48. Quality engineering and release certification

Test unit/interaction, keyboard/accessibility, automated and manual a11y, six-skin visual regression, responsive screenshots, reduced-motion/no-audio, light/dark/contrast, asset integrity/provenance, SSR/hydration, performance, app builds/typechecks and public exports.

Every catalog item carries a truthful maturity state:
- **Proposed:** documented idea, no implementation claim.
- **Designed:** API and behavior contract approved.
- **Implemented:** source exists and exports.
- **Tested:** required automated tests pass.
- **Integrated:** used by a real application workflow.
- **Certified:** visual, accessibility, responsive and performance evidence accepted.

A release cannot be certified with broken exports, missing/duplicated critical assets, skin contrast gaps, keyboard failures, absent reduced-motion behavior, failing app consumers, unexplained visual regressions or inaccurate documentation.

## 49. Expanded roadmap — premium parity

- **P0 Truth and foundation:** inventory exports/consumers, maturity status, brand/font/token defects, shell/asset/state/a11y contracts.
- **P1 Product foundations:** atoms, primitives, controls, navigation, form recipes, core shells and mobile navigation.
- **P2 Workflow/data:** tables, search, filters, charts, timeline, uploads, notifications, identity/security, operations and content.
- **P3 Signature worlds:** two or more strong compositions per DNA, unique brand systems, cinematic scenes and loading transitions.
- **P4 Foundries:** asset registry, vector/icon/brand/avatar/artwork/cover generators, Motion/Effects/Loading/Sound Labs.
- **P5 Spatial/cinematic:** selected 2.5D/3D scenes, map/network/orbit and GPU fallback certification.
- **P6 Adoption/certification:** migrate apps, remove duplicate visual systems, certify every consumer.

## 50. Final premium acceptance standard

Moon UI must support complete applications across public entry, navigation, forms, data, content, identity, community, operations, settings, media and spatial exploration. It must combine mature platform breadth with a coherent six-world identity, cinematic fidelity where appropriate, original governed assets, robust accessibility, responsive behavior, localization, performance and evidence-backed maturity.

**The distinction:** premium templates sell finished screens. Moon UI provides the engine, language, tools, assets and standards to create an entire family of coherent products and worlds.


---

# PART IV — RESEARCH-LED CREATIVE INTERFACE PLATFORM

> This part extends the premium platform blueprint with research-informed capabilities. Every item is a target or proposal unless maturity is verified in source, tests, application integration, and quality evidence.

## 51. Strategic thesis

Moon UI should own the complete path:

**Intent → Task Model → Semantic Brief → World Grammar → Composition → Interaction → Evaluation → Approval**

Five cooperating systems: **World System** (six authored DNA grammars), **Intent System** (task models and adaptive views), **Experience System** (components, blocks, scenes, transitions, media and sound), **Foundry System** (governed original assets), and **Certification System** (accessibility, performance, truth, visual quality, and release evidence).

This is not permission for an LLM to generate arbitrary application code at runtime. Generated composition resolves to approved components, recipes, data contracts, and permission-checked actions.

## 52. Intent-to-Interface Compiler

Pipeline: capture intent → clarify essential ambiguity → build task model → build semantic design brief → resolve approved recipes → preview → evaluate → approve consequential actions → learn from explicit corrections.

A task model includes ID/version, user-visible objective, actors and authority, entities and relationships, required/optional fields, allowed/forbidden operations, data dependencies, validation, completion evidence, undo/recovery, privacy classification, uncertainty, and assumptions.

Generated markup cannot bypass approved APIs. Generated actions cannot bypass authorization or server validation. Destructive and external actions require explicit approval. Views are reproducible from a versioned task model and recipe. Users can inspect, edit, dismiss, and reset adaptive views. AI never claims a suggested action is complete.

## 53. World Grammar Engine

Each DNA receives a versioned definition for identity, narrative intent, composition, spatial metaphors, geometry, material, light, typography, iconography, brand, motion, sound, artwork, responsive transformations, accessibility fallback, and prohibited patterns.

| DNA | Composition | Material / light | Motion | Signature interaction |
|---|---|---|---|---|
| IMPERIUM LUMEN | axial, monumental, ceremonial passages, vast negative space | stone, metal, ivory, antique gold, controlled light | slow reveal, alignment, restrained arrival | passage selection and architectural threshold |
| LUNAR CHRONICLES | orbital maps, celestial timelines, layered archive planes | lunar dust, silver-blue, deep night, luminous precision | orbit, phase transition, quiet drift | time navigation and source-linked exploration |
| ROCKSOUL | cinematic framing, print plates, chapter cuts, asymmetric editorial rhythm | paper, grain, ink, rain, selective crimson | hard cuts, film-like reveal, intentional imperfection | chapter sequence and narrative transmission |
| NEXUS PARADOX | instrument planes, impossible geometry, modular scopes | technical surfaces, glass, signal cyan | snap, focus shift, calibration | direct manipulation of scopes and system objects |
| RIOT ANARCHY | collage, torn edges, poster fields, expressive typography | xerox grain, halftone, ink, paper | kinetic type, cut-up transitions | poster assembly and expressive navigation |
| MYCELIUM | branching systems, organic clusters, relationship paths | biomorphic membranes, mineral green, translucent layers | growth and meaningful connection pulses | relationship exploration and network traversal |

A world may share semantic behavior, but must not reuse the same default composition and merely change color. Conformance tests cover motifs, tokens, unique identity, emblem uniqueness, motion/reduced-motion, mobile and keyboard navigation, asset provenance, and approved screenshot references.

## 54. Intent Lens

A temporary task-scoped composition, not a hidden personalization engine. Capabilities: visible objective, approved block reordering, contextual emphasis, relevant filters, saved views, pinned elements, one-action reset, “why am I seeing this?” explanation, user correction, and explicit preference capture. States: inactive → proposed → preview → active → corrected → dismissed/reset. It never changes permissions or destructive-action semantics.

## 55. Evidence Surface and AI collaboration

Default view: outcome, concise rationale, source count/freshness, action state (suggested/pending/completed/failed), and material uncertainty. Expandable evidence: source excerpts, provenance, tool/action timeline, agent contribution summary, disagreements, data transformations, approvals, and audit history.

Never display private chain-of-thought. Show useful evidence, observable actions, and concise rationale.

| Mode | Meaning | UI requirement |
|---|---|---|
| Assist | AI suggests | accept, dismiss, inspect |
| Co-create | Shared artifact editing | version, compare, undo, ownership |
| Prepare | Action prepared but not executed | preview, validate, approve |
| Delegate | Bounded authorized operation | scope, permission, progress, stop, receipt |
| Automate | Pre-authorized policy | visibility, logs, limits, pause, revoke |

Agent surfaces need objective, current phase, consequential-action preview, live status only from real events, checkpoints, pause/cancel/retry, recovery, evidence, and compact-by-default detail.

## 56. Scene Graph and spatial storytelling

Data-first model: world, region, destination, passage, object/entity, timeline event, media asset, relationship/edge, viewport, and selected node.

Rendering modes: monumental passage map, orbital atlas, cinematic chapter timeline, technical instrument graph, editorial collage map, organic relationship network, or accessible linear list/tree.

Interaction contract: keyboard navigation, clear selection and detail, pan/zoom only when useful, reset/fit-to-view, minimap for large scenes, search/direct destination access, non-spatial equivalent, no hover-only essential controls, and no fabricated location or relationship data.

## 57. Rendering architecture and constraints

| Tier | Technology | Use |
|---|---|---|
| DOM precision | semantic HTML/CSS | all core product interactions |
| Vector scene | SVG | logos, icons, maps, diagrams |
| Canvas scene | Canvas 2D | lightweight custom visualization |
| WebGL scene | Three.js / React Three Fiber | selected 3D scenes |
| WebGPU scene | capability-detected enhancement | experimental high-performance rendering |
| Offline master | pre-rendered image/video | cinematic hero and narrative media |

WebGPU is not Baseline across all widely used browsers; never require it. Detect capabilities, load 3D only when needed, keep text and controls in DOM, provide static and 2D fallback, avoid costly post-processing on ordinary routes, set device-aware resolution/particle limits, pause when hidden/constrained, and measure GPU, memory, JS bundle, LCP, CLS, and INP on real devices.

## 58. Motion Choreography System

Motion is semantic, not a bag of presets. Types: arrival, focus, relation, transformation, feedback, transition, and optional ambient movement. Every recipe defines trigger, start/end state, duration, easing, interruption, reduced-motion alternative, performance class, and purpose.

Evaluate Motion for common React transitions; Theatre.js for authored choreography; React Three Fiber/Drei for selected scenes. Adoption requires license, maintenance, bundle, fallback, and device evaluation.

## 59. Creative Foundry 2.0

Studios: Brand (emblem/wordmark/lockups/app icon/favicon/social), Vector (paths/strokes/fills/masks), Icon (semantic and expressive glyphs), Avatar (profile identities/non-human symbols/frames), Artwork (hero/destination/map/world illustration), Cover (chapter/episode/transmission/archive/poster/social/OG), Motion (transitions/loops/loading), Effects (light/grain/halftone/atmosphere/shaders), Sound (original SFX/ambience/mute/license), Loading (entry/transition/skeleton/streaming/offline/retry), and Asset Registry (search/metadata/version/provenance/approval/usage).

Every asset stores stable ID/version, DNA/routes, purpose, source/master, derivatives, dimensions, format, color profile, transparency, crop/focal point, alt text or decorative classification, license/provenance, generation brief where relevant, approval, validation, and usage references. Generators create proposals and variants; they never silently overwrite approved masters.

## 60. Experience Quality Observatory

Maintainer-only workbench for component/block coverage, six-skin conformance, route/state coverage, accessibility and keyboard paths, contrast, responsive screenshot diffs, visual hierarchy/complexity, LCP/CLS/INP, JS/image/GPU cost, asset integrity/provenance, build/typecheck/lint/test, consumer integration, maturity, and release evidence.

All values come from actual evidence. Distinguish current, historical, sampled, and simulated data. No fake green indicators or fabricated telemetry.

## 61. Design Intelligence and anti-slop pipeline

Own a design constitution covering six grammars, tokens, typography, approved compositions, prohibited patterns, accessibility, responsive behavior, asset rules, motion, sound, archetypes, examples, and counterexamples.

**Brief → Direction proposals → Compare → Select → Compose → Browser render → Screenshot critique → Accessibility/performance audit → Refine → Certify**

Detect generic repeated card grids, font/palette drift, excessive gradient/blur/glow, decorative controls, fake data, weak hierarchy, missing states, keyboard/focus failures, reduced-motion gaps, overflow, bad crops, and incorrect/duplicated marks. Automated critique is advisory until tests or human review verify the finding.

## 62. Research-backed principles

1. Agency before automation.
2. Sufficient, progressive transparency.
3. Task model before generated view.
4. Semantic guidance before prompt magic.
5. Complexity must earn its place.
6. Structure may be flexible; accessibility and security invariants are not.
7. Spatial rendering is progressive enhancement.
8. No deceptive immersion or fabricated telemetry.
9. Reduced-motion, keyboard, assistive technology, and 2D modes retain task capability.
10. Evidence-based maturity only.

## 63. New component and pattern candidates

**Intent and AI:** IntentBadge, ObjectiveHeader, TaskModelPreview, GenerationStage, SuggestionRail, ActionPreview, ApprovalGate, AgentActivityTimeline, EvidenceDrawer, SourceProvenance, UncertaintyNotice, DecisionSummary, ToolResult, UndoAction.

**Spatial and scene:** SceneViewport, SceneToolbar, SceneNavigator, SceneMinimap, SceneLegend, PassageMarker, OrbitNavigator, TimelineScrubber, NodeGraph, RelationshipEdge, ObjectInspector, ViewReset, ViewModeSwitch.

**Foundry and assets:** AssetManifest, AssetProvenance, AssetApproval, VariantCompare, CropAnchorEditor, FocalPointPicker, VectorWorkbench, BrandLockupPreview, IconGrid, AvatarComposer, CoverComposer, MotionTimeline, SoundCuePreview.

**Experience quality:** QualityScorecard, BuildEvidence, A11yAuditResult, VisualDiff, PerformanceBudget, AssetHealth, SkinConformance, RouteCoverage, MaturityBadge, EvidenceLink.

These are candidates, not an instruction to create every component. Promote one only when it has independent semantics, reuse, behavior, or accessibility requirements.

## 64. New application compositions

| Composition | Best-fit DNA | Purpose |
|---|---|---|
| Intent Workbench | NEXUS PARADOX | objective, context, generated task view, evidence |
| Evidence Observatory | LUNAR CHRONICLES / NEXUS PARADOX | sources, provenance, confidence, history |
| World Passage Atlas | IMPERIUM LUMEN | destinations and world transitions |
| Living Narrative Map | LUNAR CHRONICLES / MYCELIUM | linked events, chapters, archive references |
| Story Cut / Filmstrip | ROCKSOUL | chapter sequence, scenes, captions, media |
| Poster Assembly Wall | RIOT ANARCHY | collage-based editorial and campaign composition |
| Relationship Garden | MYCELIUM | entity relationships and network exploration |
| Experience Observatory | NEXUS PARADOX | maintainer quality and release evidence |
| Creative Foundry Floor | RIOT ANARCHY / NEXUS PARADOX | original asset and media production |
| Agent Mission Control | NEXUS PARADOX | bounded delegated work, approvals, logs, receipts |

## 65. Research-led roadmap

- **R0 — Evidence and decisions:** research ledger, source limitations, decision records.
- **R1 — World Grammar:** schema, six conformance profiles, unique identity tests, compositions.
- **R2 — Intent foundation:** task model, semantic brief, recipe resolver, preview, correction.
- **R3 — Trust and agency:** action authority, evidence surface, approval, undo, delegation, audit.
- **R4 — Scene system:** data-first scene graph, vector/2D renderer, spatial navigation, fallback.
- **R5 — Foundry 2.0:** asset registry and brand/vector/icon/avatar/cover studios, then motion/effects/sound.
- **R6 — Design intelligence:** owned constitution, anti-slop checks, browser screenshot critique.
- **R7 — Quality Observatory:** evidence-backed accessibility, performance, asset health, app certification.
- **R8 — Selective advanced rendering:** 3D/WebGL/WebGPU only when a real route requires it.
- **R9 — Application adoption:** real workflows, removal of duplicated implementations, consumer certification.

## 66. Research and adoption decision record

For each proposal record source/date, evidence class and limitations, user problem, measurable hypothesis, DNA/app consumers, implementation and dependencies, privacy/safety/accessibility/performance risks, alternatives, decision (adopt/prototype/defer/reject), validation, and revisit date.

Do not turn every paper or GitHub trend into a feature. A proposal is accepted only when it solves a real product problem and can be verified.

## 67. Updated final acceptance standard

Moon UI's next frontier is achieved when it can express six distinct world grammars over one engine; translate tasks into predictable, inspectable, user-controlled compositions; surface AI evidence and authority at the right level; render spatial and narrative experiences with non-spatial fallback; produce original governed assets with provenance; certify actual browser output; support complete product workflows; and report maturity honestly.

**The defining advantage:** Moon UI provides the grammar, intelligence, creative tools, spatial language, and evidence system required to build six coherent digital worlds—and keep them usable, trustworthy, and technically excellent.


---

## 68. Canonical execution and overlap control

The implementation baseline, predecessor-plan reconciliation, task-level delivery sequence, autonomous execution rules and requirement traceability live in the [Moon UI Master Consolidation Plan](../../.plans/20261105-moon-ui-master-consolidation/spec.md).

This blueprint remains the product/architecture target; the master plan is the execution queue. Before implementing any blueprint item, inspect the current source and active plans. Reuse existing SkinRoot/SkinScope, six skin definitions, six original vector scenes, shared components/blocks/primitives, Skin Laboratory and procedural SFX engine. Do not rebuild them merely because the target blueprint describes their complete future role.

The predecessor six-world artwork plan is superseded by the master plan. The earlier premium-skin implementation remains baseline evidence; only fresh verification or a source-backed residual defect may reopen its work. The old platform-standardization skin mapping is not authoritative where it conflicts with accepted DNA and current DESIGN.md.

Plan task states and evidence must remain separate from blueprint aspirations. A section is not implemented because it is documented, and a task is not certified because source exists.
