---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER_DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# Design — Cross-Application Skin Theme Switcher

## Boundary

The UI package owns the reusable selector and preference mechanics. Each application supplies its existing default skin and stable app key. The selector changes a route scope only; the app's canonical `SkinRoot` and motion-provider ownership remain intact.

## Data contract

- Skin values are restricted to the six IDs exported by the canonical skin registry.
- Preferences are stored per app under `mw_skin_preference:<app-id>`; invalid or unavailable values fall back to the app's declared default.
- Storage access occurs after hydration in a client boundary. The server and first client render use the same declared default to avoid markup mismatch.
- The user interface labels each option with the human-readable skin name and exposes selected state to assistive technology.

## Interaction

The selector uses the design system's public form controls, visible focus treatment and keyboard behavior. Selecting a skin updates the current route scope and persists the validated ID. Reduced-motion preferences are honored by the shared motion system.

## Integration and verification

Applications compose the exported selector without native-control duplication or private CSS hooks. Verify storage fallback, keyboard interaction, accessible labels, all six skin states, consumer builds, architecture purity, contrast and SSR behavior before release.

## Open decisions

The requirement says the selector is persistent but also excludes dynamic switching during an active session. Resolve whether selection applies immediately or on next navigation before implementation; maintain the app's canonical default mapping either way.
