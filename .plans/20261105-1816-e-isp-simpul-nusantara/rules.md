# Implementation rules

- Keep all behavior and semantic controls in `@moonwitness/ui`; E-ISP may only compose its existing routes and components.
- Use only the shared skin token API and skin-scoped design-system hooks. Do not add app-local color, type, or theme variables.
- Do not imply real locations, coverage, performance, or customer data in artwork or copy.
- Preserve keyboard access, visible focus, WCAG contrast, reduced-motion behavior, and mobile reflow.
- Serve artwork only from E-ISP, the sole app assigned to this skin.
- Keep the intentional `imperium-lumen` duplicate exception; remove the `rocksoul` exception once E-ISP changes skins.
- Preserve unrelated dirty worktree changes and stage only files belonging to this task.
