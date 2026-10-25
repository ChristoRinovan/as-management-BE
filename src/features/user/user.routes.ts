import { Router } from "express";
import { Role } from "@prisma/client";
import { UserController } from "./user.controller";
import { AuthMiddleware } from "../../middlewares/auth.middleware";

export const userRoutes = Router();

// Seluruh endpoint manajemen anggota tim wajib terautentikasi dan memiliki peran LEAD (Ketua Tim)
userRoutes.use(
  AuthMiddleware.authenticated(),
  AuthMiddleware.authorized([Role.LEAD])
);

userRoutes.get("/", UserController.listUsers);
userRoutes.get("/:id", UserController.getUser);
userRoutes.patch("/:id/status", UserController.updateStatus);

