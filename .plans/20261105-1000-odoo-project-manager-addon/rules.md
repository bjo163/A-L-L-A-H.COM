---
title: "Rules: Odoo-Style Project Manager Addon"
plan: "20261105-1000-odoo-project-manager-addon"
---

# Invariants and Boundary Rules

- **Multi-Tenant Isolation**: Every `project.project`, `project.task`, `project.task.stage`, and `ir.cron` row must possess a valid `company_id`. No cross-tenant data leakage is permitted.
- **Parameterized SQL**: All DB mutations use `@allah/arsy-orm` BaseRepository methods or numbered query parameters `$1, $2, ...`.
- **Legal Hold Fail-Closed**: Any task with `legal_hold = true` cannot be updated in state or deleted.
- **Default-Deny Auth**: All `/v1/projects*` endpoints require a verified tenant session bearer token.
