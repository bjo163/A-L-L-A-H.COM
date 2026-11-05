---
contract: "DOCUMENTATION_CONTRACT.md"
id: "MOON-UI-COVERAGE-MATRIX"
version: "1.0.0"
owner: "quality"
status: "in_progress"
---

# Moon UI — Requirements, Implementation and Task Traceability

This matrix prevents omissions and duplicate work. Status values:
- **EXISTS** — source is present in the audited `dev` snapshot.
- **PARTIAL** — a foundation exists but does not meet the full blueprint contract.
- **MISSING** — no verified implementation found in the audited source.
- **PROPOSED** — strategic direction only; implementation must be justified and bounded.
- **VERIFY** — must be rechecked at execution time.
- **TRANSFERRED** — unfinished work moved from a predecessor plan into this plan.

Do not promote status without current source/test/visual evidence.

## 1. Canonical source coverage

| Source | Requirement domain | Current interpretation | Master tasks |
|---|---|---|---|
| README §1–2 | Mission, six worlds, one engine, honesty and exclusions | Canonical doctrine; preserve | MU-0006–0020, MU-0114–0128 |
| README §3 | Six DNA, accepted Imperium palette/type | DNA exist; runtime palette/type mismatch | MU-0101–0113, MU-0118 |
| README §4–5 | Spatial/editorial experience, console-grade art, motion/performance | Doctrine specified; runtime parity partial | MU-0414–0448, MU-0626–0635, MU-0901–0912 |
| README §6–9 | Package architecture, inventory, usage and contributor rules | Core package exists; inventory must be kept current | MU-0008–0010, MU-0301–0334, MU-0930 |
| Package MCP tool controls | `packages/ui/src/components/ToolExecutionForm.tsx`, `ToolResultViewer.tsx`, component barrel | Source exists and shared public barrel now exports both; execution form validates JSON object syntax only, and result viewer provides text/raw JSON. Feature-specific Vitest files are outside the root UI test script and currently cannot resolve Vitest/Testing Library | PUI-0101–0104, 0112; MU-0930–0932 |
| README §12 | Atoms, raw, primitives, components, blocks, worlds, skins, effects, geometry, iconography, brand, avatar, artwork, assets, motion, SFX, loading, labs, generators | Mixed: core present, many foundry families absent | MU-0201–0240, MU-0301–0334, MU-0401–0448, MU-0601–0718 |
| README §13 onward | Premium parity, archetypes, capability matrix, advanced patterns | Target catalogue, not blanket build list | MU-0436–0448 and workflow-backed tasks |
| BLUEPRINT §0–3 | Authority, scope, truth states, architecture, source of truth | Specified; enforce during execution | MU-0006–0031, MU-0101–0128 |
| BLUEPRINT §4 | Current components, blocks, raw, primitives, skins and art evidence | EXISTS; inventory snapshot in spec | MU-0008–0020 |
| BLUEPRINT §4.7, §15 | Known defect/gap register | Several known gaps; reverify | MU-0020, MU-0201–0240, MU-0901–0942 |
| BLUEPRINT §5 | HD art, covers, identity, manifest | PARTIAL/MISSING | MU-0208–0240, MU-0601–0617 |
| BLUEPRINT §6 | Materials, lighting, motion tiers, performance | PARTIAL | MU-0626–0635, MU-0909–0912 |
| BLUEPRINT §7 | Six world compositions | Existing WorldArtwork scenes; composition breadth PARTIAL | MU-0414–0435 |
| BLUEPRINT §8 | Atoms and interaction components | Core controls exist; candidate set incomplete | MU-0301–0334 |
| BLUEPRINT §9–10 | Brand, logos, icons, vectors and typography | PARTIAL; emblem duplicates and fonts gap | MU-0101–0113, MU-0201–0226 |
| BLUEPRINT §11 | Accessibility and responsive behavior | Some current coverage; full certification VERIFY | MU-0309–0334, MU-0401–0448, MU-0901–0908 |
| BLUEPRINT §12 | Sound and sensory behavior | Procedural SFX engine EXISTS; foundry/lab PARTIAL | MU-0636–0646, MU-0710 |
| BLUEPRINT §13–14 | Skin Lab and visual verification pipeline | Skin Lab EXISTS; full matrix PARTIAL | MU-0701–0718, MU-0913–0929 |
| BLUEPRINT §16–18 | Quality bar, non-goals, change control | Canonical constraints | MU-0001–0031, MU-0901–0942 |
| BLUEPRINT §19–23 | Creative engine, hierarchy, component universe, blocks, six skins | Core foundation exists; complete breadth PARTIAL | MU-0114–0128, MU-0301–0448 |
| BLUEPRINT §24 | MoonWitness Avatar Studio | MISSING as a complete studio; Avatar component EXISTS | MU-0618–0625, MU-0707 |
| BLUEPRINT §25 | Brand/logo/icon/vector foundry | PARTIAL | MU-0201–0226, MU-0705–0706 |
| BLUEPRINT §26–27 | Artwork/cover/media foundry and graphic grammar | PARTIAL/MISSING | MU-0227–0240, MU-0601–0617 |
| BLUEPRINT §28 | Effects and motion engine | MotionFrame/provider/CSS EXISTS; governed choreography PARTIAL | MU-0626–0635 |
| BLUEPRINT §29 | Loading/waiting/progress/transitions | Skeleton/StatePanel exist; complete world-aware system PARTIAL | MU-0636–0640 |
| BLUEPRINT §30 | SFX foundry | Procedural engine EXISTS; metadata/lab/coverage PARTIAL | MU-0641–0646, MU-0710 |
| BLUEPRINT §31 | Asset registry and generators | PARTIAL/MISSING | MU-0227–0240, MU-0713–0718 |
| BLUEPRINT §32 | Skin Lab and Creative Foundry | Skin Lab EXISTS; foundry family PARTIAL | MU-0701–0718 |
| BLUEPRINT §33–37 | Package organization, naming, roadmap, completion and exclusions | Contract specified; execution pending | MU-0006–0031, MU-0930–0942 |
| BLUEPRINT §38–50 | Premium platform parity, shells, product capability matrix, interactions, quality | Target catalogue; adopt only for real workflows | MU-0309–0334, MU-0401–0448, MU-0901–0929 |
| BLUEPRINT §51–67 | Research-led platform, compiler, grammar, lens, evidence, scene graph, quality observatory | PROPOSED/PARTIAL; deterministic bounded implementations | MU-0501–0539 |
| RESEARCH | Adaptive/generative interfaces, agency, transparency, cognitive load, structural interaction, visual complexity | Evidence informs constraints; not blanket feature requirements | MU-0501–0539, MU-0901–0912 |
| RESEARCH | Dribbble spatial work and 2026 web direction | Visual inspiration only; never copy as final art | MU-0414–0448, MU-0601–0617 |
| RESEARCH | GitHub design intelligence, motion, R3F/Drei/Postprocessing etc. | Evaluate individually; no automatic dependency adoption | MU-0009, MU-0626–0635, MU-0713–0718 |

## 2. Current implementation baseline

| Capability | Audited source | Baseline status | Do not duplicate | Residual tasks |
|---|---|---|---|---|
| Skin IDs and registry | `src/skins/registry.ts` | EXISTS | Six skin definitions | MU-0101–0128 |
| SkinRoot / SkinScope | `src/skins/root.tsx`, `world-artwork.tsx` | EXISTS | Root/scope mechanics | MU-0019, MU-0801–0809 |
| Theme mapping | `src/theme.css`, `src/skins.css` | EXISTS | Token pipeline | MU-0101–0113, MU-0114–0128 |
| World CSS recipes | `src/skins.css` | PARTIAL | Existing per-world geometry selectors | MU-0114–0128, MU-0414–0435 |
| World vector scenes | `src/blocks/world-artwork.tsx` | EXISTS foundation | Six initial 1600×900 scenes | MU-0603–0608 (upgrade/add distinct production art, not rebuild scenes) |
| Components | `src/components/*`, public barrel and package README | 20 current exported modules, including ToolExecutionForm and ToolResultViewer; README inventory synchronized | Do not duplicate current semantic controls | MU-0301–0334 |
| Blocks | `src/blocks/*` | EXISTS foundation | 17 current exported modules | MU-0401–0448 |
| Raw layout | `src/raw/layout.tsx` | EXISTS | Five raw primitives | Extend only if a real layout gap exists |
| Motion primitives | `src/primitives/visual-effects.tsx` | EXISTS foundation | Provider and MotionFrame | MU-0626–0635 |
| SFX | `src/sfx/audio.ts` | EXISTS foundation | Existing procedural engine | MU-0636–0646 |
| Skin Laboratory | `src/blocks/skin-laboratory.tsx` | EXISTS foundation | Existing six-skin parity demo | MU-0701–0702 |
| Asset tests | `test/assets.test.ts` | EXISTS foundation | Current SVG/PNG integrity tests | MU-0227–0240 |
| UI tests | `test/components.test.tsx`, `skins.test.tsx`, `audio.test.ts`, etc. | EXISTS foundation | Existing test harness | Add coverage for new behavior |
| Font files | audited tree search | MISSING in baseline | Do not claim fonts bundled | MU-0105–0110 |
| Complete lockup family | app public brand assets | PARTIAL | Existing emblems | MU-0201–0218 |
| Duplicate emblems | Harbor/JIZZ/MoonSky SVGs | DEFECT to verify | Do not copy duplicate | MU-0201–0205 |
| Asset manifest/provenance | audited tree | PARTIAL/MISSING | Existing public assets and tests | MU-0227–0240 |
| Avatar Studio | Avatar component only | MISSING as a studio | Existing Avatar component | MU-0618–0625, MU-0707 |
| Signature composition breadth | existing blocks and skins | PARTIAL | Existing generic blocks | MU-0414–0435 |
| Advanced compiler/lens/evidence/graph | research direction | PROPOSED | No assumed implementation | MU-0501–0539 |
| Quality Observatory | CI and test commands exist | PARTIAL | Existing GitHub CI artifacts | MU-0531–0539 |

## 3. Existing plan disposition

| Existing plan | Known status/overlap | Disposition | Master task mapping |
|---|---|---|---|
| `.plans/20261104-2157-six-world-premium-skins/` | Substantial implementation marked complete: six scenes, SkinScope, hero recipes, app mapping, partial verification | Baseline. Do not reimplement; only verify residual gates or fix a proven defect | MU-0021–0022, MU-0011–0016 |
| `.plans/20261104-2325-six-world-hd-artwork/` | Artwork expansion unfinished; direct overlap with this master | Supersede and transfer all unfinished tasks here | MU-0023, MU-0601–0617, MU-0414–0435 |
| `.plans/20261105-0000-platform-capabilities-standardization/` | Conflicting skin mapping and proposes wrapping backend runtimes | Quarantine conflicting skin tasks; do not execute as written | MU-0024–0026, MU-0801–0818 |
| `.plans/20261104-0115-shadow-creative-production/` | SHADOW domain models, generation jobs and CAS backend | Out of scope for Moon UI; only consume client contracts | MU-0027 |
| `.plans/20261104-0114-moonlab-research-sandbox/` | MOONLAB backend research/evaluation sandbox | Out of scope for Moon UI; only render its UI if needed | MU-0027 |
| `.plans/20261104-0200-operator-ui-enhancements/` | Operator business workflow UI | Reuse shared UI primitives; do not duplicate business workflow | MU-0028 |
| Other app/domain plans | May include their own business routes and controls | Search and map before adding shared components | MU-0029 |

## 4. DNA-by-DNA completion coverage

| DNA | Existing foundation | Missing/partial outcomes | Task IDs |
|---|---|---|---|
| IMPERIUM LUMEN | Registry, CSS recipe, vector scene, Gate/Dock mapping | Accepted token/font reconciliation, complete identity, threshold/passage/destination compositions, premium artwork | MU-0101–0113, MU-0118, MU-0208–0218, MU-0414–0416, MU-0603 |
| LUNAR CHRONICLES | Registry, CSS recipe, vector scene, ID mapping | Full orbital/timeline/archive compositions, licensed typography if required, observatory/atlas covers | MU-0119, MU-0208–0218, MU-0417–0419, MU-0604 |
| ROCKSOUL | Registry, CSS recipe, vector scene, Harbor mapping | Correct unique emblem, chapter/filmstrip/timeline/transmission families, strict no-face/copyright controls | MU-0202–0204, MU-0120, MU-0420–0422, MU-0605, MU-0615 |
| NEXUS PARADOX | Registry, CSS recipe, vector scene, Headquarter mapping | Instrument bay, spatial selector, real sensor scope, system map, unique lockup and art | MU-0121, MU-0423–0426, MU-0606 |
| RIOT ANARCHY | Registry, CSS recipe, vector scene, MoonSky mapping | Correct unique emblem, comic/poster/issue archive compositions and art | MU-0202, MU-0204, MU-0122, MU-0427–0429, MU-0607 |
| MYCELIUM | Registry, CSS recipe, vector scene, JIZZ mapping | Verify unique mark, real relationship graph/network compositions, growth path and art | MU-0205, MU-0123, MU-0430–0432, MU-0608 |

## 5. Feature-domain coverage checklist

| Blueprint/research domain | Required outcome | Task IDs |
|---|---|---|
| Canon and architecture | One shared engine, app/domain boundaries, no duplicate plan | MU-0001–0031 |
| Tokens and fonts | Accepted Imperium palette/type, all six semantic systems | MU-0101–0113 |
| World Grammar Engine | Six typed visual grammars | MU-0114–0128, MU-0501–0509 |
| Atoms and primitives | Semantic text/line/marker/focus/layout vocabulary | MU-0301–0308 |
| Components | Workflow-backed controls and full interaction state contract | MU-0309–0334 |
| Blocks | Search, form, inspector, evidence, timeline, states | MU-0401–0413 |
| Six world compositions | At least two signature compositions per DNA | MU-0414–0435 |
| Shell archetypes | Twelve blueprint recipes mapped to existing app needs | MU-0436–0448 |
| Brand system | Emblem, wordmark, lockups, favicon, app/social variants | MU-0201–0218 |
| Icon/vector system | Semantic icons and six vector grammars | MU-0219–0226 |
| Asset system | Typed manifest, provenance, license, responsive derivatives, validation | MU-0227–0240 |
| Artwork/cover foundry | Heroes, chapters, episodes, transmissions, archive, maps, OG and loading art | MU-0601–0617 |
| Avatar Studio | Explicit safe generation/edit/replace/remove flow | MU-0618–0625 |
| Motion/effects | Named choreography, pause, reduced motion, device awareness | MU-0626–0635 |
| Loading/waiting | Honest spinner/skeleton/progress/arrival/streaming | MU-0636–0640 |
| Sound/SFX | Existing engine extension, typed events, off by default, lab | MU-0641–0646, MU-0710 |
| Labs and generators | Skin/Component/Brand/Icon/Avatar/Artwork/Motion/Effects/Sound/Loading/Asset | MU-0701–0718 |
| Intent-to-Interface Compiler | Bounded deterministic task-to-recipe pipeline | MU-0510–0515 |
| Intent Lens | User-controlled task-focused view | MU-0516–0522 |
| Evidence Surface | Source/freshness/uncertainty/audit detail, no private reasoning | MU-0523–0525 |
| Scene Graph | Real relationships plus accessible fallback | MU-0526–0530 |
| Quality Observatory | Real CI/test/performance evidence and anti-slop diagnostics | MU-0531–0539 |
| App adoption | Correct skin mapping and shared package usage in seven frontends | MU-0801–0822 |
| Accessibility/performance | WCAG AA, keyboard, screen reader, responsive, LCP/CLS/INP, low power | MU-0901–0912 |
| Visual certification | Six-world matrix, screenshots, visual regression and evidence | MU-0913–0929 |
| Documentation and release | All docs/status/commits/CI evidence aligned | MU-0930–0942 |

## 6. Explicit exclusions (avoid scope creep)

- SHADOW backend models, generation jobs, CAS storage and media persistence.
- MOONLAB research/evaluation backend.
- ARSY auth, tenant, API and permission logic.
- MOONSKY communication runtime/API/database/operator console.
- SENTINEL RADIUS runtime and network policy.
- New standalone apps or product-domain backends.
- Optional commerce patterns without a current product workflow.
- Arbitrary LLM-generated executable markup.
- WebGPU/WebGL baseline dependency.
- Copied/copyrighted visual assets or unlicensed fonts/audio.
