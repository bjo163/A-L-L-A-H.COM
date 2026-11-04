---
status: "proposed"
---
# DESIGN: MOONSKY Integration

Diringkas dari `spec.md`. Tidak ada keputusan desain baru di file ini; yang ada di sini adalah turunan dari
keputusan yang sudah diterima pada spesifikasi.

## 1. Batas kepemilikan

| Wilayah | Pemilik | Alasan |
|---|---|---|
| Identitas, autentikasi, keanggotaan tenant, role, scope, kebijakan | ARSY | satu otoritas, tidak ada penyedia identitas kedua |
| Data dan workflow bisnis, event bisnis, keputusan kebijakan | ARSY | otoritas bisnis |
| Koneksi channel, provider session, percakapan, pesan, routing, lifecycle pengiriman, webhook masuk/keluar | MOONSKY | eksekusi domain komunikasi |
| Console operator dan kesehatan channel | MOONSKY | alur kerja operator spesifik komunikasi |
| Overview lintas ekosistem dan deep-link | HEADQUARTER | pengawasan, bukan inbox kedua |

Konsumen (DOCK, WORKS, HARBOR, SENTINEL, GATE, dan aplikasi berwenang lain) hanya menyentuh kontrak API/SDK
MOONSKY lewat integrasi sisi server. Tidak ada yang menyentuh internal Baileys/Telegram atau database MOONSKY.

## 2. Topologi runtime

`apps/moonsky` berjalan sebagai proses sendiri di workspace pnpm, dapat di-restart tanpa menyentuh lifecycle ARSY,
dengan PostgreSQL dan penyimpanan provider-session sendiri. Batas permukaan yang dimaksud:

- REST API Fastify
- stream WebSocket/event untuk operator dan konsumen berwenang
- worker siklus hidup koneksi provider
- adapter WhatsApp (Baileys) dan Telegram
- webhook ingress dan worker pengiriman keluar
- persistensi plus migrasi eksplisit
- endpoint health/readiness dan telemetri operasi

## 3. Arah kontrak

- Jalur API stabil dan berversi, dengan idempotency key untuk kirim keluar dan pemrosesan webhook.
- State machine pengiriman dengan state terminal dan retryable yang terdokumentasi, retry bounded dengan backoff.
- Kontrak event dinormalisasi; tipe spesifik provider tidak bocor ke kontrak bersama kecuali di-namespace eksplisit.
- Validasi request/response, rate limit, limit ukuran payload, dan redaksi.
- Correlation ID dan log terstruktur, tanpa isi pesan sensitif secara default.
- Mengikuti konvensi `@allah/sdk` dan `@moonwitness/types` setelah mengekspor aktualnya diperiksa.

## 4. UI

Console MOONSKY tetap aplikasi operator tersendiri dan memakai mesin UI bersama `@moonwitness/ui` serta arsitektur
skin MOON UI yang sudah diterima, tanpa memfork perilaku, aksesibilitas, atau primitif. Identitas visual produk boleh
khas, DNA baru tidak dibuat sebagai bagian integrasi ini.

Headquarter hanya menambah permukaan overview: agregat kesehatan provider, ringkasan channel aktif atau terputus,
kesehatan antrean dan pengiriman, jumlah webhook atau pesan gagal, ringkasan insiden, dan deep-link ke workspace
Console yang sesuai. Komposisi pesan, inbox, pairing, dan penugasan operator tidak boleh diduplikasi di sana.

## 5. State yang wajib jujur

Setiap area Console hanya dirender bila kapasitasnya benar-benar ada, dan setiap permukaan membedakan empat kondisi:
belum tersedia, tersedia tapi dinonaktifkan, direncanakan, dan operasional. Menu non-fungsional tidak boleh
tampil sebagai fitur jadi. Ini mengikuti aturan state kosong, memuat, dan error pada kontrak UI ekosistem.
