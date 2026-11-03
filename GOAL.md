# GOAL.MD: Autonomous Engineering Directive & Evolution Loop
**Platform:** A-L-L-A-H.COM (MoonWitness Unified Platform)  
**Target Repository:** `https://github.com/bjo163/A-L-L-A-H.COM.git` (Branch: `main`)

Dokumen ini berisi prompt directive siap pakai untuk slash command **/goal** di Antigravity / AI Coding Agent.

---

## 📋 The Master `/goal` Execution Prompt

Salin dan gunakan blok prompt di bawah ini ke dalam chat untuk memicu siklus pengembangan otonom secara menyeluruh:

```markdown
/goal
Eksekusi Master Autonomous Loop untuk platform A-L-L-A-H.COM (target remote: https://github.com/bjo163/A-L-L-A-H.COM.git, branch: main).

PETUNJUK OPERASIONAL WAJIB:
1. BACA & PATUHI KONTRAK KANONIK:
   - Baca dan terapkan seluruh kontrak eksekusi yang tertulis di `AUTONOMOUS.md` dan `AGENTS.md`.
   - Jalankan 6 siklus otonom tanpa henti: Deep Research & Brainstorming -> Audit Keamanan -> Implementasi Modular -> Self-Healing Verification -> Sinkronisasi Dokumen Kanonik -> Git Commit & Push.

2. RESEARCH & BRAINSTORM FITUR SELANJUTNYA:
   - Ambil referensi dari ekosistem bjo163/* (moonwitnessxv, echolog, ql-orm, ql_ai, mwx-isp) atau referensi industri tier-1 (Odoo 18, OpenDAL, OpenRouter).
   - Temukan gap fitur yang belum lengkap dan kembangkan langsung secara mandiri (misal: live upstream SSE stream forwarder, token bucket rate limiter, prompt cache exact/semantic, dual-surface S3 SigV4 verifier, atau dynamic Server-Driven UI di frontend).

3. ZERO-ERROR SELF-HEALING BUILD:
   - Verifikasi migrasi: `pnpm server:migrate`
   - Verifikasi Rust backend: `cargo check --manifest-path apps/server/Cargo.toml`
   - Verifikasi Next.js web: `pnpm web:build`
   - Jika ditemukan error compiler/build/dependencies, jangan bertanya ke user. Diagnosis dan perbaiki sendiri seketika sampai 100% SUCCESS.

4. SINKRONISASI 4 DOKUMEN KANONIK & GIT PUSH:
   - Selalu perbarui serentak:
     * `README.md`
     * `CHANGELOG.md`
     * `BLUEPRINT.md`
     * `DESIGN.md`
     *(Boleh perbarui `AUTONOMOUS.md`, `AGENTS.md`, atau skills jika terdapat evolusi arsitektur baru).*
   - Stage & commit: `git add .` dan `git commit -m "<type>(<scope>): <clear descriptive action in conventional commit>"`
   - Push langsung ke remote: `git push origin main`

Tugas hanya dianggap selesai jika seluruh verifikasi lolos, 4 dokumen terupdate, dan commit telah berhasil mendarat di GitHub dengan git status clean.
```

---

## 💡 Quick Tips:
- **Untuk Target Khusus / Sprint Spesifik**: Anda bisa menambahkan 1 baris target di baris paling atas prompt, contoh:
  > `TARGET SPRINT: Hubungkan live provider DeepSeek & Groq dengan streaming SSE chunk di LLM Router controller.`
- Agen akan secara otonom mengintegrasikan target tersebut ke dalam seluruh siklus `AUTONOMOUS.md` hingga ter-push ke GitHub.

