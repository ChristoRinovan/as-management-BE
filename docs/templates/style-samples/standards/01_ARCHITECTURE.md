# 01 - ARCHITECTURE: VERTICAL SLICE & LAYERED RESPONSIBILITIES

## 1. Core Architectural Principle
Sistem mengadopsi pola **Feature-Based Modular Monolith** dengan **Layered Clean Architecture** di setiap modulnya (*Vertical Slice Architecture*). Setiap modul domain berdiri secara terisolasi di dalam foldernya sendiri.

Alur eksekusi request bersifat **Searah & Deterministik**:
```
Client Request
  └── Middleware Pipeline (CORS, Helmet, Rate Limiter, Morgan Logger)
      └── Route Dispatcher (routes/index.ts)
          └── Auth & Role Guard (auth.middleware.ts)
              └── Feature Slice (features/<domain>/)
                  ├── Validation (Zod Schema Parse)
                  ├── Controller (HTTP Binding & Response Formatting)
                  ├── Service (Domain Rules, Invariants & Orchestration)
                  └── Repository (Atomic Transactions & Data Access via Prisma)
                      └── Database (PostgreSQL)
```

---

## 2. Strict Layer Boundaries (Aturan Batasan Layer)

### A. Routes Layer (`<feature>.routes.ts`)
- **Tanggung Jawab:** Mendaftarkan endpoint HTTP, memasang guard middleware (`AuthMiddleware.authenticated()`, `AuthMiddleware.authorized([...roles])`), dan menghubungkan handler controller.
- **LARANGAN KERAS:**
  - TIDAK BOLEH menulis logika bisnis, validasi payload, atau query database di file route.

### B. Validation Layer (`<feature>.validation.ts`)
- **Tanggung Jawab:** Mendefinisikan skema validasi `body`, `query`, dan `params` menggunakan **Zod**.
- **LARANGAN KERAS:**
  - TIDAK BOLEH melakukan panggilan database/I/O di dalam skema Zod.

### C. Controller Layer (`<feature>.controller.ts`)
- **Tanggung Jawab:**
  1. Memvalidasi request menggunakan helper `validate(schema, req)`.
  2. Mengekstrak session user dari `res.locals.user`.
  3. Memanggil method pada Service layer.
  4. Membentuk respons HTTP terstandarisasi (`status`, `success`, `message`, `data`, `meta`).
- **LARANGAN KERAS:**
  - TIDAK BOLEH memanggil Prisma Client secara langsung.
  - TIDAK BOLEH mengolah aturan bisnis kompleks atau kalkulasi data transaksi.

### D. Service Layer (`<feature>.service.ts`)
- **Tanggung Jawab:**
  1. Inti aturan bisnis (*domain business logic*) dan penjaga invarian (*business invariants*).
  2. Memeriksa state-transition (*state machine*).
  3. Mengorkestrasi pemanggilan ke satu atau beberapa repository.
  4. Melempar `ResponseError` jika aturan bisnis dilanggar.
- **LARANGAN KERAS:**
  - TIDAK BOLEH menyentuh objek Express (`req`, `res`, `next`). Service harus murni menerima dan mengembalikan data mentah TypeScript (plain object / primitives).

### E. Repository Layer (`<feature>.repository.ts`)
- **Tanggung Jawab:**
  1. Akses langsung ke database menggunakan Prisma Client.
  2. Mengelola transaksi atomik (`prisma.$transaction`).
  3. Melakukan agregasi data (SQL/Prisma aggregation) di level engine database.
- **LARANGAN KERAS:**
  - TIDAK BOLEH menentukan status code HTTP atau membentuk pesan respons ke client.
