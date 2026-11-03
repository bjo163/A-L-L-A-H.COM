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

## Tenant provisioning resolution

The device and mission APIs correctly fail closed unless the authenticated user's `auth.user.company_id` is assigned. The current `/api/auth/register` flow creates a user without a company assignment, so a newly registered account can authenticate but receives `403 TENANT_REQUIRED` when it attempts to create a pairing code. Integration coverage confirms this behavior.

- [x] **Create a personal tenant on signup.** Confirmed by the user.

Each account receives a distinct negative `company_id` derived from its user ID. Positive IDs remain the organization-tenant namespace; zero remains unassigned. This avoids collisions with existing positive company IDs without introducing a tenant registry or a shared default tenant. Device-control validation accepts any non-zero safe integer and continues to fail closed for unassigned accounts. Users share devices and missions only when they have the same tenant ID; organization membership still requires explicit administrative assignment.

Integration coverage verifies signup provisioning, pairing, isolation between personal tenants, sharing within an assigned organization tenant, and cross-tenant denial.
