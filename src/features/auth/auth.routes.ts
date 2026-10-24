import { Router } from "express";
import { Role } from "@prisma/client";
import { AuthController } from "./auth.controller";
import { AuthMiddleware } from "../../middlewares/auth.middleware";

export const authRoutes = Router();

// Endpoint Publik
authRoutes.post("/activate", AuthController.activate);
authRoutes.post("/login", AuthController.login);
authRoutes.post("/refresh", AuthController.refresh);

// Endpoint Terproteksi
authRoutes.post(
  "/invite",
  AuthMiddleware.authenticated(),
  AuthMiddleware.authorized([Role.LEAD]),
  AuthController.invite
);

authRoutes.get("/me", AuthMiddleware.authenticated(), AuthController.getProfile);
authRoutes.post("/logout", AuthMiddleware.authenticated(), AuthController.logout);

