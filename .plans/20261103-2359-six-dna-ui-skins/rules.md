---
title: "Six DNA UI Skins Rules"
status: in_progress
---

# Six DNA UI Skins Rules

- Preserve one shared semantic behavior layer. DNA-specific code may alter presentation, not business behavior or authorization.
- Use a closed, typed skin registry. Never derive CSS selectors, class names, or styles from untrusted input.
- Keep initial skin selection stable across server rendering and hydration. Do not read browser-only state.
- Keep existing Base UI usage. Do not add Radix, another UI framework, another token engine, or animation dependencies.
- Scope token and skin styles to the selected UI root; do not leak a skin into sibling applications or unrelated roots.
- Preserve accessible names, native semantics, keyboard interaction, visible focus, disabled/error feedback, and reduced-motion behavior.
- Verify WCAG AA text contrast and 3:1 non-text control/focus contrast for each defined skin role pairing.
- Use no fabricated telemetry, astronomical facts, progress, claims, identities, or proprietary artwork.
- Never depict or claim to represent ALLAH. Do not copy protected game, manga, music, or brand assets.
- Do not mark the six skins fully verified without the deferred Skin Laboratory comparison and evidence required by `DNA/08-QUALITY-GATES.md`.
