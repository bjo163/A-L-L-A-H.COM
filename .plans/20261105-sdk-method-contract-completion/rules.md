---
contract: "DOCUMENTATION_CONTRACT.md"
id: "SDK-METHOD-CONTRACT-RULES"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# SDK Method Contract Completion — Rules

- Preserve existing public method behavior unless a migration is explicitly designed and tested.
- Shared types must have one canonical definition in `@moonwitness/types`; consumers must not redeclare them locally.
- Tenant IDs and principals must be derived from verified server authorization, never from untrusted request data.
- Endpoint validation must reject private/loopback destinations and re-check resolved addresses before server-side requests.
- Never expose upstream credentials or secrets to client components.
- Add only APIs with a real consumer; do not add speculative wrappers or types solely to satisfy a plan.
- Keep UI components and interaction behavior in `@moonwitness/ui` and outside this SDK plan.
- Do not mark proposed behavior implemented without source, tests, and consumer evidence.
