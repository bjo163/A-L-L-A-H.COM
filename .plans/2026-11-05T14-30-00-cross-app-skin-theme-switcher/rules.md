---
contract: "DOCUMENTATION_CONTRACT.md"
id: "CROSS_APP_SKIN_THEME_SWITCHER_RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# Rules — Cross-Application Skin Theme Switcher

- Reuse the canonical six-skin registry; never accept arbitrary skin strings.
- Preserve each app's assigned `SkinRoot`; use an existing route-scoping primitive for overrides.
- Keep storage access client-only and handle disabled, cleared or malformed localStorage safely.
- Server and first-client output must agree to prevent hydration errors.
- Use only public `@moonwitness/ui` exports for shared controls; apps must not render raw native controls.
- Expose labels, selected state, keyboard operation, focus visibility and reduced-motion behavior.
- Source all colors from skin tokens; do not add palette hues or app-local theme variables.
- Do not mark implementation tasks complete until the listed quality gates and affected builds pass and evidence is recorded.
