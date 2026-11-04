---
title: "Shared UI Audit Target Behavior"
status: "proposed"
timestamp: "2026-11-04T15:41:09+07:00"
---

# DESIGN: Shared UI Audit Target Behavior

## Product direction

Keep one shared behavior/accessibility engine in `@moonwitness/ui` and preserve the six skin identities. Dock, Gate, Headquarter, ID, and Jizz may have different composition and visual styling; they must not fork control semantics, keyboard behavior, or accessible states.

## Target component behavior

### Form controls

- `FormField` owns a stable control ID and the IDs of its visible hint/error nodes.
- A nested `Input`, `Textarea`, or `Select` consumes the field context and references the rendered hint/error nodes through `aria-describedby`.
- The control's visible label names that same control ID. Required and invalid states are machine-readable as well as visually apparent.
- A field description is rendered once. The API does not treat arbitrary hint copy as an element ID.

### Links and buttons

- A link always navigates; an action always activates a button.
- An external link opens a new tab only when that behavior is announced. `rel` protects the opener when a new tab is used.
- Child composition preserves the child element's meaningful event handlers and refs. A disabled action cannot still activate through an anchor or child callback.
- Apps use the public `Link`, `LinkButton`, and `Button` contracts rather than constructing the package's internal variant classes.
- App CSS targets app-owned wrapper classes or public variants, never private `.mw-*` component selectors. Public component `className` props may receive an app-owned class when a product needs a visual adjustment.

### Dialog

- The Skin Laboratory's representative dialog uses the shared native dialog behavior and the same focus/Escape guarantees as production dialogs.
- Opening places focus in the dialog; closing returns focus to the opener. Keyboard users cannot interact with background content while it is modal.
- Existing six-skin geometry and material remain a visual treatment, not a separate interaction implementation.

## Tokens and CSS

- `skins/registry.ts` remains the runtime source for the six per-world skin tokens unless implementation evidence supports another design.
- Any public static tokens entry must have a documented scope and not look like the active universal palette when it is not.
- Retain Tailwind/Shadcn compatibility only where a consuming app demonstrably needs it. `@moonwitness/ui` owns Moon UI component styles and token semantics.
- Preserve app-specific DNA styles. Share only identical foundational tokens/utilities; do not flatten product differences into a generic dashboard theme.
- Any skeleton state used by an app is rendered through a shared `Skeleton` API, not by copying the design system's private skeleton class names.

## App coverage

| App | Shared UI expectation |
|---|---|
| Dock | shared controls/blocks; Imperium Lumen skin |
| Gate | shared controls/blocks; Gate product composition |
| Headquarter | shared controls/blocks; Nexus Paradox skin |
| ID | shared controls/blocks; Lunar Chronicles skin |
| Jizz | shared controls/blocks; Mycelium/Riot identity where defined |

The app map is operational documentation, not a replacement for the architecture gate. All five React apps remain subject to the gate.
