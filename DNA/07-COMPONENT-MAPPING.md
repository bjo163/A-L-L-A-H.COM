---
title: "Six DNA Component Mapping"
version: "1.2.0"
status: "approved"
last_verified: "2026-11-04"
owner: "product-design"
---

# SIX DNA — COMPONENT MAPPING

## Purpose

Define how the same semantic task can be expressed through six distinct visual languages while preserving one functional contract. This is a design specification, not evidence that these variants have been implemented.

## Representative component matrix

| Component / task | IMPERIUM LUMEN | LUNAR CHRONICLES | ROCKSOUL | NEXUS PARADOX | RIOT ANARCHY | MYCELIUM |
|---|---|---|---|---|---|---|
| Primary action | Architectural seal | Observatory command | Chapter-entry CTA | Instrument command | Stamped graphic command | Organic node action |
| Content card | Monumental bay | Celestial object / archive record | Film still / album sleeve | Floating module | Poster cutout | Membrane / cell |
| Navigation | Gates and spaces | Orbit / constellation | Chapters / tracks | Spatial selector | Poster strip / issue index | Branching network |
| Dialog | Threshold chamber | Observation chamber | Film intertitle | Cockpit overlay | Comic spread | Membrane chamber |
| Tabs | Architectural wings | Coordinate layers | Story arcs | System modes | Graphic issue markers | Ecosystem branches |
| Progress | Journey stage | Quest constellation | Chapter sequence | Actual telemetry | Editorial sequence | Growth path |
| Data table | Inscribed information plane | Observation ledger | Event chronology | Telemetry grid | Printed data sheet | Text-first network alternative |
| Loading | Light reveal | Chart / orbit focus | Film dissolve | Actual calibration / scan | Print reveal | Connection / growth |
| Empty state | Open chamber | Undiscovered region | Quiet film frame | Idle instrument | Graphic starting point | Dormant ecosystem |

## Implementation status

This document is a design specification, so each row states whether the code exists.

| Matrix row | Implementing API in `@moonwitness/ui` | Status |
|---|---|---|
| Entry / hero composition | `PageHero` (`mediaLayout="side"` or `"backdrop"`, `as`) | implemented |
| Original world artwork | `WorldArtwork` (scalable 1600 × 900 vector scenes for all six DNA IDs) | implemented |
| Route-specific DNA | `SkinScope` (token scope only; shares the app motion provider) | implemented |
| Kicker / world label | `Kicker` | implemented |
| Section heading | `SectionHeading` (`title`, `description`, `trailing`) | implemented |
| Route measure and header | `RouteShell` (`as="main"` carries the skip target; `LANDMARK_PURITY` lint keeps `id="main-content"` owned by the design system) | implemented |
| Primary and secondary action | `Button`, `LinkButton`, `Link` with variants | implemented |
| Icon glyph | `Icon` (`@moonwitness/ui` glyph registry; `ICON_PURITY` lint blocks third-party icon libraries outside the design system) | implemented |
| Navigation | `EcosystemNavbar` plus `SkipLink` | implemented |
| Content card | `Card` family | implemented |
| Destination card | `DestinationCard`, `DestinationGrid` (static mode when a route is not open) | implemented |
| Dialog or overlay | `Dialog` on native `<dialog>` | implemented |
| Data table | `Table` family | implemented |
| Form validation | `Form`, `FormField`, `Input`, `Textarea`, `Select` | implemented |
| Status message | `StatusMessage` (info, success, warning, danger) | implemented |
| Loading, empty, error, offline, permission | `StatePanel` plus `error.tsx` / `loading.tsx` / `not-found.tsx` per app | implemented |
| Tabs | none | specification |
| Progress | none | specification |
| World recipes per block | `[data-moonframe-skin='...']` variants in `skins.css` | implemented |
| Six-world parity showcase | `SkinLaboratory` at headquarter `/skin-lab` | implemented |

The showcase carries all nine required comparisons: hero, primary and secondary action,
navigation, content card and data section, form validation, dialog, the four states,
narrow-screen adaptation, and keyboard plus reduced-motion behaviour.

## Functional invariants

Regardless of appearance, every component must preserve:

- the same semantic action and result;
- stable accessible name, role, and state;
- keyboard interaction and visible focus;
- predictable disabled, loading, success, and error behavior;
- validation and error announcement for forms;
- responsive layout and usable touch targets;
- reduced-motion behavior;
- content that remains available without decorative media.

## Anti-duplication rule

Do not create six copies of business logic. Prefer a component API with a skin recipe or composition adapter. Where the world genuinely requires a different composition, implement a world-specific layout on top of shared semantic primitives.

## Showcase requirement

The Skin Laboratory must present the same content and user task in all six worlds. The comparison must include:

1. entry / hero composition;
2. primary and secondary action;
3. navigation;
4. content card and data section;
5. form validation;
6. dialog or overlay;
7. loading, empty, error, and success states;
8. narrow-screen adaptation;
9. keyboard and reduced-motion behavior.

A visual comparison is valid only when the task, content, and states are equivalent across all six variants.
