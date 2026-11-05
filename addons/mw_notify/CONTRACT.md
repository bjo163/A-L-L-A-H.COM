---
contract: unit
id: ADDON_MW_NOTIFY
tier: addon
name: mw_notify
owner: infrastructure
version: 0.1.0
status: released
last_verified: 2026-11-05
summary: Outbound notification channels, templates, and event log foundation
depends: [base, project]
models: [notify.channel, notify.template, notify.event]
data: [data/index.ts]
installable: true
---

# mw_notify — Unit Contract

Outbound notification infrastructure: delivery channels (email/sms/webhook),
localizable templates, and the append-only notification event log. The dispatch
service uses the shared resolver-aware SSRF guard, rejects redirects, and retries
failed deliveries through the cron runner's backoff while reserving batch capacity
for older failures.

## Default data

`data/index.ts` (`loadDefaultData`) seeds the platform notification-template
catalog (`invoice.paid`, `invoice.overdue`, `radius.auth_failure`,
`gateway.spend_threshold`) as company_id 0 reference rows, idempotent on `code`.
The producers wired across `works` / `sentinel` / `mw_llm_router` reference these
codes, and `notify_dispatch` renders them. This loader is manifest-declared and
verified by `lint:arch` (ADDON_DEFAULT_DATA).

## Models

- `notify.channel` — one concrete outbound delivery target per company.
- `notify.template` — subject/body pair a producer references by `code`;
  subject and body are translatable via `ir.translation`.
- `notify.event` — append-only notification log drained by the dispatch cron.

## Security

- `auth_token_encrypted` never enters the sync ledger or any response.
- `base_url` is validated before the request and its resolved addresses are
  checked when the socket is opened.
- Delivery is disabled unless `ARSY_NOTIFY_DELIVERY=live`.
- Tenant isolation (`company_id`) enforced on all queries.