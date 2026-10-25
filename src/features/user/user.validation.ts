import { z } from "zod";

export class UserValidation {
  static readonly LIST_USERS_SCHEMA = z.object({
    query: z
      .object({
        status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).optional(),
        role: z.enum(["LEAD", "STAFF"]).optional(),
        search: z.string().trim().optional(),
      })
      .optional(),
  });

  static readonly GET_USER_SCHEMA = z.object({
    params: z.object({
      id: z.string().uuid("ID pengguna harus berupa format UUID yang valid."),
    }),
  });

  static readonly UPDATE_STATUS_SCHEMA = z.object({
    params: z.object({
      id: z.string().uuid("ID pengguna harus berupa format UUID yang valid."),
    }),
    body: z.object({
      status: z.enum(["ACTIVE", "INACTIVE"], {
        message: "Status harus bernilai ACTIVE atau INACTIVE.",
      }),
    }),
  });
}
