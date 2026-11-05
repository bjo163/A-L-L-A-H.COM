---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PACKAGE-UI-CORE-DESIGN"
version: "1.0.0"
owner: "product-design"
status: "in_progress"
---

# @moonwitness/ui — Core Delivery Design

## Package layers

| Layer | Responsibility | Source |
|---|---|---|
| Tokens and skins | Semantic visual values and six world grammars | `src/tokens/`, `src/skins/`, `src/theme.css`, `src/skins.css` |
| Raw layout | Neutral semantic structure | `src/raw/` |
| Primitives | Shared interaction mechanics and providers | `src/primitives/` |
| Components | Reusable controls and visual atoms | `src/components/` |
| Blocks | Reusable task compositions receiving props | `src/blocks/` |
| Sound and assets | Shared sensory runtime and provenance-backed media | `src/sfx/`, package-owned asset paths |

Import direction flows from higher-level compositions toward lower-level shared primitives. App routes consume the public package API and supply their own data and callbacks.

## Runtime and public contract

- Preserve the current React 19, TypeScript/TSX, and ESM package contract.
- Keep the root and documented subpath exports in `package.json` aligned with source barrels and actual consumers.
- Use public `data-slot` attributes as app CSS hooks; private `mw-*` classes remain owned by package styles.
- Let `SkinRoot` establish the application world and `SkinScope` handle route-specific world experiences without a second app root.

## Visual and interaction behavior

- The same semantic component keeps its behavior and accessibility across all six DNA; skins change its world-specific composition and material.
- Prefer native controls inside the design system. Add a non-native primitive only when a documented behavior cannot be met natively.
- Every interactive state remains perceivable without color alone and works with keyboard, zoom, narrow viewports, and reduced motion.
- Asset previews, generation tools, and visual certification remain distinct states; generated or proposed art is never represented as verified production artwork.

## Verification surfaces

Use the scripts actually declared in the root package: `pnpm ui:test`, `pnpm ui:contrast`, `pnpm lint:arch`, `pnpm lint`, `pnpm typecheck`, `pnpm docs:check`, and existing consumer build scripts. Browser review is required for runtime visual certification.
