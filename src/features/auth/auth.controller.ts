import type { Request, Response } from "express";
import { validate } from "../../validations/validate.util";
import { AuthValidation } from "./auth.validation";
import { AuthService } from "./auth.service";
import { ResponseHelper } from "../../helpers/response.helper";

export class AuthController {
  static async invite(req: Request, res: Response) {
    const { body } = validate(AuthValidation.INVITE_SCHEMA, { body: req.body });

    const result = await AuthService.inviteUser(body);

    return ResponseHelper.created(
      res,
      result,
      `Undangan aktivasi berhasil dikirim ke alamat email ${result.email}.`
    );
  }

  static async activate(req: Request, res: Response) {
    const { body } = validate(AuthValidation.ACTIVATE_SCHEMA, { body: req.body });

    const result = await AuthService.activateAccount(body);

    return ResponseHelper.success(
      res,
      result,
      "Akun berhasil diaktivasi. Anda sekarang dapat masuk menggunakan kata sandi Anda."
    );
  }

  static async login(req: Request, res: Response) {
    const { body } = validate(AuthValidation.LOGIN_SCHEMA, { body: req.body });

    const result = await AuthService.login(body);

    // Set HTTP-Only Cookie untuk refresh token & access token (dual channel support)
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 menit
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 hari
    });

    return ResponseHelper.success(res, result, "Login berhasil.");
  }

  static async refresh(req: Request, res: Response) {
    const tokenFromCookie = req.cookies?.refreshToken;
    const rawToken = tokenFromCookie || req.body?.refreshToken;

    const { body } = validate(AuthValidation.REFRESH_SCHEMA, {
      body: { refreshToken: rawToken },
    });

    const result = await AuthService.refreshToken(body.refreshToken);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return ResponseHelper.success(res, result, "Token berhasil diperbarui.");
  }

  static async getProfile(req: Request, res: Response) {
    const user = res.locals.user;
    const profile = await AuthService.getProfile(user.id);

    return ResponseHelper.success(res, profile, "Profil pengguna berhasil diambil.");
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return ResponseHelper.success(res, null, "Logout berhasil.");
  }
}

