# BLUEPRINT: A-L-L-A-H.COM Architecture Specification
**Platform Identity:** A-L-L-A-H.COM ("Accountable Life, Learning & Action Hub")  
**Target Repository:** `https://github.com/bjo163/A-L-L-A-H.COM.git`  
**Architecture Domain:** MoonWitness Unified Platform Engine  

Dokumen ini mendefinisikan cetak biru arsitektur menyeluruh, batas domain, kontrak data, dan prinsip teknis platform.

---

## 1. Domain Boundaries (Non-Overlapping Synthesis)

| Domain | Source Invariant | Implementation in A-L-L-A-H.COM |
|---|---|---|
| **OS & Enterprise Model** | `ql-orm` & Odoo ERP | `apps/server/src/core/base_model.rs` + `migration/m20261103_000001_base_odoo.rs` |
| **Object Storage** | `bjo163/echolog` | `apps/server/src/core/storage.rs` + `ir_attachment` |
| **AI Gateway & Router** | `ql_ai` & 9router | `apps/server/src/controllers/llm_gateway.rs` + `RoutingTable` |
| **Server-Driven UI** | Odoo `fields_view_get` | `apps/server/src/core/view_engine.rs` + `apps/web/src/app` |
| **Deployment Engine** | Coolify Git-Backed | `docker-compose.yml` (Loopback pinned, auto healthcheck) |

---

## 2. Invariants & Security Mandates

1. **Content-Addressed Immutability**:
   - Seluruh payload file disimpan beralamatkan hash SHA-256 (`objects/<sha256>`). File tidak pernah ditimpa (write-once).
   - Menghapus file harus mematuhi pemeriksaan `legal_hold` dan `retention_until` (fail-closed).
2. **Zero-Database Query Fast-Path Proxy**:
   - Permintaan chat completion diarahkan menggunakan hash map in-memory (`Arc<RwLock<RoutingTable>>`). Database hanya diakses saat booting atau event cache invalidation.
3. **Multi-Company Data Isolation**:
   - Setiap transaksi dan token key terikat pada `company_id`. Row-level security menjamin ketiadaan kebocoran data antar tenant.
