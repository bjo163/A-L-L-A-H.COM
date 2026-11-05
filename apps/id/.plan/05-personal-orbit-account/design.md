# Design — Personal Orbit — Account Identity Space

## Composition
An anchor-and-orbit composition: identity is the anchor, session relationship is second, destinations are outer navigation. Avoid three equal cards or dashboard grids. Mobile becomes a clear linear reading sequence.

## Shared constraints
- Use `@moonwitness/ui` and shared `lunar-chronicles` skin; no local token system or primitive fork.
- Every visual element must improve orientation, comprehension, hierarchy, or task completion.
- No generic SaaS card template, random gradient, stock galaxy, fake astronomy, fake status, or proprietary game UI imitation.
- Forms/actions remain more legible than artwork.

## Interaction
- Explicit idle/pending/success/failure/unavailable states as applicable.
- Prevent duplicate submissions/actions.
- Security-sensitive success only after ARSY confirms.
- Preserve user context on failure; safe retry only.

## Responsive and accessible
Test 320, 375, 768, 1024, and wide desktop. No horizontal overflow. Semantic headings/landmarks, visible focus, keyboard-only operation, associated labels/errors, WCAG AA contrast, reduced-motion fallback, and linear mobile reading order.

## Anti-slop review
1. Is the composition distinct and recognizable without relying on a logo?
2. Does every visual relationship map to real information?
3. Is the primary task obvious within seconds?
4. Does real error/empty/loading content remain legible?
5. Can decoration be removed without losing meaning?
