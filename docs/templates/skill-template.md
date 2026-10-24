# Template Pembuatan Skill Antigravity Baru

> Gunakan format ini untuk merancang skill baru di `.agents/skills/<nama-skill>/SKILL.md`.

```markdown
---
name: <nama-skill>
description: >-
  Jelaskan KAPAN dan APA yang dilakukan skill ini dalam 2-4 kalimat (sudut pandang orang ketiga).
  Ini adalah teks yang dibaca oleh agent Antigravity saat mengevaluasi relevansi skill.
  Contoh: "Use this skill when the user asks to [X]. This skill performs [Y] by doing [Z]."
---

# <Judul Skill>

Deskripsi singkat mengenai fungsi dan batasan skill ini.

## Inputs
- <Input yang dibutuhkan dari user atau file proyek>

## Steps
1. **Plan First (Gate Konfirmasi).**
   - Baca file yang relevan.
   - Susun rencana perubahan terstruktur.
   - Tampilkan rencana ke user.
   - **BERHENTI.** Tunggu persetujuan (`approve`) user sebelum menyentuh file apa pun.
2. **Eksekusi.**
   - Lakukan tugas hanya sesuai rencana yang disetujui.
3. **Verifikasi.**
   - Jalankan perintah pengecekan (misal: test runner, linter, atau typecheck).
4. **Laporan & Saran.**
   - Laporkan hasil dalam format yang rapi dan sarankan langkah berikutnya.

## Output format
<Deskripsikan struktur output yang diharapkan>

## Rules
- DILARANG mengedit file sebelum rencana diapprove.
- <Aturan "do not" spesifik lainnya>
```

---

## ✅ Checklist Standar Skill Antigravity
- [ ] Folder berada di `.agents/skills/<nama-skill>/`
- [ ] File bernama persis `SKILL.md` (huruf kapital)
- [ ] Field `name` di frontmatter sama dengan nama folder (huruf kecil, tanda hubung)
- [ ] Field `description` ditulis dalam sudut pandang orang ketiga dan menjelaskan trigger-nya
- [ ] Tidak ada field khusus Copilot (`disable-model-invocation`)
- [ ] Terdapat langkah "Plan first" yang mewajibkan konfirmasi manusia
- [ ] Materi dokumentasi panjang dipisahkan ke subfolder `references/`
