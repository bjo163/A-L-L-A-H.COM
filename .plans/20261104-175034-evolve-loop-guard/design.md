# Design

## Scope

Plan ini tidak menyentuh UI aplikasi. Tidak ada `apps/*` yang diubah. Perubahan terbatas pada dokumentasi proses (`AUTONOMOUS.md`), kanonikal status task (`BACKLOG.md`), dan pembersihan direktori plan.

## State Transisi BACKLOG (yang akan diterapkan)

| Capability | Status sekarang | Status target | Alasan |
|---|---|---|---|
| 4 | VERIFIED | VERIFIED (pertahankan) | Legit: membangun `apps/gate`; punya `report.md` |
| 6,7,8,9,10,11,12 | VERIFIED | DISCOVERED (koreksi) | Tidak ada kode nyata, `report.md` klaim tanpa bukti |
| 13 | READY | DISCOVERED (koreksi) | Plan hanya template kosong, belum ada spesifikasi |

Catatan: capability 5 tidak ada di BACKLOG (lompat ke 6). Capability 12 punya dua direktori plan duplikat (`...-12` dan `...-12-new-platform-capability`).

## Prinsip Dokumentasi

- Tidak menghapus baris history BACKLOG; hanya mengubah status + menambah satu baris alasan.
- Satu kanonikal dokumen per subjek (`DOCUMENTATION_CONTRACT.md`): status task di `BACKLOG.md`, proses eksekusi di `AUTONOMOUS.md`.
- `report.md` plan ini wajib berisi perintah yang benar-benar dijalankan + hasil (bukan klaim).