# 05 - ERROR HANDLING & VALIDATION STANDARDS

## 1. Centralized Error Catalog (`AppErrors`)

Hindari menulis pesan error dan HTTP status code secara *hardcoded* di berbagai controller atau service. Kumpulkan katalog error dalam satu file referensi:

```typescript
// src/constants/errors.constant.ts
import { StatusCodes } from "http-status-codes";

export const AppErrors = {
  // Auth
  AUTHENTICATION_REQUIRED: {
    code: "AUTHENTICATION_REQUIRED",
    status: StatusCodes.UNAUTHORIZED,
    message: "Sesi Anda telah berakhir atau token tidak ditemukan.",
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    status: StatusCodes.UNAUTHORIZED,
    message: "Email atau kata sandi tidak sesuai.",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    status: StatusCodes.FORBIDDEN,
    message: "Anda tidak memiliki wewenang untuk mengakses sumber daya ini.",
  },

  // Resource / Conflict
  RESOURCE_NOT_FOUND: {
    code: "RESOURCE_NOT_FOUND",
    status: StatusCodes.NOT_FOUND,
    message: "Data yang diminta tidak ditemukan.",
  },
  RESOURCE_CONFLICT: {
    code: "RESOURCE_CONFLICT",
    status: StatusCodes.CONFLICT,
    message: "Data sudah ada atau sedang diproses oleh request lain.",
  },
  INVALID_STATE_TRANSITION: {
    code: "INVALID_STATE_TRANSITION",
    status: StatusCodes.BAD_REQUEST,
    message: "Aksi tidak dapat dilakukan pada status transaksi saat ini.",
  },

  // Server
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Terjadi gangguan pada server internal.",
  },
} as const;

export type AppErrorKey = keyof typeof AppErrors;
```

---

## 2. Custom Business Error Class (`ResponseError`)

```typescript
// src/utils/errors/response-error.util.ts
import { AppErrors, AppErrorKey } from "../../constants/errors.constant";

export class ResponseError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(
    errorKey: AppErrorKey,
    customMessage?: string,
    fields?: Record<string, string[]>
  ) {
    const errorDef = AppErrors[errorKey];
    super(customMessage ?? errorDef.message);

    this.statusCode = errorDef.status;
    this.code = errorDef.code;
    if (fields) this.fields = fields;

    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}
```

---

## 3. Zod Validation Helper

Helper validasi mengeksekusi skema dan melempar `ZodError` standar jika data tidak valid:

```typescript
// src/validations/validate.util.ts
import { ZodType } from "zod";

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
```

---

## 4. Global Error Handler Middleware

Middleware menangkap semua tipe error (Zod, Prisma, ResponseError, dan unhandled error) dan menghasilkan response JSON yang informatif bagi frontend:

```typescript
// src/middlewares/error-handler.middleware.ts
import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma";
import { ResponseError } from "../utils/errors/response-error.util";
import { logger } from "../configs/logger.config";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // 1. Logging
  if (err instanceof ResponseError) {
    logger.warn(`[BUSINESS_ERROR] ${err.message}`, { path: req.originalUrl, code: err.code });
  } else {
    logger.error(`[UNHANDLED_ERROR] ${err instanceof Error ? err.message : String(err)}`, {
      path: req.originalUrl,
      stack: err instanceof Error ? err.stack : undefined,
    });
  }

  // 2. Error Validasi Zod (Kirimkan field detail ke frontend)
  if (err instanceof ZodError) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Data yang dikirim tidak valid.",
        fields: err.flatten().fieldErrors, // Format: { "email": ["Format email salah"], "password": ["Minimal 8 karakter"] }
      },
    });
  }

  // 3. Error Bisnis Sengaja (ResponseError)
  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  // 4. Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        error: {
          code: "CONFLICT",
          message: "Data duplikat telah terdaftar di sistem.",
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        error: {
          code: "RESOURCE_NOT_FOUND",
          message: "Data tidak ditemukan di database.",
        },
      });
    }
  }

  // 5. Fallback 500 (Jangan membocorkan internal stack trace)
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Terjadi kesalahan internal pada server.",
    },
  });
}
```
