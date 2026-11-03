---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY"
version: "1.0.0"
owner: "product-design"
status: "in_progress"
last_verified: "2026-11-03"
---
# WORLD OBSERVATORY — Design Composition

## Visual direction

A premium, cinematic, source-grounded global observatory. Distinct from Dock, Headquarter and ID. Monumental composition, controlled illumination, atmospheric depth, celestial geometry. No generic SaaS dashboard, fake HUD, fake counters, or untraceable metrics.

## Core screens

- **Home**: identity band; source-backed world pulse; meaningful phenomenon field; latest evidence-backed signals; coverage/freshness strip.
- **Catalogue**: supported search/filters, count and active-filter state, editorial list or dense table.
- **Phenomenon detail**: name/ID/status/time coverage, grounded summary, evidence counts, Overview/Perspectives/Signals/Timeline/Sources sections.
- **Comparison**: side-by-side, stacked mobile; never assign a winner.
- **Sources directory**: name/type/publication/retrieval/URL/linked observations.
- **Methodology**: ontology, formulas, uncertainty, coverage, freshness.

## States

Every data component handles: loading, loaded, empty, filtered-empty, partial, stale, unavailable, timeout/error and invalid/unknown ID.

## Accessibility

- Semantic landmarks and heading order
- Keyboard access and visible focus
- Sufficient contrast (WCAG AA)
- Labels and descriptions
- Reduced-motion disables nonessential transitions
- Color never sole encoding

## Design tokens

Reuse Moon UI tokens first. No competing UI library, CSS reset, auth provider, ORM, database or SDK without documented need. Keep app-specific compositions in apps/jizz.