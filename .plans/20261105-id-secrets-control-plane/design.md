---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-SECRETS-CONTROL-PLANE-DESIGN"
version: "1.0.0"
owner: "design"
status: "proposed"
last_verified: "2026-11-05"
---

# Design — Identity & Secrets Control Plane

## Experience thesis
LUNAR CHRONICLES becomes a precise personal observatory for identity and trusted connections. The visual metaphor should make complex security operations legible, not turn them into spectacle.

## Navigation model
- Identity — person profile, sessions, recovery, security posture.
- Service Identities — non-human principals, ownership and lifecycle.
- API Keys — personal/service credentials, scopes, expiry, rotation, revoke.
- Vault — secret metadata, versions, consumers, access requests.
- Environments — project/environment variables, redacted diffs, promotion.
- Policies — roles/scopes, approvals, step-up requirements.
- Audit — searchable, redacted events and lifecycle history.

Only expose a navigation item when its underlying capability is implemented and authorized. Do not render fake empty dashboards for unimplemented modules.

## Core compositions
1. Identity Anchor: active human principal and session state.
2. Service Constellation: apps, agents, automation principals and owners.
3. Credential Registry: named keys with prefix/fingerprint only, scope, environment, expiry, last used, status.
4. Vault Archive: secret name, owner, project, environment, version, consumer references, rotation status; no plaintext.
5. Environment Atlas: environment variables grouped by public/sensitive/secret class; redacted version diffs.
6. Approval Chamber: requested action, actor, target resource, reason, expiry, approver and decision.
7. Audit Chronicle: who/what, action, target, outcome, timestamp and request reference; redact values.

## Secret reveal moment
Plaintext is shown once only immediately after a successful create/rotate response, if policy allows it. Use an isolated one-time panel with explicit copy action and warning that it cannot be retrieved again. Never put plaintext in route state, URL, analytics, console, crash reports, or persisted client cache. Clear transient UI state on navigation/unmount and never store it in browser storage.

## Environment editing
- Secret fields are write-only; existing values show only configured plus a stable masked fingerprint/metadata if safe.
- Redacted diffs list variable names and operation (added/updated/removed), never old/new values.
- Public values require explicit classification and allowlist; browser-exposed values receive a warning and validation.
- Production promotion shows exact target environment, changed variable names, approver and deployment effect before confirmation.

## Interaction states
Every route defines loading, empty, stale, unavailable, unauthorized, forbidden, pending, success, failure, and expired states as applicable. Authority failure must never look like a successful revoke or safe state.

## Visual DNA
- Midnight observatory and lunar cartography; editorial hierarchy and measured instrument-like precision.
- Sensitive operations use calm, high-clarity layouts with minimal motion.
- No generic dashboard card wall, fake shield/risk score, random stars as status, or game HUD imitation.
- No visual encoding alone: status includes text and accessible semantics.
- Motion honors reduced-motion; no sound-only alert.

## Accessibility
Keyboard-operable tables/lists, explicit labels, visible focus, programmatic errors, confirmation semantics, screen-reader announcements, contrast, zoom/reflow. Validate Indonesian and English copy and long credential/resource names.

## Responsive
Validate 360, 390, 768, 1024, and 1440 CSS px. Credential metadata wraps; critical scope/environment/expiry information must not disappear on mobile.

## Design acceptance
Test one-time reveal lifecycle, copy feedback, masked re-entry, redacted diff, revoke confirmation, expired key, denied access, and authority outage using safe fixtures only. Never use production secret material in screenshots or visual tests.
