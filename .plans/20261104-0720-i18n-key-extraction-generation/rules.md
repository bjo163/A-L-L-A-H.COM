---
title: "i18n Key Extraction & Generation - Rules"
---
# Rules: i18n Key Extraction & Generation

## Invariants
- All translation keys must follow consistent naming conventions
- Key extraction must not modify source code
- Generated keys must be globally unique
- Usage analysis must be read-only

## Security Constraints
- No PII in translation keys
- Key generation must not expose internal identifiers
- CLI commands must be authenticated in CI/CD

## Boundary Rules
- Key extraction only scans `.ts`, `.tsx`, `.js`, `.jsx`, `.json` files
- Key generation restricted to i18n catalog directories
- CLI tools only available in development/CI environments
- Extracted keys must be reviewed before committing to catalogs