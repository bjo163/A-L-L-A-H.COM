---
status: "proposed"
---
# Actionable Tasks: i18n In-Context Visual Translation Editor & Live DOM Overlay

## 1. SDK Core & DOM Binding Engine
- [ ] Add `inContextEditMode` state flag to `I18nProvider` in `packages/sdk/src/i18n`.
- [ ] Extend `t(key, options)` to return metadata-wrapped nodes or inject `data-i18n-key` when editor mode is enabled.
- [ ] Implement event listeners for keyboard shortcut toggle (`Ctrl+Alt+T`) gated by user session permissions.

## 2. In-Context UI Overlay Component
- [ ] Create `InContextEditorOverlay` in `packages/ui` using atomic UI components (`Popover`, `Badge`, `Button`, `Input`).
- [ ] Implement highlight boundaries around hovered i18n DOM nodes with color-coded outline based on translation status.
- [ ] Build floating inspector popover with:
  - Original source string (e.g. English base).
  - Editable target text field.
  - Variable placeholder chips (e.g., `{userName}`) with insertion click handlers.
  - "Translate with AI" trigger button connecting to Phase 3 gateway.

## 3. Persistence & Live Mutation
- [ ] Implement optimistic UI update: immediately apply text change across all matching keys in the DOM tree.
- [ ] Implement Fastify client save mutation calling `POST /v1/i18n/tenant/overrides` with rollback on network failure.
- [ ] Add toast notification upon successful save or error.

## 4. Verification & Testing
- [ ] Write Jest / Playwright tests for editor toggle, popover interaction, and DOM attribute safety.
- [ ] Verify that disabling editor mode completely strips overlay DOM elements and listeners with zero production performance penalty.
- [ ] Run `pnpm docs:check`, `pnpm lint:arch`, and `pnpm typecheck`.

