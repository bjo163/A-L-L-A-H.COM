# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| dev     | :white_check_mark: |
| main    | :white_check_mark: |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

To report a vulnerability, please use one of the following private channels:

1. **GitHub Security Advisory**: Use the "Report a vulnerability" button on the
   [Security tab](https://github.com/bjo163/A-L-L-A-H.COM/security/advisories) of this repository.
2. **Private email**: Contact the maintainer directly (see the primary contact in
   [GOVERNANCE.md](GOVERNANCE.md)).

### What to include in your report

- A clear description of the vulnerability
- Steps to reproduce (if possible)
- Impact assessment
- Any suggested mitigation

### Our commitment

- We will acknowledge receipt of your report within **3 business days**.
- We will investigate and provide a status update within **7 business days**.
- If the vulnerability is confirmed, we will release a fix as soon as possible.
- We will credit you in the advisory (unless you prefer anonymity).

## Security Practices

These invariants are enforced by code and checked by the local quality gates:

- **Default-deny authentication.** Every hub route requires a verified principal; only an
  explicit allowlist (`/health`, `/ready`, onboarding/sign-in, and non-production `/docs`)
  is reachable anonymously.
- **Tenant isolation is fail-closed.** `company_id` is derived from the verified principal,
  never from the request body. Repository reads and writes without a resolvable tenant are
  rejected rather than widened.
- **Parameterized SQL only.** Values bind through `$n` placeholders; column and sort
  identifiers pass an allowlist, so an unexpected field fails closed with `UnknownFieldError`.
- **No raw-SQL surface.** The unauthenticated arbitrary-query tool is removed; the MCP
  surface exposes only named, tenant-scoped tools.
- **Secret hygiene.** NAS credentials round-trip through `encryptSecret`/`decryptSecret` and
  are redacted from reads and audit history; the KDF salt travels in the envelope so
  ciphertext survives restarts. AI virtual keys are stored only as SHA-256 hashes.
- **Session expiry and revocation.** Bearer tokens carry a TTL and sessions are rejected once
  `revoked` or past `expires_at`.
- **SSRF protection.** `base_url` is validated before the request and the post-resolution IP
  is re-checked, so a domain that resolves to a private or loopback address is refused.
- **Hardened transport.** Hub binds to loopback unless `HOST` is set; a strict
  `Content-Security-Policy` is applied; CORS fails closed in production; write-heavy routes
  are rate-limited.
- **Content-addressed storage.** Digests are validated as bare SHA-256 hex before any path is
  formed, so path segments cannot reach the filesystem.
- **RADIUS password verification.** Subscriber credentials are verified against the stored
  hash (constant-time) instead of accepted on presence alone.
- **No secrets in code.** `@moonwitness/lint` scans for hardcoded credentials and blocks
  interpolation inside query calls.
- **Dependency scanning.** Dependabot and CodeQL run automatically; an SBOM is generated on
  every release.
