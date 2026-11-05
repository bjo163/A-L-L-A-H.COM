---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-DELIVERY"
version: "1.0.0"
owner: "engineering"
status: "planned"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-05"
parent_plan: "../20261105-moon-ui-master-consolidation/spec.md"
---

# @moonwitness/ui — Package-Core Delivery Plan

> Focused execution view for `packages/ui` only. The Moon UI Master Consolidation Plan remains the single canonical task ledger and source of truth. This document narrows its delivery sequence; it does not create a competing implementation backlog.

## 1. Goal

Turn the existing `packages/ui` package into a dependable, documented, visually distinctive, accessible and verifiable shared interface engine for the six approved DNA worlds.

The package must provide one semantic component system and one skin engine. Six worlds may change composition, geometry, material, typography, motion and visual language, but must preserve equivalent behavior, accessible semantics, state handling and predictable APIs.

This plan starts from the real implementation already present. It is not a greenfield rebuild.

## 2. Scope boundary

### In scope — package-owned work

- `packages/ui/package.json`, package exports and public API.
- `src/components/`, `src/blocks/`, `src/primitives/`, `src/raw/`, `src/skins/`, `src/tokens/`, `src/sfx/`, `src/lib/`.
- Package-owned CSS, typography assets, vector artwork, icons, brand assets and asset metadata.
- Component and skin contracts, package tests, accessibility and visual verification fixtures.
- Skin Laboratory and package-owned specialist labs.
- Documentation that directly describes the package API, architecture and design grammar.

### Out of scope

- Editing app routes, page layouts, business workflows, authentication, authorization or API calls.
- Building or changing ARSY, SENTINEL, SHADOW, MOONSKY or MOONLAB backend services.
- Building a second UI package, second token authority, second motion engine or second audio engine.
- Changing approved DNA canon or app-to-DNA mapping.
- Creating a new app, changing production deployment or modifying `main`.
- Replacing the existing primitive layer wholesale.

Consumer applications may be used as integration fixtures and verification targets, but their source is not part of this package-only plan.

## 3. Canonical authority and constraints

Precedence is inherited from the parent master plan:

1. Accepted repository decisions and explicit user agreements.
2. Six approved DNA specifications and `DNA/00-ENGINE-CONTRACT.md`.
3. `DNA/07-COMPONENT-MAPPING.md` and `DNA/08-QUALITY-GATES.md`.
4. `DESIGN.md` and `DECISIONS.md`.
5. `packages/ui/BLUEPRINT.md`, `README.md`, and `RESEARCH-AND-DIRECTION.md`.
6. This package delivery view and implementation notes.

Hard rules:

- Work on existing `dev` only. Do not create or switch branches; never modify `main`.
- Preserve local and concurrent work. No reset, clean, force-push or unrelated overwrite.
- Re-read current source before every task. If the capability already exists, verify it and record evidence instead of rebuilding it.
- Keep the existing React 19 + TypeScript/TSX package contract.
- Extend existing exports and components. Do not create parallel abstractions.
- Keep Base UI/native-first implementation as the observed baseline. No wholesale migration to Radix or another primitive framework.
- No new runtime dependency without a measured need, license/security/maintenance review, bundle analysis, fallback and explicit decision.
- No arbitrary runtime AI-generated markup. Intent and composition features must resolve through typed, approved recipes.
- No fabricated content, telemetry, progress, astronomy or operational status.
- No unlicensed or copied fonts, art, sounds, logos or game/manga/album assets.
- All motion is purposeful, interruptible and reduced-motion aware. Audio remains opt-in and off by default.
- Spatial effects are progressive enhancement; semantic 2D/linear fallback must retain the task.

## 4. Existing package baseline to preserve

The audited repository already contains the following foundations. Confirm each at execution time; do not recreate them:

- Package identity: `@moonwitness/ui`, React 19 peer dependencies, TypeScript source.
- Public entrypoints for root, components, blocks, primitives, raw layout, SFX, skins, CSS and tokens.
- Skin engine: `SkinRoot`, `SkinScope`, typed skin IDs, registry, semantic tokens and skin CSS.
- Six approved skin IDs: `imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, `mycelium`.
- Shared components including Button, Input, Textarea, Select, Form, Card, Badge, Avatar, Table, Dialog, Link, Skeleton, Icon and Emblem.
- Shared blocks including PageHero, SectionHeading, RouteShell, StatePanel, StatusMessage, DestinationCard/Grid, SkipLink, EcosystemNavbar, WorldArtwork and SkinLaboratory.
- Raw layout primitives, visual-effects provider and MotionFrame.
- Six original scalable vector world scenes.
- Existing procedural Web Audio SFX implementation.
- Existing component, skin, audio, asset and endpoint tests.
- Existing root scripts `ui:test` and `ui:contrast`.

Known items to verify rather than assume:

- The Imperium palette and font direction may not yet match the approved reference exactly.
- Font assets may be absent or incomplete; licensing and loading strategy must be proven.
- Some brand emblems may be duplicates or assigned to the wrong world; compare actual file hashes and canonical DNA before changing them.
- Identity assets may lack a complete wordmark/lockup/favicon/social family.
- Existing hero artwork does not automatically satisfy chapter, archive, episode, transmission, loading or spatial asset needs.
- The asset manifest/provenance/derivative pipeline may be incomplete.
- The current Skin Laboratory demonstrates representative parity but may not certify all viewport, keyboard, reduced-motion and assistive-technology requirements.
- Existing SFX is the engine baseline; improve its contracts and lab without creating another engine.
- Temporary artwork/quantizer tooling and legacy compatibility files must be checked for real consumers before cleanup.

## 5. Delivery sequence

This section defines the recommended package-only order. The parent master plan's `task.md` remains the only authoritative checkbox ledger; do not duplicate task statuses here.

### Stage A — Package truth and API contract

1. Reconfirm current `dev` HEAD, worktree safety and exact package tree.
2. Inventory every public export, deep export, CSS export and package consumer.
3. Check for duplicate exports, unstable internal imports, circular dependencies and accidental public internals.
4. Confirm peer/dependency boundaries and React compatibility.
5. Document the stable public API, supported import paths and compatibility policy.
6. Verify the package can be built/typechecked through the repository's actual scripts; do not invent package scripts or claim an unrun build.
7. Record baseline test results before changing implementation.

**Exit gate:** every public entrypoint is intentional, documented and exercised; no consumer relies on an undocumented internal path.

### Stage B — One skin engine, six complete grammars

1. Validate the skin registry schema and deterministic fallback behavior.
2. Validate SSR/initial-render agreement and prevent hydration mismatch.
3. Audit semantic token completeness for canvas, surfaces, text, border, accent, status, focus, typography, spacing, density, geometry, material and motion.
4. Reconcile Imperium's approved palette and typography without imposing them on other DNA.
5. Verify six worlds are distinguishable by more than color: composition, shape, material, type, density, navigation and motion.
6. Verify SkinRoot and SkinScope isolation; no cross-skin state leakage or arbitrary CSS injection.
7. Measure contrast for all relevant text, control, border and focus pairs; fix failures at the semantic-token level.
8. Test narrow, medium, wide, touch and low-capability behavior.
9. Verify reduced-motion and static fallbacks for every world.
10. Confirm all six original vector scenes are original, scalable, labelled and resilient when motion/media is unavailable.

**Exit gate:** six distinct grammars share one typed engine; semantic behavior and accessibility remain equivalent; measured quality gates pass.

### Stage C — Component and composition completeness

1. Build an inventory from actual exports and compare it with DNA 07 and the blueprint.
2. Mark each pattern as implemented, partial, specification-only, intentionally deferred or not applicable.
3. Strengthen existing controls and composition blocks before proposing new components.
4. Add a new component only when it has distinct semantics, behavior, accessibility needs or meaningful reuse.
5. For each accepted component, define typed props, semantic HTML, keyboard behavior, disabled/loading/error states, responsive rules and skin recipes.
6. Prioritize missing high-value patterns such as tabs, progress, disclosure, command/action preview, evidence/provenance and timeline only when backed by a real consumer workflow.
7. Keep product-specific content, permissions and business logic outside the package.
8. Add server-rendered contract tests and interaction tests appropriate to the existing test stack.

**Exit gate:** every shipped component has a stable API, semantic behavior, all-six-skin treatment where applicable, and meaningful tests; no speculative component catalogue is created.

### Stage D — Identity and governed asset system

1. Audit current emblem, wordmark, icon and artwork files by content hash and actual usage.
2. Define asset IDs, source masters, derivatives, dimensions, focal points, alt text, license/provenance and approval metadata.
3. Correct only proven duplicate or misassigned brand assets against the six accepted DNA.
4. Establish complete identity families where required: emblem, wordmark, horizontal/stacked lockup, compact, inverse, monochrome, favicon, maskable and social variants.
5. Define original art families for hero, chapter, episode, transmission, archive, loading and spatial contexts.
6. Use a deterministic manifest and validation process; fail on missing files, invalid dimensions, broken references or absent provenance.
7. Keep text and essential controls out of artwork.
8. Do not generate or publish assets with unresolved licensing or approval status.

**Exit gate:** every shipped asset is traceable, correctly assigned, technically validated and usable without embedding essential UI text.

### Stage E — Motion, effects and sound

1. Audit MotionFrame, visual-effects provider and existing CSS motion before adding abstractions.
2. Define a small motion grammar per DNA: entrance, exit, focus, feedback, transition and optional ambient behavior.
3. Make motion pauseable/interruptible and respect reduced motion globally and locally.
4. Verify no animation blocks input, navigation, reading or task completion.
5. Retain the existing procedural SFX engine; add typed cue metadata, explicit opt-in, mute state and failure-safe behavior.
6. Keep audio off by default and never use sound as the sole information channel.
7. Add deterministic tests for reduced-motion, disabled effects, audio opt-in and unavailable browser APIs.
8. Defer WebGL/WebGPU/3D and external motion libraries unless a real package workflow proves their value.

**Exit gate:** no duplicate engine; effects are optional, accessible, measurable and degrade safely.

### Stage F — Labs and advanced interface intelligence

1. Strengthen Skin Laboratory so the same representative task can be tested across six worlds and multiple viewport modes.
2. Add focused labs only for package-owned systems: component, atom, brand, icon, avatar, artwork, motion, effects, sound, loading and asset validation.
3. Keep labs as development/verification tools; do not ship lab-only dependencies into production runtime.
4. Define typed task/intent models before any Intent-to-Interface Compiler work.
5. Resolve intents only to approved semantic components and compositions; no arbitrary generated DOM or CSS.
6. Make the active objective visible and correctable; provide preview, reset and undo where actions can change state.
7. Implement Evidence Surface patterns as presentation contracts only; source data and agent execution remain owned by their services.
8. Implement Scene Graph rendering only when a real data contract exists, with 2D/linear fallback.
9. Defer research concepts that lack a consumer, evidence, measurable hypothesis or bounded implementation.

**Exit gate:** labs prove actual package behavior; advanced systems remain deterministic, inspectable and user-controlled.

### Stage G — Certification and release readiness

1. Run package tests and skin contrast checks.
2. Run strict typecheck, lint, architecture and documentation contracts relevant to the package.
3. Verify package exports from real consumer build contexts.
4. Capture consistent visual evidence for six worlds at wide, medium and narrow viewports.
5. Review keyboard-only operation, focus visibility, screen-reader names/announcements, zoom/reflow and reduced motion.
6. Measure performance and asset loading; set budgets from actual baseline rather than invented targets.
7. Verify fallback when images, audio, canvas, animation or remote resources fail.
8. Record all results, including failures and blocked checks, in the parent plan report.
9. Commit only coherent passing groups to `dev`; push fast-forward only.
10. Mark a capability VERIFIED only with executable test output or documented manual evidence.

**Exit gate:** package is stable and certifiable independently; consuming-app integration remains a separate parent-plan responsibility.

## 6. Required verification commands

Use only commands confirmed in the current repository manifests. The currently documented root-level UI checks are:

- `pnpm ui:test`
- `pnpm ui:contrast`

Also run the current repository's actual typecheck, lint, architecture and documentation checks as applicable. Inspect scripts before execution. A green unit test is not a substitute for consumer build, visual review or accessibility review.

## 7. Package acceptance criteria

The package-only scope is complete when:

- [ ] One public package API is documented and has no accidental deep-import dependency.
- [ ] One skin engine supports all six approved DNA with deterministic SSR-safe selection.
- [ ] All six worlds are visually distinct beyond palette changes.
- [ ] Semantic tokens cover all required roles and measured contrast passes.
- [ ] Existing components and blocks are reused; new patterns are justified by real workflows.
- [ ] Components preserve semantic HTML, keyboard operation, visible focus, screen-reader semantics and responsive behavior.
- [ ] Reduced-motion, static-media and no-audio fallbacks preserve task completion.
- [ ] Asset identity, provenance, license, variants and validation are governed.
- [ ] Skin Laboratory provides repeatable parity evidence.
- [ ] Motion/effects/SFX extend existing engines rather than duplicate them.
- [ ] Package tests, typecheck, lint and relevant architecture gates pass.
- [ ] Visual/accessibility/performance evidence is recorded.
- [ ] No app/backend/business responsibility has leaked into the package.
- [ ] Documentation reflects implementation status honestly.

## 8. Relationship to the master plan

- Parent: `.plans/20261105-moon-ui-master-consolidation/spec.md`.
- The parent `task.md` owns all task IDs and checkboxes. Update that file and its `coverage-matrix.md` when work is executed.
- This document is a package-focused reading and sequencing guide, not a second backlog. Do not create duplicate task IDs or mark work complete here.
- If this plan and the parent disagree, the parent and repository canon win.
- App integration, app-specific visual composition and route adoption remain in the parent plan's consumer-adoption work.
- Research-led ideas remain proposals until a real package gap, consumer, acceptance test and evidence exist.

## 9. Initial status

This is a plan-only artifact. No package source, tests, runtime behavior, app integration, deployment or production configuration is changed by creating this document.

The initial status of every capability must be revalidated from the live `dev` source before implementation. The parent report remains the record of actual commits, test output, visual evidence and residual blockers.
