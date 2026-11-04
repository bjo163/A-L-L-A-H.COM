---
title: "i18n Localization Phase 2: Design Specification"
status: "proposed"
timestamp: "2026-11-04T05:10:00+07:00"
author: "Antigravity Assistant"
target_branch: "dev"
target_repo: "https://github.com/bjo163/A-L-L-A-H.COM.git"
issue: 34
parent_issue: 33
---

# DESIGN: i18n Localization Phase 2 — Frontend Runtime, RTL Layout & Locale Switcher

## 1. UI Hierarchy & Language Switcher Placement
The language switcher integrates cleanly into the atomic navigation header (`Navbar`) across all client applications.

```mermaid
flowchart LR
    subgraph Navbar["Atomic Navbar (@moonwitness/ui)"]
        Logo["A-L-L-A-H Brand Logo"]
        NavLinks["Navigation Links (Translated)"]
        ThemeToggle["Theme / DNA Skin Switcher"]
        LangSwitcher["Language Switcher (ID / EN / AR)"]
        UserAvatar["User Profile & Tenant Badge"]

        Logo --- NavLinks --- ThemeToggle --- LangSwitcher --- UserAvatar
    end

    subgraph LangDropdown["Language Selection Menu"]
        OptionID["🇮🇩 Bahasa Indonesia (id_ID)"]
        OptionEN["🇺🇸 English (en_US)"]
        OptionAR["🇸🇦 العربية (ar_SA) [RTL]"]

        LangSwitcher --> LangDropdown
    end
```

## 2. RTL Layout Adaptation Matrix
| UI Element | LTR Mode (`en_US`, `id_ID`) | RTL Mode (`ar_SA`) |
|---|---|---|
| Sidebar Dock | Anchored to Left (`left-0`) | Anchored to Right (`right-0`) |
| Form Input Label | Aligned Left (`text-left`) | Aligned Right (`text-right`) |
| Icon Placement | Icon before label (`mr-2`) | Icon after label (`ml-2`) |
| Breadcrumb Chevron | Pointing Right (`→`) | Pointing Left (`←`) |

## 3. Hook Usage Code Pattern
```tsx
import { useTranslation } from '@allah/sdk/i18n';

export function DashboardHeader() {
  const { t, formatCurrency } = useTranslation();

  return (
    <header className="p-4">
      <h1 className="text-xl font-bold">{t('dashboard.title', 'Dashboard Overview')}</h1>
      <p className="text-sm text-muted">
        {t('dashboard.revenue', { amount: formatCurrency(15000000) })}
      </p>
    </header>
  );
}
```

