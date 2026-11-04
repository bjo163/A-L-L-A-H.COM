---
status: "proposed"
---
# Invariants & Security Rules: i18n Multi-Tenant Translation Isolation & Enterprise Overrides

## 1. Architectural & Tenant Invariants
- **No Cross-Tenant Read/Write**: Under no circumstance shall any request execute SQL on `ir_translation` that returns rows belonging to a different non-zero `company_id`.
- **Global Immutability from Tenant Context**: Tenant operations cannot update or delete records where `company_id = 0`. Modifications to global system terms are restricted to platform super-administrators and system migration scripts.
- **Cache Isolation**: All caching keys MUST be prefixed with `company_id` to strictly prevent cache poisoning across tenants (`i18n:t:<company_id>:<lang>:<term>`).

## 2. Security & Anti-Tamper Constraints
- **Session Claim Source of Truth**: `company_id` MUST be sourced directly from the verified cryptographic JWT / session store, never from client-provided query strings or body parameters.
- **SQL Injection Prevention**: All queries to PGlite MUST use parameterized bindings. Raw string interpolations are prohibited.
- **Audit Logging**: Any write, update, or deletion of tenant translation overrides MUST emit an audit event to the system log with `actor_id`, `company_id`, `term_key`, `previous_value`, and `new_value`.

## 3. Quality & Contract Gates
- `pnpm docs:check` must pass at 100/100 score.
- `pnpm lint:arch` must succeed without architectural boundary violations.
- `pnpm typecheck` must pass in strict mode.

