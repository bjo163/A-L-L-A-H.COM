---
title: "UI and MoonFrame Skin Refinement"
status: in_progress
owner: "engineering"
---

# UI and MoonFrame Skin Refinement

## Goal

Refine all current Dock, Headquarter, ID, and WORLD OBSERVATORY routes and the existing shared UI components and blocks. Make each assigned skin legible through composition and interaction, not only color, and add smooth, user-controllable ambient motion.

## Scope

- Dock home.
- Headquarter overview, Agent Studio, AI Gateway, Knowledge Explorer, Swarm Operations, and Tool Registry.
- ID root, login, register, and account.
- WORLD OBSERVATORY home.
- Existing `@moonwitness/ui` components, blocks, skin tokens/recipes, and any minimal raw layout foundation justified by the code audit.
- Shared app shell control for pausing ambient visual effects.

## Out of scope

- Backend/API/auth behavior changes.
- New routes or Skin Laboratory.
- ISP operator/customer workflows.
- New logos, avatars, artwork, or animation dependencies without separate evidence and authorization.
- Copying any proprietary PlayStation, game, or console interface.

## Requirements

1. Retain the existing four app-to-skin assignments and current public component behavior.
2. Audit and improve each existing shared component and block; add only semantic, reusable raw primitives that eliminate a demonstrated duplication or layout gap.
3. Give Dock / Imperium Lumen, Headquarter / Nexus Paradox, ID / Lunar Chronicles, and WORLD OBSERVATORY / Mycelium layout and surface treatments grounded in their approved DNA.
4. Keep all six registered skin definitions visually distinct beyond palette and verify their contrast/focus/component parity.
5. Add polished, state-linked transitions and restrained identity-specific ambient effects. Provide pause/resume and reduced-motion behavior; motion must not imply fake product data or status.
6. Preserve keyboard, screen-reader, touch, zoom, responsive, and real data/auth/API behavior.

## Acceptance criteria

- All 12 current routes render without horizontal overflow at narrow, medium, and wide widths.
- Every existing component and block is reviewed and directly relevant defects are fixed without breaking its API.
- The raw layer, if added, is small, semantic, and consumed by real shared/app layouts.
- Ambient animation is pausable, stops under `prefers-reduced-motion`, and remains decorative rather than communicating fabricated status.
- Six registered skins pass contrast tests and retain distinct geometry, typography, surface, and motion identity.
- Required builds/tests and documentation checks have actual recorded outcomes; unrelated baseline failures are reported separately.
