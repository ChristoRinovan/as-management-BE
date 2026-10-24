# 03 - CODING STYLE & CORE IMPLEMENTATION PATTERNS

## 1. Type Safety & Express Context Extension

Jangan pernah membiarkan data session bertipe `any` di `res.locals`. Perluas *global namespace* Express:

```typescript
// src/types/express.d.ts
import { Role } from "../generated/prisma"; // sesuaikan enum role proyek Anda

declare global {
  namespace Express {
    interface Locals {
      user: {
        sub: string;
        role: string;
        accountType: "customer" | "employee" | "admin";
        [key: string]: unknown;
      };
    }
  }
}
```

---

## 2. Controller Pattern Template

Controller murni bertugas memvalidasi input, memanggil service, dan mengirim format respons seragam:

```typescript
// src/features/<domain>/<domain>.controller.ts
import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { validate } from "../../validations/validate";
import { DomainValidation } from "./<domain>.validation";
import { DomainService } from "./<domain>.service";

export class DomainController {
  static async performAction(req: Request, res: Response) {
    // 1. Validasi input via Zod schema
    const { body, params } = validate(DomainValidation.ACTION_SCHEMA, {
      body: req.body,
      params: req.params,
    });

    // 2. Ekstrak data user dari context yang sudah divalidasi AuthMiddleware
    const user = res.locals.user;

    // 3. Panggil Service
    const result = await DomainService.processAction({
      userId: user.sub,
      entityId: params.id,
      input: body,
    });

    // 4. Return format standar JSON
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Operasi berhasil diselesaikan.",
      data: result,
    });
  }
}
```

---

## 3. Atomic Concurrency Pattern (Pencegahan Race Condition)

> **ATURAN WAJIB:** Ketika beberapa request/pekerja berebut satu resource yang sama (misal: claim task, claim order, kurangi stok, booking slot), **DILARANG** melakukan `findFirst` lalu `update`.
> **Wajib** gunakan mutasi atomik bersyarat (`updateMany` dengan validasi kondisi state) di dalam `prisma.$transaction`:

```typescript
// src/features/<domain>/<domain>.repository.ts
export class DomainRepository {
  static async claimTaskAtomically(taskId: string, workerId: string) {
    return prisma.$transaction(async (tx) => {
      // Hanya update jika status masih QUEUED dan workerId masih null
      const claimed = await tx.taskAssignment.updateMany({
        where: {
          id: taskId,
          status: "QUEUED",
          workerId: null,
        },
        data: {
          status: "ASSIGNED",
          workerId: workerId,
          assignedAt: new Date(),
        },
      });

      // Jika count === 0, berarti tugas sudah diambil request lain di milidetik yang sama
      if (claimed.count === 0) {
        throw new ResponseError(
          "RESOURCE_CONFLICT", 
          "Tugas sudah tidak tersedia atau telah diambil pekerja lain."
        );
      }

      // Lanjutkan perubahan state aktor
      await tx.employee.update({
        where: { id: workerId },
        data: { workStatus: "BUSY" },
      });

      return tx.taskAssignment.findUnique({ where: { id: taskId } });
    });
  }
}
```

---

## 4. Historical Snapshot Pattern (Integritas Data Transaksional)

> **ATURAN WAJIB:** Pada sistem e-commerce, invoice, pembayaran, atau booking, harga master, tarif ongkir, dan detail alamat **PASTI** berubah di masa depan.
> Transaksi masa lalu **TIDAK BOLEH** terpengaruh oleh perubahan harga masa depan.

1. **Saat Transaksi Dibuat:** Simpan nilai master ke kolom *snapshot*:
   ```typescript
   await tx.orderInvoice.create({
     data: {
       orderId: order.id,
       unitPriceSnapshot: masterPricing.pricePerUnit,  // Bekukan harga saat ini
       shippingFeeSnapshot: masterShippingRate.fee,    // Bekukan tarif saat ini
       taxRateSnapshot: masterTax.rate,                // Bekukan persentase pajak
       totalAmount: calculatedTotal,
     },
   });
   ```

2. **Saat Melihat Transaksi Masa Lalu (`getById` / `detail`):**
   ```typescript
   // ❌ SALAH: Mengambil master harga live saat ini
   // const currentPrice = await PricingRepository.getCurrentPrice();

   // ✅ BENAR: Wajib membaca dari nilai snapshot invoice
   const pricePerUnit = Number(invoice.unitPriceSnapshot);
   const shippingFee = Number(invoice.shippingFeeSnapshot);
   ```

---

## 5. Database-Level Aggregation Pattern (Performa Laporan & Analytics)

> **ATURAN WAJIB:** DILARANG mengambil seluruh record ke memori Node.js (`findMany`) untuk dihitung manual dengan loop JS (`reduce`, `forEach`).
> Selalu gunakan agregasi bawaan engine database PostgreSQL / Prisma:

```typescript
// src/features/report/report.repository.ts
export class ReportRepository {
  static async getPeriodSummary(startDate: Date, endDate: Date, outletId?: string) {
    return prisma.invoice.aggregate({
      where: {
        paymentStatus: "PAID",
        paidAt: { gte: startDate, lt: endDate },
        ...(outletId ? { order: { outletId } } : {}),
      },
      _sum: { totalAmount: true },
      _count: { id: true },
      _avg: { totalAmount: true },
    });
  }
}
```
