---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-MASTER-DESIGN"
version: "1.0.0"
owner: "architecture"
status: "in_progress"
---

# Moon UI — Consolidated Target Architecture & Execution Design

## 1. Architectural thesis

**One semantic engine, six visual worlds, one governed creative production pipeline.**

Moon UI is the single owner of reusable interface semantics, skin grammar, visual tokens, composition primitives, shared artwork metadata, motion/effect contracts and visual certification. Apps compose these capabilities around their own routes, domain data, authorization and workflows.

The design must be more capable than a premium template library without becoming a collection of unrelated widgets or an unbounded generative runtime.

## 2. Current-to-target architecture

```
Consuming apps (GATE / DOCK / ID / HARBOR / HEADQUARTER / MOONSKY / JIZZ)
  ├─ routes, data, auth, business workflows, app-specific content
  └─ scene orchestration using public @moonwitness/ui APIs
       |
       v
@moonwitness/ui
  ├─ skins + semantic tokens + world grammar
  ├─ atoms + raw layout + interaction primitives
  ├─ accessible components + task blocks
  ├─ six world composition families + shell templates
  ├─ identity / icon / vector / avatar / artwork contracts
  ├─ asset manifest / resolver / provenance / validation
  ├─ motion / effects / loading / sound contracts
  ├─ deterministic intent recipes / scene graph presentation
  └─ labs / visual certification / quality observatory
       |
       v
Browser platform
  ├─ semantic DOM first
  ├─ SVG/CSS for lightweight geometry and artwork
  ├─ raster/video only for art-directed media with responsive derivatives
  └─ optional WebGL/WebGPU enhancement only behind capability detection + static fallback
```

No UI package layer may fetch app business data, hold credentials, enforce tenant authorization or persist product-domain records.

## 3. Package ownership and source-of-truth rules

| Concern | Canonical owner | Rule |
|---|---|---|
| Color/type/spacing/geometry/material/motion tokens | `packages/ui/src/skins/registry.ts` and token exports | One registry; no parallel app palettes |
| CSS mapping | `packages/ui/src/theme.css` | Maps semantic utility roles to SkinRoot variables |
| World visual recipes | `packages/ui/src/skins.css` plus typed world grammar | No private app CSS targeting internal implementation selectors |
| Semantic controls | `packages/ui/src/components/` | Native-first, accessible, shared public API |
| Layout-only helpers | `packages/ui/src/raw/` | No brand, fetching or business logic |
| Cross-cutting behavior | `packages/ui/src/primitives/` | Focus, overlay, motion, portal and selection behavior |
| Task compositions | `packages/ui/src/blocks/` | Props in, UI out; no app API/persistence |
| App route composition | `apps/*/src/app/` | Use public UI package exports |
| Public static delivery | app `public/` folders | Generated/derived assets only, source master/provenance remains traceable |
| Canonical asset metadata | `packages/ui/assets/manifest.*` (or existing verified equivalent) | Typed IDs, owner, license, source, variants and integrity |
| Design/quality tests | `packages/ui/test/` and root scripts | Deterministic and CI-enforced |

Before adding any directory or moving assets, inspect existing build/package contracts and record the lowest-risk implementation. Do not relocate all current public assets simply to satisfy a proposed folder diagram.

## 4. Six-world grammar model

Each world grammar is a typed, declarative definition. It must express more than color:
- visual thesis and semantic metaphor;
- composition primitives and layout tendencies;
- geometry and edge language;
- materials, surface treatment and depth;
- lighting and color grading;
- typography roles and editorial rhythm;
- icon/sigil vocabulary;
- navigation metaphor;
- motion/effect profile;
- sound profile;
- density and responsive transformation;
- accessibility constraints and static fallback;
- hard exclusions and anti-slop rules.

A world grammar references shared semantic component contracts; it does not fork behavior. Skin-specific rendering must not depend on fragile selectors that only work for one page shape.

## 5. Target package organization

Keep current paths and exports where possible. Add only when implementation needs them:

```
packages/ui/
  src/
    components/       semantic atoms and controls
    blocks/           reusable task compositions
    primitives/       interaction, focus, overlay, motion and scene mechanics
    raw/              layout-only primitives
    skins/            registry, SkinRoot, world grammar
    tokens/            public token contracts
    assets/            typed manifest, resolver and validation contracts
    foundry/           deterministic generators and preview contracts
    sfx/               existing audio engine + sound metadata/presets
    theme.css
    skins.css
  assets/
    masters/           canonical original source masters where appropriate
    fonts/             licensed self-hosted font files where approved
    generated/         deterministic outputs only; ignored if build artifacts
  test/
    components/
    skins/
    assets/
    accessibility/
    visual/
    performance/
```

This is a target, not a mandate to create empty folders. Use existing test structure if it already serves the same purpose.

## 6. Component strategy

Do not implement the entire generic component universe as a checklist. For each candidate:
1. Identify a real app workflow and consumer.
2. Search existing source and package exports for equivalent behavior.
3. Map the semantic task through all six DNA.
4. Prefer native platform semantics.
5. Add a shared component only if at least one real workflow needs it.
6. Test keyboard, pointer, touch, screen reader, focus, validation and disabled/loading/error states as relevant.
7. Prove all six skins render it coherently.
8. Add stable public export and docs.

Priority candidates from the blueprint include Switch, RadioGroup, Tabs, Tooltip, Popover, DropdownMenu, Progress, Separator, Accordion/Collapsible, Toast/notification, Combobox/Command, Calendar/DatePicker, Breadcrumb, Pagination and Sheet. Include other data/content/media/security components only when current apps require them. Never build a fake component merely to inflate catalog size.

## 7. World composition strategy

At minimum, each DNA must have two verified signature compositions beyond a shared generic hero. Candidate compositions:

| World | Composition family | Distinct interaction language |
|---|---|---|
| IMPERIUM LUMEN | Monumental Gate, Passage/Threshold, axial destination field | enter, reveal, align, progress through space |
| LUNAR CHRONICLES | Orbital Navigation, Lunar Timeline, Celestial Archive/Atlas | orbit, focus, compare phases, inspect evidence |
| ROCKSOUL | Chapter Cover, Filmstrip, Story Timeline, Transmission Poster | cut, dissolve, chapter advance, frame focus |
| NEXUS PARADOX | Spatial Selector, Instrument Bay, Sensor Scope, System Map | calibrate, focus, scope, trace real signals |
| RIOT ANARCHY | Comic Spread, Poster Wall, Sticker Layer, Issue Index/Xerox Archive | panel focus, stamp, hard cut, reorder |
| MYCELIUM | Living Network, Organic Node Map, Growth Path, Relationship Graph | connect, focus propagation, trace real relationships |

All compositions must support loading, empty, error, offline, permission, success and stale-data states where relevant. A composition may not invent data to appear active.

## 8. Creative asset architecture

Asset production is a governed pipeline, not an uncontrolled pile of generated files.

### 8.1 Asset classes
- World/app identity: emblems, wordmarks, lockups, app icons, favicons, social crops.
- Semantic icons and world sigils.
- Vector grammar: axes, orbital lines, film frames, instrument rails, collage shapes, organic branches.
- Hero/world plates and app route scenes.
- Chapter, episode, transmission, archive and observation covers.
- Spatial maps, relationship graphs and diagrams.
- Avatar/profile frame families.
- Loading, arrival and transition plates.
- Material textures, decals, overlays and borders.
- Original SFX assets or documented procedural presets.

### 8.2 Asset record

Every asset record must include:
- stable `assetId`;
- asset class, DNA, app and route consumer;
- source master path and generated derivative paths;
- author/source, license and provenance;
- dimensions, aspect ratio, format, file size and checksum;
- crop-safe/title-safe/UI-safe metadata;
- decorative vs informative classification and alt-text guidance;
- fallback, responsive variants and delivery priority;
- generator/tool version and input brief hash when generated;
- review/approval and lifecycle status.

### 8.3 Generation policy
- Prefer original vector/CSS geometry for interface-native scenes.
- Use generated raster artwork only when it materially improves the composition and the tool/license/provenance are clear.
- Keep editable/source masters; never treat a flattened derivative as the only source.
- Do not use runtime generation to render profile avatars or route content automatically.
- Avatar generation is explicit, user-triggered, replaceable and removable. Offer abstract/non-human choices; do not generate a sacred/divine representation or imply a generated portrait is a real identity.
- Never generate a human face for cosmic/sacred narrative assets.

## 9. Research-led interaction architecture

### 9.1 World Grammar Engine
A deterministic registry that maps a semantic task and a selected DNA to approved composition/interaction recipes. It is not an LLM renderer and does not produce arbitrary code.

### 9.2 Intent-to-Interface Compiler
Pipeline:
`user intent → task model → semantic design brief → approved recipe → UI composition → accessibility/data-truth checks → rendered result`.

- Use typed task and recipe schemas.
- Validate allowed components and props.
- Reject unsupported or unsafe composition requests.
- Preserve user control and explicit task objectives.
- Provide deterministic output and test fixtures.
- Keep any AI suggestion layer outside core UI package and treat its output as untrusted input.

### 9.3 Intent Lens
A task-focused presentation mode:
- state the current objective in user-facing terms;
- reveal only relevant tools/information without hiding critical context;
- allow user to pin, reorder, restore or reset;
- expose why a view changed;
- never infer sensitive traits or silently profile users;
- preserve a standard view and keyboard path.

### 9.4 Evidence Surface
A progressive disclosure pattern that shows:
- concise answer/result;
- source, timestamp/freshness and provenance where available;
- uncertainty, unavailable or stale state;
- actions and ownership;
- expandable audit/evidence details.

It must not expose private chain-of-thought or invent confidence/telemetry.

### 9.5 Scene Graph
Typed nodes and edges for meaningful worlds, destinations, chapters, timeline events, media and relationships. Render with spatial presentation where helpful and accessible list/table/tree fallback always available. Graph edges must originate from real app data or explicitly labelled illustrative fixtures.

### 9.6 Experience Quality Observatory
A maintainers' view of real quality evidence: test status, route coverage, visual diffs, contrast, accessibility, asset integrity, bundle cost, LCP/CLS/INP, reduced-motion and app build results. No synthetic green indicators or fabricated metrics.

### 9.7 Design Intelligence / anti-slop pipeline
- lint token misuse, arbitrary palette classes and private selector coupling;
- detect duplicated emblem/artwork hashes;
- flag repeated generic hero/card patterns;
- compare DNA composition signatures;
- validate source/license/alt-text metadata;
- measure visual density/complexity against task hierarchy;
- produce actionable diagnostics, not aesthetic scores presented as objective truth.

## 10. Motion, effects, loading and sound

- Keep existing `VisualEffectsProvider`, `MotionFrame`, toggle and reduced-motion CSS.
- Add named motion tokens and choreography sequences with explicit purpose, duration, interruption and fallback.
- Effects must be layered, scoped, low-power aware and never block interaction.
- Use static fallback first; optional WebGL/WebGPU is capability-detected and never required.
- Loading states describe real operations. Use skeleton only when layout is known; use progress only with measurable progress; otherwise show honest indeterminate state.
- Keep current procedural SFX engine as the base. Add typed event-to-sound mapping, volume/mute/preference, per-world profile, testable no-audio mode and Sound Lab. Default off.

## 11. Shells and premium platform parity

The blueprint's 12 shell archetypes are design recipes, not 12 new apps:
1. Empire Gateway
2. Community Dock
3. Operations Cockpit
4. Headquarter
5. MoonWitness Archive
6. Immersive Reader
7. Identity Center
8. Knowledge Observatory
9. Creative Foundry
10. Instrument Workspace
11. Map & Network Explorer
12. Settings Workbench

Compose these from shared primitives and app-owned routes. Do not scaffold new frontends or duplicate app workflows merely to demonstrate a shell.

Capability families to map against real app routes: application/navigation; forms/workflows; data/analysis; content/knowledge; identity/community; operations/security; optional commerce; spatial/media. Commerce is optional and must not be implemented without a current product requirement.

## 12. Quality architecture

Every capability must be verified at the right level:
- unit/component tests for behavior and public API;
- semantic/accessibility checks;
- all-six-skin parity;
- visual regression and manual art-direction review;
- responsive viewport review;
- reduced-motion and no-audio review;
- asset provenance/integrity/license checks;
- bundle/asset/performance budgets;
- consuming app typecheck/build and route integration;
- docs contract and source-link checks.

A capability's lifecycle is:
`PROPOSED → DESIGNED → IMPLEMENTED → TESTED → VISUALLY VERIFIED → INTEGRATED → CERTIFIED`.

Do not collapse these states. A visual mockup, SVG source or component unit test does not certify a full app experience.

## 13. Execution sequencing

- First audit and resolve overlap; no code changes before baseline.
- Fix existing identity/token/asset correctness defects before expanding the component catalogue.
- Build the world grammar and shared semantic component contracts.
- Implement only workflow-backed components and world compositions.
- Add foundry/asset systems and research-led deterministic interaction patterns.
- Add motion/effects/loading/sound enhancements.
- Integrate app consumers and remove proven duplicate visual implementations.
- Certify all routes and update docs with evidence.

## 14. Technical and performance guardrails

- Preserve React 19 and current Next.js app compatibility.
- Preserve current `packages/ui` TSX/TypeScript source contract.
- No dependency is added until maintenance, license, security, bundle, SSR and fallback checks pass.
- Keep semantic text and controls in the DOM.
- Prefer SVG/CSS for lightweight interface geometry and pre-rendered assets for complex scenes.
- WebGL/WebGPU is optional enhancement only; check browser/device support and never make it baseline.
- Respect reduced motion, contrast, keyboard and touch targets.
- Optimize for mobile transfer and memory; use responsive image variants and lazy loading.
- Avoid continuous large blur/filter animations, layout thrashing and unbounded SVG filters/path counts.
