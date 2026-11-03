---
contract: "DOCUMENTATION_CONTRACT.md"
id: "WORLD-OBSERVATORY"
version: "1.0.0"
owner: "architecture"
status: "proposed"
last_verified: "2026-11-03"
---
# DECISION — ADR-001: STANDALONE NEXT.JS APPLICATION

**Status:** PROPOSED. Validate repository patterns and integration contracts before accepting.

**Context:** A-L-L-A-H.COM already has independently scoped Next.js apps and shared packages. ROCKSOUL JIZZ owns PERSPECTIVE and provides a read-only API/observatory foundation. World Observatory needs a dedicated information architecture distinct from community-facing Dock and operations-focused Headquarter.

**Decision:** Create `apps/jizz/` using Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 and existing pnpm workspace conventions. Reuse `@moonwitness/ui`, `@moonwitness/types` and `@allah/sdk` only for approved A-L-L-A-H.COM/ARSY/SSO communication where verified. Public product name WORLD OBSERVATORY; canonical engine and PERSPECTIVE owner ROCKSOUL JIZZ.

**Alternatives rejected:**
1. Headquarter module — operational/admin purpose differs
2. Dock module — Dock is community/user portal
3. Embed JIZZ web app — separate shell weakens A-L-L-A-H.COM integration
4. New framework/backend — reuse existing Next.js/platform foundations

**Consequences:** Clear product boundary/navigation; independent app build boundary; shared UI/types/SDK reuse; JIZZ remains authoritative; requires workspace scripts.

**Constraints:** No duplicate database/auth/ORM/AI gateway; no JIZZ canonical writes; no truth ranking/universal verdict/fabricated coverage.