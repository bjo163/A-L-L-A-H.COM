---
contract: "DOCUMENTATION_CONTRACT.md"
id: "EVOLVE_LOOP_GUARD"
version: "1.0.0"
owner: "engineering"
status: "in_progress"
---

# Plan: Evolve Loop Guard

## Motivation

Loop `EVOLVE` (`AUTONOMOUS.md` section 8) berdegenerasi menjadi slop berulang. Plan `NEW-PLATFORM-CAPABILITY-4` s.d. `-13` semuanya berjudul "New platform capability" dengan `spec.md`/`task.md`/`design.md`/`rules.md` berisi template kosong, tanpa requirement atau acceptance criteria yang terukur. BACKLOG menandai capability 4-12 sebagai `VERIFIED` padahal sebagian besar tidak menghasilkan kode nyata; `report.md` capability 12 mengklaim "Completed with all quality gates passing" tanpa bukti. Ini melanggar `DOCUMENTATION_CONTRACT.md` ("no invented estimates", "never imply skipped check passed") dan antislop R-36/R-38.

## Architecture Requirements

- Stop produksi plan "capability" generik yang tidak menambah nilai produk.
- BACKLOG tidak boleh menandai item `VERIFIED` tanpa `report.md` berisi bukti nyata.
- Guard di dokumentasi EVOLVE: plan baru wajib punya spesifikasi konkret sebelum dibuat.
- Batas penumpukan: tidak boleh ada plan baru bila masih ada plan `proposed`/`in_progress` yang menggantung.
- State kerja bersih: `BACKLOG.md` rapi, direktori plan duplikat/untracked ditangani, semua di-commit dan di-push ke `dev`.

## Acceptance Criteria

- [x] BACKLOG tidak lagi menandai capability tanpa kode sebagai `VERIFIED`; setiap baris punya status + satu baris alasan evidence-based.
- [x] `AUTONOMOUS.md` section 8 memuat: (a) guard spesifikasi-nyata sebelum plan dibuat, (b) guard bukti `report.md` sebelum `VERIFIED`, (c) guard anti-penumpukan plan.
- [x] Direktori plan duplikat/untracked yang isinya template kosong sudah dihapus, dengan alasan tercatat di `report.md`.
- [x] `report.md` plan ini mencatat perintah yang benar-benar dijalankan dan hasilnya (bukan klaim).
- [ ] `git status` bersih setelah commit; perubahan di-push ke `dev` (push tertunda karena breakage typecheck pre-existing di luar scope).

## Status

completed (code/deliverables done; push pending due to pre-existing typecheck breakage outside this change)