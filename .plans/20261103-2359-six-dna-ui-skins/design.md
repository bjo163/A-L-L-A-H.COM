---
title: "Six DNA UI Skins Design"
status: in_progress
---

# Six DNA UI Skins Design

## Runtime contract

- Export a `SkinId` union and a registry keyed by the six kebab-case DNA IDs.
- Provide a server-compatible `SkinRoot` that emits a stable `data-moonframe-skin` attribute and package-owned root styling.
- Export the skin stylesheet and load it from each in-scope app's existing global stylesheet.
- Use a deterministic Imperium Lumen fallback for a missing ID. Report invalid runtime IDs and use the same fallback.
- Do not inspect `window`, local storage, cookies, or user preferences during rendering.

## Skin expression

The shared UI keeps one semantic component contract. Token roles control color, typography, spacing, shape, surface, depth, and motion; shared recipes adapt to those roles and add world-specific visual cues. Layout cues and surface treatments should be distinct, not six palette recolors. Decorative effects remain subordinate to essential content.

## App assignment

| Consumer | Skin |
|---|---|
| `apps/dock` | `imperium-lumen` |
| `apps/headquarter` | `nexus-paradox` |
| `apps/id` | `lunar-chronicles` |
| `apps/jizz` | `mycelium` |

`apps/web` is not wired because it does not consume `@moonwitness/ui`. `rocksoul` and `riot-anarchy` are provided by the package for future consumers.

## Interaction and responsive states

- Preserve existing button, input, card, badge, avatar, navbar, and session-card semantics and behavior.
- Keep hover, active, disabled, error, and focus states perceptible. Focus must remain visible against each skin's surfaces.
- Retain native keyboard behavior and use reduced-motion-safe transitions. Do not add ambient animation to controls that do not need it.
- Allow layouts and text to reflow at narrow widths and 200% zoom. Do not make essential information depend on decorative assets.

## Composition boundary

App roots select a skin, and package components consume it. App-specific pages remain app-owned and are not redesigned in this change. The Skin Laboratory and its equivalent-content comparisons remain a later step.
