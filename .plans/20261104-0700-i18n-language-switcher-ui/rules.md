---
title: "i18n Language Switcher UI - Rules"
---
# Rules: i18n Language Switcher UI

## Invariants
- Language switcher must persist user preference in session
- Available languages must be filtered by tenant configuration
- Language detection must respect browser headers with override capability
- Language switcher must be accessible (WCAG 2.1 compliant)

## Security Constraints
- Language parameter must be validated against allowed list
- No open redirects via language parameter
- CSRF protection on language change endpoints
- Input sanitization for language codes

## Boundary Rules
- Language switcher components only import from @moonwitness/ui
- Language detection logic centralized in SDK
- No direct API calls from language switcher - use SDK wrappers
- Lazy loading of language assets for performance