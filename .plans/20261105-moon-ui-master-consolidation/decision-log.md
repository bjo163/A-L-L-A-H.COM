# Moon UI Master Plan — Autonomous Decision Log

This log records low-risk decisions made under the existing accepted canon. It is not an ADR register. Only genuinely accepted architecture changes belong in root `DECISIONS.md`.

## DL-001 — Existing implementation is the baseline, not a rebuild target
- Date: 2026-11-05
- Decision: Reuse current skin registry, SkinRoot/SkinScope, six vector scenes, existing controls/blocks/raw/primitives, Skin Laboratory, tests and procedural SFX engine.
- Reason: These already exist in `dev`; duplicate implementations would create conflicting owners.
- Affected tasks: MU-0021–0022, MU-0301–0334, MU-0701, MU-0636–0646.
- Status: adopted.

## DL-002 — One master plan supersedes the separate HD artwork plan
- Date: 2026-11-05
- Decision: Transfer unfinished work from `.plans/20261104-2325-six-world-hd-artwork/` into MU-0601–0617 and MU-0414–0435. The predecessor is not executed independently.
- Reason: Avoid two active plans implementing the same six-world art/composition work.
- Status: adopted; predecessor disposition task MU-0023.

## DL-003 — Canonical frontend skin mapping
- Date: 2026-11-05
- Decision: Gate+Dock=Imperium; ID=Lunar; Harbor=ROCKSOUL; Headquarter=Nexus; MoonSky=Riot; JIZZ=Mycelium.
- Reason: Current `DESIGN.md` and package README identify these assignments. Verify against accepted DNA/ADRs before changing runtime.
- Status: adopted as current baseline; verification task MU-0025.

## DL-004 — Backend services are not skin-root apps
- Date: 2026-11-05
- Decision: Do not wrap ARSY or SENTINEL with frontend SkinRoot. UI plan covers seven Next.js frontends only.
- Reason: These are backend/service runtimes with separate ownership.
- Status: adopted.

## DL-005 — UI package remains TSX/TypeScript
- Date: 2026-11-05
- Decision: Do not rewrite `packages/ui` to JavaScript. Preserve its current React 19 TypeScript package contract.
- Reason: The package already has typed React component APIs and tests. Application/backend JS conventions do not imply converting this package.
- Status: adopted.

## DL-006 — Research concepts are bounded deterministic UI systems
- Date: 2026-11-05
- Decision: World Grammar Engine, Intent-to-Interface Compiler, Intent Lens, Evidence Surface, Scene Graph and Quality Observatory are implemented as typed deterministic contracts and UI composition tools. They do not generate arbitrary executable markup or duplicate backend/AI services.
- Reason: Preserve user agency, safety, testability, performance and clear ownership.
- Status: adopted.

## DL-007 — Preserve the existing sound engine
- Date: 2026-11-05
- Decision: Extend `src/sfx/audio.ts`; do not create another sound engine.
- Reason: A procedural engine and sound preference behavior already exist.
- Status: adopted.

## DL-008 — Preserve current public asset delivery until a tested replacement exists
- Date: 2026-11-05
- Decision: Do not mass-move app public assets before a deterministic manifest/resolver and build-compatible delivery path are verified.
- Reason: Existing apps use public paths referenced by the skin registry.
- Status: adopted.

## Open items
- No owner decision is currently required for ordinary plan execution.
- Specific implementation choices may be appended with rationale and affected task IDs.
- External/legal/credential/production blockers must be recorded per task and must not halt independent work.
