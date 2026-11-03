---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DESIGN"
version: "1.0.0"
owner: "product-design"
status: "implemented"
last_verified: "2026-11-04"
---
# DESIGN.md
## Empire of the Light: Product Experience & Moon UI Doctrine

## Purpose
Create one coherent design foundation for A-L-L-A-H.COM while preserving the distinct identity of MoonWitness and each product. The target is a distinctive, premium, cinematic, carefully crafted interface—not a generic SaaS dashboard or default component-library layout.

## Principles
- Purpose before decoration: every element communicates hierarchy, state, or meaning.
- Distinctive composition: avoid repetitive dashboard grids and generic hero templates.
- Coherent ecosystem: shared foundations with recognizable product identities.
- Clarity in navigation, hierarchy, actions, and status.
- Effects, glow, gradients, texture, and motion must serve a distinct design purpose.
- Accessibility: contrast, keyboard support, focus, semantics, reduced motion, readable type.
- Responsive composition for desktop, tablet, and mobile.
- Honest loading, empty, error, offline, permission, and success states.
- Product canon and asset provenance must be preserved.

## Empire of the Light visual direction

- IMPERIUM LUMEN: A-L-L-A-H.COM / Empire of the Light
- LUNAR CHRONICLES: MoonWitness Universe
- ROCKSOUL: the established silent-storyteller poster identity
- NEXUS PARADOX: diegetic future-game HUD and spatial technology
- RIOT ANARCHY: manga, xerox punk, underground poster, and controlled anti-design
- MYCELIUM: biomorphic, generative, interconnected organic systems
- WORLD OBSERVATORY: premium cinematic intelligence observatory
Use monumental composition, abstract architectural language, controlled illumination, atmospheric depth, celestial geometry, refined surfaces, and subtle intentional motion where appropriate. Avoid noisy decoration and generic sci-fi clichés. Reuse approved MoonWitness and A-L-L-A-H.COM canon/assets; do not discard established identity without a documented decision. Never depict or claim to represent ALLAH.

## Moon UI and six Master DNA
The canonical six-world direction is documented in [DNA/README.md](DNA/README.md):
1. IMPERIUM LUMEN: A-L-L-A-H.COM / Empire of the Light.
2. LUNAR CHRONICLES: MoonWitness Universe.
3. ROCKSOUL: the established silent-storyteller poster identity.
4. NEXUS PARADOX: diegetic future-game HUD and spatial technology.
5. RIOT ANARCHY: manga, xerox punk, underground poster, and controlled anti-design.
6. MYCELIUM: biomorphic, generative, interconnected organic systems.

These are distinct visual and interaction grammars, not color themes. Each owns composition, navigation metaphor, geometry, material, typography, motion, component recipes, and exclusions. The shared component engine remains singular; world-specific presentation must not fork business logic or accessibility behavior.

All client applications (`apps/dock`, `apps/headquarter`, `apps/id`) must consume interactive elements and layouts from `@moonwitness/ui`. The shared UI package provides components, blocks, primitives, raw semantic layout foundations, SFX, tokens, and utilities. Raw un-themed HTML controls in `apps/` are blocked by `@moonwitness/lint`; retain product-specific variants only when behavior genuinely differs.

Inspect the existing UI package and app integrations before extending it. Its current primitive implementation uses Base UI; do not assume Radix is installed or migrate the primitive layer as part of skin work. The package now provides typed tokens and shared component recipes for all six skin IDs, with root assignments for Dock, Headquarter, ID, and WORLD OBSERVATORY. Those four apps now have distinct route compositions, responsive navigation, and app-specific artwork. A dedicated Skin Laboratory comparison remains pending; the implemented app routes have been verified separately.

## Product identity
A-L-L-A-H.COM, MoonWitness, Headquarter, Dock, Cockpit, Qorpus, and ROCKSOUL may share atomic foundations but must remain visually distinct. Their hierarchy, tone, navigation, and motifs must reflect validated purpose and preserved canon.

## Interaction
Every visible control performs its advertised action. Provide hover, focus, pressed, disabled, loading, success, and error states. Motion communicates transition or feedback, respects reduced-motion preferences, and never obstructs core tasks. Each skin must preserve keyboard and screen-reader behavior.

The VS Code agent requests explicit consent before sending selected workspace context, presents proposed file changes for review, and exposes permission, approval, cancellation, and truthful completion states. Headquarter's remote agent controls manage paired devices and missions, but do not expose workspace paths or bypass local extension permissions.

## Delivery Experience
Production releases use prebuilt, versioned container images so deployment does not compile application code on the production host. Keep the active image tag explicit and provide a commit-specific tag for rollback.

## Review checklist
Review information architecture, task flow, visual hierarchy, responsive behavior, accessibility, keyboard/focus, loading/empty/error/offline states, functional controls, performance, motion fallback, asset licensing, and consistency with Moon UI and product identity. A mockup is not a completed feature; verify the running implementation.
