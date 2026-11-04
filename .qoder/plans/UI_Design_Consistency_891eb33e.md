# UI Design Consistency Wave

## Ringkasan

Empat hal membuat design UI tidak konsisten hari ini, dan semuanya terukur:

1. **Dua sistem token berjalan paralel.** `@moonwitness/ui` menghasilkan 32 CSS var `--mw-*` lewat `getSkinStyle` ([registry.ts](file:///z:/project/rocksoul-dx/packages/ui/src/skins/registry.ts)), sementara tiap app mendefinisikan `--background`/`--foreground` sendiri (hex di headquarter, oklch shadcn di empat app lain) dan memetakannya ke Tailwind lewat `@theme inline` lokal.
2. **Warna literal mengalahkan token.** 150 baris literal (hex/rgb/oklch) di CSS app versus 65 pemakaian `var(--mw-*)`.
3. **Kosakata komposisi diduplikasi per app.** kicker ×5, hero ×5, shell ×6, section heading ×4, kartu destinasi ×4, `.dark` ×4, `skip-link` hanya ada di gate.
4. **State dan penegakan bolong.** dock/headquarter/id tidak punya `error.tsx`/`loading.tsx`/`not-found.tsx` padahal `QUALITY.md` mewajibkannya; `apps/gate` tidak masuk CI; test paket UI tidak pernah dijalankan.

Strategi: **ratchet**. Tegakkan lebih dulu dengan baseline yang hanya boleh turun, lalu pindahkan tanggung jawab ke paket, lalu migrasi app satu per satu. Urutan ini dipilih karena repo ini sudah membuktikan bahwa aturan yang tidak ditegakkan akan melapuk tanpa ada yang sadar.

---

## Fase 0, Pra-kondisi dan keamanan kolaborasi

Sebelum menyentuh file apa pun:

- **T0.1** Jalankan `pnpm lint:arch`, `pnpm lint`, `pnpm typecheck`, `pnpm docs:check` dan catat hasilnya sebagai baseline. Semua harus hijau sebelum fase berikutnya mulai.
- **T0.2** Untuk setiap file target, cek `git status --porcelain -- <path>` sesaat sebelum mengedit. Repo ini sedang ditulis proses lain (terbukti: `apps/gate/src/components/transmissions-feed.tsx` sempat berisi JSX bersilangan, `BACKLOG.md` sempat terisi `[object Object]`). Jika file itu dirty oleh pihak lain, tunda dan kerjakan file lain.
- **T0.3** Satu app = satu commit, dan setiap commit harus lolos hook tanpa `--no-verify`.

**Dependensi:** tidak ada. Semua fase lain bergantung pada T0.1.

---

## Fase 1, Satu sumber token

Tujuan: hanya ada satu tempat yang mendefinisikan warna, tipografi, spacing, radius, shadow, dan motion.

- **T1.1** Buat `packages/ui/src/theme.css` yang berisi blok `@theme inline` kanonik, memetakan variabel Tailwind ke token skin, bukan ke nilai literal:
  ```css
  @theme inline {
    --color-background: var(--mw-canvas);
    --color-foreground: var(--mw-text);
    --color-surface: var(--mw-surface);
    --color-surface-raised: var(--mw-surface-raised);
    --color-border: var(--mw-border);
    --color-accent: var(--mw-accent);
    --color-muted: var(--mw-muted-text);
    --color-success: var(--mw-success);
    --color-danger: var(--mw-danger);
    --font-sans: var(--mw-font-body);
    --font-heading: var(--mw-font-heading);
    --font-mono: var(--mw-font-numeric);
    --radius-control: var(--mw-control-radius);
    --radius-surface: var(--mw-surface-radius);
  }
  ```
  Konvensi impor yang seragam di lima app (urutan penting karena cascade):
  ```css
  @import "tailwindcss";
  @import "@moonwitness/ui/theme.css";
  @import "@moonwitness/ui/skins.css";
  @import "tw-animate-css";
  ```
  Tambahkan `"./theme.css": "./src/theme.css"` ke `exports` di [packages/ui/package.json](file:///z:/project/rocksoul-dx/packages/ui/package.json).
- **T1.2** Hapus dari lima `apps/*/src/app/globals.css`: blok `--background/--foreground` (dock ~52-54 dan ~87-89, id ~53-54 dan ~88-89, jizz ~53-54 dan ~88-89, gate ~52-53 dan ~87-88, headquarter baris 5-6), blok `@theme inline` lokal (semua app, sekitar baris 8), dan blok `.dark { ... }` yang hanya menimpa variabel shadcn.
- **T1.3** Hapus `font-family: Arial, Helvetica, sans-serif` dari `body` di [apps/headquarter/src/app/globals.css](file:///z:/project/rocksoul-dx/apps/headquarter/src/app/globals.css) dan ganti menjadi `font-family: var(--mw-font-body)`, atau hilangkan deklarasi itu agar skin yang menentukan.
- **T1.4** Hentikan ekspor token warna deprecated: di [packages/ui/src/tokens/index.ts](file:///z:/project/rocksoul-dx/packages/ui/src/tokens/index.ts) hapus objek `tokens` (baris 1-31) dan pertahankan hanya re-export skin registry. Cari pemakai lebih dulu dengan grep `from '@moonwitness/ui/tokens'` dan `tokens.colors`; jika tidak ada, hapus bersih; jika ada, pindahkan pemakainya ke `--mw-*`.
- **T1.5** Selaraskan urutan impor `skins.css` di gate: saat ini `apps/gate/src/app/globals.css` tidak mengimpor `shadcn/tailwind.css` sementara dock/id/jizz mengimpornya. Putuskan satu kebijakan (rekomendasi: tidak mengimpor `shadcn/tailwind.css` sama sekali, karena gaya sudah dimiliki `skins.css`) dan terapkan seragam, termasuk menghapus `@import "shadcn/tailwind.css"` di dock/id/jizz.

**Dependensi:** T1.1 sebelum T1.2. T1.4 dan T1.5 independen setelah T1.2.
**Risiko:** Tailwind v4 hanya memproses `@theme` di file yang ikut graf CSS. Jika `theme.css` tidak terproses, utilitas warna app jadi bening.
**Mitigasi:** setelah T1.2, jalankan `pnpm dock:build` dan `pnpm headquarter:build`, lalu buka keduanya di browser dan pastikan `getComputedStyle(document.body).backgroundColor` sama dengan nilai `--mw-canvas` skin masing-masing, bukan `rgb(0,0,0)` atau transparan.

---

## Fase 2, Penegakan berupa ratchet

Tujuan: konsistensi tidak bisa kembali diam-diam.

- **T2.1** Tambah aturan `STYLE_PURITY` di [packages/lint/src/check-architecture.mjs](file:///z:/project/rocksoul-dx/packages/lint/src/check-architecture.mjs) yang memindai `apps/*/src/**/*.css`:
  - larang literal `#hex`, `rgb(`, `rgba(`, `oklch(`, `hsl(`, kecuali `transparent` dan `currentColor`;
  - larang deklarasi `--background:` dan `--foreground:`;
  - larang `font-family: Arial|Helvetica|system-ui` di luar token.
  Mulai dengan **baseline ratchet**: simpan jumlah temuan saat ini (150) di file `packages/lint/style-baseline.json`, gagal hanya jika jumlah naik. Turunkan baseline setiap kali satu app bersih, sampai 0.
- **T2.2** Tambah aturan `INLINE_STYLE_PURITY` untuk `apps/**/*.tsx`: flag `style={{ ... }}` yang memuat kunci `color`, `background`, `backgroundColor`, `border`, `borderColor`, `fontFamily`. Baseline awal 148 (semuanya di gate), ratchet yang sama.
- **T2.3** Tambah aturan `STATE_PARITY`: setiap direktori `apps/*/src/app` wajib punya `error.tsx`, `loading.tsx`, `not-found.tsx`. Aturan ini langsung gagal untuk dock, headquarter, id, dan itu memang yang diinginkan; tutup di Fase 4.
- **T2.4** Tambah aturan `SKIN_ROOT`: setiap `apps/*/src/app/layout.tsx` harus me-render `SkinRoot` dengan `skin` yang termasuk `skinIds`, dan satu skin tidak dipakai dua app.
- **T2.5** Sambungkan test paket UI yang sudah ada tapi tak pernah jalan: tambah script root `"ui:test": "tsx --test packages/ui/test/components.test.tsx packages/ui/test/skins.test.tsx packages/ui/test/audio.test.ts"` dan job `verify-tests` di [ci-dev.yml](file:///z:/project/rocksoul-dx/.github/workflows/ci-dev.yml) yang memanggilnya. Tambahkan `packages/ui/test/*.test.tsx` ke daftar `extension:test` hanya bila tidak duplikasi.
- **T2.6** Tambah `gate:build` di [package.json](file:///z:/project/rocksoul-dx/package.json) dan job `verify-gate` di `ci-dev.yml` yang memanggil `pnpm --filter @moonwitness/gate build`, lalu daftarkan `verify-gate` pada kebutuhan `promote-to-main`.
- **T2.7** Perbarui `AGENTS.md` (Invariants + Quality Gates), `QUALITY.md` (Frontend Standards), dan `DESIGN.md` (Implementation Rules) agar menyebut aturan baru ini. Ganti kalimat "Primitives engine: Base UI" menjadi kebijakan native-first yang benar-benar dipakai kode, dan tambahkan satu entri ADR di `DECISIONS.md` untuk keputusan itu. Naikkan versi frontmatter dan tambahkan entri `CHANGELOG.md`.

**Dependensi:** T2.1 dan T2.2 harus hadir sebelum Fase 5 supaya tidak ada regresi diam-diam. T2.5 dan T2.6 bisa berjalan paralel sejak awal.
**Risiko:** linter CSS bisa salah tangkap (mis. hex di dalam komentar atau data URI).
**Mitigasi:** pakai penghapusan komentar yang sudah ada (`stripComments`) dan kecualikan baris yang mengandung `data:`.

---

## Fase 3, Blok komposisi bersama di paket

Tujuan: kata benda desain yang sama punya satu implementasi.

Tambahkan di `packages/ui/src/blocks/`, diekspor lewat `blocks/index.ts`, dengan gaya di `skins.css` memakai kelas `mw-*` dan varian per dunia:

| Blok | Menggantikan | Kelas |
|---|---|---|
| `Kicker` | `dock-kicker`, `hq-kicker`, `id-kicker`, `jizz-kicker`, `gate-kicker` | `mw-kicker` |
| `PageHero` (props: `title`, `summary`, `actions`, `media`, `captionLeft`, `captionRight`) | `dock-hero*`, `hq-home__hero*`, `jizz-hero*`, `gate-hero*`, `id-auth-aside*` | `mw-hero` |
| `SectionHeading` (props: `title`, `description`, `trailing`) | `dock-index__heading`, `hq-modules__heading`, `jizz-records__heading`, `gate-section__heading` | `mw-section-heading` |
| `RouteShell` (props: `title`, `kicker`, `children`) | `dock-page`, `hq-route`, `hq-shell__content`, `id-account-page`, `jizz-page`, `gate-page` | `mw-route` |
| `StatusMessage` (props: `tone: 'info' \| 'success' \| 'warning' \| 'danger'`, `role` otomatis) | `dock-auth-notice`, `hq-shell__notice`, `remote-agent-control__message(--error)`, banner error di `ai-gateway`/`tools`/`swarm` | `mw-status` |
| `DestinationCard` (props: `index`, `role`, `title`, `description`, `href`, `external`) | `dock-destination*`, `hq-module*`, `universe-destination*`, `gate-closing-horizon__destinations` | `mw-destination` |
| `StatePanel` (props: `kind: 'empty' \| 'loading' \| 'error' \| 'offline' \| 'permission'`, `cause`, `nextAction`) | `jizz-empty*`, `jizz-state*`, `gate` error/loading/not-found, dan semua state yang belum dibuat | `mw-state` |

Aturan desain untuk blok-blok ini:

- Hanya properti; tidak ada logika bisnis, tidak ada fetch.
- Aksi dirender lewat `Button`, `Link`, atau `LinkButton` yang sudah ada, bukan elemen native baru.
- Semua warna, radius, gap, shadow, font lewat `var(--mw-*)`. Tidak ada literal di `skins.css` untuk blok baru ini.
- Varian per dunia ditulis di blok `[data-moonframe-skin='...']` yang sudah ada, mengikuti pola `mw-card` dan `mw-dialog` yang sekarang, supaya enam DNA tetap berbeda secara nyata.
- `StatePanel` wajib memenuhi aturan yang sudah didokumentasikan: menyebut sebab dan tindakan berikutnya, memakai `role="status"` atau `role="alert"`, dan tidak mengandalkan warna saja.
- Setiap blok baru diuji di `packages/ui/test/components.test.tsx` mengikuti pola yang sudah ada (`renderToStaticMarkup` + assertion pada markup), termasuk assertion bahwa `StatePanel` menghasilkan `role` yang benar.

**Dependensi:** Fase 1 (butuh token tunggal yang benar) sebelum blok distyling. Blok harus ada sebelum Fase 4/5 memigrasi app.

---

## Fase 4, Parity state di lima app

- **T4.1** Buat `error.tsx`, `loading.tsx`, `not-found.tsx` di `apps/dock/src/app`, `apps/headquarter/src/app`, `apps/id/src/app`, memakai `StatePanel` dan `Button` dari paket. Contoh rujukan gaya yang sudah benar: [apps/jizz/src/app/error.tsx](file:///z:/project/rocksoul-dx/apps/jizz/src/app/error.tsx) dan [apps/gate/src/app/loading.tsx](file:///z:/project/rocksoul-dx/apps/gate/src/app/loading.tsx).
- **T4.2** Ganti pola state inline di app yang sudah punya file state (jizz, gate) dengan `StatePanel`, dan hapus kelas `jizz-empty*`, `jizz-state*` dari globals.css mereka.
- **T4.3** Tambah skip-link yang konsisten: pindahkan `skip-link` dari `apps/gate/src/app/globals.css` ke `skins.css` sebagai `mw-skip-link`, dan render di semua layout.
- **T4.4** Samakan permukaan status: `dock-auth-notice`, `hq-shell__notice`, dan `remote-agent-control__message` menjadi `StatusMessage`.
- **T4.5** Hapus 8 override warna Tailwind yang tersisa di kode app: [apps/id/src/app/layout.tsx](file:///z:/project/rocksoul-dx/apps/id/src/app/layout.tsx) baris 17, dan `apps/jizz/src/app/{error,loading,not-found,layout}.tsx` baris 9-19.

**Dependensi:** T3 (StatePanel) wajib selesai lebih dulu. Setelah T4.1 selesai, baseline `STATE_PARITY` di T2.3 bisa dihapus menjadi larangan mutlak.

---

## Fase 5, Migrasi app ke blok bersama

Urutan dari yang paling kecil risiko ke yang paling besar: **id → dock → jizz → gate → headquarter**.

Untuk setiap app:

1. Ganti kelas lokal dengan blok paket: hero, kicker, section heading, shell, status, kartu destinasi.
2. Hapus deklarasi kelas yang sudah tidak dipakai dari `apps/<app>/src/app/globals.css`.
3. Turunkan baseline `STYLE_PURITY` app itu (T2.1) sampai nol.
4. Untuk gate saja: turunkan baseline `INLINE_STYLE_PURITY` dari 148 ke nol dengan memindahkan gaya ke kelas `mw-*` atau ke globals yang berbasis token. File yang paling padat: `apps/gate/src/components/closing-horizon.tsx`, `explore-index.tsx`, `transmissions-feed.tsx`, `universe-map.tsx`, `discover-filters.tsx`.
5. Verifikasi: `pnpm lint:arch`, build app itu, lalu buka di browser pada tiga lebar (360, 768, 1440) dan bandingkan dengan screenshot sebelum/sesudah.

Setelah headquarter selesai, hapus baseline ratchet dan jadikan kedua aturan itu mutlak.

**Dependensi:** Fase 3 dan Fase 4. Fase 2 harus aktif supaya langkah 3 dan 4 terverifikasi otomatis.

---

## Fase 6, Keputusan DNA dan pembuktiannya

- **T6.1** Tetapkan satu skin per app dan dokumentasikan. Usulan: dock `imperium-lumen`, id `lunar-chronicles`, headquarter `nexus-paradox`, jizz `mycelium`, gate `rocksoul`. `riot-anarchy` tidak terikat app dan tetap dibuktikan lewat SkinLaboratory. Ini mengubah kondisi hari ini di mana dock dan gate memakai skin yang sama dan dua dunia tidak pernah dipakai app.
- **T6.2** Perbarui [DNA/07-COMPONENT-MAPPING.md](file:///z:/project/rocksoul-dx/DNA/07-COMPONENT-MAPPING.md) matriksnya agar menyebut blok nyata hasil Fase 3 (`PageHero`, `SectionHeading`, `StatusMessage`, `DestinationCard`, `StatePanel`) untuk tiap baris tugas, dan tandai mana yang sudah diimplementasi versus masih spesifikasi, karena dokumen itu sendiri menyatakan "design specification, not evidence".
- **T6.3** Perluas `SkinLaboratory` ([packages/ui/src/blocks/skin-laboratory.tsx](file:///z:/project/rocksoul-dx/packages/ui/src/blocks/skin-laboratory.tsx)) supaya enam dunia menampilkan blok baru yang sama, termasuk narrow-screen dan reduced-motion, sesuai sembilan butir Showcase Requirement di DNA 07.
- **T6.4** Verifikasi kontras nyata, bukan klaim: untuk tiap skin, uji pasangan `--mw-text` di atas `--mw-canvas` dan `--mw-muted-text` di atas `--mw-surface` dengan kalkulator kontras, dan catat rasio aktualnya di report.

**Dependensi:** Fase 3 dan Fase 5.

---

## Fase 7, Penutup kontrak

- **T7.1** Perbarui `AGENTS.md`, `QUALITY.md`, `DESIGN.md`, `DECISIONS.md`, `CHANGELOG.md` dengan hasil akhir: aturan baru, blok baru, satu sumber token, dan daftar kelas app yang dihapus.
- **T7.2** Buat `.plans/<timestamp>-ui-design-consistency/` berisi `spec.md`, `task.md`, `design.md`, `rules.md`, dan `report.md`. `report.md` hanya berisi perintah yang benar-benar dijalankan beserta outputnya.
- **T7.3** Gerbang akhir, semuanya harus hijau: `pnpm lint:arch` (dengan `STYLE_PURITY`, `INLINE_STYLE_PURITY`, `STATE_PARITY`, `SKIN_ROOT` tanpa baseline), `pnpm lint`, `pnpm typecheck`, `pnpm docs:check` 100/100, `pnpm ui:test`, dan lima build app.

---

## Peta dependensi

```
F0 (baseline) ──> F1 (satu token) ──> F3 (blok bersama) ──> F5 (migrasi app) ──> F7 (penutup)
              └─> F2 (ratchet + CI) ────────────────────────┘                └─> F6 (DNA + bukti)
F4 (state parity) bergantung pada F3, dan membuka jalan bagi F5
```

F1 dan F2 dapat dikerjakan paralel. F6 bergantung pada F3 dan F5. F7 terakhir.

---

## Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Tailwind tidak memproses `theme.css` | Warna utilitas app jadi bening, tampilan runtuh senyap | Uji build + periksa `getComputedStyle` di tiga app pertama yang dimigrasi, sebelum menyentuh sisanya |
| Menghapus `.dark` mengubah tema light | App yang selama ini mengandalkan `.dark` kehilangan gaya | Cek pemakaian `class="dark"` di `layout.tsx` (id memakainya di `<html>`), pindahkan ke keputusan skin eksplisit, jangan biarkan dua mekanisme |
| Ratchet CSS salah hitung | Lint gagal palsu dan orang mulai mengabaikan gate | Baseline disimpan di file, komentar dan `data:` dikecualikan, dan kegagalan menyebut angka saat ini versus baseline |
| Konflik dengan agen lain yang sedang menulis | Edit saling menimpa, JSX rusak seperti yang sudah terjadi | T0.2: cek status git per file sebelum edit, satu app per commit, jangan pernah menulis ulang file yang sedang dirty |
| Migrasi gate besar (148 inline style) | Diff raksasa, sulit direview | Pecah per komponen, lima commit terpisah, baseline turun bertahap |
| Blok baru dianggap memaksakan satu tampilan | Enam DNA jadi seragam dan kehilangan identitas | Setiap blok wajib punya varian per `[data-moonframe-skin]` dan dibuktikan di SkinLaboratory, bukan hanya diklaim |

---

## Alternatif yang ditolak

1. **Langsung hapus semua CSS app tanpa blok pengganti.** Menyatukan gaya dengan cara memaksa app memakai utilitas Tailwind mentah justru memindahkan inkonsistensi ke JSX, dan menghapus perbedaan DNA yang merupakan kontrak produk.
2. **Menegakkan konsistensi lewat review manual dan checklist.** Sudah terbukti gagal di repo ini: `UI_PURITY` melaporkan PASS 100% di atas 24 pelanggaran, dan test paket UI ada tetapi tidak pernah dijalankan oleh script maupun CI apa pun.
3. **Membangun sistem tema baru (mis. token JSON terpisah atau CSS-in-JS).** Menambah sumber kebenaran keempat di samping `--mw-*`, shadcn vars, dan `@theme`. Masalahnya bukan kurang kerangka kerja, melainkan dua kerangka yang berjalan bersamaan.
4. **Mengembalikan `@base-ui/react` sebagai mesin primitif.** `DESIGN.md` memang menulis begitu, tapi paket kini sengaja native-first (`<select>`, `<dialog>`, `<table>`) dan dependensinya sudah dihapus karena tak terpakai. Rencana ini menyelaraskan dokumen ke kode lewat ADR, bukan membalikkan kode ke dokumen yang sudah usang.
5. **Mengganti seluruh skin assignment lebih dulu sebelum konsistensi.** Perubahan DNA adalah keputusan produk; melakukannya lebih awal akan membuat setiap diff migrasi visual sulit dibedakan dari perubahan identitas.
6. **Menambah `apps/gate` ke CI di akhir.** Justru pintu yang paling murah dan paling tinggi nilainya, karena gate adalah app dengan penyimpangan terbanyak (148 inline style, satu-satunya yang belum punya aturan). Dinaikkan ke Fase 2.