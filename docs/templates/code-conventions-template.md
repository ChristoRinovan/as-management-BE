# Template Code Conventions & Project Preferences

> File ini dihasilkan saat setup project atau diisi manual oleh developer.
> Semua skill (`code-development`, `write-tests`, `review-code`, `generate-commit`)
> akan membaca file ini sebagai sumber kebenaran (source of truth) konvensi koding.

## 1. Tech Stack & Environment
- **Project Structure**: [Monorepo (pnpm workspace / Turborepo) / Standalone App / Microservices]
- **Language & Runtime**: [e.g. TypeScript (Node.js 20+), Python 3.11, Go, etc.]
- **Framework(s)**: [e.g. Next.js App Router (Frontend) / Express (Backend) / FastAPI]
- **State & Data**: [e.g. Zustand, Prisma ORM, TanStack Query, Postgres]
- **Test Runner & Tools**: [e.g. Vitest, Jest, Pytest, Playwright]
- **Package Manager & Commands**:
  - Install: `[pnpm install / npm install / poetry install]`
  - Dev: `[pnpm dev / npm run dev]`
  - Test: `[pnpm test / npm test]`
  - Build: `[pnpm build / npm run build]`

---

## 2. Struktur Direktori Proyek
```text
[Tuliskan struktur direktori proyek Anda di sini, misalnya:]
src/ (atau app/ dan lib/ untuk Next.js, packages/* untuk monorepo)
├── ...
```

---

## 3. Gaya Koding & Arsitektur (Code Convention)

### Preset yang Dipilih:
> [Pilih salah satu atau custom:]
> - **Style A (Compact)**: Logic inline di file utama/halaman, file lebih sedikit, cepat untuk MVP.
> - **Style B (Componentized / Layered)**: Pemisahan ketat antara Handler/UI, Service (business logic), dan Data access layer.
> - **Custom**: Mengikuti file contoh kode yang ditempel oleh developer di bawah.

### Aturan Spesifik:
- **Deklarasi Fungsi**: [Arrow functions `const fn = () => {}` / Function declaration `function fn() {}`]
- **Penamaan**:
  - File: [kebab-case / camelCase / PascalCase]
  - Variabel & Fungsi: [camelCase]
  - Types / Interfaces / Classes: [PascalCase]
  - Konstanta: [UPPER_SNAKE_CASE]
- **Type Safety**: [Strict TypeScript (no any, explicit return types) / Dynamic with hints]
- **Imports**: [Absolute path with alias `@/*` / relative path]
- **Error Handling**: [Throw custom errors / Result type pattern / Centralized error middleware]
- **Styling (Jika ada UI)**: [Tailwind CSS / CSS Modules / Vanilla CSS / No styling]

---

## 4. Alur Kerja Pembangunan (Preferred Build Flow)
- **Urutan Pengerjaan per Fitur**:
  - [Opsi 1: Logic-first → Bangun domain/logic/services dulu, lalu UI/API route, test terakhir]
  - [Opsi 2: UI-first → Mock UI dulu sampai disetujui, lalu sambungkan backend/storage logic]
  - [Opsi 3: Test-driven → Tulis test dulu, lalu kode sampai pass]
  - [Opsi 4: Custom workflow]

---

## 5. Konvensi Commit Message
- **Format**: [Conventional Commits (`feat(scope): desc`) / Plain English / Ticket ID prefix (`PROJ-123: desc`)]
- **Bahasa**: [Bahasa Inggris / Bahasa Indonesia]
- **Aturan Body**: [Opsional, jelaskan 'why' bukan hanya 'what']

---

## 6. Contoh File Referensi (Golden Samples)
```typescript
// Tempelkan 1-2 contoh potongan kode ideal proyek Anda di sini jika ada:
```
