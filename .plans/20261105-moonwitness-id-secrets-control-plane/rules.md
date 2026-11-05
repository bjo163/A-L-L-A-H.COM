# Rules: MoonWitness ID Secrets Control Plane

## Security
- Secret material stays server-side and is never rendered in browser state.
- Tenant ownership is resolved from the authenticated principal, not client input.
- All credential operations generate audit records with redacted metadata.

## UX
- Use `@moonwitness/ui` composition and accessible controls.
- Keep empty, loading, and error states explicit.
- Ensure keyboard operability and visible focus states.

## Delivery
- All work must pass the repository documentation and architecture gates.
- Never fabricate claims or placeholder statistics in production-facing surfaces.
