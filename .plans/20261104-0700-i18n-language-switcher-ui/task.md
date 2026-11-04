---
status: "proposed"
---
# i18n Language Switcher UI Component Plan – Tasks

- [ ] **Design API** – Define TypeScript interface for language switcher props and context provider. (2h)
- [ ] **Create UI Component** – Implement `<LanguageSwitcher />` using `@moonwitness/ui` primitives (Button, Menu). (4h)
- [ ] **Persist Selection** – Hook into `localStorage` and SDK cache to remember chosen language. (2h)
- [ ] **RTL Integration** – Detect RTL languages and toggle CSS direction via `RTLProvider`. (2h)
- [ ] **Accessibility** – Add ARIA labels, keyboard navigation, focus management. (2h)
- [ ] **Unit Tests** – Jest tests for state changes and persistence. (2h)
- [ ] **Integration Tests** – React Testing Library tests across apps (`dock`, `headquarter`, `id`). (3h)
- [ ] **Storybook Story** – Add interactive story with language options. (1h)
- [ ] **Documentation** – Update `packages/sdk/README.md` and generate usage example. (1h)
- [ ] **Release** – Bump SDK version, publish to npm scope `@allah/sdk`. (1h)

**Total Estimated Effort:** ~20 hours.

