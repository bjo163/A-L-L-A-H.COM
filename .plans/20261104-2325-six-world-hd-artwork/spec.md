---
status: in_progress
---

# Six-World High-Detail Artwork

## Problem

The six approved worlds have distinct tokens and abstract vector compositions, but the art does not yet deliver the authored material, cinematic, editorial, instrument, or organic depth in their DNA.

## Goal

Create original, detailed vector artwork for all six worlds and integrate it through the shared UI system without sacrificing clarity, accessibility, responsive behavior, or performance.

## Scope

- Worlds: Imperium Lumen, Lunar Chronicles, ROCKSOUL, Nexus Paradox, Riot Anarchy, and Mycelium.
- Consumers: Gate, Dock, Headquarter, ID, Jizz, plus the in-progress Harbor ROCKSOUL metadata artwork and MoonSky Riot route.
- Shared implementation in `packages/ui/src/blocks/world-artwork.tsx`, its visual recipes, representative comparison, and owned public artwork files.
- ID login mobile composition so the sign-in action is not displaced by the art.

## Requirements

- Each scene is identifiable by composition and material language, not just palette.
- Art is original and follows the approved DNA, canon, and exclusions.
- Geometry is resolution-independent SVG; static public previews match the shared artwork source.
- Existing pause and reduced-motion behavior remains intact.
- Decorative SVG remains hidden from assistive technology; informative visual data has a text equivalent.
- Hero text and primary actions remain legible and reachable at narrow widths.
- All art stays within existing UI package ownership and semantic-token boundaries.
- Do not add a runtime generation service, rendering engine, or third-party dependency.

## Acceptance

1. Server-rendered `WorldArtwork` produces a distinct detailed scene for every registry skin.
2. The six public SVG/PNG preview pairs reflect those same scenes in all known consumer apps.
3. The Skin Laboratory can compare the six scenes with its existing world selector and task parity.
4. At 320px and 390px mobile widths, the ID login sign-in action is not pushed below the initial viewport; no horizontal overflow is introduced.
5. `pnpm ui:test` and `pnpm ui:contrast` pass; relevant builds/typechecks pass or existing blockers are identified separately.
6. Reduced-motion and the visual-effects pause control continue to suppress nonessential animation.

## Out of Scope

- Authentication or API changes.
- Reworking product workflows, navigation, or data semantics.
- New external asset services, new image-rendering dependencies, or third-party visual references copied as final art.
- Unsupported astronomy, device telemetry, user metrics, or narrative claims.
