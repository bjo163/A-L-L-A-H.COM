# Design — Arrival — Observatory Threshold

## Experience direction
Composition: a wide, quiet observatory threshold. One lunar instrument landmark anchors the visual field; text and action occupy a stable readable zone. The first viewport answers where the user is, what this identity service does, and what to do next. Guest entry is primary; account continuation is primary only after the service confirms a current identity. Avoid multi-card feature grids.

## Shared design constraints
- Master DNA: LUNAR CHRONICLES; use shared skin engine and tokens.
- Shared components and semantic HTML are preferred over custom primitives.
- Every visual element must improve orientation, hierarchy, comprehension, or task completion.
- No generic centered-card template repeated across all routes.
- No equal-card dashboard grids, arbitrary gradients, glassmorphism by default, stock galaxy wallpaper, random starfield, fake coordinates, fake measurements, or decorative status claims.
- Forms and security actions remain immediately understandable and usable.
- Motion is purposeful, short, non-blocking, and reduced-motion aware.

## Interaction contract
- Use real service state, never optimistic assumptions for security-sensitive actions.
- Show pending state and prevent duplicate submission.
- Confirm success only after authoritative service success.
- On failure, preserve the user's context and provide a safe retry or next step.
- Keep focus visible and predictable after validation, dialogs, and navigation.
- Provide a linear reading order on mobile even when desktop composition is spatial.

## Responsive composition
- 320–374px: no horizontal page overflow; single-column reading; no essential spatial navigation.
- 375–767px: compact but breathable composition; actions remain thumb-accessible.
- 768–1023px: balanced two-region composition only when content benefits.
- 1024px and wider: use negative space and deliberate asymmetry; do not stretch forms.
- Test at 320, 375, 768, 1024, and wide desktop.

## Accessibility
- Semantic landmarks and ordered headings.
- Every field has a programmatic label and associated hint/error.
- Keyboard-only operation and visible focus.
- State never communicated by color alone.
- Contrast meets WCAG AA for text and controls.
- Respect `prefers-reduced-motion`; static experience retains all meaning.

## Review questions
1. Is the page recognizably MoonWitness ID without its logo?
2. Does the composition express a real information relationship?
3. Can a first-time visitor identify the primary action immediately?
4. Does the design remain calm and legible with real error/empty/loading data?
5. Is every visual flourish removable without losing task meaning?
