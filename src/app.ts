import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { rootRouter } from "./routes";
import { errorHandler } from "./middlewares/error-handler.middleware";

export function createApp(): Express {
  const app = express();

  // 1. Security Middlewares
  app.use(helmet());
  app.use(
    cors({
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    })
  );

  // 2. Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // 3. Rate Limiter Proteksi Brute-force pada Auth
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 menit
    max: 100, // 100 request per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Terlalu banyak permintaan dari IP ini. Silakan coba lagi setelah 15 menit.",
      error: { code: "TOO_MANY_REQUESTS" },
    },
  });

  app.use("/api/v1/auth", authLimiter);

  // 4. API Routes
  app.use("/api/v1", rootRouter);

  // 5. 404 Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      message: "Endpoint yang Anda tuju tidak ditemukan.",
      error: { code: "NOT_FOUND" },
    });
  });

  // 6. Global Error Handler
  app.use(errorHandler);

  return app;
}

