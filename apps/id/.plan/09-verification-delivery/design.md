# Design — Verification, Documentation and Delivery

## Direction
The report is an engineering artifact, not marketing copy. Use exact source references, test names, commands, and observed outcomes. VERIFIED requires repeatable evidence. Production hostname behavior and cross-domain SSO stay NOT VERIFIED unless actually tested in the real environment.

## Shared visual constraints
Use `@moonwitness/ui` and the existing `lunar-chronicles` skin. No parallel tokens/primitives. Every visual element must improve orientation or task completion. Avoid generic SaaS templates, repeated cards, random gradients, stock galaxy imagery, fake data, and purposeless animation.

## Interaction constraints
Show pending states; prevent duplicate actions; report success only after the authoritative service confirms; preserve context on failure; provide safe retry. No secret/token/session identifier in URLs.

## Accessibility and responsive
Test 320, 375, 768, 1024, and wide desktop. Semantic landmarks/headings, visible focus, keyboard operation, associated errors, WCAG AA contrast, reduced-motion support, and mobile linear reading order are mandatory.

## Anti-slop review
- Is the composition distinct and information-led?
- Is the primary action immediately obvious?
- Are all statuses backed by actual data?
- Does the experience remain legible when empty or failing?
- Can decoration be removed without losing meaning?
