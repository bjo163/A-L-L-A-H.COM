# Resolution: Autonomy and Windows Trust Boundary

## Conflict

The user requested a “super free” autonomous Windows coding/fixing agent with no limits. Unrestricted machine-wide filesystem or shell access, secret access, and silent commit/push/deploy would violate the repository's least-privilege, explicit-authorization, and operational-safety invariants.

## Options

- [x] **Bounded Autopilot (confirmed by approval of the implementation plan):** no per-action prompt for operations allowed by an explicit trusted-workspace/mode grant; hard policy for workspace escape, secrets, destructive/system-wide operations, and Git write/deployment actions.
- [ ] Unrestricted machine-wide execution with no policy boundary. Not available for implementation.

## Resolution

Implement Kilo-like per-mode `allow` / `ask` / `deny` policies and a high-autonomy mode scoped to a user-selected workspace. Require explicit session start and context consent; local extension policy remains authoritative for both VS Code and Headquarter-originated missions. Dangerous or out-of-scope actions require explicit confirmation or are denied.

## Dashboard boundary

The user selected remote control from Headquarter. Pairing is therefore required; Headquarter can submit and cancel missions for an authenticated paired extension, but cannot select arbitrary local paths or bypass local approvals.

## Tenant provisioning prerequisite

The device and mission APIs correctly fail closed unless the authenticated user's `auth.user.company_id` is assigned. The current `/api/auth/register` flow creates a user without a company assignment, so a newly registered account can authenticate but receives `403 TENANT_REQUIRED` when it attempts to create a pairing code. Integration coverage confirms this behavior.

Choose how new accounts receive tenant membership before remote pairing is considered complete:

- [ ] **Create a personal tenant on signup.** New accounts can pair immediately in an isolated tenant. Team sharing still requires an existing administrative assignment of users to the same company tenant.
- [ ] **Require pre-provisioned membership.** Keep registration unchanged and require an operator to assign `company_id` before users can pair. Document this prerequisite in setup guidance.
- [ ] **Add tenant creation and invitation onboarding.** Allow account owners to create a shared tenant and invite other authenticated users. This expands scope to tenant membership UX and APIs.

No option is selected yet. Do not weaken the fail-closed tenant check or create a shared default tenant while awaiting the product decision.
