import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, UserStatus } from "@prisma/client";
import { UserService } from "../src/features/user/user.service";
import { UserRepository } from "../src/features/user/user.repository";
import { UserValidation } from "../src/features/user/user.validation";
import { UserController } from "../src/features/user/user.controller";
import { AuthMiddleware } from "../src/middlewares/auth.middleware";
import { ResponseError } from "../src/utils/errors/response-error.util";

describe("US-2: Manajemen Akun Anggota Tim (List User & Update Status)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // US-2: Melihat Daftar Anggota Tim
  // ==========================================
  describe("Melihat Daftar Anggota Tim", () => {
    it("harus berhasil menampilkan seluruh daftar anggota tim tanpa membocorkan hash password", async () => {
      const mockUsers = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          email: "ketua@tim.com",
          name: "Ketua Tim",
          role: Role.LEAD,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          email: "staff1@tim.com",
          name: "Staff Satu",
          role: Role.STAFF,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(UserRepository, "findUsers").mockResolvedValue(mockUsers);

      const result = await UserService.listUsers();

      expect(result).toHaveLength(2);
      expect(result[0].email).toBe("ketua@tim.com");
      expect(result[1].email).toBe("staff1@tim.com");
      expect(result[0]).not.toHaveProperty("password");
      expect(result[1]).not.toHaveProperty("password");
    });

    it("harus meneruskan parameter filter status, role, atau search ke repository", async () => {
      const findSpy = vi.spyOn(UserRepository, "findUsers").mockResolvedValue([]);

      await UserService.listUsers({
        status: UserStatus.ACTIVE,
        role: Role.STAFF,
        search: "budi",
      });

      expect(findSpy).toHaveBeenCalledWith({
        status: UserStatus.ACTIVE,
        role: Role.STAFF,
        search: "budi",
      });
    });

    it("harus berhasil mengambil detail profil anggota berdasarkan ID", async () => {
      const mockUser = {
        id: "22222222-2222-2222-2222-222222222222",
        email: "staff1@tim.com",
        name: "Staff Satu",
        role: Role.STAFF,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(mockUser);

      const result = await UserService.getUserById("22222222-2222-2222-2222-222222222222");

      expect(result.id).toBe("22222222-2222-2222-2222-222222222222");
      expect(result.email).toBe("staff1@tim.com");
    });

    it("harus melempar 404 RESOURCE_NOT_FOUND jika user tidak ditemukan saat ambil detail", async () => {
      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(null);

      await expect(
        UserService.getUserById("33333333-3333-3333-3333-333333333333")
      ).rejects.toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        statusCode: 404,
      });
    });
  });

  // ==========================================
  // AC-4: Mengubah Status Anggota Tim (Aktifkan / Nonaktifkan)
  // ==========================================
  describe("AC-4: Mengubah Status Anggota Tim", () => {
    it("harus berhasil menonaktifkan akun anggota tim (INACTIVE)", async () => {
      const targetUserId = "22222222-2222-2222-2222-222222222222";
      const leadUserId = "11111111-1111-1111-1111-111111111111";

      const existingMember = {
        id: targetUserId,
        email: "staff1@tim.com",
        name: "Staff Satu",
        role: Role.STAFF,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(existingMember);
      const updateSpy = vi
        .spyOn(UserRepository, "updateUserStatus")
        .mockResolvedValue({ ...existingMember, status: UserStatus.INACTIVE });

      const result = await UserService.updateUserStatus(targetUserId, leadUserId, {
        status: UserStatus.INACTIVE,
      });

      expect(updateSpy).toHaveBeenCalledWith(targetUserId, UserStatus.INACTIVE);
      expect(result.status).toBe(UserStatus.INACTIVE);
    });

    it("harus berhasil mengaktifkan kembali akun anggota tim (ACTIVE)", async () => {
      const targetUserId = "22222222-2222-2222-2222-222222222222";
      const leadUserId = "11111111-1111-1111-1111-111111111111";

      const inactiveMember = {
        id: targetUserId,
        email: "staff1@tim.com",
        name: "Staff Satu",
        role: Role.STAFF,
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(inactiveMember);
      const updateSpy = vi
        .spyOn(UserRepository, "updateUserStatus")
        .mockResolvedValue({ ...inactiveMember, status: UserStatus.ACTIVE });

      const result = await UserService.updateUserStatus(targetUserId, leadUserId, {
        status: UserStatus.ACTIVE,
      });

      expect(updateSpy).toHaveBeenCalledWith(targetUserId, UserStatus.ACTIVE);
      expect(result.status).toBe(UserStatus.ACTIVE);
    });

    it("harus menolak pembaruan status jika target anggota tidak ditemukan (404)", async () => {
      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(null);

      await expect(
        UserService.updateUserStatus(
          "99999999-9999-9999-9999-999999999999",
          "11111111-1111-1111-1111-111111111111",
          { status: UserStatus.INACTIVE }
        )
      ).rejects.toMatchObject({
        code: "RESOURCE_NOT_FOUND",
        statusCode: 404,
      });
    });

    it("harus menolak jika Ketua Tim mencoba menonaktifkan status akunnya sendiri (403)", async () => {
      const leadUserId = "11111111-1111-1111-1111-111111111111";

      const leadUser = {
        id: leadUserId,
        email: "ketua@tim.com",
        name: "Ketua Tim",
        role: Role.LEAD,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(UserRepository, "findUserById").mockResolvedValue(leadUser);

      await expect(
        UserService.updateUserStatus(leadUserId, leadUserId, {
          status: UserStatus.INACTIVE,
        })
      ).rejects.toMatchObject({
        code: "FORBIDDEN",
        statusCode: 403,
      });
    });
  });

  // ==========================================
  // Validasi Input Zod
  // ==========================================
  describe("Validasi Input Zod", () => {
    it("harus menerima UUID dan status ACTIVE / INACTIVE yang valid", () => {
      const valid = UserValidation.UPDATE_STATUS_SCHEMA.safeParse({
        params: { id: "123e4567-e89b-12d3-a456-426614174000" },
        body: { status: "ACTIVE" },
      });
      expect(valid.success).toBe(true);

      const validInactive = UserValidation.UPDATE_STATUS_SCHEMA.safeParse({
        params: { id: "123e4567-e89b-12d3-a456-426614174000" },
        body: { status: "INACTIVE" },
      });
      expect(validInactive.success).toBe(true);
    });

    it("harus menolak jika ID bukan format UUID", () => {
      const invalid = UserValidation.UPDATE_STATUS_SCHEMA.safeParse({
        params: { id: "bukan-uuid" },
        body: { status: "ACTIVE" },
      });
      expect(invalid.success).toBe(false);
    });

    it("harus menolak jika status bernilai di luar ACTIVE atau INACTIVE", () => {
      const invalid = UserValidation.UPDATE_STATUS_SCHEMA.safeParse({
        params: { id: "123e4567-e89b-12d3-a456-426614174000" },
        body: { status: "PENDING" },
      });
      expect(invalid.success).toBe(false);
    });
  });

  // ==========================================
  // Proteksi Middleware Otorisasi (Auth Guards)
  // ==========================================
  describe("Proteksi Hak Akses (Auth Middleware)", () => {
    it("harus menolak request tanpa token otentikasi (401)", () => {
      const req = { headers: {}, cookies: {} } as any;
      const res = { locals: {} } as any;
      const next = vi.fn();

      AuthMiddleware.authenticated()(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ResponseError));
      const error = next.mock.calls[0][0];
      expect(error.code).toBe("AUTHENTICATION_REQUIRED");
      expect(error.statusCode).toBe(401);
    });

    it("harus menolak anggota berstatus STAFF yang mengakses endpoint manajemen user (403)", () => {
      const req = {} as any;
      const res = { locals: { user: { id: "staff-1", role: Role.STAFF } } } as any;
      const next = vi.fn();

      AuthMiddleware.authorized([Role.LEAD])(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(ResponseError));
      const error = next.mock.calls[0][0];
      expect(error.code).toBe("FORBIDDEN");
      expect(error.statusCode).toBe(403);
    });

    it("harus mengizinkan pengguna berstatus LEAD untuk lewat middleware (next)", () => {
      const req = {} as any;
      const res = { locals: { user: { id: "lead-1", role: Role.LEAD } } } as any;
      const next = vi.fn();

      AuthMiddleware.authorized([Role.LEAD])(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  // ==========================================
  // Controller Response Formatting
  // ==========================================
  describe("Controller Response Wrapper", () => {
    it("harus mengembalikan response terstruktur { success, message, data } saat update status", async () => {
      const mockUpdatedUser = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        email: "staff1@tim.com",
        name: "Staff",
        role: Role.STAFF,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(UserService, "updateUserStatus").mockResolvedValue(mockUpdatedUser);

      const req = {
        params: { id: "123e4567-e89b-12d3-a456-426614174000" },
        body: { status: "ACTIVE" },
      } as any;

      const jsonMock = vi.fn();
      const res = {
        locals: { user: { id: "lead-admin-id" } },
        status: vi.fn().mockReturnValue({ json: jsonMock }),
      } as any;

      await UserController.updateStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        message: "Status anggota tim berhasil diaktifkan.",
        data: mockUpdatedUser,
      });
    });
  });
});

