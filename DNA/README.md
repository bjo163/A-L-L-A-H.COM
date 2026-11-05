---
title: "MoonFrame Seven Master DNA"
version: "1.0.0"
status: "approved"
last_verified: "2026-11-03"
owner: "product-design"
---

# MOONFRAME: SEVEN MASTER DESIGN DNA

## Purpose

This directory defines the approved creative and interaction direction for seven distinct visual worlds used by A-L-L-A-H.COM, MoonWitness, ROCKSOUL, E-ISP, and future MoonFrame experiences.

These are not color themes. Each Master DNA defines a world model, visual grammar, spatial composition, typography, material language, motion behavior, navigation metaphor, component recipes, and exclusions.

## Canonical status

- **Creative direction:** APPROVED.
- **Specification:** DOCUMENTED in this directory.
- **Shared UI foundation:** EXISTS at `../packages/ui/`; inspect its actual source before extending it.
- **Shared skin engine and semantic recipes:** IMPLEMENTED in `../packages/ui/` for all seven DNA IDs.
- **Application root assignments:** Gate and Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, E-ISP / Simpul Nusantara, and WORLD OBSERVATORY / Mycelium.
- **Route-specific world scopes:** ROCKSOUL and RIOT ANARCHY use `SkinScope` within WORLD OBSERVATORY; the app retains MYCELIUM as its root world.
- **Seven runtime worlds:** shared vector artwork and world-specific component recipes are implemented; the full cross-app experience remains subject to visual and accessibility verification.
- **Showcase / Skin Laboratory:** implemented in Headquarter at `/skin-lab`; visual, responsive, and interaction verification remains an explicit release gate.

A documented direction must never be reported as a shipped feature.

## The seven worlds

| ID | Master DNA | World metaphor | Primary ecosystem identity |
|---|---|---|---|
| 01 | IMPERIUM LUMEN | A monumental empire of light and impossible architecture | A-L-L-A-H.COM / Empire of the Light |
| 02 | LUNAR CHRONICLES | A living lunar observatory, celestial chronicle, and universe archive | MoonWitness Universe |
| 03 | ROCKSOUL | A silent cinematic storyteller and alternative-music journey | ROCKSOUL signature narrative |
| 04 | NEXUS PARADOX | An interface from another reality; diegetic spatial technology | Future-game / experimental products |
| 05 | RIOT ANARCHY | An underground wall of manga, punk, xerox, and anti-design | Gen-Z grunge / manga / poster experiences |
| 06 | MYCELIUM | A digital ecosystem behaving like a living organism | Organic / generative / network experiences |
| 07 | SIMPUL NUSANTARA | A service atlas showing abstract neighborhood network routes | E-ISP storefront |

## Canonical documents

- [00 — Engine Contract](00-ENGINE-CONTRACT.md): invariants, architecture boundary, and rules shared by all skins.
- [01 — Imperium Lumen](01-IMPERIUM-LUMEN.md)
- [02 — Lunar Chronicles](02-LUNAR-CHRONICLES.md)
- [03 — ROCKSOUL](03-ROCKSOUL.md)
- [04 — Nexus Paradox](04-NEXUS-PARADOX.md)
- [05 — Riot Anarchy](05-RIOT-ANARCHY.md)
- [06 — Mycelium](06-MYCELIUM.md)
- [Simpul Nusantara](09-SIMPUL-NUSANTARA.md)
- [07 — Component Mapping](07-COMPONENT-MAPPING.md): how shared primitives receive different world-specific recipes.
- [08 — Quality Gates](08-QUALITY-GATES.md): acceptance criteria and anti-slop review.

## Non-negotiable design doctrine

1. One functional component engine; seven distinct visual and interaction languages.
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

The shared UI package is the functional foundation. The seven DNA specifications are the visual and experiential layer. Before implementation, inspect current component exports, tokens, Tailwind integration, and the actual primitive library in `../packages/ui/`. Current repository code uses Base UI primitives in its shared package; do not assume Radix is installed or migrate the primitive layer as part of skin implementation.

## Delivery sequence

1. Keep the Skin Laboratory task equivalent across all seven worlds.
2. Implement token contracts, shared vector scenes, and world-specific layout recipes.
3. Apply each DNA to its app root or explicitly scoped route.
4. Extend the component catalogue in controlled batches.
5. Verify accessibility, responsive behavior, performance, reduced motion, and functional parity.
6. Promote only evidence-backed capabilities from documented to implemented and verified.

Gate and Dock intentionally share the IMPERIUM LUMEN root. The architecture lint baseline records this product-mapping exception; the remaining root skins stay distinct.
