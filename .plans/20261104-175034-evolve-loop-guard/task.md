# Task: Evolve Loop Guard

- [x] AUDIT: inventarisasi semua plan capability (4-13), tentukan mana yang punya kode nyata vs template kosong
- [x] VERIFY: kumpulkan bukti dari `report.md` tiap plan; tandai yang berisi klaim tanpa evidence
- [x] DOC: koreksi `BACKLOG.md` (turunkan status, tambah baris alasan per item)
- [x] DOC: update `AUTONOMOUS.md` section 8 dengan guard spesifikasi-nyata, guard bukti `report.md`, guard anti-penumpukan
- [x] CLEANUP: hapus direktori plan duplikat/untracked template-kosong (capability 12, 12-new, 13)
- [x] VERIFY: jalankan `pnpm docs:check` (PASS 100/100) dan `pnpm lint:arch` (PASS 100%)
- [x] VERIFY: jalankan `pnpm typecheck` (FAIL, pre-existing breakage di arsy-plugin-llm-gateway/src/cache.ts dan sentinel-radius, di luar perubahan plan ini)
- [x] DOC: tulis `report.md` dengan bukti perintah yang dijalankan
- [ ] PUSH: commit semua perubahan plan ini dan push ke `dev` (push mungkin terblokir pre-push gate oleh breakage pre-existing)