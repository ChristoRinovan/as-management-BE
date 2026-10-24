# Project Configuration: Backend Manajemen Laporan Keuangan Pengeluaran

> Dokumen konfigurasi proyek aktif. Dihasilkan melalui skill `setup-project` dan mengacu pada standar di `docs/templates/style-samples/standards/`.

## 1. Tech Stack & Environment
- **Project Structure**: Standalone Backend API (Feature-based Vertical Slice Monolith)
- **Language & Runtime**: TypeScript 5+ (Node.js v24+)
- **Framework**: Express.js
- **Database & ORM**: PostgreSQL (Supabase) via Prisma ORM
- **File Storage**: Cloudinary (via Multer)
- **Email Service**: Nodemailer (SMTP gratis / Ethereal / Gmail App Password)
- **Validation**: Zod
- **Security & Auth**: Dual-channel (Bearer Token & HTTP-Only Cookie), JWT, Refresh Token Rotation (SHA-256 hash), bcryptjs
- **Test Runner**: Vitest
- **Package Manager**: npm

---

## 2. Universal Directory Layout
Mengadopsi standar `docs/templates/style-samples/standards/02_STRUCTURE.md`:
```text
BACKEND/
├── api/
│   └── index.ts                       # Serverless Entry Point
├── prisma/
│   ├── schema.prisma                  # Prisma Schema & Models
│   └── seed.ts                        # Initial Database Seeder
├── src/
│   ├── app.ts                         # Express App Factory (Middleware global & Route mounting)
│   ├── server.ts                      # Local HTTP Server (app.listen + Graceful Shutdown)
│   ├── configs/                       # Konfigurasi app, db, env, logger, cloudinary, mailer
│   ├── constants/                     # Centralized errors, roles, status
│   ├── helpers/                       # Helper response, pagination
│   ├── middlewares/                   # Auth guard, error-handler, rate-limiter, upload
│   ├── routes/
│   │   └── index.ts                   # Root Router Aggregator
│   ├── types/                         # Global Type Declarations (express.d.ts)
│   ├── utils/                         # Token, hashing, errors
│   └── features/                      # DOMAIN FEATURE SLICES (Vertical Slices)
│       ├── auth/                      # Fitur Registrasi Undangan, Aktivasi, Login
│       ├── user/                      # Manajemen Akun Anggota Tim
│       ├── expense/                   # Pencatatan Laporan & Bukti Nota
│       └── audit/                     # Review & Persetujuan (Approval) Laporan
├── .env.example
├── package.json
└── tsconfig.json
```

---

## 3. Gaya Koding & Arsitektur (Code Convention)
Mengikuti pedoman `01_ARCHITECTURE.md`, `03_CODING_STYLE.md`, `04_SECURITY_AUTH.md`, dan `05_ERROR_VALIDATION.md`:
- **Pola**: Feature-Based Modular Monolith with Vertical Slice Clean Architecture.
- **Batasan Layer**:
  - `routes.ts`: Hanya HTTP endpoints & auth guards.
  - `controller.ts`: Validasi input via Zod, panggil Service, return format standar `{ success, message, data }`. Tidak ada query database.
  - `service.ts`: Logika bisnis murni, penjaga aturan domain, melempar `ResponseError`. Bebas dari objek Express (`req`, `res`).
  - `repository.ts`: Akses database langsung via Prisma Client, transaksi atomik (`prisma.$transaction`), agregasi data level database.
  - `validation.ts`: Skema validasi Zod untuk `body`, `query`, dan `params`.
- **Penamaan**:
  - Folder fitur: `kebab-case`
  - Nama file layer: Strictly singular (`auth.controller.ts`, `auth.service.ts`, `auth.repository.ts`, `auth.validation.ts`, `auth.routes.ts`, `auth.types.ts`)
  - Class: `PascalCase` (`AuthController`, `ExpenseService`)
  - Methods: `camelCase` static methods
- **Error Handling**:
  - Terpusat di `AppErrors` catalog (`src/constants/errors.constant.ts`).
  - Custom error: `ResponseError`.
  - Global `errorHandler` menangkap `ZodError` dan memetakan field error secara presisi.

---

## 4. Alur Kerja Pembangunan (Build Flow)
- **Preferred Build Flow**: **Logic-first**
  1. Buat skema database Prisma (`schema.prisma`) dan repository data access.
  2. Implementasikan aturan bisnis domain pada layer service.
  3. Pasang validasi Zod dan controller HTTP.
  4. Daftarkan router dan proteksi auth guard.
  5. Uji dengan test suite Vitest.

---

## 5. Konvensi Commit Message
- **Format**: Conventional Commits (`feat(auth): ...`, `fix(expense): ...`, `test(audit): ...`)
- **Bahasa**: Bahasa Inggris atau Bahasa Indonesia konsisten.

---

## 6. Catatan Khusus Fitur Autentikasi
- Diskusi mendalam mengenai alur login, authentikasi-authorization (JWT, refresh token rotation, invite verification 24 jam) akan dipaparkan dan disepakati bersama sebelum pengerjaan `US-1`.

