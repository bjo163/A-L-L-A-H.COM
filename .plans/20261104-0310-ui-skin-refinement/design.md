---
title: "UI and MoonFrame Skin Refinement Design"
status: "in_progress"
---

# UI and MoonFrame Skin Refinement Design

## Design read

Reading this as: an ecosystem of public entry, operations, identity, and research apps for MoonWitness and Empire of the Light users, in a distinct cinematic design language, with ENERGY 2 / RHYTHM 2 / MOTION 2. Headquarter uses MOTION 1 for its task-first control surfaces.

- Dock / Imperium Lumen: monumental threshold, axial framing, quiet negative space, controlled warm illumination.
- Headquarter / Nexus Paradox: task-first instrument planes, precise focus and state signals, no decorative fake telemetry.
- ID / Lunar Chronicles: layered archive, lunar framing, readable form surfaces, no unsourced astronomy.
- WORLD OBSERVATORY / Mycelium: connected organic forms and branching relationships, with a linear reading alternative.

“PlayStation super ultra HD” is interpreted as a request for high-fidelity polish and responsive, cinematic motion, not imitation of a console or game interface.

## Composition and component system

- Keep business behavior in the existing React components and SDK calls.
- Keep skin-independent semantic layout primitives and component APIs in `@moonwitness/ui`.
- Use semantic raw layout primitives only where they remove repeated one-off layout patterns; blocks compose these with existing `Button`, `Input`, `Textarea`, `Card`, `Badge`, and `Avatar`.
- Keep product-specific route compositions in their existing applications and stylesheets.
- Use the existing artwork and CSS/SVG only; do not generate additional visual assets for this phase.

## Motion behavior

- Buttons, links, navigation, cards, and form feedback use short state-triggered easing and depth changes.
- Each assigned DNA may have one subtle ambient layer that supports its metaphor. It must not simulate telemetry, scanning, loading, growth progress, or status.
- Add one accessible `Pause visual effects` / `Resume visual effects` control in the shared application navigation. It pauses ambient motion without disabling interaction transitions.
- A reduced-motion system preference turns ambient motion off and uses static visual equivalents.
- Use CSS and existing React state; no continuous WebGL, autoplay media, or added animation dependency.

## Visual decision record

- The six skin identities remain distinguishable through typography, geometry, surfaces, and motion recipes so they do not collapse into palette-only themes.
- Ambient light and line fields stay behind content because they give each named world atmosphere without inventing operational or observational data.
- The Dock destination layout gives Headquarter more area because it is the primary operations entry; the other two destinations remain equal-weight secondary routes.
- The shared compact navigation stacks identity, actions, and the menu on narrow screens so the controls remain named and thumb-sized instead of compressing the desktop row.
- Entrance movement is limited to short route transitions; focus, hover, and pressed states handle direct interaction feedback.

## Responsive and interaction states

- Keep the DOM order as the reading order. At narrow widths, reflow content into intentional stacks and preserve minimum touch targets.
- Preserve visible focus, labels, loading/error/empty states, and existing routes.
- Avoid clipping, hover-only behavior, and color-only feedback.
