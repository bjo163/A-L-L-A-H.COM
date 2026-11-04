---
title: "Full UI Transformation"
status: completed
owner: "engineering"
---

# Full UI Transformation

## Goal

Complete the MoonFrame transformation across all six Master DNA worlds and the four active applications while preserving established content, routes, SDK behavior, authentication, tenant boundaries, and user work.

## Scope

- Shared `@moonwitness/ui` skin engine, navigation, primitives, components, and tokens.
- Six-world Skin Laboratory and representative task comparison.
- Dock / Imperium Lumen.
- Headquarter / Nexus Paradox and its operational routes.
- ID / Lunar Chronicles and account flows.
- WORLD OBSERVATORY / Mycelium.
- ROCKSOUL and RIOT ANARCHY runtime experiences.
- Loading, empty, error, success, focus, reduced-motion, and pauseable-motion states.

## Requirements

1. Keep six skins distinct through composition, geometry, typography, surface, and motion, not palette alone.
2. Keep one shared semantic component and interaction engine.
3. Use approved DNA canon and only existing or explicitly approved assets.
4. Do not fabricate users, statistics, observations, telemetry, testimonials, or performance claims.
5. Preserve authentication, routing, SDK calls, tenant isolation, and worktree changes.
6. Every control must perform a real action and remain keyboard and screen-reader usable.
7. Every data view must expose truthful loading, empty, error, and success states.
8. Verify production runtime behavior rather than relying only on development previews.

## Acceptance criteria

- Six DNA worlds render one repeated representative task for direct comparison.
- Active apps improve on the recorded baseline and remain responsive at 320, 360, 390, 768, 1024, 1280, and 1440 pixels.
- ROCKSOUL and RIOT ANARCHY have runtime surfaces and pass the same browser, accessibility, and state contracts.
- All shared controls retain native semantics, visible focus, 44px targets, and reduced-motion support.
- Production builds and interactive checks pass for all selected surfaces.
- Canonical reports distinguish implemented, verified, and unverified capabilities.

