---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-MASTER-TASKS"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
target_branch: "dev"
---

# Moon UI — Atomic Autonomous Execution Tasks

Status: `[ ] pending` · `[~] in progress` · `[x] verified complete` · `[!] blocked` · `[-] not applicable with evidence`

## Execution protocol

- Execute in phase order unless a task explicitly declares independent work.
- Before each task, re-read the current source and verify whether the desired outcome already exists. If it does, run the stated proof and mark the task `[x]` without rewriting it.
- Each task must produce one small, reviewable outcome. Do not bundle unrelated changes.
- Record changed paths, test command/output, commit SHA and remaining issue in `report.md`.
- Update `coverage-matrix.md` and this checklist when a capability changes state.
- If implementation is already complete, record evidence and skip the code change.
- A failing unrelated baseline is not permission to weaken a test or expand scope. Isolate it and continue independent tasks.
- Commit coherent passing task groups to `dev`; no new branches and no `main`.

---

## Phase 0 — Baseline, authority and overlap elimination

### P0.1 Repository and worktree safety
- [x] **MU-0001** Verify repository identity is `bjo163/A-L-L-A-H.COM`; record remote URL.
- [x] **MU-0002** Verify current branch is `dev`; do not create or switch to a new branch.
- [x] **MU-0003** Record current `dev` HEAD and timestamp in `report.md`.
- [x] **MU-0004** Inspect `git status --short`; preserve every pre-existing local change.
- [x] **MU-0005** Verify `main` is not checked out and will not be modified.
- [x] **MU-0006** Read `AGENTS.md`, `AUTONOMOUS.md`, `DOCUMENTATION_CONTRACT.md`, `QUALITY.md`, `DESIGN.md`, `DECISIONS.md` and relevant DNA contracts.
- [x] **MU-0007** Read all four Moon UI source documents and extract every requirement into `coverage-matrix.md`.
- [x] **MU-0008** Enumerate all package source files, exports, tests, app consumers, fonts, image/audio assets and scripts from the live tree.
- [x] **MU-0009** Search all frontend apps for direct icon-library imports, app-local design tokens, duplicate controls and private `mw-*` selectors.
- [x] **MU-0010** Record the current root build/test/lint/typecheck/docs commands from `package.json`; do not invent scripts.
- [x] **MU-0011** Run baseline `pnpm ui:test` and record exact output.
- [x] **MU-0012** Run baseline `pnpm ui:contrast` and record exact output.
- [x] **MU-0013** Run baseline `pnpm lint:arch` and record exact output.
- [x] **MU-0014** Run baseline `pnpm typecheck` and record exact output.
- [x] **MU-0015** Run baseline `pnpm lint` and `pnpm docs:check`; record failures independently.
- [x] **MU-0016** Run every existing frontend app build script and record each result independently.
- [x] **MU-0017** Capture baseline asset counts, sizes, duplicate hashes, font presence and SVG validation results.
- [ ] **MU-0018** Capture baseline route/consumer map for GATE, DOCK, ID, HARBOR, HEADQUARTER, MOONSKY and JIZZ.
- [ ] **MU-0019** Verify current six root skin assignments against `DESIGN.md`, DNA docs and actual `SkinRoot`/route scopes; record conflicts without changing them yet.
- [ ] **MU-0020** Produce a source-backed baseline report distinguishing implemented, tested, visually verified, proposed and blocked.

### P0.2 Existing plan overlap and conflict control
- [ ] **MU-0021** Inspect `.plans/20261104-2157-six-world-premium-skins/`; verify which tasks are complete from current source and evidence.
- [ ] **MU-0022** Do not repeat completed six-skin registry, `SkinScope`, six vector scene or initial hero-recipe work; record any specific residual defects only.
- [ ] **MU-0023** Mark `.plans/20261104-2325-six-world-hd-artwork/` as superseded by this master plan and map its unfinished deliverables to MU-asset/composition task IDs.
- [ ] **MU-0024** Inspect `.plans/20261105-0000-platform-capabilities-standardization/`; explicitly quarantine its conflicting skin mapping and backend SkinRoot tasks from execution.
- [ ] **MU-0025** Verify the approved mapping: Gate+Dock=Imperium, ID=Lunar, Harbor=ROCKSOUL, Headquarter=Nexus, MoonSky=Riot, JIZZ=Mycelium.
- [ ] **MU-0026** Confirm ARSY and SENTINEL are backend/service runtimes and must not receive frontend `SkinRoot` wrappers.
- [ ] **MU-0027** Inspect SHADOW and MOONLAB plans; record their backend/domain ownership as out of scope for this UI plan.
- [ ] **MU-0028** Inspect operator/app-specific UI plans; list shared component opportunities but do not duplicate their business workflows.
- [ ] **MU-0029** Search every active `.plans/*` for overlapping UI component, asset, skin, foundry or visual-certification tasks; record links and dispositions.
- [ ] **MU-0030** Create/update `decision-log.md` with plan precedence, conflicts, transferred tasks and any blocked item.
- [ ] **MU-0031** Verify there is one active master plan for Moon UI execution and no parallel active six-world artwork plan remains.

**Phase 0 exit gate:** live baseline and overlap matrix are complete; no code implementation begins until source ownership, root mappings and duplicate plan disposition are known.

---

## Phase 1 — Canonical design system and World Grammar Engine

### P1.1 Token and typography reconciliation
- [ ] **MU-0101** Inventory every `SkinTokens` field and every CSS variable consumed by `theme.css`, `skins.css` and apps.
- [ ] **MU-0102** Compare Imperium registry values with the accepted palette; produce a token-by-token diff.
- [ ] **MU-0103** Define semantic roles for Obsidian, Lunar Slate, Moon Gold, Ivory, Moon Dust and selective Crimson without hardcoding raw colors into components.
- [ ] **MU-0104** Update Imperium semantic tokens to the accepted palette only after checking all text, border, focus, status and control contrast pairs.
- [ ] **MU-0105** Audit the accepted Cormorant Garamond, Inter and Cascadia Code font licenses and official source files.
- [ ] **MU-0106** Add licensed, self-hosted font assets and font-face declarations using the existing package/build conventions.
- [ ] **MU-0107** Map display/editorial, heading, body, label and numeric roles to the approved Imperium type stack.
- [ ] **MU-0108** Verify font loading strategy, font-display, fallback metrics, subset coverage and layout-shift behavior.
- [ ] **MU-0109** Audit all five non-Imperium DNA typography definitions against their canonical DNA documents.
- [ ] **MU-0110** Add only approved, licensed font assets for other worlds where the DNA requires them; otherwise document system fallback.
- [ ] **MU-0111** Verify no consuming app defines a competing font family or theme token.
- [ ] **MU-0112** Run contrast tests after token/font changes and correct failures without reducing semantic clarity.
- [ ] **MU-0113** Update token documentation and registry types to match actual runtime fields.

### P1.2 Six-world grammar
- [ ] **MU-0114** Define a typed `WorldGrammar` contract using current `SkinId` values.
- [ ] **MU-0115** Add composition, geometry, material, light, typography, iconography, navigation, motion, sound, density and responsive descriptors to the grammar where justified.
- [ ] **MU-0116** Add explicit accessibility fallback and reduced-motion profile to each world grammar.
- [ ] **MU-0117** Add explicit hard exclusions and anti-slop rules to each world grammar.
- [ ] **MU-0118** Author IMPERIUM LUMEN grammar: monumental axial architecture, negative space, ivory/obsidian, restrained gold, threshold/passage metaphor.
- [ ] **MU-0119** Author LUNAR CHRONICLES grammar: lunar atlas, orbital alignment, silver-blue observatory, archival chronology and evidence labels.
- [ ] **MU-0120** Author ROCKSOUL grammar: rain-noir cinema, film frames, tactile print, restrained crimson, chapter pacing and face restrictions.
- [ ] **MU-0121** Author NEXUS PARADOX grammar: instrument planes, precise geometry, signal traces, technical density and truthful live-state cues.
- [ ] **MU-0122** Author RIOT ANARCHY grammar: xerox collage, halftone, cut paper, hard borders, kinetic typography and controlled disruption.
- [ ] **MU-0123** Author MYCELIUM grammar: biomorphic surfaces, branching paths, organic nodes, mineral-green palette and real relationship semantics.
- [ ] **MU-0124** Add schema validation ensuring all six registered skins have complete grammar entries.
- [ ] **MU-0125** Add tests that detect accidental grammar equality or color-only differences across worlds.
- [ ] **MU-0126** Ensure the grammar selects presentation only and cannot alter behavior, authorization or business logic.
- [ ] **MU-0127** Ensure app-specific route scopes remain explicit and do not create nested duplicate effects providers.
- [ ] **MU-0128** Document grammar extension/versioning rules and a stable public read API.

**Phase 1 exit gate:** six grammars validate, the accepted Imperium reference is reconciled, no app-local token system is introduced, and all contrast tests pass.

---

## Phase 2 — Brand, icon, vector and asset foundation

### P2.1 Brand system
- [ ] **MU-0201** Hash all current app emblem SVGs and identify exact or near-duplicate artwork.
- [ ] **MU-0202** Confirm Harbor/JIZZ/MoonSky emblem ownership and map each to its approved DNA.
- [ ] **MU-0203** Design a unique ROCKSOUL emblem for Harbor; do not reuse the Mycelium network mark.
- [ ] **MU-0204** Design a unique RIOT ANARCHY emblem for MoonSky; do not reuse the Mycelium network mark.
- [ ] **MU-0205** Review the JIZZ emblem against MYCELIUM; preserve it only if it is intentionally the canonical Mycelium mark.
- [ ] **MU-0206** Review Gate and Dock emblems as two distinct product marks inside the shared Imperium world.
- [ ] **MU-0207** Define parent ecosystem endorsement rules so shared parent branding is an intentional lockup, not a copied emblem.
- [ ] **MU-0208** Create source masters for all six world emblems.
- [ ] **MU-0209** Create primary wordmarks for all six worlds.
- [ ] **MU-0210** Create horizontal and stacked lockups for each approved identity.
- [ ] **MU-0211** Create compact and small-size marks with optical corrections.
- [ ] **MU-0212** Create positive, inverse, monochrome and light/dark-safe variants.
- [ ] **MU-0213** Create favicon, maskable app-icon and social/avatar crops for each app/world identity.
- [ ] **MU-0214** Document clear-space, minimum size, contrast, background and placement rules.
- [ ] **MU-0215** Update the skin identity registry and app metadata to use the correct emblem/icon paths.
- [ ] **MU-0216** Add automated tests rejecting duplicate emblems across unrelated DNA and missing lockup variants.
- [ ] **MU-0217** Verify every generated SVG is sanitised, scalable, accessible/decorative as appropriate and contains no external reference.
- [ ] **MU-0218** Verify no identity asset depicts ALLAH or implies an image represents ALLAH.

### P2.2 Iconography and vector grammar
- [ ] **MU-0219** Inventory current shared Icon component, Lucide usage and all app-local icon imports.
- [ ] **MU-0220** Define stable semantic icon naming and action/status/navigation/data icon categories.
- [ ] **MU-0221** Define world sigils separately from functional action icons.
- [ ] **MU-0222** Build missing high-frequency semantic icons only where current workflows require them.
- [ ] **MU-0223** Build six world-specific vector primitive families: architectural axes, orbital arcs, film cuts, instrument rails, print marks and organic branches.
- [ ] **MU-0224** Add vector baseline, viewBox, stroke/fill, sizing, optical alignment and accessible naming rules.
- [ ] **MU-0225** Ensure apps import icons through `@moonwitness/ui` only.
- [ ] **MU-0226** Add render snapshots or deterministic geometry tests for the public icon set.

### P2.3 Asset manifest and pipeline
- [ ] **MU-0227** Inventory current hero PNG/SVG pairs, route artwork, logos, textures, audio and file sizes.
- [ ] **MU-0228** Define typed asset classes and stable asset IDs.
- [ ] **MU-0229** Define manifest fields for world, app, route, source master, derivatives, dimensions, ratio, format, size, checksum, license, provenance, alt/decorative status and fallback.
- [ ] **MU-0230** Select canonical master/derivative storage without breaking current Next.js public asset paths.
- [ ] **MU-0231** Add a deterministic manifest validator for missing files, duplicate hashes, dimensions, formats, size budgets and invalid metadata.
- [ ] **MU-0232** Add an asset resolver that returns the correct responsive derivative and fallback.
- [ ] **MU-0233** Add image derivative rules for AVIF/WebP and SVG/raster source handling.
- [ ] **MU-0234** Add responsive crop variants and crop-safe/title-safe/UI-safe metadata for wide, square, portrait and OG ratios.
- [ ] **MU-0235** Add an Open Graph 1200×630 asset family and metadata integration where an app has a public shareable route.
- [ ] **MU-0236** Add asset provenance/license validation and reject unknown/unlicensed source assets from production.
- [ ] **MU-0237** Add checksum-based duplicate detection for app public assets.
- [ ] **MU-0238** Add asset inventory report output to the quality pipeline.
- [ ] **MU-0239** Add fallback handling for missing, failed or unsupported media.
- [ ] **MU-0240** Verify app build output includes only required derivatives and does not ship source masters unnecessarily.

**Phase 2 exit gate:** no wrong/duplicate world emblem remains; icon ownership is centralized; asset records are traceable and validated; every shipped asset has license/provenance and a fallback.

---

## Phase 3 — Atoms, primitives and workflow-backed components

### P3.1 Atomic visual vocabulary
- [ ] **MU-0301** Audit existing typography and metadata atoms in current components.
- [ ] **MU-0302** Add or standardize semantic text roles: display, heading, body, label, caption, mono and numeric.
- [ ] **MU-0303** Add semantic kicker/eyebrow/overline/source/timestamp/metadata patterns without duplicating existing Kicker.
- [ ] **MU-0304** Add status marker, index, marker, rank and counter atoms with truthful semantic meaning.
- [ ] **MU-0305** Add divider, hairline, frame, bracket, notch, rail and rule primitives.
- [ ] **MU-0306** Add focus, selection, active, progress and safe-area primitives where current source does not already provide them.
- [ ] **MU-0307** Add image/avatar placeholder and crop-anchor primitives.
- [ ] **MU-0308** Verify all atoms are semantically named, composable and exposed through stable exports.

### P3.2 Interaction primitives and components
- [ ] **MU-0309** Map candidate components to real workflows in the seven frontend apps.
- [ ] **MU-0310** Reuse native `button`, `input`, `select`, `form`, `dialog`, `table` and disclosure semantics before adding a library.
- [ ] **MU-0311** Implement Switch only if sound/effects/preferences workflows need it; test keyboard and screen reader.
- [ ] **MU-0312** Implement RadioGroup only where a real mutually exclusive configuration exists.
- [ ] **MU-0313** Implement Tabs for route-local content modes without replacing primary navigation.
- [ ] **MU-0314** Implement Tooltip for accessible icon-only or dense instrument details.
- [ ] **MU-0315** Implement Popover for contextual detail/actions with correct focus return.
- [ ] **MU-0316** Implement DropdownMenu for compact actions and keyboard navigation.
- [ ] **MU-0317** Implement Progress for measurable upload/job/task progress only; retain indeterminate alternative.
- [ ] **MU-0318** Implement Separator with correct decorative/semantic behavior.
- [ ] **MU-0319** Implement Accordion/Collapsible for genuine progressive disclosure.
- [ ] **MU-0320** Implement Toast/notification pattern with announce, dismiss, timeout and persistence rules.
- [ ] **MU-0321** Implement Combobox/Command palette only where search/action discovery exists; include accessible listbox behavior.
- [ ] **MU-0322** Implement Calendar/DatePicker only where current app workflows require date selection.
- [ ] **MU-0323** Implement Breadcrumb for nested route hierarchy where it improves orientation.
- [ ] **MU-0324** Implement Pagination for real paged collections with URL/state contract.
- [ ] **MU-0325** Implement Sheet/Drawer for mobile or contextual tasks with focus trap and escape behavior.
- [ ] **MU-0326** Add Alert/inline validation/confirmation patterns if existing StatusMessage does not cover the use case.
- [ ] **MU-0327** Add file upload/dropzone, filter/sort, empty search and selection patterns only when current app routes require them.
- [ ] **MU-0328** Add chart/data visualization primitives only for actual sourced data; provide text/table equivalent.
- [ ] **MU-0329** Add rich content/editor/media controls only for actual app workflows, not a generic showcase.
- [ ] **MU-0330** Add tests for every implemented control's public API, keyboard, focus, validation, disabled/loading/error and screen-reader contract.
- [ ] **MU-0331** Verify each implemented control has a meaningful recipe in all six skins.
- [ ] **MU-0332** Update public component exports, package exports and API documentation.
- [ ] **MU-0333** Add an automated duplicate-component check to prevent app-local copies of shared controls.
- [ ] **MU-0334** Document deferred component candidates with a specific missing workflow rather than silently dropping them.

**Phase 3 exit gate:** only workflow-backed components ship; each has tested semantics, six-world presentation and stable public API.

---

## Phase 4 — Blocks, world compositions and shell archetypes

### P4.1 Shared task blocks
- [ ] **MU-0401** Audit current blocks and their real app consumers.
- [ ] **MU-0402** Define a common composition contract for purpose, hierarchy, actions, states, keyboard/touch, responsive behavior and data truth.
- [ ] **MU-0403** Strengthen RouteShell and navigation landmarks without changing app routing ownership.
- [ ] **MU-0404** Add reusable command/navigation rail only where current app navigation needs it.
- [ ] **MU-0405** Add reusable search/filter/sort composition for actual collection routes.
- [ ] **MU-0406** Add reusable form/workflow composition for real create/edit/review flows.
- [ ] **MU-0407** Add reusable detail/inspector composition for real selected-item workflows.
- [ ] **MU-0408** Add reusable source/evidence panel composition.
- [ ] **MU-0409** Add reusable activity/timeline composition with real timestamped records.
- [ ] **MU-0410** Add reusable notification/feedback center only if an app owns the real notification data.
- [ ] **MU-0411** Add reusable responsive table/list/detail pattern with accessible mobile transformation.
- [ ] **MU-0412** Add honest loading, empty, error, offline, permission, stale and success state recipes.
- [ ] **MU-0413** Add route-state fixtures so each block can be visually tested deterministically.

### P4.2 Six signature world compositions
- [ ] **MU-0414** Build Imperium Monumental Gate composition from current PageHero/WorldArtwork foundations; avoid duplicating the existing generic hero.
- [ ] **MU-0415** Build Imperium Passage/Threshold transition composition.
- [ ] **MU-0416** Build Imperium axial destination field/spatial directory.
- [ ] **MU-0417** Build Lunar Orbital Navigation with accessible linear fallback.
- [ ] **MU-0418** Build Lunar Timeline with measured-vs-symbolic data distinction.
- [ ] **MU-0419** Build Lunar Celestial Archive/Atlas record composition.
- [ ] **MU-0420** Build ROCKSOUL Chapter Cover and chapter-entry composition.
- [ ] **MU-0421** Build ROCKSOUL Filmstrip and story timeline.
- [ ] **MU-0422** Build ROCKSOUL Transmission Poster/archive plate.
- [ ] **MU-0423** Build Nexus Spatial Selector for actual system/area selection.
- [ ] **MU-0424** Build Nexus Instrument Bay for task-oriented controls.
- [ ] **MU-0425** Build Nexus Sensor Scope that only displays sourced real values and stale/unavailable states.
- [ ] **MU-0426** Build Nexus System Map for real nodes and edges.
- [ ] **MU-0427** Build Riot Comic Spread with keyboard-order and reading-order parity.
- [ ] **MU-0428** Build Riot Poster Wall and Sticker Layer with controlled visual hierarchy.
- [ ] **MU-0429** Build Riot Issue Index/Xerox Archive composition.
- [ ] **MU-0430** Build Mycelium Living Network for real relationships.
- [ ] **MU-0431** Build Mycelium Organic Node Map with keyboard/list alternative.
- [ ] **MU-0432** Build Mycelium Growth Path and Relationship Graph from real data only.
- [ ] **MU-0433** Verify every world has at least two genuinely distinctive signature compositions beyond shared hero treatment.
- [ ] **MU-0434** Verify all composition families include relevant empty/error/offline/permission/stale/success states.
- [ ] **MU-0435** Verify no composition uses meaningless decorative charts, fake telemetry, random graph edges or generic card wallpaper.

### P4.3 Shell archetypes and platform parity
- [ ] **MU-0436** Map the 12 blueprint shell archetypes to existing app routes and identify which are truly needed.
- [ ] **MU-0437** Implement/refine Empire Gateway shell recipe for GATE.
- [ ] **MU-0438** Implement/refine Community Dock shell recipe for DOCK.
- [ ] **MU-0439** Implement/refine Operations Cockpit and Headquarter shell recipes without creating a second control plane.
- [ ] **MU-0440** Implement/refine MoonWitness Archive and Immersive Reader recipes only where existing content routes need them.
- [ ] **MU-0441** Implement/refine Identity Center recipe for ID without changing authentication/session behavior.
- [ ] **MU-0442** Implement/refine Knowledge Observatory recipe for JIZZ using evidence and source provenance.
- [ ] **MU-0443** Implement/refine Creative Foundry shell as a client-side UI for existing workflows; do not create SHADOW backend models.
- [ ] **MU-0444** Implement/refine Instrument Workspace for real Headquarter tools.
- [ ] **MU-0445** Implement/refine Map & Network Explorer only for real geospatial/network relationships.
- [ ] **MU-0446** Implement/refine Settings Workbench only for real preferences and settings.
- [ ] **MU-0447** Mark unused shell archetypes as deferred with a workflow-based reason; do not scaffold new apps.
- [ ] **MU-0448** Verify shell navigation, focus order, responsive transformation and app ownership.

**Phase 4 exit gate:** each DNA has at least two tested signature compositions; shell recipes map to existing apps and do not create new app/backend ownership.

---

## Phase 5 — Research-led intelligent interface capabilities

### P5.1 Deterministic intent and world grammar
- [ ] **MU-0501** Define a typed task-intent schema (goal, entity, constraints, actions, evidence needs, risk and fallback).
- [ ] **MU-0502** Define a semantic design brief schema independent of visual skin.
- [ ] **MU-0503** Define an approved recipe registry keyed by semantic task and world DNA.
- [ ] **MU-0504** Implement deterministic World Grammar Engine lookup from task + SkinId to a validated recipe.
- [ ] **MU-0505** Add schema validation and reject unknown component names/props.
- [ ] **MU-0506** Add fixtures proving identical intent yields stable composition output.
- [ ] **MU-0507** Add all-six-world recipe mapping for common tasks (navigation, form, detail, timeline, evidence, graph, status).
- [ ] **MU-0508** Ensure engine output is a bounded composition description, never arbitrary executable markup or code.
- [ ] **MU-0509** Add semantic 2D fallback for every spatial recipe.

### P5.2 Intent-to-Interface Compiler
- [ ] **MU-0510** Implement pipeline stages: intent → task model → semantic brief → approved recipe → UI composition → validation.
- [ ] **MU-0511** Add validation stage for accessibility, data truth, permissions supplied by app, and allowed component contracts.
- [ ] **MU-0512** Add error diagnostics for unsupported intent, missing data and unsafe/ambiguous action.
- [ ] **MU-0513** Add deterministic snapshot tests for compiler stages.
- [ ] **MU-0514** Keep AI suggestion integration outside core UI; validate all external/AI-produced suggestions as untrusted data.
- [ ] **MU-0515** Document compiler limits and ensure it never makes authorization decisions.

### P5.3 Intent Lens and user agency
- [ ] **MU-0516** Define Intent Lens state contract and current-objective representation.
- [ ] **MU-0517** Implement task-focused presentation mode that does not remove critical context or permissions.
- [ ] **MU-0518** Add pin, reorder, restore-standard-view and reset controls.
- [ ] **MU-0519** Explain why the current view was adapted using concise user-facing rationale.
- [ ] **MU-0520** Add keyboard, touch and screen-reader operation for all lens controls.
- [ ] **MU-0521** Ensure no sensitive profiling, hidden preference inference or automatic irreversible action occurs.
- [ ] **MU-0522** Add tests for user override, persistence boundaries and reset behavior.

### P5.4 Evidence Surface and Scene Graph
- [ ] **MU-0523** Define Evidence Surface schema for source, timestamp, freshness, uncertainty, unavailable/stale state and available actions.
- [ ] **MU-0524** Implement concise result-first Evidence Surface block with expandable audit details.
- [ ] **MU-0525** Ensure it never displays private chain-of-thought or fabricated confidence scores.
- [ ] **MU-0526** Define typed Scene Graph node/edge schema for destinations, chapters, events, media and relationships.
- [ ] **MU-0527** Implement graph validation for duplicate IDs, invalid edges, missing labels and unsupported node types.
- [ ] **MU-0528** Implement spatial graph view only when the relationship structure is meaningful.
- [ ] **MU-0529** Implement accessible list/tree/table fallback with equivalent information and actions.
- [ ] **MU-0530** Add real-data and clearly labelled fixture-data tests; reject random/fake edges in production mode.

### P5.5 Experience Quality Observatory and anti-slop
- [ ] **MU-0531** Define quality evidence schema for tests, coverage, visual diffs, contrast, accessibility, assets, bundle and performance.
- [ ] **MU-0532** Implement Experience Quality Observatory from actual CI/test/build artifacts only.
- [ ] **MU-0533** Display unavailable/stale evidence honestly; never fabricate green checks or live telemetry.
- [ ] **MU-0534** Add lint checks for raw palette misuse, app-local theme variables and private selector coupling.
- [ ] **MU-0535** Add duplicate asset/emblem hash detection to the quality pipeline.
- [ ] **MU-0536** Add diagnostics for repetitive generic hero/card patterns where a reliable static rule is possible.
- [ ] **MU-0537** Add a manual anti-slop review rubric for visual hierarchy, world distinctiveness, meaningful motion and information density.
- [ ] **MU-0538** Treat visual complexity as a diagnostic signal, not an objective beauty score; tie each flagged issue to a concrete task/user cost.
- [ ] **MU-0539** Document source, limitations and confidence boundaries of every quality metric.

**Phase 5 exit gate:** research-led features are bounded, deterministic, user-controlled, evidence-backed and accessible; no arbitrary runtime UI generation or private reasoning display.

---

## Phase 6 — Artwork, Avatar, Motion, Effects, Loading and SFX Foundries

### P6.1 Artwork and cover foundry
- [ ] **MU-0601** Define structured artwork brief fields: asset ID, DNA, app/route, narrative purpose, focal subject, camera, layers, lighting, material, exclusions, crops, formats, license, alt and fallback.
- [ ] **MU-0602** Build a reusable artwork brief validator and preview record.
- [ ] **MU-0603** Produce detailed original Imperium world/app hero plates with approved monumental architecture.
- [ ] **MU-0604** Produce detailed original Lunar observatory/atlas/archive plates.
- [ ] **MU-0605** Produce detailed original ROCKSOUL chapter/episode/transmission covers consistent with the silent-storyteller canon.
- [ ] **MU-0606** Produce detailed original Nexus instrument/system plates.
- [ ] **MU-0607** Produce detailed original Riot issue/poster/comic/xerox plates.
- [ ] **MU-0608** Produce detailed original Mycelium organism/network/growth plates.
- [ ] **MU-0609** Produce chapter, episode, transmission and archive cover families with responsive crops.
- [ ] **MU-0610** Produce spatial map/atlas/graph visual plates only when they explain actual app data or are clearly illustrative.
- [ ] **MU-0611** Produce loading/arrival/transition plates with text-safe and control-safe areas.
- [ ] **MU-0612** Produce social/OG cover variants and app identity exports.
- [ ] **MU-0613** Generate AVIF/WebP derivatives from approved masters with documented quality settings.
- [ ] **MU-0614** Verify all six worlds at 16:9, square, portrait and narrow responsive crops.
- [ ] **MU-0615** Ensure no faces in cosmic/sacred artwork, no depiction of ALLAH and no copyrighted imitation.
- [ ] **MU-0616** Verify all artwork text remains in DOM and all informative media has alt/text equivalent.
- [ ] **MU-0617** Verify source dimensions, output sizes, file weights and fallback behavior.

### P6.2 MoonWitness Avatar Studio
- [ ] **MU-0618** Define avatar families: abstract sigil, symbolic/non-human, initials/emblem, role frame and optional user-authorized portrait.
- [ ] **MU-0619** Define explicit user-triggered create/edit/replace/remove flow; never generate automatically during profile rendering.
- [ ] **MU-0620** Define consent, moderation, privacy, retention and source-provenance boundaries.
- [ ] **MU-0621** Implement deterministic SVG/avatar presets for all six worlds.
- [ ] **MU-0622** Implement preview, crop, color/variant and safe fallback controls.
- [ ] **MU-0623** Keep avatar persistence and profile identity owned by the consuming app/API; UI only accepts props and callbacks.
- [ ] **MU-0624** Add tests for empty, initials, generated symbol, user image, replacement, removal and inaccessible image states.
- [ ] **MU-0625** Ensure no generated avatar represents ALLAH or a sacred entity.

### P6.3 Motion, effects and transition system
- [ ] **MU-0626** Audit current VisualEffectsProvider, MotionFrame, CSS animations and per-skin motion values.
- [ ] **MU-0627** Define named motion primitives and choreography: establish, focus, resolve; arrival, reveal, cut, orbit, signal, branch.
- [ ] **MU-0628** Add explicit motion purpose, duration, easing, interruptibility and fallback metadata.
- [ ] **MU-0629** Add per-world motion profiles without duplicating the shared motion runtime.
- [ ] **MU-0630** Add pause, reduced-motion precedence and low-power/device-aware behavior.
- [ ] **MU-0631** Remove or reduce nonessential continuous high-cost filters, glow and particle effects.
- [ ] **MU-0632** Ensure transforms/opacity are preferred over layout-thrashing animations.
- [ ] **MU-0633** Add deterministic tests for reduced-motion, pause and interrupted transitions.
- [ ] **MU-0634** Add visual review for all motion profiles on desktop and mobile.
- [ ] **MU-0635** Add optional WebGL/WebGPU enhancement only if a concrete user task justifies it; capability-detect and provide static fallback.

### P6.4 Loading, waiting and SFX
- [ ] **MU-0636** Inventory current Skeleton, StatePanel, StatusMessage, audio engine and effects toggle.
- [ ] **MU-0637** Define loading/waiting contract for known-duration, measurable-progress and indeterminate operations.
- [ ] **MU-0638** Build world-specific arrival/loading identities using existing art/motion primitives.
- [ ] **MU-0639** Build generic skeleton, spinner, progress and streaming patterns with honest state semantics.
- [ ] **MU-0640** Ensure loading states never block usable content longer than necessary.
- [ ] **MU-0641** Extend existing procedural SFX engine with typed event metadata and stable sound names.
- [ ] **MU-0642** Map select/confirm/cancel/arrival/notification/complete events to subtle per-world profiles.
- [ ] **MU-0643** Keep SFX off by default; provide mute/volume/preference controls and no-audio fallback.
- [ ] **MU-0644** Add SFX tests for user gesture requirements, unsupported AudioContext, preference storage failure and disabled mode.
- [ ] **MU-0645** Create Sound Lab preview using original/procedural sounds only; no copyrighted music.
- [ ] **MU-0646** Verify every sound event has equivalent visual/semantic feedback.

**Phase 6 exit gate:** foundry outputs are original, licensed, traceable and responsive; avatar generation is explicit; motion and audio remain optional, safe and accessible.

---

## Phase 7 — Laboratories, previews and deterministic generation tooling

- [ ] **MU-0701** Audit existing Skin Laboratory and reuse its representative task instead of creating a second skin lab.
- [ ] **MU-0702** Upgrade Skin Laboratory to compare all six worlds with equivalent content, form, dialog, navigation and state fixtures.
- [ ] **MU-0703** Add composition gallery showing the signature compositions of each world.
- [ ] **MU-0704** Add Atom/Component Lab with keyboard, focus, disabled, validation, loading and error states.
- [ ] **MU-0705** Add Brand/Logo Lab with all lockups, backgrounds, sizes and export previews.
- [ ] **MU-0706** Add Icon/Vector Lab with semantic search, size, stroke/fill and contrast previews.
- [ ] **MU-0707** Add Avatar Lab with deterministic presets, preview and replace/remove states.
- [ ] **MU-0708** Add Artwork/Cover Lab with crop-safe and responsive previews.
- [ ] **MU-0709** Add Motion/Effects Lab with pause, reduced-motion, low-power and per-world comparisons.
- [ ] **MU-0710** Add Sound Lab using existing audio engine and off-by-default behavior.
- [ ] **MU-0711** Add Loading/State Lab for real and indeterminate state patterns.
- [ ] **MU-0712** Add Asset Lab showing manifest, provenance, derivative and validation status.
- [ ] **MU-0713** Add Creative Foundry workflow to create a brief, preview, validate and export deterministic assets.
- [ ] **MU-0714** Keep all labs maintainer-oriented and out of public user routes unless explicitly required.
- [ ] **MU-0715** Ensure every generator has deterministic inputs, reproducible outputs and a source master.
- [ ] **MU-0716** Ensure generated artifacts cannot overwrite approved masters without an explicit versioned operation.
- [ ] **MU-0717** Add snapshot fixtures for generated outputs and stable asset IDs.
- [ ] **MU-0718** Document generator boundaries and manual approval needs for any externally generated raster media.

**Phase 7 exit gate:** labs are usable maintainer tools, generators are deterministic and reproducible, and no lab duplicates existing product functionality.

---

## Phase 8 — App integration and adoption

- [ ] **MU-0801** Audit all seven frontend app root layouts for `SkinRoot`, fonts, metadata, theme loading and duplicate providers.
- [ ] **MU-0802** Align GATE root with IMPERIUM LUMEN.
- [ ] **MU-0803** Align DOCK root with IMPERIUM LUMEN.
- [ ] **MU-0804** Align ID root with LUNAR CHRONICLES.
- [ ] **MU-0805** Align HARBOR root with ROCKSOUL.
- [ ] **MU-0806** Align HEADQUARTER root with NEXUS PARADOX.
- [ ] **MU-0807** Align MOONSKY root with RIOT ANARCHY.
- [ ] **MU-0808** Align JIZZ root with MYCELIUM.
- [ ] **MU-0809** Preserve only approved route-level SkinScope exceptions; verify no duplicate VisualEffectsProvider.
- [ ] **MU-0810** Replace wrong/duplicate app emblems and hero references with correct registry/asset IDs.
- [ ] **MU-0811** Audit app routes for local duplicate buttons, forms, tables, dialogs, icons and state blocks.
- [ ] **MU-0812** Migrate only duplicate UI primitives to shared public package exports; preserve app route/data logic.
- [ ] **MU-0813** Remove app-local token declarations only after all consumers use shared tokens and visual parity is verified.
- [ ] **MU-0814** Remove private `mw-*` selector dependencies from apps by replacing them with public APIs or documented slots.
- [ ] **MU-0815** Verify all app public asset references resolve after any asset pipeline change.
- [ ] **MU-0816** Verify metadata, favicons, themeColor and Open Graph assets match app DNA.
- [ ] **MU-0817** Verify no backend/service app (ARSY/SENTINEL) is incorrectly wrapped in frontend skin components.
- [ ] **MU-0818** Verify app-level route ownership and business logic remain unchanged by UI refactors.
- [ ] **MU-0819** Remove `session_card.tsx` only if no consumer remains and compatibility is not required; otherwise document deprecation.
- [ ] **MU-0820** Move or remove temporary artwork/quantizer files only after proving they are not build/test inputs; retain useful tools in documented scripts.
- [ ] **MU-0821** Verify each consuming app build after its own migration before proceeding to the next app.
- [ ] **MU-0822** Verify responsive app routes with correct DNA and no horizontal overflow.

**Phase 8 exit gate:** all seven frontends consume the correct shared identity and UI system; no business logic or backend ownership moved into the UI package.

---

## Phase 9 — Certification, documentation and release readiness

### P9.1 Accessibility, responsive and performance
- [ ] **MU-0901** Define viewport matrix for desktop, laptop, tablet, narrow mobile and 320px minimum width.
- [ ] **MU-0902** Test keyboard-only navigation, visible focus, focus return, escape behavior and skip links.
- [ ] **MU-0903** Test screen-reader names, landmarks, headings, announcements and table/list semantics.
- [ ] **MU-0904** Test touch target sizes and pointer interactions for all new controls.
- [ ] **MU-0905** Verify WCAG AA contrast for text and meaningful non-text controls across six skins.
- [ ] **MU-0906** Verify reduced-motion behavior with OS preference and manual effects pause.
- [ ] **MU-0907** Verify no-audio operation preserves all information and feedback.
- [ ] **MU-0908** Verify responsive compositions preserve reading order, primary action visibility and crop safety.
- [ ] **MU-0909** Measure LCP, CLS, INP, JS bundle, font transfer, image transfer and GPU-heavy effects on representative routes.
- [ ] **MU-0910** Establish measured budgets from real baseline hardware; do not invent performance results.
- [ ] **MU-0911** Optimize largest assets and font loading based on measurements.
- [ ] **MU-0912** Verify optional WebGL/WebGPU features are absent or gracefully disabled on unsupported devices.

### P9.2 Visual and quality verification
- [ ] **MU-0913** Build a visual matrix covering six skins × signature compositions × key component states.
- [ ] **MU-0914** Capture screenshots at desktop, tablet and mobile sizes for every DNA.
- [ ] **MU-0915** Capture reduced-motion and effects-paused screenshots.
- [ ] **MU-0916** Run visual regression tests for stable fixtures and review every material diff.
- [ ] **MU-0917** Verify asset hashes, manifest integrity, licensing and duplicate detection.
- [ ] **MU-0918** Verify all public component/skin/asset exports and package subpath exports.
- [ ] **MU-0919** Verify docs links and API examples against actual exports.
- [ ] **MU-0920** Run `pnpm ui:test`.
- [ ] **MU-0921** Run `pnpm ui:contrast`.
- [ ] **MU-0922** Run `pnpm lint:arch`.
- [ ] **MU-0923** Run `pnpm lint`.
- [ ] **MU-0924** Run `pnpm typecheck`.
- [ ] **MU-0925** Run `pnpm docs:check`.
- [ ] **MU-0926** Run `pnpm gate:build`, `pnpm dock:build`, `pnpm id:build`, `pnpm harbor:build`, `pnpm headquarter:build`, `pnpm moonsky:build` and `pnpm jizz:build`.
- [ ] **MU-0927** Run full workspace build if the current environment supports it; record exact scope and any unrelated failure.
- [ ] **MU-0928** Verify GitHub CI for the final `dev` commits; cite the exact workflow run.
- [ ] **MU-0929** Do not report full certification if any required app build, contrast, accessibility, visual or docs gate remains failing.

### P9.3 Documentation and delivery
- [ ] **MU-0930** Update README current inventory to match actual public exports.
- [ ] **MU-0931** Update BLUEPRINT implementation/gap statuses and remove stale claims.
- [ ] **MU-0932** Update RESEARCH-AND-DIRECTION with adopted, deferred and rejected concepts plus evidence.
- [ ] **MU-0933** Update DNA component mapping with implemented APIs and status.
- [ ] **MU-0934** Update DNA quality gates with actual test/visual evidence.
- [ ] **MU-0935** Update DESIGN only where implementation or accepted doctrine changed.
- [ ] **MU-0936** Add a DECISIONS entry only for a genuinely accepted architecture change; do not turn implementation notes into ADRs.
- [ ] **MU-0937** Update BACKLOG status for completed or deferred Moon UI items using evidence-based states.
- [ ] **MU-0938** Update this plan's coverage matrix and report with every task disposition.
- [ ] **MU-0939** Produce a final capability matrix with implemented/tested/visually verified/integrated/certified states separated.
- [ ] **MU-0940** Record final HEAD, all commit SHAs, changed files, commands/results, CI URLs, screenshots and residual blockers.
- [ ] **MU-0941** Confirm all changes are on `dev`, no branch was created, and `main` was untouched.
- [ ] **MU-0942** Commit and push final documentation/evidence updates to `dev` after all relevant checks pass.

**Final exit gate:** every applicable task has evidence, the coverage matrix has no unexplained omissions, no duplicate plan remains active, and all unresolved external blockers are explicitly isolated.

---

## Parallelization rules

Safe parallel work after Phase 0:
- Independent font license research and emblem source design.
- Independent six-world artwork briefs, provided each uses the same asset schema.
- Independent component implementations when files/public exports do not overlap.
- Independent world composition work by DNA.
- Independent app integration by frontend app, after shared API contracts are frozen.

Must remain sequential:
- Baseline before code.
- Canon/mapping conflict resolution before skin migration.
- Token contract before component recipe expansion.
- Asset manifest before derivative generation.
- Shared public API before app adoption.
- Each app's own build after its migration.
- Final docs/status update after evidence exists.

## Task sizing contract

A task is too large and must be split before execution if it:
- changes more than one independent subsystem;
- spans more than one app without a mechanical shared change;
- cannot be verified with one focused command or manual check;
- requires several unrelated design decisions;
- has no clear file ownership or acceptance result.

Each task must end with a short evidence entry in `report.md`. Do not mark a phase complete merely because all checkboxes were mechanically changed.
