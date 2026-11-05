---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-COVERAGE"
version: "1.0.0"
owner: "engineering"
status: "planned"
---

# Package UI — Requirement and Task Coverage Matrix

This matrix links the package-specific execution tasks to the canonical Moon UI master backlog. Parent MU IDs remain authoritative for project-wide status. PUI IDs split package work into smaller execution units and must be synchronized with the parent ledger.

| Package domain | Source of truth / baseline | PUI tasks | Parent MU mapping | Evidence required |
|---|---|---|---|---|
| Repository/package baseline | live repo, package manifests, CI | PUI-0001–0021 | MU-0001–0031 | HEAD, status, source inventory, command output, overlap record |
| Component/primitive ownership | `src/components`, `src/blocks`, `src/primitives`, root/subpath barrels | PUI-0018 | MU-0008–0010 | Owner/export map in `package-inventory.md`; route/business boundary review |
| MCP tool UI exports | `src/components/ToolExecutionForm.tsx`, `ToolResultViewer.tsx`, component barrel | PUI-0101–0104, 0112 | MU-0930–0932 | Named public exports and successful strict package typecheck; UI test suite |
| Internal dependency direction | imports under `src/components`, `src/blocks`, package boundary checks | PUI-0110, 0118 | MU-0008–0010, MU-0930–0942 | no package self-imports or app/backend imports; architecture gate |
| Public API/exports | package.json, src/index.ts, subpath indexes | PUI-0101–0112 | MU-0930–0942 | export tests, consumer import/build evidence |
| Layer boundaries | README architecture table, source imports | PUI-0113–0119 | MU-0008–0010, MU-0930–0942 | dependency/architecture checks |
| Skin runtime | src/skins, SkinRoot, SkinScope | PUI-0201–0208 | MU-0019, MU-0101–0128, MU-0801–0809 | SSR/hydration tests, scope isolation |
| Semantic tokens | registry, theme.css, skins.css | PUI-0209–0216 | MU-0101–0113 | token schema, contrast output |
| Six DNA grammars | six approved DNA documents | PUI-0217–0226 | MU-0114–0128, MU-0501–0509 | grammar completeness and distinction tests |
| Fonts/contrast | current font tree and license records | PUI-0227–0234 | MU-0105–0113, MU-0901–0912 | license/provenance, loading and contrast evidence |
| Existing components | src/components, component tests | PUI-0301–0308 | MU-0301–0334 | API/state/a11y test results |
| Atoms | components, tokens, raw primitives | PUI-0309–0315 | MU-0301–0308 | public exports and composability tests |
| Workflow-backed controls | consumer route inventory | PUI-0316–0331 | MU-0309–0334 | named consumer, semantics, keyboard and skin tests |
| Shared blocks | src/blocks, real consumers | PUI-0332–0340 | MU-0401–0413 | state fixtures, consumer evidence |
| Six signature compositions | current blocks, skin recipes, DNA specs | PUI-0401–0424 | MU-0414–0448 | screenshots, responsive and fallback evidence |
| Brand system | existing SVG marks and app metadata | PUI-0501–0510 | MU-0201–0218 | hashes, approved source masters, variant validation |
| Icon/vector system | Icon component and SVG assets | PUI-0511–0517 | MU-0219–0226 | import audit, SVG tests |
| Asset manifest/pipeline | package/app public assets, asset tests | PUI-0518–0530 | MU-0227–0240, MU-0601–0617 | manifest validation, checksum, provenance/license |
| Motion/effects | MotionFrame, VisualEffectsProvider | PUI-0601–0608 | MU-0626–0635 | reduced-motion and performance evidence |
| Loading/waiting | Skeleton, StatePanel, StatusMessage | PUI-0609–0613 | MU-0636–0640 | real progress semantics and fallback tests |
| SFX | existing procedural audio engine | PUI-0614–0620 | MU-0641–0646, MU-0710 | opt-in/mute/API failure tests |
| Labs | SkinLaboratory and existing package providers | PUI-0701–0709 | MU-0701–0718 | repeatable six-skin lab evidence |
| Intent/evidence | research proposal, real consumer contracts | PUI-0710–0716 | MU-0501–0525 | typed schema, authority boundary, user-control tests |
| Scene graph/spatial | real relationship data contracts | PUI-0717–0721 | MU-0526–0530 | sourced graph, keyboard/linear fallback |
| Certification | root scripts, CI, app builds | PUI-0722–0734 | MU-0901–0942 | tests, contrast, screenshots, a11y, perf, commits |

## Baseline facts to preserve

- Package: `@moonwitness/ui`, currently private workspace package, ESM, TypeScript/TSX source, React 19 peer dependencies.
- Public package paths currently include root, components, blocks, primitives, raw, sfx, skins.css, theme.css and tokens.
- Existing source inventory includes shared components, blocks, raw layout, visual-effects primitives, six skin IDs and a procedural SFX foundation.
- Existing UI and contrast scripts are `pnpm ui:test` and `pnpm ui:contrast`; verify all other commands from the live root manifest.
- Six DNA mapping is fixed by accepted design canon: Gate+Dock=Imperium; ID=Lunar; Harbor=ROCKSOUL; Headquarter=Nexus; MoonSky=Riot; JIZZ=Mycelium.
- Do not treat proposed foundries, compiler, spatial graph or observatory capabilities as implemented without source and evidence.

## Status reconciliation

Phase 0 ownership and baseline classification are complete from the live source inventory, architecture search, six DNA specifications, root engineering contracts, and package documentation. `package-inventory.md` records the 57-source/5-test inventory, complete file paths, app consumers and entrypoints. App route/data/auth/persistence ownership is documented in README §6 and BLUEPRINT §0.2 and the repository architecture check passes.

The package-only API gap found during the baseline was that existing `ToolExecutionForm` and `ToolResultViewer` source modules were missing from `src/components/index.ts`. Both are now included in the public component surface. They accept provided data/callbacks and do not own provider transport. Source-level feature tests exist but are excluded from `pnpm ui:test` and depend on absent Vitest/Testing Library packages; do not claim those tests pass or credit feature-level test coverage until the test harness is reconciled.

The export audit also found five tool UI modules importing their own library through `@moonwitness/ui`, creating a package-barrel cycle. Those modules now import sibling components or the shared status block directly. `rg "@moonwitness/ui" packages/ui/src` returns no package self-imports; package typecheck, `pnpm ui:test` and lint pass.

When a PUI task is verified:
1. Record exact source paths and test/manual evidence here or in report.
2. Update its parent MU task(s) in the master `task.md`.
3. Update this row if scope/status changes.
4. Keep proposal/specification status separate from implementation/test/visual certification status.
