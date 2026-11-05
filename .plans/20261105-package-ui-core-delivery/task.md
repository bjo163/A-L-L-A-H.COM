---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-TASKS"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
target_branch: "dev"
parent_task_ledger: "../20261105-moon-ui-master-consolidation/task.md"
---

# @moonwitness/ui — Atomic Execution Tasks

Status: `[ ] pending` · `[~] in progress` · `[x] verified complete` · `[!] blocked` · `[-] not applicable with evidence`

## Execution protocol

- This is the detailed package-only execution view requested for `packages/ui`.
- Parent task IDs in `.plans/20261105-moon-ui-master-consolidation/task.md` remain the canonical project ledger. Every PUI task maps to one or more parent MU IDs in the coverage matrix; update both records together when implementation is executed.
- Do not create duplicate implementations. Re-read source, exports, tests, consumers and active plans before each task.
- A task is complete only with source-backed evidence and its stated verification. Documentation or a mockup alone is not implementation.
- Work on existing `dev` only. No new branch, no `main`, no destructive git commands.
- Keep tasks small and reviewable. Commit coherent passing groups; record changed paths, commands/output, commit SHA and blockers in `report.md`.
- Existing passing foundations are verified, not rebuilt. Existing partial work is extended only against a named acceptance gap.
- Do not change app routes, backend services, app-specific business logic, authentication, API contracts or deployment as part of this plan.

---

## Phase 0 — Live baseline and package ownership

### P0.1 Repository and package baseline
- [x] **PUI-0001** Verify repository is `bjo163/A-L-L-A-H.COM` and record remote URL.
- [x] **PUI-0002** Verify current branch is the existing `dev`; do not create or switch branches.
- [x] **PUI-0003** Record remote `dev` HEAD and timestamp in `report.md`.
- [x] **PUI-0004** Inspect worktree status and preserve all existing modifications.
- [x] **PUI-0005** Read root engineering instructions, design decisions, quality contract and all six DNA references relevant to package work.
- [x] **PUI-0006** Read `packages/ui/README.md`, `BLUEPRINT.md`, `RESEARCH-AND-DIRECTION.md` and this plan; extract package requirements into the coverage matrix.
- [x] **PUI-0007** Enumerate every file under `packages/ui/src`, `packages/ui/test` and package asset directories from the live tree.
- [x] **PUI-0008** Enumerate package exports and compare them with every real application import.
- [x] **PUI-0009** Record actual package scripts, root quality commands and CI jobs; do not invent commands.
- [x] **PUI-0010** Run the existing baseline `pnpm ui:test` and record exact result.
- [x] **PUI-0011** Run the existing baseline `pnpm ui:contrast` and record exact result.
- [x] **PUI-0012** Run relevant baseline typecheck, lint and architecture checks; record each independently.
- [x] **PUI-0013** Record baseline package build/consumer build results using scripts that actually exist.
- [x] **PUI-0014** Record baseline source, test, asset, font, audio and export counts.
- [x] **PUI-0015** Classify each package capability as implemented, partial, proposed, tested, visually verified, integrated or blocked.

### P0.2 Ownership and overlap
- [x] **PUI-0016** Confirm `@moonwitness/ui` is the sole shared visual and interaction package.
- [x] **PUI-0017** Search for duplicate token registries, icon systems, motion providers, SFX engines and asset registries before proposing changes.
- [x] **PUI-0018** Map each current component/block/primitive to its package owner and public export.
- [x] **PUI-0019** Verify app-specific routes, fetching, authorization, persistence and business logic remain outside the package.
- [x] **PUI-0020** Map package tasks to canonical parent MU task IDs; identify overlap and defer any item already fully satisfied.
- [x] **PUI-0021** Record baseline findings and the first verified implementation gaps in `report.md`.

**Phase 0 exit gate:** current source and tests have been inspected; package ownership and task overlap are explicit; no implementation begins from assumptions.

---

## Phase 1 — Package API, exports and architecture

### P1.1 Public contract
- [x] **PUI-0101** Audit root export `src/index.ts` for completeness, accidental internals and duplicate names.
- [x] **PUI-0102** Audit `./components`, `./blocks`, `./primitives`, `./raw`, `./sfx` and `./tokens` subpath exports.
- [x] **PUI-0103** Audit CSS exports `./skins.css` and `./theme.css` against actual package files.
- [x] **PUI-0104** Verify every public export resolves in a real consumer context.
- [x] **PUI-0105** Identify consumer imports that bypass public exports through private source paths.
- [ ] **PUI-0106** Replace private imports only where the package API already provides an equivalent stable export; coordinate consumer changes under parent task ownership.
- [ ] **PUI-0107** Document public API stability and the policy for adding, deprecating and removing exports.
- [x] **PUI-0108** Verify package metadata, React 19 peer dependencies and workspace dependency boundaries.
- [x] **PUI-0109** Verify package source format remains TypeScript/TSX and ESM as currently contracted.
- [x] **PUI-0110** Detect circular dependencies and unintended imports from app/backend packages.
- [ ] **PUI-0111** Verify tree-shaking and CSS import behavior using the actual consumer build pipeline.
- [~] **PUI-0112** Add export-contract tests for every supported public entrypoint.

### P1.2 Layer boundaries
- [ ] **PUI-0113** Verify tokens/skins own presentation values only and contain no business data.
- [ ] **PUI-0114** Verify raw layout owns structure only and has no brand or data-fetching responsibilities.
- [ ] **PUI-0115** Verify components own semantic controls and atoms, not app workflows.
- [ ] **PUI-0116** Verify primitives own shared mechanics/providers, not product navigation or remote data.
- [ ] **PUI-0117** Verify blocks own reusable task compositions and receive data/callbacks from consumers.
- [ ] **PUI-0118** Add or refine architecture checks for forbidden app/backend imports and private implementation leakage.
- [ ] **PUI-0119** Document package layer ownership and import direction with examples grounded in current source.

**Phase 1 exit gate:** public entrypoints are intentional and tested; layer boundaries are enforceable; consumers do not depend on accidental internals.

---

## Phase 2 — Six-world skin and token engine

### P2.1 Skin runtime contract
- [ ] **PUI-0201** Audit `SkinId`, registry schema and all six registered values.
- [ ] **PUI-0202** Verify `SkinRoot` selection, fallback and invalid-ID behavior.
- [ ] **PUI-0203** Verify `SkinScope` isolation and nested-scope semantics.
- [ ] **PUI-0204** Verify server-rendered skin selection matches first client render.
- [ ] **PUI-0205** Add regression coverage for hydration stability and deterministic fallback.
- [ ] **PUI-0206** Verify changing skin cannot alter component behavior, permissions or business logic.
- [ ] **PUI-0207** Verify there is one token authority and no app-level competing palette.
- [ ] **PUI-0208** Audit all `SkinTokens` fields and CSS variables consumed by package components and app consumers.

### P2.2 Semantic token completeness
- [ ] **PUI-0209** Define and validate semantic roles for canvas, surface, elevated surface and overlay.
- [ ] **PUI-0210** Define and validate text, muted text, inverse text, border and divider roles.
- [ ] **PUI-0211** Define and validate accent, interactive, selected, focus and disabled roles.
- [ ] **PUI-0212** Define and validate success, warning, danger and informational status roles.
- [ ] **PUI-0213** Define and validate typography, spacing, density, radius, geometry and elevation roles.
- [ ] **PUI-0214** Define and validate motion, material and world identity roles only where consumed by runtime.
- [ ] **PUI-0215** Remove raw hard-coded color values from shared component styles when a semantic token exists.
- [ ] **PUI-0216** Ensure app overrides are scoped and cannot mutate global package skin state.

### P2.3 Six distinctive visual grammars
- [ ] **PUI-0217** Document typed grammar fields supported by the existing engine; add only fields required by approved DNA.
- [ ] **PUI-0218** Validate IMPERIUM LUMEN's monumental axial architecture, negative space, ivory/obsidian and restrained antique-gold direction.
- [ ] **PUI-0219** Validate LUNAR CHRONICLES' orbital atlas, chronology, archival layers and silver-blue observatory direction.
- [ ] **PUI-0220** Validate ROCKSOUL's cinematic framing, tactile print, chapter rhythm, rain/noir material and selective crimson.
- [ ] **PUI-0221** Validate NEXUS PARADOX's instrument planes, precise geometry, signal traces and technical density.
- [ ] **PUI-0222** Validate RIOT ANARCHY's xerox collage, halftone, torn-paper grammar and kinetic typography.
- [ ] **PUI-0223** Validate MYCELIUM's biomorphic surfaces, branching paths, organic nodes and mineral-green language.
- [ ] **PUI-0224** Verify each DNA differs in composition, shape, material, typography, density, navigation and motion—not palette alone.
- [ ] **PUI-0225** Add tests that fail on missing grammar fields or accidental cross-world equality.
- [ ] **PUI-0226** Verify each skin has a documented static/reduced-motion and accessible fallback.

### P2.4 Typography and contrast
- [ ] **PUI-0227** Audit all current font declarations and verify whether font files exist in the live tree.
- [ ] **PUI-0228** Verify license and provenance for Cormorant Garamond, Inter, Cascadia Code and every proposed font asset.
- [ ] **PUI-0229** Add self-hosted licensed fonts only where approved and supported by current build conventions.
- [ ] **PUI-0230** Define font roles for display, heading, body, label and technical/numeric content.
- [ ] **PUI-0231** Verify fallback stacks and font loading do not create unacceptable layout shift.
- [ ] **PUI-0232** Run contrast verification for text, controls, borders, focus and status states across all six skins.
- [ ] **PUI-0233** Fix contrast failures at semantic-token level and add regression tests.
- [ ] **PUI-0234** Verify zoom/reflow and long localized strings do not break core component layouts.

**Phase 2 exit gate:** six typed worlds remain distinct on one deterministic engine; semantic token coverage and contrast pass; font rights and delivery are verified.

---

## Phase 3 — Semantic atoms, controls and reusable blocks

### P3.1 Existing component audit
- [ ] **PUI-0301** Inventory every exported component and record its current API, semantic element and consumer.
- [ ] **PUI-0302** Audit Button states: default, hover, focus, active, disabled, loading and icon-only.
- [ ] **PUI-0303** Audit Input, Textarea, Select, Checkbox and Form validation/label/error contracts.
- [ ] **PUI-0304** Audit Dialog focus trap, escape handling, focus return and accessible naming.
- [ ] **PUI-0305** Audit Table semantics, responsive strategy and empty/loading/error states.
- [ ] **PUI-0306** Audit Card, Badge, Avatar, Link, Skeleton, Icon and Emblem semantics and variants.
- [ ] **PUI-0307** Audit ToolRegistryCard, ToolDetailPanel and ToolParameterField for package-level generic behavior versus app-specific responsibility.
- [ ] **PUI-0308** Record each existing component's six-skin coverage and maturity without assuming source presence means certification.

### P3.2 Atomic visual vocabulary
- [ ] **PUI-0309** Audit current typography and metadata primitives; reuse existing Kicker and related atoms.
- [ ] **PUI-0310** Standardize semantic display, heading, body, label, caption, mono and numeric roles where missing.
- [ ] **PUI-0311** Standardize source, timestamp, eyebrow, overline and metadata patterns without duplicate atoms.
- [ ] **PUI-0312** Add or refine status/index/counter markers only where their meaning is explicit.
- [ ] **PUI-0313** Add or refine line/frame/rail/bracket/notch primitives only where repeated source-backed patterns exist.
- [ ] **PUI-0314** Verify focus, selection, active and safe-area primitives; implement only genuine gaps.
- [ ] **PUI-0315** Verify all atoms are composable, semantically named, tested and publicly exported.

### P3.3 Workflow-backed control gaps
- [ ] **PUI-0316** Map proposed controls to real consumer workflows before implementation.
- [ ] **PUI-0317** Evaluate native semantics before Base UI or another dependency.
- [ ] **PUI-0318** Implement missing Switch/RadioGroup only if a real preference/configuration workflow requires them.
- [ ] **PUI-0319** Implement Tabs only for local content modes, not as a duplicate primary navigation system.
- [ ] **PUI-0320** Implement Tooltip/Popover/DropdownMenu only with complete keyboard and focus contracts.
- [ ] **PUI-0321** Implement Progress only for measurable real progress; provide indeterminate state when needed.
- [ ] **PUI-0322** Implement Accordion/Collapsible only for real progressive disclosure.
- [ ] **PUI-0323** Implement Toast/notification only with explicit announce, dismiss, timeout and persistence behavior.
- [ ] **PUI-0324** Implement Combobox/Command only where search/action discovery is a real requirement.
- [ ] **PUI-0325** Implement Calendar/DatePicker only where an actual app workflow needs date selection.
- [ ] **PUI-0326** Implement Breadcrumb/Pagination/Sheet only when consumer route hierarchy or collection behavior justifies them.
- [ ] **PUI-0327** Implement file upload, filter/sort, chart or rich-content controls only with a named real consumer and source-backed data contract.
- [ ] **PUI-0328** For each accepted new control, define typed props, semantic markup, keyboard, focus, validation, disabled/loading/error and responsive behavior.
- [ ] **PUI-0329** Add behavior tests and six-skin recipes for every accepted control.
- [ ] **PUI-0330** Add accepted components to public exports and API documentation.
- [ ] **PUI-0331** Record rejected/deferred candidates with the missing workflow or acceptance evidence.

### P3.4 Shared blocks and states
- [ ] **PUI-0332** Inventory existing blocks and actual app consumers.
- [ ] **PUI-0333** Audit RouteShell landmarks, responsive behavior and composition API.
- [ ] **PUI-0334** Audit PageHero, SectionHeading, DestinationCard/Grid and WorldArtwork composition behavior.
- [ ] **PUI-0335** Audit StatePanel and StatusMessage for loading, empty, error, offline, denied, stale and success coverage.
- [ ] **PUI-0336** Audit EcosystemNavbar and SkipLink keyboard/screen-reader/mobile behavior.
- [ ] **PUI-0337** Define a shared block contract for purpose, hierarchy, actions, states, responsive behavior and data truth.
- [ ] **PUI-0338** Add reusable search/filter/sort, form, inspector, evidence and timeline blocks only where real workflows support them.
- [ ] **PUI-0339** Ensure blocks receive data and callbacks; they must not fetch, persist or authorize app data.
- [ ] **PUI-0340** Add deterministic route/state fixtures for repeatable block verification.

**Phase 3 exit gate:** existing controls meet their documented semantics; new controls are workflow-backed; blocks remain reusable and do not absorb app business logic.

---

## Phase 4 — Six signature composition systems

### P4.1 Imperium Lumen
- [ ] **PUI-0401** Audit current Imperium PageHero/WorldArtwork and avoid duplicating the existing generic hero.
- [ ] **PUI-0402** Define and verify Monumental Gate composition with responsive scale and clear primary action.
- [ ] **PUI-0403** Define and verify Passage/Threshold transition composition.
- [ ] **PUI-0404** Define and verify axial destination field/spatial directory with linear fallback.

### P4.2 Lunar Chronicles
- [ ] **PUI-0405** Define and verify Orbital Navigation with keyboard and linear fallback.
- [ ] **PUI-0406** Define and verify Timeline composition with sourced timestamps and clear measured/symbolic distinction.
- [ ] **PUI-0407** Define and verify Celestial Archive/Atlas record composition.

### P4.3 ROCKSOUL
- [ ] **PUI-0408** Define and verify Chapter Cover and chapter-entry composition.
- [ ] **PUI-0409** Define and verify Filmstrip/Scene Sequence with readable captions and controls.
- [ ] **PUI-0410** Define and verify Narrative Transmission/Archive composition without depicting faces or copying copyrighted artwork.

### P4.4 Nexus Paradox
- [ ] **PUI-0411** Define and verify Instrument Bay composition with real state labels.
- [ ] **PUI-0412** Define and verify Spatial Selector with direct keyboard destination access.
- [ ] **PUI-0413** Define and verify System Map/Inspector composition using only real relationship data.

### P4.5 Riot Anarchy
- [ ] **PUI-0414** Define and verify Poster Wall/Editorial Collage composition.
- [ ] **PUI-0415** Define and verify Comic/Issue Archive composition with responsive reading order.
- [ ] **PUI-0416** Define and verify campaign/announcement composition without generic card-wall layout.

### P4.6 Mycelium
- [ ] **PUI-0417** Define and verify Relationship Garden/Network composition using real entity relationships.
- [ ] **PUI-0418** Define and verify branching Path/Lineage composition with accessible list/tree alternative.
- [ ] **PUI-0419** Define and verify Node Inspector/Connection detail composition without fabricated graph edges.

### P4.7 Composition certification
- [ ] **PUI-0420** Verify at least two signature compositions per DNA are implemented or explicitly deferred with evidence.
- [ ] **PUI-0421** Verify all compositions work at narrow, medium and wide viewports.
- [ ] **PUI-0422** Verify composition controls remain semantic DOM controls, not baked into images/canvas.
- [ ] **PUI-0423** Verify no repeated generic card grid is used as the default composition for all six worlds.
- [ ] **PUI-0424** Record visual reference screenshots and review findings for each accepted composition.

**Phase 4 exit gate:** six worlds have distinct, useful composition patterns; every spatial pattern has a non-spatial fallback and truthful data contract.

---

## Phase 5 — Identity, iconography and governed assets

### P5.1 Brand identity
- [ ] **PUI-0501** Hash current emblem SVGs and identify exact/near duplicates.
- [ ] **PUI-0502** Verify ownership of Harbor/ROCKSOUL, MoonSky/RIOT ANARCHY and JIZZ/MYCELIUM marks against accepted DNA.
- [ ] **PUI-0503** Review Gate and Dock as distinct product marks within Imperium.
- [ ] **PUI-0504** Define six-world parent endorsement and lockup rules without copying unrelated emblems.
- [ ] **PUI-0505** Create or correct approved source masters only where an evidenced defect exists.
- [ ] **PUI-0506** Produce required wordmark, horizontal/stacked lockup and compact variants for approved identities.
- [ ] **PUI-0507** Produce positive, inverse, monochrome, favicon, maskable and social variants where required by real consumers.
- [ ] **PUI-0508** Document clear space, minimum size, contrast, background and placement rules.
- [ ] **PUI-0509** Add tests for missing identity files, invalid SVG and prohibited duplicate marks.
- [ ] **PUI-0510** Verify no identity artwork depicts or claims to represent ALLAH.

### P5.2 Icon and vector language
- [ ] **PUI-0511** Audit the shared Icon component and all direct icon-library imports.
- [ ] **PUI-0512** Define stable semantic icon names for action, status, navigation and data.
- [ ] **PUI-0513** Keep world sigils separate from functional action icons.
- [ ] **PUI-0514** Define six vector motif families: architectural axes, orbital arcs, film cuts, instrument rails, print marks and organic branches.
- [ ] **PUI-0515** Verify SVG viewBox, stroke/fill, optical alignment, naming and sanitization rules.
- [ ] **PUI-0516** Add only missing high-frequency icons with a real consumer.
- [ ] **PUI-0517** Verify applications import icons through the shared package API.

### P5.3 Asset registry and validation
- [ ] **PUI-0518** Inventory hero, route, identity, texture, avatar, cover and audio assets with dimensions and byte sizes.
- [ ] **PUI-0519** Define stable asset IDs and typed asset categories.
- [ ] **PUI-0520** Define manifest metadata for world/app/route, master/derivative, dimensions, ratio, format, checksum, license, provenance, alt/decorative status and fallback.
- [ ] **PUI-0521** Select canonical source-master and derivative storage without breaking current app paths.
- [ ] **PUI-0522** Implement deterministic manifest validation for missing files, duplicate hashes, invalid dimensions, format and metadata.
- [ ] **PUI-0523** Implement a resolver for responsive derivatives and safe fallback.
- [ ] **PUI-0524** Define AVIF/WebP/SVG derivative rules using existing build tooling where possible.
- [ ] **PUI-0525** Define crop/focal/title-safe metadata for wide, square, portrait and social ratios.
- [ ] **PUI-0526** Verify every shipped asset has a clear license and provenance; block unknown rights.
- [ ] **PUI-0527** Add checksum-based duplicate detection and asset inventory reporting.
- [ ] **PUI-0528** Verify missing/failed/unsupported media falls back without blocking core UI.
- [ ] **PUI-0529** Verify production builds include only required derivatives and not unnecessary source masters.
- [ ] **PUI-0530** Keep essential interface text and controls out of artwork.

**Phase 5 exit gate:** identity ownership is correct; all assets are traceable and licensed; icon/vector rules are consistent; media failure does not block the interface.

---

## Phase 6 — Motion, visual effects, loading and sound

### P6.1 Motion and effects
- [ ] **PUI-0601** Audit existing MotionFrame and VisualEffectsProvider before changing abstractions.
- [ ] **PUI-0602** Define semantic motion categories: arrival, focus, relation, transformation, feedback and transition.
- [ ] **PUI-0603** Define trigger, duration, easing, interruption, reduced-motion alternative and performance class for each accepted recipe.
- [ ] **PUI-0604** Verify global `prefers-reduced-motion` wins over optional manual effect settings.
- [ ] **PUI-0605** Verify all motion can be paused/interrupted and never blocks input or reading.
- [ ] **PUI-0606** Verify CSS animation avoids layout thrashing and costly continuous filters.
- [ ] **PUI-0607** Add tests for reduced motion, effects disabled and hidden-tab behavior.
- [ ] **PUI-0608** Defer WebGL/WebGPU/3D and animation dependencies unless a real composition has a measured need and fallback.

### P6.2 Loading and waiting states
- [ ] **PUI-0609** Audit existing Skeleton, StatePanel and StatusMessage before adding loading primitives.
- [ ] **PUI-0610** Distinguish indeterminate loading from measurable operation progress.
- [ ] **PUI-0611** Define honest waiting/streaming/retry/offline/arrival states with no invented percentages.
- [ ] **PUI-0612** Verify skeletons preserve layout and do not imitate fake content.
- [ ] **PUI-0613** Verify reduced-motion and no-media fallback for loading/arrival compositions.

### P6.3 Sound effects
- [ ] **PUI-0614** Audit existing procedural SFX engine and its public API.
- [ ] **PUI-0615** Define typed cue IDs, purpose, source, duration and volume constraints using the current engine.
- [ ] **PUI-0616** Verify sound is opt-in/off by default and respects persisted/user-controlled mute behavior where currently supported.
- [ ] **PUI-0617** Verify no essential information is conveyed only through sound.
- [ ] **PUI-0618** Verify autoplay restrictions and unavailable Web Audio APIs fail safely.
- [ ] **PUI-0619** Add deterministic tests for mute, opt-in, unavailable APIs and cue lifecycle.
- [ ] **PUI-0620** Extend the current sound lab rather than creating a second audio engine.

**Phase 6 exit gate:** existing engines are extended, not duplicated; motion/effects/audio are optional, accessible and resilient.

---

## Phase 7 — Labs, advanced capabilities and quality certification

### P7.1 Skin Laboratory and specialist labs
- [ ] **PUI-0701** Audit current SkinLaboratory tasks, states and component coverage.
- [ ] **PUI-0702** Define a repeatable representative-task matrix across all six skins.
- [ ] **PUI-0703** Add viewport modes for narrow, medium and wide visual review.
- [ ] **PUI-0704** Add keyboard-only and reduced-motion verification modes to the lab.
- [ ] **PUI-0705** Add component/atom lab views only for public components that need repeatable review.
- [ ] **PUI-0706** Add brand/icon/avatar/artwork lab views only when their source systems are implemented.
- [ ] **PUI-0707** Add motion/effects/loading/sound lab views that exercise the real package providers.
- [ ] **PUI-0708** Keep all lab-only tooling and dependencies out of production exports unless intentionally public.
- [ ] **PUI-0709** Add deterministic lab fixtures and ensure no fake live telemetry is presented as real.

### P7.2 Intent and evidence foundations
- [ ] **PUI-0710** Define a typed task-intent schema only after identifying a real package consumer and authority boundary.
- [ ] **PUI-0711** Define a deterministic resolver from approved task intents to existing semantic components/blocks.
- [ ] **PUI-0712** Reject arbitrary generated markup, CSS, untrusted executable code and unapproved component names.
- [ ] **PUI-0713** Provide preview, user correction, reset and explicit approval for consequential actions.
- [ ] **PUI-0714** Define evidence presentation for source, freshness, action status and uncertainty without private chain-of-thought.
- [ ] **PUI-0715** Keep agent execution, authorization, tools and business data owned by their respective services.
- [ ] **PUI-0716** Defer Intent Lens/Compiler features that lack a real task contract or measurable acceptance test.

### P7.3 Scene graph and advanced rendering
- [ ] **PUI-0717** Define a typed scene data contract only when a real data owner and consumer exist.
- [ ] **PUI-0718** Provide DOM/SVG/2D rendering and accessible linear/list/tree fallback before optional 3D.
- [ ] **PUI-0719** Verify keyboard selection, direct destination access, reset/fit-to-view and search for any spatial composition.
- [ ] **PUI-0720** Require device-aware performance evidence before WebGL/WebGPU/Three.js dependencies.
- [ ] **PUI-0721** Defer advanced renderer work without real sourced relationships or route-level need.

### P7.4 Quality certification
- [ ] **PUI-0722** Run final package UI tests and record exact output.
- [ ] **PUI-0723** Run final contrast checks for all six skins and record exact output.
- [ ] **PUI-0724** Run typecheck, lint, architecture and documentation checks that exist in the current repository.
- [ ] **PUI-0725** Verify package public exports from actual consumer build contexts.
- [ ] **PUI-0726** Capture visual evidence for all six worlds at narrow, medium and wide viewports.
- [ ] **PUI-0727** Complete keyboard-only, focus visibility and screen-reader semantic review.
- [ ] **PUI-0728** Verify reduced-motion, no-audio, no-canvas and failed-media fallbacks.
- [ ] **PUI-0729** Measure package and asset performance against recorded baseline on representative devices.
- [ ] **PUI-0730** Verify no unresolved license/provenance or duplicate-asset defect remains.
- [ ] **PUI-0731** Update parent task ledger and coverage matrix with verified status and evidence.
- [ ] **PUI-0732** Update package README/blueprint/research docs only where implementation truth has changed.
- [ ] **PUI-0733** Commit coherent passing package groups to `dev` and record commit SHAs.
- [ ] **PUI-0734** Verify remote `dev` head after push; do not modify `main`.

**Phase 7 exit gate:** package release readiness is supported by source, tests, visual/accessibility evidence and consumer build results; all claims are truthful.

---

## Final acceptance checklist

- [ ] One stable and tested public package API.
- [ ] One deterministic six-world skin engine.
- [ ] Six visual grammars distinguishable beyond palette.
- [ ] Semantic tokens and contrast verified for all six worlds.
- [ ] Existing controls and blocks audited for accessibility and responsive behavior.
- [ ] New controls are justified by real workflows and tested.
- [ ] At least two meaningful signature compositions per DNA, or explicit evidence-backed deferral.
- [ ] Brand/icon/vector ownership is correct and centralized.
- [ ] Asset manifest, provenance, license, validation and fallbacks are enforced.
- [ ] Motion/effects/SFX extend existing systems and respect user control.
- [ ] Skin Laboratory produces repeatable parity evidence.
- [ ] Advanced intent/spatial features remain bounded and evidence-led.
- [ ] Package tests, contrast, typecheck, lint, architecture and consumer builds have recorded results.
- [ ] Parent task ledger, coverage matrix, package docs and implementation status agree.
- [ ] All applicable work is committed to `dev`; `main` remains untouched.
