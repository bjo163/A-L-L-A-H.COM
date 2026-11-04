# Artwork and UI Rules

- Use the approved `DNA/01` through `DNA/06` world contracts as the design source.
- Keep shared UI ownership in `packages/ui`; consuming apps use exported blocks and tokens.
- Keep asset content original or document its license and source.
- Keep SVGs resolution-independent and static PNG previews aligned to the shared source.
- Keep decorative SVGs `aria-hidden`; never place essential copy, values, controls, or status only in artwork.
- Honor `prefers-reduced-motion`, the app pause control, keyboard navigation, focus visibility, WCAG contrast, and 44px touch targets.
- Do not add a runtime image service, new rendering engine, generated data, fake telemetry, or new dependency.
- Keep mobile text and actions clear over every crop. Test the actual 320px and 390px layouts.
- Avoid CSS selectors tied to private app/component classes.
- Do not touch unrelated worktree changes or overwrite pre-existing edits.
