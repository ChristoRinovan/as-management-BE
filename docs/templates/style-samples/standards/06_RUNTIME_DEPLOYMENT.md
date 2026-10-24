# 06 - RUNTIME, BUILD & DEPLOYMENT ARCHITECTURE

## 1. Triple-Entry Point Pattern (Dev, Prod Standalone & Serverless)

Untuk menjaga kode 100% portabel (dapat dijalankan di Local Dev, Docker Container, VM Linux, maupun Vercel/AWS Serverless):

### A. Factory Express: `src/app.ts`
Murni instansiasi aplikasi Express, registrasi middleware global, dan pendaftaran rute. **DILARANG** memanggil `app.listen` di file ini.

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Prefix API seragam
app.use("/api/v1", routes);

// Error handler WAJIB diletakkan paling akhir
app.use(errorHandler);

export default app;
```

### B. Local Runner & Standalone Container: `src/server.ts`
File yang dieksekusi saat `npm run dev` atau di dalam Docker container:

```typescript
// src/server.ts
import app from "./app";
import { PORT } from "./configs/env.config";
import { logger } from "./configs/logger.config";

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server aktif di http://localhost:${PORT}`);
});

// Graceful Shutdown
const shutdown = (signal: string) => {
  logger.info(`Menerima ${signal}. Menutup koneksi database dan HTTP listener...`);
  server.close(() => {
    logger.info("Server berhasil dihentikan.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
```

### C. Serverless Function Handler: `api/index.ts`
Digunakan oleh platform serverless seperti Vercel:

```typescript
// api/index.ts
import app from "../src/app";

export default app;
```

---

## 2. Standard Scripts di `package.json`

```json
{
  "scripts": {
    "dev": "nodemon --watch 'src/**/*.ts' --exec ts-node src/server.ts",
    "build": "tsc && prisma generate",
    "start": "node dist/src/server.js",
    "postinstall": "prisma generate"
  }
}
```

---

## 3. Tooling & Dependencies Hygiene

1. **Paket Runtime vs DevDependencies:**
   - Masukkan paket yang dijalankan saat runtime ke `dependencies`: `express`, `cors`, `cookie-parser`, `zod`, `multer`, `bcrypt`, `jsonwebtoken`, `@prisma/client`.
   - **JANGAN** menaruh `multer` di `devDependencies` (bisa menyebabkan crash pada environment container/CI yang memangkas dev dependencies).
   - Pastikan `@types/node` selalu terpasang di `devDependencies`.

2. **Pengaturan `tsconfig.json` Modern:**
   ```json
   {
     "compilerOptions": {
       "rootDir": "./",
       "outDir": "./dist",
       "module": "commonjs",
       "target": "ES2022",
       "lib": ["ES2022"],
       "types": ["node"],
       "strict": true,
       "esModuleInterop": true,
       "skipLibCheck": true,
       "forceConsistentCasingInFileNames": true,
       "noUncheckedIndexedAccess": true
     },
     "include": ["src/**/*", "api/**/*", "prisma/**/*"]
   }
   ```
   *Catatan:* Hapus `"jsx": "react-jsx"` dari proyek murni backend.
