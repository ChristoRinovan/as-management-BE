# 🏭 Skill Factory: SOP & Master Workflow
> Framework pembuatan **Antigravity AI Skill** — skill yang hidup di workspace project kamu sebagai `.agents/skills/<name>/SKILL.md` dan diaktifkan oleh Antigravity agent secara otomatis maupun on-demand.

> [!IMPORTANT]
> Framework ini **stack-agnostic** (tidak terkunci pada framework tertentu). Baik Anda membangun aplikasi monorepo, Next.js, Express, FastAPI, atau Go, alur kerja selalu diawali dengan Fase Setup & Konvensi Koding agar agent mengetahui persis gaya koding, arsitektur, dan format commit yang Anda inginkan.

> [!CAUTION]
> **ATURAN MUTLAK INSTALASI DEPENDENSI:**
> Kapan pun proyek membutuhkan instalasi package, scaffolding, atau library pihak ketiga
> (baik di Fase 0 setup, Fase 2 koding, atau pengujian), **AGENT DILARANG MENJALANKAN INSTALASI SECARA OTOMATIS**.
> Agent wajib berhenti, memberikan baris perintah terminal (`npm i <package>` / `pnpm add <package>` / dll.),
> dan menunggu konfirmasi dari manusia bahwa instalasi telah selesai dijalankan secara manual di terminal.

---

## ⚡ PERBEDAAN KUNCI: Antigravity vs Copilot

| Aspek | Copilot (materi awal) | Antigravity (framework ini) |
|---|---|---|
| **Lokasi Folder** | `.github/skills/<name>/SKILL.md` | `.agents/skills/<name>/SKILL.md` |
| **Frontmatter** | `name`, `description`, `disable-model-invocation: true` | `name`, `description` (hanya 2 field utama) |
| **Aktivasi** | Mengetik manual `/<name>` | Otomatis oleh agent berbasis `description` + bisa dipanggil eksplisit |
| **Pemuatan Konteks** | Seluruh isi file skill dimuat sejak awal | Progressive Disclosure: hanya deskripsi dulu, isi dimuat saat aktif |
| **Instalasi Package** | Diinstruksikan scaffold terminal manual | **Gate Ketat:** Agent dilarang install otomatis; selalu stop & beri command `npm i` |
| **Penyesuaian Gaya** | Hardcoded di awal kelas | Fleksibel: Wawancara Fase 0 (Style A, Style B, atau Custom) |

---

## 📋 RINGKASAN ARSITEKTUR WORKFLOW (Pintu Masuk + 5 Fase)

Ada dua jalur masuk, dipilih lewat satu pertanyaan triage:

- **Jalur A** (sudah tahu stack / developer): Fase 0 → 1 → 1b → 2 → 3
- **Jalur B** (baru punya ide/cerita, tanpa PRD): **Fase 1 → 0 → 1b → 2 → 3** — PRD ditulis dulu dari cerita,
  lalu stack direkomendasikan berdasarkan PRD.

```text
💡 Ide / Permintaan Proyek
    ↓
[PINTU MASUK — Triage]        → Jalur A atau Jalur B
    ↓
[FASE 0 — Setup & Konvensi]   → Mode Mandiri (wawancara) ATAU Mode Rekomendasi (agent usulkan dari PRD)
                                🛑 GATE: User mengeksekusi perintah scaffolding / npm i di terminal
    ↓
[FASE 1 — Spesifikasi (PRD)]  → Discovery cerita → Ringkasan berbukti → docs/prd.md (User Story & AC)
    ↓
[FASE 1b — Desain UI]         → prd-to-design → docs/design.md (hanya jika produk punya UI)
    ↓
[FASE 2 — Build Loop]         → Per Fitur:
                                • code-development (Plan first → 🛑 GATE: npm i jika butuh package baru → Koding)
                                • write-tests (Plan first → 🛑 GATE: npm i runner jika butuh → Locking Tests)
                                • debug-fix (Hanya jika test gagal)
                                • generate-commit (Format sesuai konvensi Fase 0)
    ↓
[FASE 3 — Review & Docs]      → review-code (report only) → generate-docs (README & code comments)
    ↓
✅ Aplikasi / Fitur Siap Rilis
```

---

## 📐 MODUL A: SKILL BUILDER PIPELINE

### FASE 0 — Setup & Coding Conventions (Penyesuaian Gaya Developer)

**Tujuan:** Memastikan agent tidak berasumsi mengenai tech stack, struktur folder, atau gaya koding developer.

**Dua mode:**
- **Mode Mandiri:** user menjawab 4 pertanyaan teknis di bawah.
- **Mode Rekomendasi:** untuk user yang tidak tahu pilihan teknis. Agent membaca `docs/prd.md`, mengusulkan
  jawaban untuk keempat aspek dengan alasan berbahasa awam (panduan: `setup-project/references/stack-recommendation-guide.md`).
  Rekomendasi **bukan keputusan** sampai user `approve`. Jika PRD belum ada, agent berhenti dan mengarahkan ke `research-to-prd`.

**Dokumen yang dihasilkan:**
- `docs/project-config.md`
- `.agents/skills/code-development/references/code-conventions.md`

**4 Aspek Utama yang Ditetapkan:**
1. **Tech Stack & Workspace:** Monorepo (pnpm workspace/Turborepo) atau Standalone? Framework apa yang dipakai (Next.js, Express, dll.)?
2. **Gaya Koding (Preset):**
   - **Style A (Compact)**: Sedikit file, logic inline, arrow functions, cocok untuk MVP cepat.
   - **Style B (Componentized / Layered)**: Pemisahan ketat antara Route/UI, Service (business logic), dan Data access layer.
   - **Custom**: Developer menempelkan 1–2 file contoh kode mereka sendiri sebagai standar emas (Golden Sample).
3. **Preferred Build Flow:** Urutan kerja (Logic/Lib dulu baru UI/Route, UI-first, atau Test-driven).
4. **Format Commit Message:** Conventional Commits (`feat(scope): desc`), Plain English, atau format dengan nomor tiket.

**🛑 Gate Instalasi Terminal:** Jika proyek membutuhkan scaffolding atau instalasi package dasar, agent berhenti dan memberikan command kepada developer:
```bash
# Developer menjalankan ini secara manual di terminal:
npm install <package-name>
```

---

### FASE 1 — Research & PRD (Product Requirements Document)

**Tujuan:** Mengunci kebutuhan sistem dalam 1 halaman sebelum kode ditulis — **termasuk untuk user yang hanya punya cerita**.

**Dokumen:** `docs/prd.md`, `docs/research-synthesis.md`

**Alur `research-to-prd`:**
1. Terima cerita apa adanya.
2. **Discovery:** cek 6 topik (siapa, masalah, hasil, tempat pakai, yang ditunda, tanda berhasil). Tanyakan hanya yang kosong,
   satu pertanyaan per giliran, maksimal 6; "belum tahu" dicatat sebagai Open Question.
3. **Ringkasan berbukti:** persona dan pain point wajib berasal dari cerita (`[Dari cerita]`); sisanya ditandai `[Asumsi]`. Gate konfirmasi.
4. Draft PRD + Open Questions. Gate approve.

**Struktur Standar PRD:**
1. **Problem Statement**: Satu paragraf masalah nyata yang diselesaikan.
2. **Goals & Non-goals**: Apa yang dikerjakan vs apa yang secara tegas DITUNDA / out-of-scope.
3. **Personas**: Target pengguna utama.
4. **User Stories (Maksimal 4 untuk MVP)**: Format `As a... I want to... So that...`
5. **Acceptance Criteria**: Format `Given / When / Then` yang dapat dinilai lulus/gagal secara objektif.
6. **Open Questions**: hal yang belum diketahui dan asumsi yang perlu dikonfirmasi.

**✅ Gate Manusia:** Draft PRD disajikan kepada user. DILARANG menyimpan atau mulai koding sebelum user menyetujui cakupannya.

---

### FASE 1b — Desain UI (hanya jika produk punya antarmuka)

**Tujuan:** Agar UI tidak ditebak saat koding.

**Skill:** `prd-to-design` → `docs/design.md`

- Setiap halaman: layout, elemen, state (kosong/loading/error/sukses), navigasi, device priority, visual style, jejak US/AC.
- Preset direkomendasikan oleh agent (bukan pertanyaan kosong). Elemen yang tidak ada di PRD masuk "Usulan di Luar PRD".
- Dilewati untuk produk API/CLI. `code-development` akan berhenti jika fitur ber-UI tidak punya `docs/design.md`.

---

### FASE 2 — Build Loop (Iterasi Fitur)

Setiap fitur dikerjakan secara isolasi dalam siklus 4 langkah:

```text
1. code-development (Feature: US-X)
   └── Plan first → Cek package baru?
       ├── Jika butuh package: 🛑 STOP → Berikan `npm i <pkg>` ke user → Tunggu konfirmasi
       └── Implementasi kode → Explain-back

2. write-tests (Feature: US-X)
   └── Plan first → Cek test runner terpasang?
       ├── Jika belum ada: 🛑 STOP → Berikan `npm i -D <runner>` ke user → Tunggu konfirmasi
       └── Tulis test 1-to-1 dengan AC → Jalankan test runner (harus PASS)

3. debug-fix (Hanya jika test gagal)
   └── Diagnosis akar masalah → Perbaiki kode (DILARANG melemahkan test) → Uji ulang

4. generate-commit (Feature: US-X)
   └── Analisis git diff → Tampilkan usulan pesan sesuai konvensi Fase 0 → Commit setelah approve
```

**Aturan Besi Build Loop:**
- Satu fitur dalam satu waktu.
- Setujui rencana ("Plan first") SEBELUM file apa pun dibuat atau diubah.
- **Agent tidak boleh menginstall package sendiri.**
- Test datang SETELAH fitur diapprove untuk mengunci perilaku yang disetujui.
- Test gagal = perbaiki implementasi kode, BUKAN melonggarkan ekspektasi test.
- Satu fitur = satu commit yang bersih.

---

### FASE 3 — Review Kualitas & Dokumentasi

**1. Review Code (`review-code`):**
- **Report-only:** Sama sekali tidak mengedit file kode.
- Mengecek kesesuaian diff terhadap PRD, konvensi koding Fase 0, dan checklist kualitas 10 poin.
- Menyajikan temuan dalam tabel (`file:line`, masalah, severity, solusi yang disarankan).

**2. Generate Documentation (`generate-docs`):**
- Menambahkan dokumentasi fungsi inline (JSDoc/TSDoc/Docstrings) pada modul publik.
- Memperbarui `README.md` (cara instalasi, struktur folder, API/cara pakai, dan instruksi pengujian).

---

## 🔗 MODUL B: WORKFLOW ORCHESTRATOR

Workflow dapat dijalankan dengan 2 cara:

### Cara 1 — Manual Orchestration (Step-by-Step)
Developer memanggil skill individual sesuai kebutuhan:
Jalur A: `setup-project` → `research-to-prd` → `prd-to-design` (jika ada UI) → build loop.
Jalur B: `research-to-prd` → `setup-project` (Mode Rekomendasi) → `prd-to-design` (jika ada UI) → build loop.

1. `setup-project` → atur stack & gaya koding (developer jalankan `npm i` manual jika ada)
2. `research-to-prd` → buat PRD
3. `prd-to-design` → deskripsi UI (jika ada)
4. `code-development` → bangun fitur
5. `write-tests` → kunci fitur
6. `generate-commit` → simpan perubahan
7. `review-code` & `generate-docs` → audit & dokumentasi

### Cara 2 — Master Orchestrator (`build-app-workflow`)
Developer cukup memanggil satu skill orkestrator yang akan memandu seluruh alur dan menjaga gate secara otomatis:
> *"Mulai project baru dari nol"* atau *"Jalankan build-app-workflow"*

Skill orchestrator akan:
- Mengajukan satu pertanyaan triage untuk memilih Jalur A atau B
- Jalur A: wawancara Fase 0 (Mode Mandiri). Jalur B: PRD dari cerita dulu, lalu Fase 0 Mode Rekomendasi
- Menghentikan alur dan memberikan perintah terminal jika ada instalasi package
- Mengaktifkan `prd-to-design` bila produk punya UI
- Mengulang Build Loop untuk setiap User Story
- Menjalankan audit `review-code` dan pembuatan dokumentasi di akhir

---

## 🚦 PRINSIP UTAMA ANTI-VIBE-CODING

1. **Wawancara Sebelum Koding**: Jangan berasumsi mengenai stack atau struktur proyek; tetapkan di Fase 0 (mandiri atau lewat rekomendasi yang disetujui).
1a. **Cerita Dulu, Teknis Kemudian**: untuk user tanpa PRD, kebutuhan digali dari cerita sebelum stack dipilih.
1b. **Jangan Mengarang**: persona, bukti, dan angka harus berasal dari cerita user atau ditandai `[Asumsi]`.
2. **Human-Executed Installations**: Agent tidak boleh menjalankan instalasi library/dependencies di terminal secara otomatis. Agent wajib berhenti, memberikan baris perintah instalasi (`npm i ...`), dan menunggu manusia mengeksekusinya.
3. **Plan First, Always**: Setiap skill wajib menyajikan rencana dan berhenti menunggu konfirmasi sebelum menyentuh file.
4. **One Feature at a Time**: Hindari implementasi multitugas dalam satu langkah.
5. **Explain-Back Mandatory**: Agent wajib menjelaskan bagaimana kode yang dibuat memenuhi Acceptance Criteria.
6. **Tests Lock Behavior**: Test dibuat setelah fitur disetujui, berfungsi sebagai jaring pengaman regresi.
7. **Never Loosen Tests**: Jika test gagal, perbaiki kode aplikasinya, bukan test-nya.
8. **Review-Only is Sacred**: Skill review dilarang mengedit file; fungsinya murni audit independen.
