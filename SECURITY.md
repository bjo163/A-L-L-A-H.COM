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

This project follows these security invariants:

- **No secrets in code**: GitHub Actions secret scanning + `@moonwitness/lint` enforce this.
- **Parameterized SQL only**: No raw string queries (via `@allah/arsy-orm`).
- **Tenant isolation**: `company_id` on every row.
- **SSRF protection**: `base_url` validated before every upstream request.
- **Dependency scanning**: Dependabot + CodeQL run automatically.
- **SBOM**: Generated on every release.
