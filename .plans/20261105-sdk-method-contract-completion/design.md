---
contract: "DOCUMENTATION_CONTRACT.md"
id: "SDK-METHOD-CONTRACT-DESIGN"
version: "1.0.0"
owner: "engineering"
status: "proposed"
---

# SDK Method Contract Completion — Design

## Current status

The accompanying spec is proposed. No new API behavior is approved by this design note, and the shared type/API source of truth must be verified before implementation.

## Intended boundary

- `@moonwitness/types` owns shared serializable contracts only.
- `@allah/sdk` owns client transport and typed endpoint methods.
- Authentication authority and tenant identity remain derived server-side from a verified principal.
- UI skin preference presentation remains owned by `@moonwitness/ui`; this plan may only provide a shared `SkinId` type if the existing skin registry is verified as its authority.

## API decisions still required

- Whether SDK methods return existing values or an `ApiResponse<T>` wrapper.
- Whether `principal()` belongs in the SDK and what verified auth context it can access.
- Which runtime owns endpoint URL validation and DNS/IP revalidation.
- Whether `SdkError` extends or replaces existing error types.

No API is implemented until these points are reconciled with the live source and relevant contracts.
