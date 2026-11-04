# Rules

## Invariants

- No fabricated claims. Status `VERIFIED` hanya boleh dipakai bila `report.md` berisi bukti nyata (perintah + hasil). Referensi: `DOCUMENTATION_CONTRACT.md` ("no invented estimates", "never imply skipped check passed").
- Satu kanonikal dokumen per subjek. Status task di `BACKLOG.md`; proses eksekusi di `AUTONOMOUS.md`; quality criteria di `QUALITY.md`. Jangan duplikasi aturan antar file.
- No em dash (`—`) dalam teks yang ditulis (antislop R-02). Gunakan koma, titik, titik dua, atau kurung.
- Directori plan dihapus hanya bila isinya sudah diverifikasi template kosong dan tidak dirujuk sebagai bukti kode nyata oleh BACKLOG.
- Tidak menyentuh kode aplikasi (`apps/*`, `packages/*`) dalam plan ini.
- Tidak ada batas waktu/estimasi usaha yang dibuat tanpa bukti.