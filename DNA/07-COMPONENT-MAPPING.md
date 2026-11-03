---
title: "Six DNA Component Mapping"
version: "1.0.0"
status: "approved"
last_verified: "2026-11-03"
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
