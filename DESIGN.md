---
contract: "DOCUMENTATION_CONTRACT.md"
id: "DESIGN"
version: "1.0.0"
owner: "product-design"
status: "implemented"
last_verified: "2026-11-03"
---
# DESIGN.md
## Empire of the Light: Product Experience & Moon UI Doctrine

## Purpose
Create one coherent design language for A-L-L-A-H.COM while preserving the distinct identity of MoonWitness and each product. The target is a distinctive, premium, cinematic, carefully crafted interface: not a generic SaaS dashboard or default component-library layout.

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

## Empire of the Light Visual DNA
Use cinematic light, atmospheric depth, celestial geometry, refined surfaces, and subtle intentional motion where appropriate. Avoid noisy decoration and generic sci-fi tropes. Reuse approved MoonWitness and A-L-L-A-H.COM canon/assets; do not discard established identity without a documented decision.

## Moon UI Design System (`@moonwitness/ui`)
All client applications (`apps/dock`, `apps/headquarter`, `apps/id`) must strictly consume interactive elements and layouts from `@moonwitness/ui`:
- **Components**: `Button`, `Input`, `Card`, `Badge`, `Avatar`.
- **Blocks**: `EcosystemNavbar`, `SessionCard`.
- **Primitives & Raw**: Semantic layout foundations.
- **SFX**: Audio feedback for actions (`sfx.click()`, `sfx.success()`).
- **Tokens & Utils**: Color scales, typography, radii, elevation, and `cn()` utility.
- **Architectural Guard**: Raw un-themed HTML controls (`<button>`, `<input>`) in `apps/` are blocked by `@moonwitness/lint`.

Share components across applications; retain product-specific variants only when behavior genuinely differs.

## Product Identity
A-L-L-A-H.COM, MoonWitness, Headquarter, Dock, Cockpit, and Qorpus share atomic foundations but remain visually distinct. Their hierarchy, tone, navigation, and motifs must reflect validated purpose.

## Interaction
Every visible control performs its advertised action. Provide hover, focus, pressed, disabled, loading, success, and error states. Motion communicates transition or feedback, respects reduced-motion preferences, and never obstructs core tasks. Each skin must preserve keyboard and screen-reader behavior.

## Delivery Experience
Production releases use prebuilt, versioned container images so deployment does not compile application code on the production host. Keep the active image tag explicit and provide a commit-specific tag for rollback.

## Review Checklist
Review information architecture, task flow, visual hierarchy, responsive behavior, accessibility, keyboard/focus, loading/empty/error/offline states, functional controls, performance, and consistency with Moon UI and product identity. A mockup is not a completed feature; verify the running implementation.
