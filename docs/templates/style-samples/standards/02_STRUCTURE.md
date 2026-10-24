# 02 - STRUCTURE: DIRECTORY LAYOUT & NAMING CONVENTIONS

## 1. Universal Directory Layout

```text
project-root/
├── api/
│   └── index.ts                      # Serverless Entry Point (Vercel, AWS Lambda)
├── prisma/
│   ├── schema.prisma                 # Skema DB, Indeks, & Enums
│   └── seed.ts                       # Database Initial Seeder
├── src/
│   ├── app.ts                        # Express App Factory (Middleware global & Route mounting)
│   ├── server.ts                     # Local HTTP Server (app.listen + Graceful Shutdown)
│   ├── configs/                      # Konfigurasi aplikasi & third-party
│   │   ├── env.config.ts             # Validasi Environment Variables
│   │   ├── database.config.ts        # Database Connection Client (Prisma)
│   │   └── logger.config.ts          # Structured Logger (Winston)
│   ├── constants/                    # Nilai konstan global & pesan sistem
│   ├── helpers/                      # Helper lintas modul (pagination, response)
│   ├── middlewares/                  # Middleware global
│   │   ├── auth.middleware.ts        # Universal Auth Guard (Bearer + Cookie)
│   │   ├── error-handler.middleware.ts# Global Error Catcher & Zod Formatter
│   │   └── rate-limiter.middleware.ts# Proteksi Brute-Force Auth
│   ├── routes/
│   │   └── index.ts                  # Root Router Aggregator
│   ├── types/                        # Global Type Declarations (Express.Locals, dll)
│   ├── utils/                        # Utilitas kriptografi, JWT, hashing, mailer, storage
│   └── features/                     # DOMAIN FEATURE SLICES (Vertical Slices)
│       ├── auth/                     # Fitur Autentikasi
│       │   ├── auth.controller.ts
│       │   ├── auth.service.ts
│       │   ├── auth.repository.ts
│       │   ├── auth.routes.ts
│       │   ├── auth.validation.ts
│       │   ├── auth.helper.ts        # (Opsional) jika ada logika kalkulasi spesifik fitur
│       │   └── auth.types.ts         # Deklarasi tipe spesifik fitur
│       ├── user/                     # Fitur Manajemen User / Profil
│       ├── <domain-core-1>/          # Contoh: order, booking, post, product
│       ├── <domain-core-2>/          # Contoh: payment, subscription, billing
│       ├── report/                   # Analytics & Pelaporan (Database-level Agregasi)
│       └── scheduled-job/            # Worker background & Cron endpoints
├── .env.example                      # Template Environment Variables (Wajib Ada)
├── package.json
└── tsconfig.json
```

---

## 2. Naming Conventions (Konvensi Penamaan)

1. **Folder Modul Fitur:**
   - Wajib menggunakan **kebab-case** huruf kecil.
   - Contoh: `order-management`, `user-profile`, `customer-address`.
   - DILARANG menggunakan camelCase atau PascalCase untuk folder fitur.

2. **File Modul di dalam Fitur:**
   - Format: `<nama-fitur>.<layer>.ts`.
   - Bagian nama layer **selalu singular**:
     - `auth.controller.ts` (BUKAN `controllers.ts`)
     - `auth.service.ts` (BUKAN `services.ts`)
     - `auth.repository.ts` (BUKAN `repositories.ts`)
     - `auth.routes.ts` (Route boleh berakhiran `routes.ts` atau `route.ts`, wajib konsisten di seluruh proyek)
     - `auth.validation.ts` (BUKAN `validations.ts`)
     - `auth.helper.ts` (BUKAN `helpers.ts`)
     - `auth.types.ts`
   - DILARANG mencampur file singular dan plural dalam satu codebase.

3. **Nama Class:**
   - Wajib PascalCase diakhiri nama layer:
     - `AuthController`, `AuthService`, `AuthRepository`, `AuthValidation`, `AuthHelper`.

4. **Metode (Methods):**
   - Wajib `camelCase` dan static methods:
     - `AuthService.loginWithEmail(...)`
     - `OrderRepository.claimTaskAtomically(...)`

5. **Kebersihan Repository:**
   - Dilarang men-commit file OS seperti `.DS_Store` atau `Thumbs.db`.
   - Pastikan `.gitignore` mencakup:
     ```gitignore
     node_modules/
     dist/
     .env
     .DS_Store
     Thumbs.db
     *.log
     ```
