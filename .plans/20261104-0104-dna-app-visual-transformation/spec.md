---
title: "DNA App Visual Transformation"
status: completed
owner: "engineering"
---

# DNA App Visual Transformation

## Problem

The six-skin foundation is wired into four apps, but their existing routes still reuse generic layouts and app-local styles, so the assigned DNA identities do not read as complete experiences.

## Goal

Transform all current routes in Dock, Headquarter, ID, and WORLD OBSERVATORY with original high-resolution artwork, vectors, icons, app-specific atomic UI, distinct navigation/composition, and opt-in sound effects.

## Scope

- Dock: home route.
- Headquarter: home, agent, AI Gateway, knowledge, swarm, and tools routes.
- ID: root redirect, account, login, and register routes.
- WORLD OBSERVATORY: home route.
- Shared `@moonwitness/ui` components, skin recipes, sound preference behavior, and app-specific shells required by these routes.
- Preserve real SDK/API/auth flows and route destinations. Correct dead controls and replace data that appears real but has no source with honest loading, empty, or unavailable states.

## Out of scope

- Backend/API implementation or contract changes.
- `apps/web`, unrelated apps, or routes not listed above.
- A dedicated Skin Laboratory route.
- Third-party, copyrighted, or unlicensed artwork, fonts, or sounds.

## Acceptance criteria

1. All 12 in-scope routes use distinct app compositions grounded in their assigned DNA, rather than a shared generic dashboard template.
2. Original SVG/vector masters, appropriate high-resolution PNG derivatives, and semantic iconography are stored with their owning app or shared package.
3. Artwork has dimensions/aspect ratios reserved, informative alt text when meaningful, and a text fallback when decorative or unavailable.
4. Existing authentication, SDK, route, form, session, search, agent, and telemetry interactions remain functional.
5. Dead controls and mock claims/data are removed or replaced with honest states and real destinations.
6. SFX are silent by default, user-controlled, and never autoplay; preference handling is consistent across routes.
7. Each route reflows without horizontal overflow, preserves keyboard/focus behavior, color contrast, touch targets, and reduced-motion behavior.
8. Affected app builds, typechecks, tests, documentation checks, and browser validation pass; repository-wide architecture lint is run and any unrelated violations are reported with evidence.
