---
contract: "DOCUMENTATION_CONTRACT.md"
id: "ID-NEXT-EVOLUTION-RULES"
version: "1.0.0"
owner: "security-architecture"
status: "proposed"
last_verified: "2026-11-05"
---

# Engineering & Security Rules — MoonWitness ID

1. **Single authority:** ARSY owns identity, credentials, session issuance/revocation, tenant, roles, authorization, audit, consent, and data-rights execution.
2. **No parallel backend:** no identity database, auth microservice, shadow session store, or direct DB access from ID.
3. **Shared contracts:** use `@moonwitness/types`; transport only through `@allah/sdk`; controls and visual primitives only through `@moonwitness/ui`.
4. **Default deny:** missing principal, invalid origin, invalid audience, expired/replayed token, unknown client, or ambiguous tenant must fail closed.
5. **No browser trust:** never trust client-supplied role, tenant, company, permission, identity status, or authorization decision.
6. **Redirect safety:** exact allowlisted origins/URIs; reject wildcard redirects, credentials in URLs, javascript/data schemes, and untrusted callback hosts.
7. **Token hygiene:** never place credentials, access/refresh tokens, recovery tokens, session IDs, or signing keys in URLs, logs, analytics, screenshots, or error messages.
8. **Recovery safety:** one-time, short-lived, purpose-bound tokens; generic request response; server-side throttling; replay prevention; no account enumeration.
9. **Federation safety:** use an explicit reviewed protocol; validate issuer, audience, signature, expiry, state, nonce, PKCE, redirect URI, and one-time code consumption as applicable.
10. **Session truth:** remove a session from the UI only after authority confirmation. Failed revoke keeps it visible. Current-session revoke must safely terminate the local flow.
11. **Device privacy:** show only metadata returned by ARSY; do not invent fingerprinting or infer precise location from IP.
12. **Audit integrity:** security events are append-only and redacted; define retention before promising deletion or retention periods.
13. **Data rights:** export/deletion must enforce tenant ownership, legal hold, retention, idempotency, expiry, and audit obligations.
14. **Privacy by design:** optional consent is separate from required processing; record notice version and purpose; support withdrawal where policy permits.
15. **UI quality:** no raw native controls in apps; no app-private component clones or private `mw-*` classes; all routes provide loading/error/not-found parity.
16. **Honest capability labels:** distinguish proposed, implemented, unit-tested, integration-verified, released, and deployed. Dependency support is not proof of product availability.
17. **Evidence-first completion:** no task marked complete without changed source, passing focused tests, and exact verification commands/results.
18. **No slop plans:** every task must name bounded scope, expected files/contracts, acceptance criteria, dependency, and verification. Do not create placeholder plans or mark empty work verified.
19. **No unrelated changes:** preserve existing user work; do not create a new branch; target `dev` per repository policy.
20. **Stop conditions:** if an API, policy, domain, or legal decision is missing, record the blocker and produce a concrete decision request instead of inventing behavior.
