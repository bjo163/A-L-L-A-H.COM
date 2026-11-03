---
title: "DNA App Visual Transformation Design"
status: in_progress
---

# DNA App Visual Transformation Design

## Design read and dials

- Dock: product-discovery portal for developers, using Imperium Lumen's monumental architecture and controlled light. ENERGY 2 / RHYTHM 3 / MOTION 1.
- Headquarter: operational control surface for platform operators, using Nexus Paradox's spatial instrument language with legible telemetry. ENERGY 2 / RHYTHM 3 / MOTION 1.
- ID: account and session authority for ecosystem users, using Lunar Chronicles' observatory archive, lunar cartography, and measured typography. ENERGY 2 / RHYTHM 2 / MOTION 1.
- WORLD OBSERVATORY: source-grounded intelligence exploration, using Mycelium's connected structures and organic branching only where real relationships support them. ENERGY 3 / RHYTHM 3 / MOTION 2.

## Composition

- Give each app a separate navigation grammar and page silhouette. Reuse semantic primitives, not an identical page template.
- Dock uses a clear architectural entry and named product destinations, with sparse supporting details rather than a generic three-card dashboard.
- Headquarter uses a stable instrument shell, explicit current destination, and task-led control surfaces. Do not present fake telemetry or always-on pseudo-HUD decoration.
- ID uses quiet observatory framing for authentication and an archival layout for account/session management. Forms remain the visual and interaction focal point.
- WORLD OBSERVATORY uses an organic network only to show sourced connections. Until real observation/perspective APIs exist, show an honest empty state instead of fabricated sample records.

## Asset direction

- Create original vector master artwork and marks for the four assigned worlds. Use SVG for responsive geometry and high-resolution PNG derivatives only for compositions where raster output is beneficial.
- Keep each artwork recognizable through framing, material, and geometry, not only color. Preserve readable negative space around interface content.
- Create semantic, original icon marks for navigation and state. A label remains present when an icon's meaning is not universal.
- Do not add a generated human, logo, astronomical fact, testimonial, data point, or protected fictional identity.
- Existing fonts and local/system fallbacks remain in use unless a font asset has verified licensing and a demonstrated need.

## SFX and interaction contract

- Extend the existing shared sound engine with app-specific short interaction cues where they add feedback.
- Persist an explicit per-device opt-in preference; default to off for first-time visitors and never play ambient or automatic audio.
- Expose a labeled, keyboard-operable sound toggle in each app shell. Respect reduced motion by avoiding unnecessary animation; sound preference remains independent.
- Keep action and navigation on native button and link semantics. Retain accessible labels, visible focus, disabled/loading/error feedback, and real destinations.

## Responsive and state behavior

- Establish layouts from content breakpoints and test phone, tablet, laptop, and wide desktop widths.
- Collapse navigation into a labeled, operable menu. Keep tap targets at least 44px and prevent page-level horizontal overflow.
- Data pages distinguish loading, empty, error, and populated states. Use only data returned by current APIs; do not disguise sample content as live.
- SVG/PNG artwork includes explicit dimensions or aspect ratio. Decorative art has empty alt text; informative art has concise alt text and a non-image equivalent.

## Shared technical contract

- Keep the `SkinRoot` token contract and package ownership in `@moonwitness/ui`.
- Add reusable atoms and navigation/sound controls to the shared package only when their semantics are common. Keep route composition and DNA-specific artwork in the owning app.
- Preserve all SDK/API behavior and avoid backend changes.
