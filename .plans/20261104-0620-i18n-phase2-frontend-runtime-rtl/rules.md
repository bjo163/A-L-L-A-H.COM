---
title: "i18n Localization Phase 2: Rules & Invariants"
status: "proposed"
timestamp: "2026-11-04T05:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 34
parent_issue: 33
---

# RULES: i18n Localization Phase 2 — Frontend Runtime, RTL Layout & Locale Switcher

## 1. Architectural Invariants
- **Atomic UI Standard**: All visual elements for language selection, dropdowns, and text containers MUST import components from `@moonwitness/ui`. Ad-hoc HTML `<select>` tags are forbidden and blocked by `@moonwitness/lint`.
- **SDK Exclusive Routing**: Translation fetching, user preference syncing, and dictionary loading MUST route through `@allah/sdk/i18n`. Direct `fetch()` calls to internal endpoints are prohibited.
- **Fail-Safe Rendering**: Missing translation keys MUST never throw unhandled runtime errors or crash components; they must render the provided fallback string or the key itself.

## 2. Accessibility & Performance
- Zero Cumulative Layout Shift (CLS $< 0.05$) when language resources hydrate.
- Keyboard navigation (Arrow Up/Down, Enter, Esc) MUST function completely on `<LanguageSwitcher />`.
- When switching to an RTL language, the `dir="rtl"` attribute MUST be attached to the root document to guarantee screen-reader compatibility.

## 3. Storage & Bandwidth Constraints
- Cached terms in `localStorage` must include dictionary versioning to auto-invalidate stale entries upon server release.
- Memory consumption of the in-memory dictionary must not exceed $5\text{MB}$ per tab.

