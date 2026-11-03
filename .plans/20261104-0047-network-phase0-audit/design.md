# Design: Network Foundation Phase 0 — Audit Current Repository & Reconcile Architecture (Issue #6)

## 1. Domain Ownership & Boundary Model

```mermaid
erDiagram
    TENANT ||--o{ SUBSCRIBER : owns
    SUBSCRIBER ||--o{ SUBSCRIPTION : holds
    SUBSCRIPTION ||--|| PLAN : defines
    SUBSCRIPTION ||--o{ PPPOE_ACCOUNT : authenticates
    PPPOE_ACCOUNT ||--o{ RADIUS_SESSION : records
    NAS_DEVICE ||--o{ RADIUS_SESSION : terminates

    TENANT {
        string company_id
        string name
    }
    SUBSCRIBER {
        string id
        string partner_id
        string status
    }
    SUBSCRIPTION {
        string id
        string plan_id
        string status
        datetime valid_until
    }
    PPPOE_ACCOUNT {
        string username
        string encrypted_password
        string ip_pool
        int rate_limit_up_kbps
        int rate_limit_down_kbps
    }
    NAS_DEVICE {
        string ip_address
        string secret
        string vendor
    }
    RADIUS_SESSION {
        string acct_session_id
        string username
        datetime start_time
        datetime stop_time
        bigint input_octets
        bigint output_octets
    }
```

---

## 2. Invariant Guidelines
- **Single Authority**: ARSY Fastify Hub remains the sole HTTP backend and PGlite database authority.
- **Native UDP Runtime**: SENTINEL RADIUS runs as a dedicated Node.js process with `dgram` UDP sockets, querying ARSY ORM / PGlite directly or through Fastify internal control APIs.
- **No FreeRADIUS**: Zero FreeRADIUS binaries, libraries, or sidecars.

