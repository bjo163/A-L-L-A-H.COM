# AGENTS.md: Project Guidance for AI Coding Agents

Repository: **A-L-L-A-H.COM** (MoonWitness Unified Platform)  
Target Remote: `https://github.com/bjo163/A-L-L-A-H.COM.git` (Branch: `main`)

Semua agen coding yang bekerja di repositori ini harus mematuhi aturan berikut:

---

## 📜 Canonical Operating Contract: `AUTONOMOUS.md`

Sebelum mengeksekusi tugas apa pun di repositori ini, baca dan terapkan seluruh kontrak kerja yang tertulis di [**`AUTONOMOUS.md`**](./AUTONOMOUS.md).

### Inti Kontrak Kerja:
1. **Zero-Confirmation Autonomous Execution**: Jalankan tugas dari riset hingga selesai tanpa menanyakan hal-hal kecil per file.
2. **Deep-Research & Gap Analysis**: Eksplorasi ekosistem `bjo163/*` dan referensi Odoo / Echolog sebelum merancang fitur.
3. **Audit Keamanan & Integritas**: Terapkan zero-copy streaming, query parameterized, dan proteksi SSRF / legal holds.
4. **Mandatory Documentation Synchronization**: Setiap kali ada perubahan fungsional atau refactoring, **wajib** memperbarui 4 dokumen kanonik:
   - `README.md`
   - `CHANGELOG.md`
   - `BLUEPRINT.md`
   - `DESIGN.md`
5. **Self-Healing Build Gate**:
   - `pnpm server:migrate`
   - `cargo check --manifest-path apps/server/Cargo.toml`
   - `pnpm web:build`
   Jika ada error, perbaiki sendiri sampai lolos zero-error.
6. **Automatic Git Push**: Stage, commit conventional, dan push langsung ke branch `main`.

---

## 🛠️ Stack & Directory Mapping
- **`apps/server/`**: Rust / Loco / SeaORM / Axum
  - `src/core/`: Abstraksi Ql-Orm, BaseModel, Content-Addressed Storage, In-memory Router State.
  - `src/controllers/`: Endpoint gateway `/v1/chat/completions`, `/v1/models`, `/v1/sdui`.
  - `addons/`: Addons modular `base`, `mw_storage`, `mw_llm_router`.
- **`apps/web/`**: Next.js 16 (App Router) + React 19 + Tailwind CSS v4.
- **`docker-compose.yml`**: Deployment produksi Coolify (loopback bindings `127.0.0.1:5150` & `127.0.0.1:3000`).

