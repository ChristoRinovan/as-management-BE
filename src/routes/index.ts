import { Router } from "express";
import { authRoutes } from "../features/auth/auth.routes";

export const rootRouter = Router();

rootRouter.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server Backend Manajemen Laporan aktif dan siap melayani request.",
    timestamp: new Date().toISOString(),
  });
});

rootRouter.use("/auth", authRoutes);

