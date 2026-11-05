---
contract: unit
id: PKG_UI
tier: package
name: @moonwitness/ui
owner: product-design
version: 1.0.0
status: released
last_verified: 2026-02-10
summary: Design-system component library primitives blocks and skin root
publicSurface: [SkinRoot]
depends: [@moonwitness/types]
---

# @moonwitness/ui — Unit Contract

The design-system library: primitives, blocks, tokens, and the `SkinRoot`
provider that every front-end app's layout wraps its tree in to select a skin.

## Public surface

`SkinRoot` (`src/skins/root.tsx`, re-exported via `src/skins`). The barrel also
re-exports `components`, `blocks`, `primitives`, `raw`, `sfx`, `skins`, `tokens`,
and utility helpers.

## Depends

`@moonwitness/types`; external: `class-variance-authority`, `clsx`,
`lucide-react`, `tailwind-merge`.
