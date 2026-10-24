import { z } from "zod";

export class AuthValidation {
  static readonly INVITE_SCHEMA = z.object({
    body: z.object({
      email: z.string().trim().email("Format alamat email tidak valid."),
      name: z.string().trim().min(2, "Nama minimal 2 karakter.").optional(),
      role: z.enum(["LEAD", "STAFF"]).optional().default("STAFF"),
    }),
  });

  static readonly ACTIVATE_SCHEMA = z.object({
    body: z.object({
      token: z.string().trim().min(1, "Token aktivasi wajib disertakan."),
      password: z.string().min(6, "Kata sandi minimal 6 karakter."),
    }),
  });

  static readonly LOGIN_SCHEMA = z.object({
    body: z.object({
      email: z.string().trim().email("Format alamat email tidak valid."),
      password: z.string().min(1, "Kata sandi wajib diisi."),
    }),
  });

  static readonly REFRESH_SCHEMA = z.object({
    body: z.object({
      refreshToken: z.string().trim().min(1, "Refresh token wajib disertakan."),
    }),
  });
}

