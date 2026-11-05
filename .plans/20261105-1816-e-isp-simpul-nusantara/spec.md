---
status: in_progress
owner: product-design
---

# SIMPUL NUSANTARA skin and DNA

## Architecture

Add a seventh Master DNA and Moon UI skin for the public E-ISP storefront. Keep behavior in the shared component engine and express the new identity through the skin registry, skin-scoped recipes, vector artwork, and E-ISP root assignment.

## Requirements

- Give E-ISP a unique `simpul-nusantara` root skin.
- Define and document the SIMPUL NUSANTARA world grammar, palette, typography, materials, component recipes, responsive behavior, motion, and exclusions.
- Supply original abstract network-topology artwork, not a coverage map or a claim about real service availability.
- Keep E-ISP routes, interactions, and data behavior unchanged.
- Remove the obsolete `rocksoul` duplicate-root exception while preserving the intentional `imperium-lumen` exception.
- Update skin tests, app contract, skin counts, and design documentation.

## Acceptance criteria

- The registry and artwork renderer expose seven unique skin IDs.
- E-ISP `SkinRoot`, `CONTRACT.md`, metadata assets, and architecture lint agree on `simpul-nusantara`.
- SVG source and 1600x900 PNG preview are served by E-ISP and match the shared artwork renderer.
- Skin token contrast and UI tests pass.
- Platform, Docker, unit-contract, docs, and architecture gates pass in a clean checkout.
- Existing E-ISP navigation and route behavior remain unchanged.
