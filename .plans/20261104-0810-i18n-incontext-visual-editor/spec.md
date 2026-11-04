---
status: "proposed"
---
# Plan Specification: i18n In-Context Visual Translation Editor & Live DOM Overlay

## 1. Overview & Vision
This plan establishes a live "in-context" translation editing environment directly on top of client web applications (`dock`, `headquarter`, `id`). Inspired by Odoo's web translation studio and Crowdin in-context editor, authorized translators, localization managers, and tenant admins can browse the live web application with a visual translation overlay. Hovering over any text element reveals its translation key, status, and allows direct inline editing, instantly persisting the revision back to `ir.translation` in the backend Hub without leaving the page.

## 2. Goals & Objectives
- **Zero-Context-Switch Localization**: Translators edit text in-place seeing exact typographical flow, wrapping, and layout context.
- **Dynamic DOM Text Binding**: The SDK i18n client tags rendered DOM nodes with data attributes (`data-i18n-key`, `data-i18n-source`, `data-i18n-company`) when `inContextEditMode = true`.
- **Visual Overlay Studio Component**: Built entirely with `@moonwitness/ui` primitives (drawer, modal, badge, tooltip, popover).
- **Instant Live Preview**: Local memory state mutates instantly upon typing; saving commits changes to Fastify Hub `POST /v1/i18n/tenant/overrides` or `PUT /v1/i18n/terms/:id`.
- **Role-Gated Activation**: Enabled only for authenticated users with `i18n:edit` permissions via a secure toggle in the command center or developer shortcut (`Ctrl+Alt+T`).

## 3. Scope & Acceptance Criteria
- [ ] Implement `InContextTranslationProvider` in `packages/sdk/src/i18n`.
- [ ] DOM annotation hook in `useTranslation` that wraps translatable strings in identifiable spans/attributes when edit mode is active.
- [ ] Visual overlay component in `packages/ui` featuring:
  - Status badges: Translated (Green), Pending (Yellow), Missing/Untranslated (Red), AI-generated (Purple).
  - Floating editor popover with original source text, input textarea, placeholder variables preview, and AI suggestions button.
- [ ] Real-time commit to Fastify Hub with optimistic updates.
- [ ] Pass all quality gates: `pnpm docs:check` (100/100), `pnpm lint:arch`, `pnpm typecheck`.

