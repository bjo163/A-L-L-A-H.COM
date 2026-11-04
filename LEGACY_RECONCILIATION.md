---
contract: "DOCUMENTATION_CONTRACT.md"
id: "LEGACY_RECONCILIATION"
version: "1.2.0"
owner: "engineering"
status: "implemented"
last_verified: "2026-11-04"
---
# LEGACY_RECONCILIATION.md

Protect MoonWitness history while enabling evolution inside A-L-L-A-H.COM. ADRs → [DECISIONS.md](DECISIONS.md) D-001/D-002.

## Discovery Scope

All accessible: MoonWitness generations (Reborn, XV, archives) · repos/branches/tags/releases/issues · narrative manuscripts + canon · scripts · posters · images · video/audio · research · timelines · datasets · Moon UI · Headquarter · Dock · Cockpit · Qorpus · infrastructure · APIs · schemas · prototypes.
**Inaccessible sources: list explicitly. Never claim they were audited.**

## Inventory Schema

| Field | Note |
|---|---|
| `source` | Exact repo / path / URL |
| `generation` | Date/version if known |
| `purpose` | What it contains/does |
| `provenance` | Origin, ownership |
| `status` | Current state |
| `disposition` | Classification (see below) |
| `evidence` | Verification proof |

## Disposition Classes

`preserve:canonical` · `preserve:historical` · `integrate` · `migrate` · `reference` · `consolidate` · `archive` · `retire` *(requires rationale + explicit authorization for irreversible)* · `unresolved`

## Current Dispositions

| Source | Disposition | Rationale |
|---|---|---|
| `apps/server/` (Rust/Loco) | `retire` | Replaced by Arsy Fastify. History in Git + migration plan. |
| `apps/web/` (legacy Next.js) | `retire` | Superseded by Dock. Historical refs in identity report. |

## Canon Integrity Rules

- Never silently rewrite original canon
- Keep original + corrected versions traceable
- Distinguish: narrative fiction · dream accounts · creative interpretation · research claims · verified facts
- Preserve: titles · chapter order · chronology · motifs · established naming corrections
- Version conflict: preserve both · document conflict · then select canonical interpretation

## Technical Consolidation Checklist

Before porting or rebuilding:
- [ ] Inspect: source · license · runtime · deps · data · APIs · tests
- [ ] Evaluate: reuse / integration / migration / replacement
- [ ] Plan: reversible · source references and mapping preserved
- [ ] Validate: data counts · hashes · behavior
- [ ] Document: omissions · gaps · deviations
- [ ] Never delete original because a copy exists in A-L-L-A-H.COM

## Completion Criteria

All accessible sources inventoried · inaccessible listed explicitly · all important content has a disposition · conflicts traceable · migration provenance retained · migrated content validated · zero unauthorized destructive cleanup.
