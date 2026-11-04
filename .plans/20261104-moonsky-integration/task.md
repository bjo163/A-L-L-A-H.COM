---
status: "proposed"
---
# TASK: MOONSKY Integration

Diturunkan dari `spec.md` pada plan yang sama. Tidak ada butir yang dicentang: pekerjaan ini belum dimulai.

## Phase 0, baseline dan sumber
- [ ] Verifikasi branch `dev`, HEAD saat ini, dan status git yang diketahui
- [ ] Baca ulang dokumen governance root dan kontrak yang ditautkan
- [ ] Re-fetch sumber historis `bjo163/moonsky` dan kunci commit SHA
- [ ] Inventaris paket, test, Docker, env var, schema, dan migrasi
- [ ] Hasilkan peta file sumber ke target dan laporan kompatibilitasnya

## Phase 1, arsitektur dan kontrak
- [ ] Tambah ADR yang diterima ke `DECISIONS.md`
- [ ] Tetapkan batas service dan arah dependensi
- [ ] Definisikan kontrak identitas, tenancy, autentikasi service, API, event, dan data
- [ ] Definisikan strategi PostgreSQL dan penyimpanan provider-session
- [ ] Susun threat model dan strategi migrasi data
- [ ] Finalisasi arsitektur informasi Console dibanding Headquarter

## Phase 2, fondasi integrasi monorepo
- [ ] Tambah `apps/moonsky` mengikuti konvensi workspace yang ada
- [ ] Sesuaikan manifest, script, TS config, lint, test, dan build config
- [ ] Pertahankan batas build API/runtime dan client yang terpisah
- [ ] Tambah kontrak bertipe bersama hanya bila layak dan terpakai
- [ ] Hindari paket bersama ganda dan dependensi sirkular

## Phase 3, migrasi service dan provider
- [ ] Migrasi service Fastify dan core provider-neutral
- [ ] Migrasi adapter WhatsApp (Baileys) dan Telegram
- [ ] Migrasi skema persistensi dan riwayat migrasinya
- [ ] Migrasi mekanisme webhook dan WebSocket/event
- [ ] Tambah health/readiness, graceful shutdown, retry, idempotency, observability
- [ ] Pastikan repo sumber tetap tidak berubah

## Phase 4, identitas, tenancy, dan keamanan
- [ ] Integrasi identitas dan otorisasi ARSY
- [ ] Terapkan kepemilikan tenant dan isolasi query
- [ ] Ganti service key statis luas dengan workload identity yang scoped dan dapat dicabut
- [ ] Hapus kredensial bootstrap produksi
- [ ] Validasi keamanan webhook, pairing, secret, dan media
- [ ] Tambah test negatif akses lintas tenant

## Phase 5, Console dan integrasi Headquarter
- [ ] Adaptasi Console ke MOON UI
- [ ] Implementasi alur inbox, channel, dan connection yang didukung API nyata
- [ ] Terapkan state jujur dan aksesibilitas
- [ ] Tambah overview dan deep-link di Headquarter, tanpa inbox ganda

## Phase 6, migrasi, deployment, verifikasi
- [ ] Uji migrasi data pada database sekali pakai
- [ ] Tambah definisi Compose lokal dan CI
- [ ] Validasi kontrak volume persisten dan injeksi secret
- [ ] Jalankan seluruh quality gate workspace dan test khusus MOONSKY
- [ ] Lakukan verifikasi UI pada ukuran desktop, tablet, dan mobile
- [ ] Tulis runbook operasi, backup/restore, recovery, dan batasannya

## Phase 7, laporan penyelesaian
- [ ] Catat commit sumber, branch/HEAD target, file berubah, perintah test beserta hasilnya, bukti migrasi, pemeriksaan keamanan, dan sisa celah
- [ ] Commit ke `dev` yang sudah ada hanya setelah gate lolos

## Deliverables yang diminta spec
- [ ] ADR pada lokasi kanonik repository
- [ ] `docs/architecture/MOONSKY-ARCHITECTURE.md`
- [ ] `docs/security/MOONSKY-THREAT-MODEL.md`
- [ ] `docs/operations/MOONSKY-RUNBOOK.md`
- [ ] `docs/implementation/MOONSKY-MIGRATION-REPORT.md`
