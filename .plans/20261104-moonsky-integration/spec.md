---
contract: "DOCUMENTATION_CONTRACT.md"
id: "moonsky-integration"
version: "1.0.0"
owner: "architecture"
status: "accepted"
last_verified: "2026-11-04"
source_repository: "bjo163/moonsky"
target_repository: "bjo163/A-L-L-A-H.COM"
target_branch: "dev"
---

# MOONSKY Integration Plan
## Independent Communication Service inside the A-L-L-A-H.COM Ecosystem

## 1. Accepted Architecture Decision

MOONSKY is an ecosystem-owned, independently deployable communication platform inside the A-L-L-A-H.COM monorepo.

**MOONSKY is not an ARSY addon and is not a second backend authority.**

- ARSY remains the central backend authority for identity, authorization, tenant membership, business data, business workflows, and ecosystem policy.
- MOONSKY owns communication-domain execution: channel connections, provider sessions, conversations, messages, routing, delivery lifecycle, webhook ingress/egress, and communication operations.
- MOONSKY runs as its own service/API process with its own PostgreSQL persistence and persistent provider-session storage.
- MOONSKY owns its own operator workspace/console.
- HEADQUARTER provides cross-ecosystem operational overview and deep-links into MOONSKY; it does not absorb the full inbox or channel-operator UI.
- DOCK, WORKS, HARBOR, SENTINEL, GATE, and other authorized applications consume communication capabilities through stable contracts.

This decision preserves MOONSKY's operational isolation while bringing it under the final ecosystem's governance, identity, design system, and deployment conventions.

## 2. Repository and Branch Rules

Target repository: `bjo163/A-L-L-A-H.COM`.

Target branch: existing `dev` only.

Historical source repository: `bjo163/moonsky` branch `main`, read-only during this integration.

- Do not create a branch.
- Do not modify, delete, archive, or commit to the historical MOONSKY repository.
- Do not modify `main`.
- Do not force-push.
- Do not deploy production, change DNS, or modify production secrets.
- Inspect current HEAD, git status, workspace structure, and current CI before editing.
- Preserve unrelated local changes.
- Follow root `AGENTS.md`, `AUTONOMOUS.md`, `DOCUMENTATION_CONTRACT.md`, `DECISIONS.md`, `BLUEPRINT.md`, `QUALITY.md`, and `LEGACY_RECONCILIATION.md`.

## 3. Evidence-Based Source Audit

The initial remote source inspection found the following in `bjo163/moonsky`:

- A pnpm monorepo with `apps/moonsky` and shared packages.
- Fastify service with REST routes and WebSocket event delivery.
- PostgreSQL persistence via Drizzle in `packages/store`.
- `packages/whatsapp` containing the Baileys transport adapter.
- `packages/telegram` containing the Telegram adapter.
- `packages/core` containing provider-neutral communication contracts.
- React/Vite operator client under `apps/moonsky/client`.
- Existing tests covering control-plane, operator UI, and transport behavior.
- Standalone operator authentication and machine-client service-key concepts.
- Existing deployment/container configuration.

Historical source reference: https://github.com/bjo163/moonsky/tree/main

These are initial remote-inspection findings, not proof that all tests pass or that the service is production-ready. Before migration, re-fetch and inspect the complete current source, manifests, migrations, tests, Docker configuration, runtime behavior, and security-sensitive code. Record exact commit SHA and evidence in the implementation report.

## 4. Product Boundaries and Ownership

### 4.1 ARSY owns

- Canonical user identity and authentication authority.
- Tenant/company membership and membership lifecycle.
- Roles, permissions, scopes, and authorization policy.
- Ecosystem business records and business workflows.
- Issuing scoped service identities/credentials or another approved workload identity mechanism.
- Publishing business events and authorizing communication intents.
- Cross-product audit context and policy decisions.

### 4.2 MOONSKY owns

- Provider/channel account configuration and connection state.
- WhatsApp and Telegram provider sessions.
- Future channel adapters (official WhatsApp Business Platform, email, SMS, other providers).
- Inbound webhook validation and provider event normalization.
- Outbound webhook delivery, retries, signing, idempotency, and delivery logs.
- Conversation, message, attachment metadata, routing, queue, and delivery lifecycle.
- Operator assignment and communication-specific workflow.
- Communication templates and channel-specific capabilities.
- Communication console, operational logs, and channel health.

### 4.3 Consumers

DOCK, WORKS, HARBOR, SENTINEL, HEADQUARTER, GATE, and other products must not connect directly to Baileys/Telegram internals or MOONSKY's database.

They consume documented MOONSKY API/SDK contracts through authorized server-side integration.

### 4.4 Explicit non-goals

- Do not move all MOONSKY business logic into ARSY.
- Do not make MOONSKY a second identity provider or tenant authority.
- Do not merge MOONSKY PostgreSQL data into ARSY PGlite.
- Do not let consumer apps write directly to MOONSKY tables.
- Do not put the full operator inbox into HEADQUARTER.
- Do not build a second generic notification system in each consumer app.
- Do not replace Baileys with an official provider without a separate migration decision.
- Do not claim Baileys is an official WhatsApp Business API integration.
- Do not silently discard or rewrite existing message/session data.

## 5. Runtime and Deployment Architecture

Target workspace: `apps/moonsky`.

Keep the communication runtime independently executable and deployable within the A-L-L-A-H.COM pnpm workspace.

The target service boundary includes:

- Fastify REST API.
- WebSocket/event stream for operator and authorized consumers.
- Provider connection lifecycle workers.
- WhatsApp adapter (Baileys) and Telegram adapter.
- Webhook ingress and outbound delivery worker.
- Communication persistence and migrations.
- Health/readiness endpoints and operational telemetry.

The MOONSKY process must be independently restartable and must not share the ARSY process lifecycle.

Use its own PostgreSQL database/schema and explicit migrations. Preserve durable provider credentials/session state in private persistent storage. Never put WhatsApp auth state in a public/static directory, source control, container image layer, or shared untrusted volume.

Deployment must use the repository's canonical Docker Compose / CI conventions. Do not invent a separate deployment platform. Add MOONSKY to local/CI composition only after verifying health checks, environment contracts, volume permissions, backup expectations, and secret injection.

## 6. Identity, Authentication, Authorization, and Tenancy

This is a mandatory design gate before enabling ecosystem use.

- ARSY is the identity and tenant authority.
- Integrate operator sign-in with the existing ARSY/ID authentication mechanism where supported by actual repository contracts.
- Do not trust client-supplied `user_id`, `company_id`, tenant IDs, role names, or scopes.
- Resolve tenant and permissions from a verified identity/token or server-side identity exchange.
- Machine-to-machine access must use scoped, revocable service identity; do not perpetuate a single broad static service key.
- Apply tenant scoping to every account, conversation, message, attachment, template, webhook, delivery, and operator query/mutation.
- Prevent cross-tenant enumeration and object-reference authorization bugs.
- Preserve audit actor, tenant, correlation ID, and originating product context.
- Do not use a hardcoded bootstrap admin password in production. Development bootstrap must be explicitly development-only and fail closed in production.
- Do not log credentials, pairing codes, session keys, message secrets, or sensitive payloads.

Personal tenant IDs and organization tenant IDs must follow the current accepted A-L-L-A-H.COM tenant contract (including D-008). Do not invent a second tenant identifier scheme. Confirm how that contract maps to MOONSKY's persistence model before migration.

If current ARSY/ID authentication contracts are insufficient, implement and document a narrow adapter/interface and record the blocker. Do not create an independent identity authority as a workaround.

## 7. Data Ownership and Migration

MOONSKY PostgreSQL remains a separate persistence boundary.

Before migrating any data:
1. Inventory all existing tables and relations.
2. Inventory schema versions and migration history.
3. Identify credentials, session state, PII, message bodies, attachments, and retention requirements.
4. Define tenant ownership mapping.
5. Define encryption, backup, restore, and deletion behavior.
6. Produce a reversible migration/import plan with counts and checksums where feasible.
7. Test migration against a disposable database copy.
8. Verify old and new record counts and referential integrity.

Do not migrate live data or alter the historical MOONSKY database during this plan unless explicitly authorized. No destructive migration.

## 8. API and Event Contracts

Define versioned, typed contracts for:

- Send message / send template.
- Receive normalized inbound message.
- Conversation list/detail and assignment.
- Channel account create/configure/connect/disconnect/status.
- Webhook subscription, signature, delivery, retry, and dead-letter handling.
- Message delivery state transitions.
- Attachments and media metadata.
- Health/readiness and provider diagnostics.
- Audit/correlation metadata.

Requirements:
- Stable versioned API paths.
- Idempotency keys for outbound send and webhook processing.
- Explicit retry policy and bounded backoff.
- Delivery state machine with documented terminal/retryable states.
- Request/response validation.
- Rate limits and abuse controls.
- Redaction and payload-size limits.
- Correlation IDs and structured logs.
- No provider-specific types leaking into shared consumer contracts unless explicitly namespaced.
- Use existing `@allah/sdk` and `@moonwitness/types` conventions after inspecting their actual exports and package boundaries.
- Do not invent endpoints before defining their contracts.

## 9. UI and Product Experience

### 9.1 MOONSKY Console — dedicated operator workspace

Retain MOONSKY's own operator console as a distinct application experience. It may initially live within the `apps/moonsky` workspace as a client entry point, subject to current monorepo app conventions.

Required areas, only where backed by implemented capabilities:

- Inbox: conversations, filters, search, assignment, reply.
- Channels: WhatsApp, Telegram, and future providers.
- Connections: pairing, connect/disconnect, reconnect, connection state.
- Templates: reusable message templates and provider constraints.
- Campaigns: controlled bulk/scheduled messaging with consent, rate limits, and approval safeguards.
- Automations: triggers and routing rules.
- Webhooks: endpoints, signing, attempts, retries, dead-letter state.
- Delivery: message lifecycle and diagnostics.
- Operators: roles and assignment, delegated to ARSY identity/authorization.
- Settings: channel configuration and retention controls.

Do not render non-functional menu items as completed features. Distinguish unavailable, disabled, planned, and operational states.

### 9.2 Headquarter — overview, not inbox

Headquarter remains the central command center and uses the NEXUS PARADOX DNA.

Add a communication overview/integration surface only:
- Aggregate provider health.
- Active/disconnected channel summary.
- Delivery/queue health.
- Failed webhook or message counts.
- Alert/incident summaries.
- Deep link to the relevant MOONSKY Console workspace.

Headquarter must not duplicate message composition, inbox, pairing, operator assignment, or full channel configuration.


### 9.4 Explicit UI ownership and integration contract (locked)

The Console and Headquarter are two coordinated surfaces over one MOONSKY service, not two competing implementations.

**MOONSKY Console is the full operator workspace and remains independently usable.** It owns the complete communication interaction loop: inbox, conversation detail, message composition/reply, assignment, channel onboarding and QR/pairing, session repair, channel configuration, templates, routing, automation, webhook operations, delivery diagnostics, and communication-specific settings. These workflows must be backed by MOONSKY APIs and authorization.

**HEADQUARTER is the ecosystem command surface, not the communication operator application.** It owns cross-product situational awareness: aggregate channel/provider health, connection state, queue and delivery summaries, failed webhook/message counts, operational alerts, recent activity summaries, and navigation/deep-links into the relevant MOONSKY Console context.

Integration behavior:
- Headquarter may show compact, read-only communication summaries and health indicators.
- Headquarter may expose a narrowly scoped quick action only when it is safe, genuinely useful, authorized by MOONSKY, and does not recreate a full operator workflow.
- Headquarter may host a lightweight embedded/summary view only when it reuses the MOONSKY-owned UI/API contract; it must not fork inbox state, message composition logic, pairing flows, or operator permissions.
- Deep-links must preserve the intended tenant and resource context without trusting client-provided tenant identifiers. MOONSKY must re-authorize every destination and action.
- Use the ecosystem's shared identity/session and navigation conventions where supported, so the transition feels native rather than like an unrelated external product. Independent runtime does not require a separate user identity provider or a disconnected visual system.
- The Console must remain reachable and operable independently of Headquarter availability. Headquarter must degrade gracefully if MOONSKY is unavailable.
- Do not duplicate MOONSKY business logic, data stores, or authorization decisions in Headquarter.

**Architecture shorthand:** independent service + native Console + integrated Headquarter command surface. Standalone describes service/runtime and operator-workspace capability; it does not mean disconnected branding, identity, navigation, or ecosystem integration.

### 9.3 Shared UI

- Use `@moonwitness/ui` as the shared functional UI engine.
- Use the approved MOON UI skin architecture and tokens.
- MOONSKY gets its own product identity/visual composition without forking behavior, accessibility, or primitives.
- Select an existing approved DNA only after documenting the rationale; do not create a seventh master DNA as part of this integration.
- Follow WCAG AA, keyboard navigation, semantic HTML, focus states, reduced motion, responsive layouts, and honest loading/empty/error/offline/permission states.
- Do not use generic SaaS dashboard grids as the entire design.

## 10. Security and Reliability Requirements

- Treat Baileys as an unofficial WhatsApp Web protocol integration; provide an adapter boundary for official WhatsApp Business Platform providers.
- Do not claim WhatsApp Business API compliance for Baileys.
- Secure pairing flows and protect QR/pairing codes from logs and unauthorized viewers.
- Encrypt secrets at rest where feasible and use managed secret injection.
- Restrict outbound destinations and webhook SSRF vectors.
- Verify provider webhook signatures/secrets.
- Use idempotent event processing and deduplication.
- Apply per-tenant/per-channel quotas and rate limits.
- Protect against message replay and duplicate sends.
- Persist delivery attempts and failures.
- Provide bounded queues and backpressure behavior.
- Define graceful shutdown and provider session recovery.
- Implement health/readiness that reflects database and critical provider subsystem state.
- Provide backup/restore and retention policy.
- Add observability without logging sensitive message contents by default.

## 11. Implementation Phases

### Phase 0 — Reconfirm baseline and source
- Verify target repository branch `dev`, current HEAD, and clean/known git status.
- Re-read root governance documents and workspace contracts.
- Re-fetch historical MOONSKY source and pin source commit SHA.
- Inventory packages, tests, Docker, env variables, schemas, and migrations.
- Produce source-to-target file map and compatibility report.

### Phase 1 — Architecture and contracts
- Add accepted ADR to `DECISIONS.md`.
- Define service boundary and dependency direction.
- Define identity, tenancy, service authentication, API, event, and data contracts.
- Define PostgreSQL deployment and session storage strategy.
- Define threat model and data migration strategy.
- Finalize Console vs Headquarter information architecture.

### Phase 2 — Monorepo integration foundation
- Add `apps/moonsky` using existing workspace conventions.
- Adapt manifests, scripts, TS config, lint, test, and build config.
- Preserve separable API/runtime and client build boundaries.
- Add shared typed contracts/SDK only where reusable and justified.
- Avoid duplicate shared packages and circular dependencies.

### Phase 3 — Service and provider migration
- Migrate Fastify service and provider-neutral core.
- Migrate WhatsApp and Telegram adapters.
- Migrate persistence schema and migrations.
- Migrate webhook and WebSocket/event mechanisms.
- Add health/readiness, graceful shutdown, retries, idempotency, and observability.
- Keep source repository unchanged.

### Phase 4 — Identity, tenancy, and security
- Integrate ARSY identity and authorization.
- Implement tenant ownership and query isolation.
- Replace broad static service key with scoped workload identity.
- Remove production bootstrap credentials.
- Validate webhook, pairing, secret, and media security.
- Add negative security tests for cross-tenant access.

### Phase 5 — Console and Headquarter integration
- Adapt MOONSKY Console to MOON UI.
- Implement inbox/channel/connection workflows backed by real APIs.
- Implement honest states and accessibility.
- Add Headquarter overview and deep-links only.
- Ensure no duplicated inbox or operator control plane.

### Phase 6 — Migration, deployment, and verification
- Test data migration on disposable database.
- Add local Compose and CI service definitions.
- Validate persistent volume and secret contracts.
- Run all workspace quality gates and MOONSKY-specific tests.
- Run integration tests with provider mocks; live provider tests only with explicit test credentials and safe test accounts.
- Perform UI verification at desktop/tablet/mobile sizes.
- Document operational runbook, backup/restore, recovery, and limitations.

### Phase 7 — Completion report
- Record source commit, target branch/HEAD, changed files, test commands/results, migration evidence, security checks, and remaining gaps.
- Commit only to existing `dev` after gates pass.
- Do not merge, release, deploy, change DNS, or modify production data.

## 12. Required Deliverables

- `.plans/20261104-moonsky-integration/spec.md` — this accepted execution specification.
- `docs/architecture/adr/ADR-011-moonsky-communication-service.md` or the repository's canonical ADR location.
- `docs/architecture/MOONSKY-ARCHITECTURE.md`.
- `docs/security/MOONSKY-THREAT-MODEL.md`.
- `docs/operations/MOONSKY-RUNBOOK.md`.
- `docs/implementation/MOONSKY-MIGRATION-REPORT.md`.
- Updated package/app manifests and tests.
- Working MOONSKY service and Console integration.
- Headquarter communication overview integration.

If an equivalent canonical document already exists, update it instead of creating duplicate sources of truth.

## 13. Definition of Done

- [ ] Source audit is complete and pinned to an exact historical commit.
- [ ] Target architecture is documented and consistent with root governance.
- [ ] MOONSKY is a separate runtime/service in the final monorepo.
- [ ] ARSY remains identity, tenant, authorization, and business authority.
- [ ] MOONSKY retains communication-domain data and PostgreSQL persistence.
- [ ] WhatsApp and Telegram adapters work behind provider-neutral contracts.
- [ ] Webhook ingress/egress, retries, idempotency, and delivery lifecycle are verified.
- [ ] No cross-tenant access is possible; negative tests prove it.
- [ ] Service identity is scoped and revocable.
- [ ] No production bootstrap credentials or secrets are present.
- [ ] MOONSKY Console uses the shared MOON UI engine.
- [ ] Headquarter shows overview and deep-links, not a duplicated inbox.
- [ ] Local Compose, health checks, persistence, and shutdown work.
- [ ] Migration is tested on disposable data with reconciliation evidence.
- [ ] Lint, typecheck, tests, and builds pass with exact logs/results recorded.
- [ ] Historical `bjo163/moonsky` remains unchanged.
- [ ] Only the existing `dev` branch is modified.
- [ ] No production deployment or release occurred.

## 14. Required Local AI Execution Behavior

The local coding agent must:

1. Pull the latest `dev` branch of `bjo163/A-L-L-A-H.COM`.
2. Read this complete plan before coding.
3. Read root governance docs and linked contracts.
4. Inspect the current source repository state at the pinned/verified commit.
5. Execute phases sequentially, autonomously, and with evidence.
6. Never create a branch.
7. Never modify the historical MOONSKY repository.
8. Never ask for approval for ordinary reversible implementation decisions.
9. Stop only for genuinely unsafe/irreversible/external authorization blockers; continue independent work.
10. Never claim tests, migration, security, or deployment are complete without evidence.

**Execution command:** implement this plan on `dev` through verified local completion. The GitHub issue is the tracking record; this file is the authoritative technical execution plan.
