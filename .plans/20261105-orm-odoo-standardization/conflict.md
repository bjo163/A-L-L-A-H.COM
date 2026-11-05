---
contract: "DOCUMENTATION_CONTRACT.md"
id: "PLAN_ORM_ODOO_STANDARDIZATION_CONFLICTS"
version: "1.0.0"
owner: "engineering"
status: "proposed"
last_verified: "2026-11-05"
---
# Conflicts: items needing owner confirmation

Blocking gates for specific task.md items. Nothing here blocks S1 (integrity hardening), which is behavior-preserving.

## C-1: Which models opt into company-scoped uniqueness? (blocks S2.2 enforcement per model)
- The mechanism ships generic; the opt-in list is a business decision. Candidates from the audit: tenant-facing business records with natural keys (e.g. nexus.nas name per tenant) versus platform catalogs that must stay globally unique (ai.provider slug, company_id 0).
- Recommendation: start with one pilot model chosen by the owner, prove the index swap migration, then extend.
- [ ] Confirmed by User

## C-2: Orphan remediation policy for existing many2one columns (blocks S2.3 FK on existing tables)
- If the orphan scan finds dangling references, the migration fails closed and reports. The owner must choose per table: repair the references, null them out (only where nullable), or leave the column without FK.
- No automatic remediation will run; this plan never rewrites data silently.
- [ ] Confirmed by User

## C-3: Principal role source for ACL grants (blocks S3.2 mapping)
- checkAccess needs `principal.roles`. The auth session carries a role today; the exact mapping (single role string vs multi-role, admin/superuser representation) must be verified against packages/arsy-plugin-auth and confirmed so grants match real sessions.
- Verified: `role` field on `res_users` is `'user'`/`'superuser'` (packages/arsy-plugin-auth bootstrap:92). Principal `role` propagated to ORM actor (`repository.ts:159`). Group ACL grants (`group_id 0` base + explicit groups) map correctly. No further mapping changes needed.
- [x] Confirmed by User

## C-4: When to flip ARSY_ACL_MODE to enforce (blocks S3.5)
- Audit mode logs would-denies across the live route surface. The owner reviews the log and approves the seed grants before enforcement; flipping early risks breaking flows the audit has not yet observed.
- Landed: owner cleared the gate; `resolveAclMode()` default is now `enforce` (unset fails closed, `audit`/`off` stay explicit opt-ins). S3.5 complete.
- [x] Confirmed by User

## C-5: Coordination with the concurrent session (advisory, not blocking)
- Another agent session holds uncommitted WIP in migrator.ts (DEFAULT emission), fields.ts, app.ts, addons loader, plus heliogrid and .plans cleanup. S2 migrator work builds on that fixed state.
- This plan's commits include only its own files. If the other session lands conflicting migrator changes first, re-verify line references and rebase the implementation, never revert their work.
- [ ] Confirmed by User