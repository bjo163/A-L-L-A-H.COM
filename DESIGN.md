# DESIGN.md
## Empire of the Light — Product Experience & Moon UI Doctrine

## Purpose
Create one coherent design language for A-L-L-A-H.COM while preserving the distinct identity of MoonWitness and each product. The target is a distinctive, premium, cinematic, carefully crafted interface—not a generic SaaS dashboard or default component-library layout.

## Principles
- Purpose before decoration; every element communicates hierarchy, state, or meaning.
- Distinctive composition; avoid repetitive dashboard grids and generic hero templates.
- Coherent ecosystem; shared foundations with recognizable product identities.
- Clarity in navigation, hierarchy, actions, and status.
- Restraint in glow, gradients, effects, and motion.
- Accessibility: contrast, keyboard support, focus, semantics, reduced motion, readable type.
- Responsive composition for desktop, tablet, and mobile.
- Honest loading, empty, error, offline, permission, and success states.

## Empire of the Light visual DNA
Use cinematic light, atmospheric depth, celestial geometry, refined surfaces, and subtle intentional motion where appropriate. Avoid noisy decoration and generic sci-fi clichés. Reuse approved MoonWitness and A-L-L-A-H.COM canon/assets; do not discard established identity without a documented decision.

## Moon UI
Evaluate Moon UI as the shared foundation. Maintain tokens for color, typography, spacing, radii, elevation, motion; layout primitives; accessible components; iconography; data visualization; navigation/overlays; theme behavior; responsive rules; and component states.

Share components when appropriate; retain product-specific components when behavior genuinely differs.

## Product identity
A-L-L-A-H.COM, MoonWitness, Headquarter, Dock, Cockpit, and Qorpus may share foundations but should not become visually indistinguishable. Their hierarchy, tone, navigation, and motifs must reflect validated purpose.

## Interaction
Every visible control performs its advertised action. Provide hover, focus, pressed, disabled, loading, success, and error states. Motion communicates transition or feedback, respects reduced-motion preferences, and never obstructs core tasks.

## Delivery experience
Production releases should use prebuilt, versioned container images so deployment does not compile application code on the production host. Keep the active image tag explicit and provide a commit-specific tag for rollback.

## Review checklist
Review information architecture, task flow, visual hierarchy, responsive behavior, accessibility, keyboard/focus, loading/empty/error/offline states, functional controls, performance, and consistency with Moon UI and product identity. A mockup is not a completed feature; verify the running implementation.
