import type { Request, Response } from "express";
import { validate } from "../../validations/validate.util";
import { UserValidation } from "./user.validation";
import { UserService } from "./user.service";
import { ResponseHelper } from "../../helpers/response.helper";

export class UserController {
  static async listUsers(req: Request, res: Response) {
    const parsed = validate(UserValidation.LIST_USERS_SCHEMA, { query: req.query });
    const users = await UserService.listUsers(parsed.query);

    return ResponseHelper.success(res, users, "Daftar anggota tim berhasil dimuat.");
  }

  static async getUser(req: Request, res: Response) {
    const { params } = validate(UserValidation.GET_USER_SCHEMA, { params: req.params });
    const user = await UserService.getUserById(params.id);

    return ResponseHelper.success(res, user, "Detail profil anggota berhasil dimuat.");
  }

  static async updateStatus(req: Request, res: Response) {
    const { params, body } = validate(UserValidation.UPDATE_STATUS_SCHEMA, {
      params: req.params,
      body: req.body,
    });

    const currentUserId = res.locals.user.id;
    const updatedUser = await UserService.updateUserStatus(
      params.id,
      currentUserId,
      body
    );

    const statusLabel = body.status === "ACTIVE" ? "diaktifkan" : "dinonaktifkan";
    return ResponseHelper.success(
      res,
      updatedUser,
      `Status anggota tim berhasil ${statusLabel}.`
    );
  }
}

