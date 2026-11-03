---
title: "i18n CI Validation Pipeline - Rules"
---
# Rules: i18n CI Validation Pipeline

## Invariants
- CI pipeline must run on every PR and push to main
- Translation catalog validation must be deterministic
- Critical violations must block merge (fail-fast)
- Validation results must be visible in PR checks

## Security Constraints
- CI secrets must not be exposed in logs
- Validation results must not leak sensitive data
- GitHub Actions must use least-privilege permissions
- Validation scripts must be immutable in main branch

## Boundary Rules
- Validation applies to all `@moonwitness/types` and `packages/sdk` i18n catalogs
- CI pipeline runs only in designated workflows
- No direct production deployment from validation pipeline
- Report retention limited to 30 days for compliance