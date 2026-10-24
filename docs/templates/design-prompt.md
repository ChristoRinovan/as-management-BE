# Prompt UI Design (Cadangan Manual)

> **Catatan:** Di Skill Factory versi ini, pembuatan `docs/design.md` sudah ditangani oleh skill
> **`prd-to-design`** (`.agents/skills/prd-to-design/`). Gunakan skill itu sebagai jalur utama.
>
> File ini hanya **cadangan** jika kamu ingin membuat deskripsi UI di luar agent (misalnya di chat
> ChatGPT/Claude/Gemini biasa). Hasilnya disimpan sebagai `docs/design.md` dan akan dibaca oleh
> `code-development`. Format lengkap dan preset ada di
> `.agents/skills/prd-to-design/references/design-template.md`.

## Prompt

```
Role: You are a product/UX-minded engineer. There is no design tool involved —
describe the UI precisely enough that a developer can build it directly from
your words.

Task: From the attached docs/prd.md (and docs/research-synthesis.md for personas),
describe the UI for every page the MVP needs.

For EACH page, write:
1) Layout: the zones top to bottom (header, main sections, footer) in plain words.
2) Key UI elements per zone: forms (fields + order), lists/tables (columns),
   buttons (label + what happens when clicked).
3) States: what the user sees when empty (no data yet), loading, error, success.
4) Navigation: how the user arrives at/leaves this page.
5) Device priority: «CUSTOMIZE: pick a preset»
6) Visual style: «CUSTOMIZE: pick a preset»
7) Trace: which user story / acceptance criterion this page serves.
8) Write this document in Bahasa Indonesia.

Rules:
- Every element must trace to a user story or acceptance criterion in docs/prd.md.
  Do not invent features (no dark mode, no animations) unless they are in the PRD.
- Anything that seems needed but is not in the PRD goes into a separate section
  "Usulan di Luar PRD" — do not put it in the design.
- No code, no HTML, no CSS.

Format: one section per page.
```

## Preset

| Preset | Device priority | Visual style |
|---|---|---|
| **Mobile-first** | HP dulu, desktop menyesuaikan | Minimal: kartu polos, satu warna aksen, tanpa ikon |
| **Desktop/admin-first** | Layar lebar dulu | Dense: tabel padat, teks kecil |
| **Friendly** | — | Sudut membulat, satu emoji per empty state, palet lembut |

Preset boleh berbeda per halaman (halaman pelanggan vs halaman admin).
