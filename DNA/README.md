---
title: "MoonFrame Six Master DNA"
version: "1.0.0"
status: "approved"
last_verified: "2026-11-03"
owner: "product-design"
---

# MOONFRAME — SIX MASTER DESIGN DNA

## Purpose

This directory defines the approved creative and interaction direction for six radically distinct visual worlds used by A-L-L-A-H.COM, MoonWitness, ROCKSOUL, and future MoonFrame experiences.

These are not six color themes. Each Master DNA defines a world model, visual grammar, spatial composition, typography, material language, motion behavior, navigation metaphor, component recipes, and exclusions.

## Canonical status

- **Creative direction:** APPROVED.
- **Specification:** DOCUMENTED in this directory.
- **Shared UI foundation:** EXISTS at `packages/ui/`; inspect its actual source before extending it.
- **Six runtime skins:** NOT YET IMPLEMENTED or verified.
- **Showcase / Skin Laboratory:** NOT YET IMPLEMENTED or verified.

A documented direction must never be reported as a shipped feature.

## The six worlds

| ID | Master DNA | World metaphor | Primary ecosystem identity |
|---|---|---|---|
| 01 | IMPERIUM LUMEN | A monumental empire of light and impossible architecture | A-L-L-A-H.COM / Empire of the Light |
| 02 | LUNAR CHRONICLES | A living lunar observatory, celestial chronicle, and universe archive | MoonWitness Universe |
| 03 | ROCKSOUL | A silent cinematic storyteller and alternative-music journey | ROCKSOUL signature narrative |
| 04 | NEXUS PARADOX | An interface from another reality; diegetic spatial technology | Future-game / experimental products |
| 05 | RIOT ANARCHY | An underground wall of manga, punk, xerox, and anti-design | Gen-Z grunge / manga / poster experiences |
| 06 | MYCELIUM | A digital ecosystem behaving like a living organism | Organic / generative / network experiences |

## Canonical documents

- [00 — Engine Contract](00-ENGINE-CONTRACT.md): invariants, architecture boundary, and rules shared by all skins.
- [01 — Imperium Lumen](01-IMPERIUM-LUMEN.md)
- [02 — Lunar Chronicles](02-LUNAR-CHRONICLES.md)
- [03 — ROCKSOUL](03-ROCKSOUL.md)
- [04 — Nexus Paradox](04-NEXUS-PARADOX.md)
- [05 — Riot Anarchy](05-RIOT-ANARCHY.md)
- [06 — Mycelium](06-MYCELIUM.md)
- [07 — Component Mapping](07-COMPONENT-MAPPING.md): how shared primitives receive different world-specific recipes.
- [08 — Quality Gates](08-QUALITY-GATES.md): acceptance criteria and anti-slop review.

## Non-negotiable design doctrine

1. One functional component engine; six distinct visual and interaction languages.
2. No skin may be reduced to recoloring the same generic dashboard.
3. World-specific layout, navigation, hierarchy, composition, surfaces, typography, and motion are allowed when they preserve the underlying task and semantics.
4. Shared components must remain keyboard-operable, screen-reader understandable, responsive, and testable.
5. Decorative effects must never obscure labels, controls, data, focus, or state.
6. The visual canon of each parent identity must be preserved. A child skin cannot silently rewrite the product's narrative or history.
7. Real-world astronomy and other factual data must remain distinguishable from fictional, symbolic, or narrative content.
8. Never depict ALLAH or claim that a graphic, architecture, light effect, or interface is a representation of ALLAH. IMPERIUM LUMEN uses abstract artistic language only.
9. Use original or properly licensed assets. Do not reproduce proprietary game interfaces, manga characters, album artwork, or poster compositions.
10. Implementation status requires source and verification evidence, not mockups or documentation alone.

## Relationship to Moon UI

The shared UI package is the functional foundation. The six DNA specifications are the visual and experiential layer. Before implementation, inspect current component exports, tokens, Tailwind integration, and the actual primitive library in `packages/ui/`. Current repository code uses Base UI primitives in its shared package; do not assume Radix is installed or migrate the primitive layer as part of skin implementation.

## Delivery sequence

1. Build the Skin Laboratory comparison surface.
2. Prove all six worlds with the same small set of representative tasks.
3. Implement token contracts and world-specific layout recipes.
4. Extend the component catalogue in controlled batches.
5. Verify accessibility, responsive behavior, performance, reduced motion, and functional parity.
6. Promote only evidence-backed capabilities from documented to implemented and verified.
