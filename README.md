# 🏭 Skill Factory — Antigravity Edition (Stack-Agnostic)
> Framework pembuatan dan orkestrasi **Antigravity AI Skills** berbasis materi *Spec-Driven Development*.

Framework ini **stack-agnostic** (tidak terkunci pada Express/Node.js saja) dan bisa dipakai oleh dua tipe user:

- **Developer yang sudah tahu stack-nya** → Jalur A: wawancara teknis lebih dulu (Fase 0), lalu PRD.
- **Orang yang hanya punya ide/cerita, tanpa PRD dan tanpa latar teknis** → Jalur B: cukup bercerita. Agent menggali
  ceritamu, menulis PRD, lalu **merekomendasikan** stack, gaya koding, dan format commit beserta alasannya.
  Kamu tinggal menyetujui atau mengganti.

> [!CAUTION]
> **ATURAN MUTLAK INSTALASI DEPENDENSI (HUMAN-EXECUTED):**
> Kapan pun proyek membutuhkan instalasi package, library, atau framework, **AGENT DILARANG MENGINSTALL OTOMATIS**.
> Agent wajib berhenti, memberikan baris perintah terminal (`npm i <package>` / `pnpm add <package>`), dan menunggu
> Anda menjalankannya di terminal. Di Jalur B, tiap perintah dijelaskan: di mana menjalankannya, fungsinya, tanda berhasil,
> dan apa yang dilakukan jika error.

---

## 📦 Isi Paket Zip

```text
skill-factory-antigravity/
│
├── README.md                               ← Panduan utama (file ini)
│
├── docs/                                   ← Panduan SOP & Template
│   ├── SOP-Skill-Factory.md                ← SOP lengkap (pintu masuk + 5 fase)
│   ├── Master-Workflow-Architecture.md     ← Diagram alur Jalur A / Jalur B
│   ├── CHANGELOG.md                        ← Daftar perubahan versi ini
│   └── templates/
│       ├── code-conventions-template.md    ← Template profil koding & tech stack
│       ├── prd-template.md                 ← Template PRD 1 halaman (dengan Open Questions)
│       ├── research-synthesis.md           ← Template ringkasan berbukti dari cerita
│       ├── design-prompt.md                ← Prompt cadangan manual untuk deskripsi UI
│       ├── skill-template.md               ← Template untuk membuat skill baru
│       └── style-samples/                  ← Contoh kode referensi (Style A & Style B)
│
├── .agents/skills/                         ← 9 SKILL UTAMA (Cara 1: Manual)
│   ├── setup-project/                      ← Fase 0: Mode Mandiri / Mode Rekomendasi
│   │   └── references/stack-recommendation-guide.md
│   ├── research-to-prd/                    ← Fase 1: Cerita → Discovery → PRD berbukti
│   │   └── references/ (prd-template.md, research-synthesis-template.md)
│   ├── prd-to-design/                      ← Fase 1b: PRD → docs/design.md (jika ada UI)
│   │   └── references/design-template.md
│   ├── code-development/                   ← Fase 2: Implementasi 1 fitur (Plan first)
│   │   └── references/code-conventions.md
│   ├── write-tests/                        ← Fase 2: Test pengunci perilaku (PASS)
│   ├── debug-fix/                          ← Fase 2: Diagnosis & fix kode (bukan test)
│   ├── generate-commit/                    ← Fase 2: Commit message terstandar
│   ├── review-code/                        ← Fase 3: Audit kualitas (Report only)
│   │   └── references/review-checklist.md
│   └── generate-docs/                      ← Fase 3: Inline comments & update README
│
└── orchestrator/.agents/skills/            ← ORCHESTRATOR TERPISAH (Cara 2)
    └── build-app-workflow/SKILL.md         ← Triage Jalur A/B + mengorkestrasi semua fase
```

---

## 🚀 Cara Menggunakan di Proyek Anda

### Pilihan B — Master Orchestrator (disarankan untuk pemula / hanya punya cerita)
1. Salin folder `.agents/` ke root proyek Anda.
2. Salin folder `build-app-workflow` dari `orchestrator/.agents/skills/` ke `.agents/skills/` proyek Anda.
3. Di chat Antigravity cukup katakan, misalnya:
   > *"Mulai project baru dari nol"* atau *"Aku punya ide aplikasi, tolong bantu dari awal"*

   Agent akan bertanya satu hal: apakah kamu sudah tahu stack atau baru punya cerita. Lalu ia memandu sisanya:
   - **Jalur B (cerita):** bercerita bebas → agent bertanya hal yang kurang (maks 6 pertanyaan, satu per satu) →
     ringkasan pemahaman → PRD → rekomendasi stack → desain UI (jika ada) → bangun fitur satu per satu.
   - **Jalur A (sudah tahu stack):** wawancara stack → PRD → desain UI (jika ada) → bangun fitur.

### Pilihan A — Pemanggilan Manual (kontrol penuh)
Panggil skill sesuai tahap. Urutan Jalur B: `research-to-prd` → `setup-project` → `prd-to-design` → build loop.
Urutan Jalur A: `setup-project` → `research-to-prd` → `prd-to-design` → build loop.

- *"Gunakan skill research-to-prd"* — ceritakan idemu; agent menggali dan menyusun PRD.
- *"Gunakan skill setup-project"* — jawab sendiri, atau katakan *"belum tahu, rekomendasikan saja"*.
- *"Gunakan skill prd-to-design"* — deskripsi tampilan setiap halaman (dilewati bila tidak ada UI).
- *"Gunakan skill code-development untuk US-1"* — mulai koding (agent berhenti dan memberi `npm i <pkg>` jika perlu).
- *"Gunakan skill write-tests untuk US-1"* — kunci perilaku dengan test.
- *"Gunakan skill generate-commit"* — commit.
- *"Gunakan skill review-code"* — audit kualitas.
- *"Gunakan skill generate-docs"* — dokumentasi.

### Catatan Penting
- `code-development` **berhenti** jika `docs/prd.md` tidak ada, atau jika fitur ber-UI tidak punya `docs/design.md`.
  Ia tidak akan menebak.
- Semua rekomendasi agent (stack, gaya koding, tampilan) **baru berlaku setelah kamu `approve`**.
- Persona dan bukti di PRD hanya berasal dari ceritamu; hal yang disimpulkan agent ditandai `[Asumsi]` dan masuk Open Questions.
