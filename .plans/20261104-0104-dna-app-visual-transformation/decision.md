---
title: "ADR: Per-App DNA Compositions and Opt-In Sound"
status: accepted
---

# ADR: Per-App DNA Compositions and Opt-In Sound

## Context

The shared skin tokens alone do not make current routes visually distinct. Four products have different approved DNA specifications, navigation needs, and interaction patterns. Existing button sounds also play through a shared procedural engine without an explicit user preference.

## Decision

Keep a shared set of accessible atomic UI and a shared sound engine, but redesign route composition and navigation in each app according to its assigned DNA. Store original app-specific vector artwork alongside the owning app, with high-resolution raster derivatives only where useful. Make the sound engine default-off and expose an explicit per-device opt-in control in each app shell.

Preserve real API, SDK, authentication, and route behavior. Replace fake data and dead actions with sourced results, honest states, or removal.

## Alternatives considered

- Changing only CSS tokens was rejected because it leaves the generic page structure that prompted the request.
- Copying one new shell into all four apps was rejected because the DNA specifications require distinct spatial and navigation grammars.
- Adding independent button/audio implementations per app was rejected because it forks accessibility and sound behavior.
- Making SFX play by default was rejected because sound must remain user-controlled.

## Consequences

- All 12 current routes and four app shells require review and visual refactoring.
- Shared package changes must remain semantic and scoped; app-specific composition stays owned by each app.
- No backend work is included. Pages without a data source may display honest empty/unavailable states until one exists.
- Visual work requires real browser checks at multiple widths; builds alone do not establish visual completion.
