# CHANGELOG

## Versi ini — dukungan "mulai dari cerita, tanpa PRD"

### Ditambahkan
- **Pintu masuk (triage)** di `build-app-workflow`: Jalur A (sudah tahu stack) vs Jalur B (baru punya cerita).
  Jalur B mengubah urutan menjadi Fase 1 → Fase 0.
- **`research-to-prd`**: tahap Discovery (6 topik, satu pertanyaan per giliran, maks 6, "belum tahu" sah),
  Ringkasan Pemahaman berbukti dengan gate sendiri, tag `[Dari cerita]` / `[Asumsi]`, Open Questions terisi,
  dan penyimpanan `docs/research-synthesis.md`.
- **`setup-project` Mode Rekomendasi**: membaca PRD dan mengusulkan stack, gaya koding, build flow, commit,
  dan test runner beserta alasan awam. Panduan di `references/stack-recommendation-guide.md`. Berhenti dan
  mengarahkan ke `research-to-prd` bila PRD belum ada.
- **Skill baru `prd-to-design`** → `docs/design.md` (menggantikan prompt manual `design-prompt.md` yang berasal dari versi Copilot).
- **Fase 1b** (Desain UI) di orchestrator, SOP, dan diagram.
- **Mode Pendamping**: setiap perintah terminal dijelaskan (lokasi, fungsi, tanda berhasil, jika error).

### Diubah
- `code-development`: berhenti jika `docs/prd.md` tidak ada, atau fitur ber-UI tidak punya `docs/design.md`.
- Template PRD: bagian Open Questions berbentuk tabel; checklist anti-karang dan "tanpa keputusan teknologi".
- `docs/templates/research-synthesis.md`: diganti template bukti-dari-cerita (tanpa prompt Lab C).
- `docs/templates/design-prompt.md`: dijadikan prompt cadangan; referensi `docs/skill-recipes.md` yang tidak ada dihapus.
- README: jumlah skill dikoreksi (9), struktur dan panduan penggunaan diperbarui.

### Diperbaiki
- Arsip zip memakai pemisah path `/` (sebelumnya `\`, bermasalah di Linux/macOS).
- Folder kosong `setup-project/references/` kini berisi panduan rekomendasi.
