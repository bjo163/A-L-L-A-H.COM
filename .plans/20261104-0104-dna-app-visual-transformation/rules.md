---
title: "DNA App Visual Transformation Rules"
status: in_progress
---

# DNA App Visual Transformation Rules

- Keep one behavior and accessibility contract across the four visual systems; do not fork API, authorization, or business behavior for presentation.
- Do not change backend code, service contracts, credentials, or data ownership.
- Preserve the existing six-skin registry and the agreed app mapping.
- Scope CSS to the owning skin root or an app-specific component. Avoid global selectors that leak into unrelated routes.
- Use only original or verified licensed visual, icon, font, and sound assets. Do not imitate proprietary game, film, manga, music, or brand assets.
- Never depict ALLAH or claim to represent ALLAH. Do not use sacred names or religious text as decoration.
- Do not invent statistics, customer names, testimonials, observatory data, telemetry, system status, or security/performance claims.
- Remove or replace controls without a real action or destination. Preserve native semantics, accessible names, keyboard use, focus, disabled state, and visible feedback.
- Keep all text and component boundaries above applicable WCAG contrast thresholds.
- No horizontal overflow or clipped essential content; preserve 44px touch targets and visible focus.
- Honor `prefers-reduced-motion`. No perpetual animation, autoplay sound, or audio before explicit opt-in.
- SFX default to off. Read/write the opt-in locally without assuming consent from server state.
- Keep media dimensions/aspect ratio stable, limit expensive motion/effects, and provide useful fallbacks.
- Do not generate content or artwork in a way that suggests real people, real observations, or facts without a verifiable source.
