# Design — Destination Orbit — Safe Ecosystem Handoff

## Direction
A navigable atlas index, not equal product tiles. Group by actual user intent (discovery, operations, research, communication) only when supported. Never show fake online badges or status without a trusted status API.

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
