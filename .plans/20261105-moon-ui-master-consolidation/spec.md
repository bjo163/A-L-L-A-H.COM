---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-MASTER-CONSOLIDATION"
version: "1.0.0"
owner: "product-design"
status: "in_progress"
target_repo: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
created: "2026-11-05"
---

# Moon UI — Master Consolidation & Autonomous Delivery Plan

## 1. Objective

Consolidate the approved Moon UI doctrine across `packages/ui/README.md`, `packages/ui/BLUEPRINT.md`, `packages/ui/RESEARCH-AND-DIRECTION.md`, `DNA/*`, `DESIGN.md`, `DECISIONS.md`, current source, consuming applications, existing plans, and CI evidence.

Then deliver the missing and partial Moon UI capabilities through small, independently verifiable tasks that a local coding agent can execute autonomously from the existing `dev` branch without routine owner confirmation.

This is a **single master execution plan**. It is not permission to rebuild existing capabilities, create duplicate plans, introduce a parallel UI system, change product/backend boundaries, or claim unverified completion.

## 2. Canonical source and precedence

Repository: `bjo163/A-L-L-A-H.COM`  
Execution branch: `dev` only.  
Frozen references: `moonwitnessxv` and `moonwitness-reborn` are read-only historical references.

Apply this precedence when sources conflict:

1. Accepted decisions in `DECISIONS.md` and explicit user agreements recorded in the repository.
2. Six approved DNA specifications and `DNA/00-ENGINE-CONTRACT.md`.
3. `DNA/07-COMPONENT-MAPPING.md` and `DNA/08-QUALITY-GATES.md`.
4. `DESIGN.md`.
5. `packages/ui/BLUEPRINT.md` — implementation target and roadmap.
6. `packages/ui/README.md` — package entrypoint and contributor contract.
7. `packages/ui/RESEARCH-AND-DIRECTION.md` — research-informed proposals and adoption constraints.
8. Existing implementation plans, source comments, and examples.

A lower-precedence document or old plan must not silently override an accepted decision. Record any unresolved conflict in this plan's decision log and continue with unrelated work.

## 3. User-approved product canon

### 3.1 Six Master DNA

1. **IMPERIUM LUMEN** — A-L-L-A-H.COM / Empire of the Light; monumental abstract architecture, axial order, ivory, obsidian and restrained antique-gold light.
2. **LUNAR CHRONICLES** — MoonWitness Universe; lunar observatory, celestial atlas, orbital chronology, archival precision and quiet silver-blue light.
3. **ROCKSOUL** — Silent storyteller / Born to Running; cinematic rain-noir, chapter rhythm, tactile print, alternative-music energy and selective crimson.
4. **NEXUS PARADOX** — HEADQUARTER; spatial instruments, impossible geometry, precise technical surfaces and signal cyan.
5. **RIOT ANARCHY** — MOONSKY; manga, xerox punk, underground poster, hard print edges and controlled anti-design.
6. **MYCELIUM** — JIZZ / World Observatory; living relationships, biomorphic membranes, branching systems and mineral-green light.

Six DNA are six authored worlds, not six color presets. Shared behavior, semantics, accessibility and data contracts remain one engine.

### 3.2 Current canonical app mapping

Use the current accepted mapping as the starting contract and verify it against the live tree before any change:

| App | Canonical identity |
|---|---|
| `apps/gate` | IMPERIUM LUMEN |
| `apps/dock` | IMPERIUM LUMEN |
| `apps/id` | LUNAR CHRONICLES |
| `apps/harbor` | ROCKSOUL |
| `apps/headquarter` | NEXUS PARADOX |
| `apps/moonsky` | RIOT ANARCHY |
| `apps/jizz` | MYCELIUM |

An app may host an explicitly approved route-level `SkinScope` for a different world. A route scope is not a second app root. ARSY and SENTINEL are backend/service runtimes, not frontend apps to be wrapped in `SkinRoot`.

### 3.3 Approved Imperium visual reference

The accepted reference palette is:
- Obsidian `#090A0D`
- Lunar Slate `#20242B`
- Moon Gold `#C5A15A`
- Ivory `#F4F1E9`
- Moon Dust `#D9D4C8`
- Crimson `#8E2635` (selective narrative accent only)

Accepted type direction:
- Display/editorial: Cormorant Garamond
- Interface/body: Inter
- Technical/numeric: Cascadia Code

The current registry differs. Reconcile deliberately, preserve semantic roles and contrast, and do not claim that the target is already live. Do not force the Imperium palette or font family onto the other five DNA.

### 3.4 Non-negotiable experience rules

- No generic SaaS dashboard/card-wall composition.
- No visible product label reading “HUD”.
- Never depict ALLAH or use a human/animal/abstract proxy claiming to represent ALLAH.
- Cosmic/sacred artwork contains no faces. Where narrative human imagery is explicitly needed, use the established ROCKSOUL back-facing/distant framing canon.
- No fabricated telemetry, coordinates, astronomy, activity, AI work, counts, progress, system state or network connections.
- Never bake interface text or essential controls into artwork.
- No copied copyrighted game, manga, album, film, logo or poster artwork.
- Motion is purposeful, interruptible, optional where ambient, and respects reduced motion.
- Sound is opt-in, off by default, and never carries essential information.
- Every spatial/immersive experience has a semantic, accessible 2D/linear fallback.
- One shared functional engine and one token authority; no app-local competing theme systems.
- Native-first interaction primitives. Do not migrate wholesale to a third-party primitive library.
- Browser game-grade art direction is the target; do not claim a web UI is a native console game or build a 3D engine without a real task and measured benefit.

## 4. Scope

This plan covers the shared `@moonwitness/ui` package and its real frontend consumers:

- Tokens, skin grammar, typography, density, materials and visual identity.
- Atoms, raw layout, interaction primitives, semantic components and state contracts.
- Shared blocks, world-specific compositions, shell archetypes and page templates.
- Six-world identity, logos, emblems, wordmarks, lockups, icons, vectors and app/social marks.
- MoonWitness avatar creation workflow and its safe, explicit generation contract.
- Artwork, cover, chapter, episode, transmission, archive, loading and spatial asset families.
- Asset manifest, provenance, licensing, variants, deterministic validation and delivery.
- Motion choreography, visual effects, loading/waiting/progress, transitions and SFX.
- Skin Laboratory, Component/Atom/Brand/Icon/Avatar/Artwork/Motion/Effects/Sound/Loading/Asset labs and preview workflows.
- Research-led World Grammar Engine, Intent-to-Interface Compiler, Intent Lens, Evidence Surface, Scene Graph, Experience Quality Observatory and anti-slop evaluation.
- Accessibility, responsive behavior, internationalization, visual regression, performance, security, package exports, documentation and app adoption.

Applications remain owners of routes, domain workflows, API calls, permissions, business data and app-specific content. This plan must not duplicate those responsibilities inside the UI package.

## 5. Explicit implementation baseline and no-rebuild rule

The following are already present in the audited `dev` snapshot and must be reused, strengthened or verified rather than recreated:

- Package: `packages/ui`, `@moonwitness/ui`, React 19, TypeScript/TSX source.
- Skin engine: `SkinRoot`, `SkinScope`, `skinIds`, `skinRegistry`, `SkinTokens`, `theme.css`, `skins.css`.
- Six registered skin IDs: `imperium-lumen`, `lunar-chronicles`, `rocksoul`, `nexus-paradox`, `riot-anarchy`, `mycelium`.
- Components: Button, Input, Textarea, Select, Form, Card, Badge, Avatar, Table, Dialog, Link, Skeleton, Icon, Emblem, Checkbox, ToolRegistryCard, ToolDetailPanel, ToolParameterField.
- Blocks: EcosystemNavbar, Endpoints, SessionCard, SoundToggle, VisualEffectsToggle, useEcosystemSession, WorldArtwork, DestinationCard, Kicker, PageHero, RouteShell, SectionHeading, SkipLink, StatePanel, StatusMessage, SkinLaboratory.
- Raw layout: RawContainer, RawSection, RawStack, RawCluster, RawGrid.
- Primitives: VisualEffectsProvider, useVisualEffects, MotionFrame.
- Six original 1600×900 SVG world scenes in `WorldArtwork`.
- SFX engine: procedural Web Audio implementation in `src/sfx/audio.ts`.
- Existing asset, audio, component, endpoint and skin tests.
- Existing per-skin geometry/composition CSS. The current skins are not color-only.

The exact source inventory must be rechecked at task execution time because `dev` may advance.

## 6. Known baseline gaps and defects to validate

These are known from the current documentation/source audit; confirm each before changing it:

1. Approved Imperium palette and Cormorant Garamond / Inter / Cascadia Code direction are not yet reflected exactly in the registry/runtime.
2. No bundled font assets were found in the audited repository tree.
3. Several unrelated app brand emblems are duplicates: Harbor, JIZZ and MoonSky currently share the same Mycelium-style network emblem; MoonSky's approved identity is RIOT ANARCHY. Confirm content hashes before replacing.
4. The current identity system is emblem-centric; complete wordmark, horizontal/stacked lockup, compact, inverse, monochrome, favicon, maskable app icon and social variants are not established as a complete tested family.
5. Existing artwork is a small hero/preview set, not a full chapter/episode/transmission/archive/spatial-map/loading-cover library.
6. No complete typed asset manifest/provenance/derivative pipeline is established by the audited inventory.
7. Existing `WorldArtwork` scenes are useful original foundations but do not yet prove all intended world-specific page compositions or the requested detailed production-art breadth.
8. Existing Skin Laboratory demonstrates representative task parity, but does not yet certify the full composition, brand, asset, responsive, reduced-motion and accessibility matrix.
9. Many candidate interaction components and product patterns are not implemented. Add only those justified by real workflows and the component mapping.
10. Existing SFX is procedural and present; do not build a second audio engine. Add the missing metadata, sound grammar, controls, tests and lab around the existing engine.
11. Advanced research concepts are strategic target capabilities, not evidence of implemented runtime systems.
12. Temporary files `packages/ui/.artwork-render-temp.tsx` and `packages/ui/.png-quantizer-temp.cs` exist in the audited tree; inspect whether still needed, then move to documented tooling or remove safely.
13. A legacy `session_card.tsx` compatibility file exists alongside `session-card.tsx`; inspect consumers before any removal.
14. Historical CI evidence included JIZZ build/typecheck and documentation-contract failures. Re-run current gates; do not reuse stale pass/fail claims as current results.

## 7. Existing-plan reconciliation

- `.plans/20261104-2157-six-world-premium-skins/` is an existing implementation plan with substantial work already marked complete. Treat completed work as baseline evidence. Do not repeat its vector-scene, SkinScope, hero-recipe or app-root mapping work unless a current failing test or source defect proves a specific residual.
- `.plans/20261104-2325-six-world-hd-artwork/` is the direct predecessor for detailed six-world artwork. Its unfinished work is transferred into this master plan under the asset/world-composition phases. Mark the predecessor as superseded by this master plan; do not execute it in parallel.
- `.plans/20261105-0000-platform-capabilities-standardization/` contains an app-skin mapping that conflicts with current approved mapping and proposes SkinRoot wrappers for backend/service runtimes. Do not execute its skin-mapping phase as written. Canonical mapping is the table in this spec, subject to verification against accepted DNA/DESIGN/ADRs.
- `.plans/20261104-0115-shadow-creative-production/` describes a separate SHADOW backend creative-production domain. This Moon UI plan owns client-side creative interface components and asset presentation only; it does not duplicate SHADOW projects, generation-task APIs, CAS persistence or ARSY models.
- `.plans/20261104-0114-moonlab-research-sandbox/` describes the MOONLAB research domain. Moon UI may render its interface patterns but must not implement research/model-evaluation backend ownership.
- `.plans/20261104-0200-operator-ui-enhancements/` and other app/domain plans remain owners of their specific business workflows. Moon UI supplies reusable UI patterns only; inspect before adding any overlapping workflow.
- The existing SFX engine, Skin Laboratory, components and blocks are baseline assets, not new greenfield tasks.

The detailed cross-document and plan-to-task mapping is in `coverage-matrix.md`.

## 8. Autonomous execution policy

The local agent is authorized by this plan to execute all in-scope, reversible engineering and documentation tasks on `dev` without routine user/owner confirmation.

- Do not ask the owner to choose between alternatives already decided by canon.
- If a low-risk implementation detail is unspecified, choose the smallest change consistent with existing architecture, record the rationale in `decision-log.md`, and continue.
- If a task is blocked by missing credentials, paid service, external account permission, legally uncertain asset licensing, destructive data migration, production DNS/deployment, or irreversible external action, mark only that task `[!]`, record the exact blocker, and continue all independent tasks.
- Do not invent credentials, pay for services, change production infrastructure, publish generated user media, or perform destructive cleanup.
- Do not stop the entire plan for a non-critical blocked item.
- No new Git branch. Work on the existing `dev` branch only. Never modify `main`.
- Preserve uncommitted user changes. Never reset, clean, force-push, or overwrite unrelated work.
- Make small, focused conventional commits on `dev` after a coherent task group passes its gates. Push only the resulting fast-forward commits to `dev`; never force-push.
- Do not mark a task complete from a plan, mockup, generated image, source file alone, or unexecuted command. Attach evidence.
- Keep package source in its existing TSX/TypeScript contract. Do not rewrite `packages/ui` to JavaScript just because application/backend conventions use JavaScript.
- Do not introduce new runtime dependencies without a documented need, license/maintenance/security/bundle review, fallback and passing build proof.
- Do not introduce an always-on runtime AI generation service. Advanced generation/compiler features must be deterministic and bounded unless a separate approved service boundary already exists.

## 9. Definition of done

The master plan is complete only when:

1. All applicable tasks are checked with verifiable evidence; blocked external items are clearly isolated and do not masquerade as completed.
2. No duplicate implementation was created for an existing component, block, skin, scene, generator, sound engine or app workflow.
3. Six DNA have distinct, complete and verified world grammars and usable signature compositions.
4. All required brand and asset families have source masters, derivatives, manifests, provenance and validation.
5. Components, blocks, templates and labs cover real app workflows with semantic parity.
6. Research-led capabilities are implemented at the appropriate deterministic UI/architecture layer, with agency, truth, explainability and accessible fallbacks.
7. All visual effects, loading, motion and sound obey user preference, reduced motion, performance and no-audio fallbacks.
8. All seven frontend apps use the approved identity mapping and shared UI system without duplicate local tokens/components.
9. All relevant automated gates pass, and all consuming app builds pass or a separately documented external blocker remains with exact evidence.
10. Desktop, tablet, mobile, reduced-motion, keyboard and screen-reader review evidence is recorded.
11. README, BLUEPRINT, RESEARCH, DNA mapping, DESIGN, DECISIONS (only for accepted decisions), BACKLOG and this plan agree with implementation status.
12. Final report records baseline and final HEAD, changed paths, commits, CI URLs, commands/results, visual evidence and residual blockers.

## 10. Out of scope

- Backend service/API/data-model implementation for ARSY, SHADOW, MOONLAB, MOONSKY or other product domains.
- App-specific authentication, authorization, tenant logic or business workflows.
- Production DNS, certificates, reverse proxy, deployment, release promotion or changes to `main`.
- Wholesale migration from native primitives to Radix/Base UI or another UI framework.
- Runtime AI generation of arbitrary markup or uncontrolled user-facing interfaces.
- Unlicensed fonts, images, sounds, logos or copied visual works.
- 3D/WebGPU/WebGL as a default rendering dependency.
- New standalone applications or duplicated creative-production backends.

## 11. Plan artifacts

- `spec.md` — objective, canon, scope, baseline and done criteria.
- `design.md` — target architecture and execution design.
- `task.md` — atomic, ordered, autonomous tasks.
- `rule.md` — hard execution and quality guardrails.
- `coverage-matrix.md` — traceability from every blueprint/research domain to existing implementation and task IDs.
- `decision-log.md` — autonomous low-risk choices and unresolved blockers.
- `report.md` — actual execution evidence; update continuously, never pre-fill with assumed passes.
