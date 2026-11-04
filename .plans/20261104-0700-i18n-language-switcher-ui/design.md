---
status: "proposed"
---
# i18n Language Switcher UI Component – Design

## Component Architecture
```mermaid
flowchart TD
    LS[LanguageSwitcher Component] -->|uses| UI[@moonwitness/ui Primitives]
    LS -->|updates| Ctx[I18nContext Provider]
    Ctx -->|notifies| App[All Consumer Components]
    App -->|re‑render| RTL[RTLProvider]
    UI -->|dispatches| LS
```

## Data Flow
1. **Initial Load** – `I18nContext` reads `localStorage` key `selectedLang` (default `en`).
2. **User Interaction** – `LanguageSwitcher` opens a dropdown (Button → Menu). Selecting a language calls `setLanguage(lang)`.
3. **State Update** – `setLanguage` updates context state, writes to `localStorage`, and triggers SDK cache refresh (`sdk.i18n.refresh(lang)`).
4. **RTL Trigger** – If the chosen language is in the RTL list (`['ar', 'he', 'fa']`), `RTLProvider` toggles CSS `direction: rtl` and updates theme tokens.
5. **Re‑render** – All components consuming `useTranslation()` hook re‑evaluate and render the new strings.

## Accessibility Considerations
- Keyboard‑navigable menu with `Enter`/`Space` to open and arrow keys to navigate.
- `aria-label="Language selector"` on the button.
- Focus trap within the menu while open.
- High‑contrast color tokens from `@moonwitness/ui`.

## Styling & Theming
- Uses `tokens.colors.primary` for button background.
- Supports dark/light mode via theme context.
- RTL layout adjustments handled by `RTLProvider` (mirrored paddings, margin swaps).

## Test Strategy
- **Unit** – Verify `setLanguage` updates context and `localStorage`.
- **Integration** – Render component inside a mock app, simulate selection, assert DOM direction changes.
- **Storybook** – Interactive story with language options and live RTL preview.

