# 04 - SECURITY & AUTHENTICATION STANDARDS

## 1. Dual-Channel Authentication (Header + Cookie Support)

Aplikasi harus fleksibel: Klien web browser dilayani via HTTP-Only Cookies, sementara mobile app, Postman, atau integrasi pihak ketiga dilayani via `Authorization: Bearer <token>`.

```typescript
// src/middlewares/auth.middleware.ts
import { NextFunction, Request, Response } from "express";
import { JWTUtil } from "../utils/jwt.util";
import { ResponseError } from "../utils/errors/response-error.util";

export class AuthMiddleware {
  static authenticated() {
    return (req: Request, res: Response, next: NextFunction) => {
      // 1. Cek Header Authorization terlebih dahulu
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        // 2. Fallback ke Cookie
        token = req.cookies.accessToken;
      }

      if (!token) {
        return next(new ResponseError("AUTHENTICATION_REQUIRED"));
      }

      try {
        const payload = JWTUtil.verifyAccessToken(token);
        res.locals.user = payload;
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  static authorized(allowedRoles: string[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user;
      if (!user || !allowedRoles.includes(user.role)) {
        return next(new ResponseError("FORBIDDEN", "Anda tidak memiliki akses ke sumber daya ini."));
      }
      next();
    };
  }
}
```

---

## 2. Refresh Token Rotation (RTR) dengan Hashing

Untuk mencegah token theft dan sesi yang tidak pernah berakhir:

1. **Access Token:** Masa aktif pendek (15–30 menit), berformat JWT.
2. **Refresh Token:** Masa aktif panjang (7–30 hari), berformat random cryptographic string (32 bytes).
3. **Penyimpanan di Database:** **DILARANG** menyimpan raw refresh token. Simpan nilai hash `SHA-256` di database:
   ```typescript
   const rawToken = crypto.randomBytes(32).toString("hex");
   const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

   await prisma.refreshToken.create({
     data: {
       userId,
       tokenHash,
       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
     },
   });
   ```
4. **Saat Refresh Endpoint Dipanggil (`/auth/refresh`):**
   - Cari token berdasarkan hash.
   - Jika sudah kedaluwarsa atau `revokedAt !== null`, tolak (indikasi replay attack).
   - Segera tandai token lama sebagai revoked (`revokedAt = new Date()`).
   - Buat sepasang Access Token & Refresh Token baru (*Rotate*).

---

## 3. Zero-Trust Webhook & Scheduled Job Authentication

Endpoint yang dieksekusi otomatis oleh scheduler (Vercel Cron, GitHub Actions, AWS EventBridge) atau Payment Gateway Webhook (Midtrans, Stripe, Xendit) **Wajib** diverifikasi secara ketat:

### A. Cron Secret Validation
```typescript
// src/features/scheduled-job/job.routes.ts
router.get("/process-overdue", async (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    // Zero-Trust: Jika secret belum dikonfigurasi di env, segera tolak!
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = await JobService.processOverdue();
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});
```

### B. Payment Webhook Signature & Idempotency
- **Signature Verification:** Selalu validasi HMAC/SHA-512 signature dari penyedia pembayaran sebelum membaca status transaksi.
- **Idempotency:** Jika status order di DB sudah `PAID` atau `isFinal === true`, segera return HTTP 200 tanpa memproses logic ulang untuk mencegah duplikasi saldo/status.

---

## 4. Perlindungan Terhadap Brute Force & CSRF

1. **Rate Limiting:** Pasang `express-rate-limit` pada endpoint sensitif:
   - `/auth/login`: Maksimal 5 percobaan gagal per 15 menit per IP.
   - `/auth/forgot-password`: Maksimal 3 permintaan per jam per email.
2. **CSRF Protection:** Jika cookie menggunakan `sameSite: "none"` untuk keperluan cross-origin production, wajib aktifkan verifikasi header `Origin` / `Referer` atau sertakan Anti-CSRF token pada semua request mutasi (`POST`, `PUT`, `PATCH`, `DELETE`).
