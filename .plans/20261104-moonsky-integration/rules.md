---
status: "proposed"
---
# RULES: MOONSKY Integration

Diturunkan dari `spec.md`. Butir di sini adalah batasan yang mengikat eksekusi, bukan keputusan baru.

## 1. Invarian arsitektur

- ARSY tetap satu-satunya otoritas identitas, autentikasi, keanggotaan tenant, dan kebijakan otorisasi. MOONSKY tidak
  menjadi penyedia identitas kedua, termasuk tidak sebagai jalan pintas saat kontrak ARSY belum cukup; dalam kasus itu
  yang dibuat adalah adapter sempit dan blocker-nya dicatat.
- MOONSKY adalah runtime terpisah dengan PostgreSQL sendiri. Data komunikasi tidak digabung ke PGlite ARSY, dan tidak
  ada aplikasi konsumen yang menulis langsung ke tabel MOONSKY.
- Baileys diperlakukan sebagai integrasi protokol WhatsApp Web tidak resmi, dibungkus batas adapter yang siap untuk
  penyedia resmi. Klaim kepatuhan WhatsApp Business API atas Baileys dilarang.
- Konsumen memakai kontrak API/SDK terdokumentasi lewat integrasi sisi server, bukan internal provider.

## 2. Aturan repository dan eksekusi

- Hanya branch `dev` yang ada yang diubah. Tidak membuat branch, tidak menyentuh `main`, tidak force-push.
- Repo historis `bjo163/moonsky` bersifat baca-saja: tidak dimodifikasi, dihapus, diarsipkan, atau di-commit.
- Tidak ada deployment produksi, perubahan DNS, pelepasan rilis, atau perubahan secret produksi sebagai bagian plan ini.
- Perubahan lokal yang tidak terkait harus tetap utuh, dan kondisi HEAD, status git, struktur workspace, serta CI
  diperiksa lebih dulu.
- Migrasi destruktif dilarang. Data live tidak dipindah tanpa otorisasi eksplisit, dan tanpa menulis ulang atau
  membuang data pesan/session yang ada.

## 3. Isolasi tenant dan otorisasi

- `user_id`, `company_id`, id tenant, nama role, dan scope dari klien tidak pernah dipercaya. Semuanya berasal dari
  token terverifikasi atau pertukaran identitas sisi server.
- Scoping tenant berlaku di setiap query dan mutasi akun, percakapan, pesan, lampiran, template, webhook, pengiriman,
  dan penugasan operator.
- Kerentanan enumerasi lintas tenant dan object-reference authorization harus dibuktikan tidak ada lewat test negatif,
  bukan diasumsikan.
- Identitas machine-to-machine memakai workload identity yang scoped dan dapat dicabut; satu service key statis luas
  tidak dipertahankan.
- Konteks audit, actor, tenant, correlation ID, dan produk asal tetap terjaga.

## 4. Keamanan dan keandalan

- State sesi provider dan kredensial disimpan di penyimpanan privat persisten. Auth state WhatsApp tidak boleh berada
  di direktori publik atau statis, source control, layer image container, atau volume bersama yang tidak dipercaya.
- QR dan pairing code dilindungi dari log dan dari pengamat tanpa izin. Log tidak memuat kredensial, pairing code,
  session key, secret pesan, atau payload sensitif.
- Endpoint webhook keluar membatasi tujuan dan memvalidasi tanda tangan provider, dengan vektor SSRF diperlakukan
  sebagai risiko utama sesuai kontrak ekosistem.
- Pemrosesan event idempoten dengan deduplikasi, proteksi replay dan kirim ganda, kuota serta rate limit per tenant
  dan per channel.
- Antrean bounded dengan backpressure, upaya dan kegagalan pengiriman dipersisten, shutdown graceful dan pemulihan
  sesi provider terdefinisi.
- Health/readiness mencerminkan kondisi database dan subsistem provider kritis, bukan sekadar proses hidup.
- Kebijakan backup, restore, dan retensi didefinisikan sebelum produksi.

## 5. Aturan UI

- `@moonwitness/ui` adalah mesin UI bersama; perilaku, primitif, dan aksesibilitas tidak di-fork.
- WCAG AA, navigasi keyboard, HTML semantik, state fokus, reduced motion, dan layout responsif berlaku penuh.
- State kosong, memuat, error, offline, dan tanpa izin harus jujur dan menyebut sebab serta tindakan berikutnya.
- Item menu non-fungsional tidak boleh dirender seolah fitur sudah jadi.
- Headquarter tidak menduplikasi inbox, komposisi pesan, pairing, atau kendali operator.

## 6. Gerbang kualitas

- Gate workspace berjalan penuh: `pnpm lint:arch`, `pnpm lint`, `pnpm typecheck`, `pnpm docs:check`, dan build setiap
  aplikasi terdampak, dengan log hasilnya dicatat pada laporan implementasi.
- Test integrasi memakai mock provider; test provider live hanya dengan kredensial test eksplisit dan akun aman.
- Verifikasi UI dilakukan pada ukuran desktop, tablet, dan mobile.
- Tidak ada klaim test, migrasi, keamanan, atau deployment selesai tanpa bukti.
