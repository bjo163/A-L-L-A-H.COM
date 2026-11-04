---
title: "Shared UI Audit Invariants"
status: "proposed"
timestamp: "2026-11-04T15:41:09+07:00"
---

# RULES: Shared UI Audit Remediation

## Architecture

- `@moonwitness/ui` is the only app-level source for UI controls and primitive behavior.
- Do not add raw interactive/structural controls or hand-written internal `mw-*` primitive classes to any of the five React apps.
- The UI purity gate must enforce that rule across app JSX and CSS; it must not treat a successful raw-tag-only check as proof of full compliance.
- Use public component props/variants or app-owned class names for product styling. Do not select or construct private `.mw-*` classes outside `packages/ui`.
- Keep primitive definitions, shared blocks, tokens, and their skin styles owned by `packages/ui`.
- Do not import primitive libraries or internal implementation helpers directly into apps.
- Keep app-to-package dependencies one-way; the shared package must not depend on apps.

## Accessibility and interaction

- Use native semantics where supported; no hand-built modal/focus-trap replacement for the shared native `Dialog`.
- Every form control has an associated visible label and every hint/error reference resolves to rendered text.
- Never announce a new tab unless the link opens one; any new-tab behavior includes safe `rel` handling.
- Composed children retain expected handlers, refs, keyboard behavior, and disabled semantics.
- Keyboard operation, visible focus, reduced-motion support, responsive reflow, and non-color state cues are release criteria.
- Verify contrast from actual rendered token pairings. A passing registry-token unit test is not a substitute for checking text and interactive boundaries in browser-rendered states.

## Theme and CSS

- Preserve the six skin identities and shared behavior.
- Do not delete the `shadcn` runtime stylesheet dependency or a CSS snapshot until its actual import resolution and consumers are verified.
- Do not introduce a second canonical token source. Document aliases and compatibility layers.
- Avoid unrelated app CSS rewrites.

## Verification and evidence

- Use the smallest focused UI tests first, then the documented workspace checks and all five app builds.
- Browser/axe, keyboard, zoom, and responsive claims must be backed by observed evidence and recorded as manual or automated.
- Do not claim completion until all acceptance criteria in `spec.md` pass.
- Do not commit or push this plan as part of implementation unless separately requested.
