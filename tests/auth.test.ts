import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role, UserStatus } from "@prisma/client";
import { AuthService } from "../src/features/auth/auth.service";
import { AuthRepository } from "../src/features/auth/auth.repository";
import { AuthValidation } from "../src/features/auth/auth.validation";
import { MailerUtil } from "../src/utils/mailer.util";
import { HashUtil } from "../src/utils/hash.util";
import { ResponseError } from "../src/utils/errors/response-error.util";

describe("US-1: Autentikasi & Registrasi Anggota via Email Undangan", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // AC-1: Ketua Tim Mengundang Anggota
  // ==========================================
  describe("AC-1: Undangan Anggota via Email (Token 24 Jam)", () => {
    it("harus berhasil mengundang anggota baru dan mengirim email aktivasi", async () => {
      // Mock repository: email belum pernah terdaftar
      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValue(null);

      const mockCreatedUser = {
        id: "user-uuid-1",
        email: "staff1@tim.com",
        name: "Staff Satu",
        password: null,
        role: Role.STAFF,
        status: UserStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInvitation = {
        id: "token-uuid-1",
        token: "token-string-32-bytes",
        userId: mockCreatedUser.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };

      const createSpy = vi
        .spyOn(AuthRepository, "createInvitedUserWithToken")
        .mockResolvedValue({ user: mockCreatedUser, invitation: mockInvitation });

      const mailerSpy = vi
        .spyOn(MailerUtil, "sendInvitationEmail")
        .mockResolvedValue(undefined);

      const result = await AuthService.inviteUser({
        email: "staff1@tim.com",
        name: "Staff Satu",
        role: Role.STAFF,
      });

      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(mailerSpy).toHaveBeenCalledWith("staff1@tim.com", expect.any(String));
      expect(result.email).toBe("staff1@tim.com");
      expect(result.status).toBe(UserStatus.PENDING);
      expect(result.role).toBe(Role.STAFF);
    });

    it("harus menolak undangan jika email sudah terdaftar di sistem", async () => {
      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValue({
        id: "existing-user",
        email: "staff1@tim.com",
        name: "Existing",
        password: "hash",
        role: Role.STAFF,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.inviteUser({ email: "staff1@tim.com" })
      ).rejects.toThrow(ResponseError);

      await expect(
        AuthService.inviteUser({ email: "staff1@tim.com" })
      ).rejects.toMatchObject({ code: "EMAIL_ALREADY_REGISTERED", statusCode: 409 });
    });

    it("harus memvalidasi format email menggunakan Zod schema", () => {
      const valid = AuthValidation.INVITE_SCHEMA.safeParse({
        body: { email: "anggota@tim.com", name: "Budi" },
      });
      expect(valid.success).toBe(true);

      const invalid = AuthValidation.INVITE_SCHEMA.safeParse({
        body: { email: "bukan-email-valid" },
      });
      expect(invalid.success).toBe(false);
    });
  });

  // ==========================================
  // AC-2: Aktivasi Akun & Pengaturan Password
  // ==========================================
  describe("AC-2: Aktivasi Akun & Pembuatan Password", () => {
    it("harus berhasil mengaktivasi akun jika token valid (< 24 jam)", async () => {
      const validInvitation = {
        id: "inv-uuid-1",
        token: "valid-token-123",
        userId: "user-uuid-1",
        expiresAt: new Date(Date.now() + 10 * 60 * 60 * 1000), // masih berlaku 10 jam
        usedAt: null,
        createdAt: new Date(),
        user: {
          id: "user-uuid-1",
          email: "staff1@tim.com",
          name: "Staff Satu",
          password: null,
          role: Role.STAFF,
          status: UserStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.spyOn(AuthRepository, "findInvitationToken").mockResolvedValue(validInvitation);

      const activateSpy = vi
        .spyOn(AuthRepository, "activateUserAtomically")
        .mockResolvedValue({
          ...validInvitation.user,
          status: UserStatus.ACTIVE,
          password: "new-hashed-password",
        });

      const result = await AuthService.activateAccount({
        token: "valid-token-123",
        password: "SecretPassword123!",
      });

      expect(activateSpy).toHaveBeenCalledTimes(1);
      expect(result.status).toBe(UserStatus.ACTIVE);
      expect(result.email).toBe("staff1@tim.com");
    });

    it("harus menolak aktivasi jika token sudah kedaluwarsa (> 24 jam)", async () => {
      const expiredInvitation = {
        id: "inv-uuid-expired",
        token: "expired-token",
        userId: "user-uuid-1",
        expiresAt: new Date(Date.now() - 1000), // sudah lewat batas 24 jam
        usedAt: null,
        createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
        user: {
          id: "user-uuid-1",
          email: "staff1@tim.com",
          name: "Staff",
          password: null,
          role: Role.STAFF,
          status: UserStatus.PENDING,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.spyOn(AuthRepository, "findInvitationToken").mockResolvedValue(expiredInvitation);

      await expect(
        AuthService.activateAccount({
          token: "expired-token",
          password: "SecretPassword123!",
        })
      ).rejects.toMatchObject({ code: "TOKEN_EXPIRED", statusCode: 400 });
    });

    it("harus menolak aktivasi jika token tidak ditemukan atau sudah pernah digunakan", async () => {
      // Skenario token tidak ada
      vi.spyOn(AuthRepository, "findInvitationToken").mockResolvedValueOnce(null);

      await expect(
        AuthService.activateAccount({
          token: "token-palsu",
          password: "Password123",
        })
      ).rejects.toMatchObject({ code: "TOKEN_INVALID", statusCode: 400 });

      // Skenario token sudah usedAt
      vi.spyOn(AuthRepository, "findInvitationToken").mockResolvedValueOnce({
        id: "inv-already-used",
        token: "used-token",
        userId: "user-uuid-1",
        expiresAt: new Date(Date.now() + 10000),
        usedAt: new Date(), // sudah digunakan
        createdAt: new Date(),
        user: {} as any,
      });

      await expect(
        AuthService.activateAccount({
          token: "used-token",
          password: "Password123",
        })
      ).rejects.toMatchObject({ code: "TOKEN_INVALID", statusCode: 400 });
    });

    it("harus menolak password yang kurang dari 6 karakter melalui Zod schema", () => {
      const shortPassword = AuthValidation.ACTIVATE_SCHEMA.safeParse({
        body: { token: "token-123", password: "123" },
      });
      expect(shortPassword.success).toBe(false);
    });
  });

  // ==========================================
  // AC-3: Login Pengguna & JWT
  // ==========================================
  describe("AC-3: Login Pengguna & Sesi JWT", () => {
    it("harus berhasil login dengan email dan kata sandi yang valid serta akun ACTIVE", async () => {
      const rawPassword = "PasswordJuara123!";
      const hashedPassword = await HashUtil.hashPassword(rawPassword);

      const activeUser = {
        id: "user-active-1",
        email: "ketua@tim.com",
        name: "Ketua Tim",
        password: hashedPassword,
        role: Role.LEAD,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValue(activeUser);
      vi.spyOn(AuthRepository, "createRefreshToken").mockResolvedValue({} as any);

      const result = await AuthService.login({
        email: "ketua@tim.com",
        password: rawPassword,
      });

      expect(result.accessToken).toBeDefined();
      expect(typeof result.accessToken).toBe("string");
      expect(result.refreshToken).toBeDefined();
      expect(result.user.email).toBe("ketua@tim.com");
      expect(result.user.role).toBe(Role.LEAD);
      expect(result.user.status).toBe(UserStatus.ACTIVE);
    });

    it("harus menolak login jika kata sandi tidak cocok", async () => {
      const hashedPassword = await HashUtil.hashPassword("PasswordBenar123!");

      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValue({
        id: "user-1",
        email: "ketua@tim.com",
        name: "Ketua",
        password: hashedPassword,
        role: Role.LEAD,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.login({
          email: "ketua@tim.com",
          password: "PasswordSalah123!",
        })
      ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS", statusCode: 401 });
    });

    it("harus menolak login jika akun belum aktif (PENDING / INACTIVE)", async () => {
      const rawPassword = "PasswordValid123!";
      const hashedPassword = await HashUtil.hashPassword(rawPassword);

      // Akun PENDING
      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValueOnce({
        id: "user-pending",
        email: "calon@tim.com",
        name: "Calon Staff",
        password: hashedPassword,
        role: Role.STAFF,
        status: UserStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.login({
          email: "calon@tim.com",
          password: rawPassword,
        })
      ).rejects.toMatchObject({ code: "ACCOUNT_INACTIVE", statusCode: 403 });

      // Akun INACTIVE
      vi.spyOn(AuthRepository, "findUserByEmail").mockResolvedValueOnce({
        id: "user-inactive",
        email: "dinonaktifkan@tim.com",
        name: "Staff Nonaktif",
        password: hashedPassword,
        role: Role.STAFF,
        status: UserStatus.INACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(
        AuthService.login({
          email: "dinonaktifkan@tim.com",
          password: rawPassword,
        })
      ).rejects.toMatchObject({ code: "ACCOUNT_INACTIVE", statusCode: 403 });
    });
  });

  // ==========================================
  // Sesi Token & Refresh Token Rotation (RTR)
  // ==========================================
  describe("Refresh Token Rotation (RTR)", () => {
    it("harus menerbitkan token baru dan mencabut token lama saat refresh", async () => {
      const mockUser = {
        id: "user-rtr-1",
        email: "user@tim.com",
        name: "User RTR",
        password: "hash",
        role: Role.STAFF,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockStoredToken = {
        id: "refresh-token-id-1",
        userId: mockUser.id,
        tokenHash: "some-hash",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        revokedAt: null,
        createdAt: new Date(),
        user: mockUser,
      };

      vi.spyOn(AuthRepository, "findRefreshToken").mockResolvedValue(mockStoredToken);
      const revokeSpy = vi
        .spyOn(AuthRepository, "revokeRefreshToken")
        .mockResolvedValue({} as any);
      const createSpy = vi
        .spyOn(AuthRepository, "createRefreshToken")
        .mockResolvedValue({} as any);

      const result = await AuthService.refreshToken("raw-token-string");

      expect(revokeSpy).toHaveBeenCalledWith("refresh-token-id-1");
      expect(createSpy).toHaveBeenCalledTimes(1);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
  });
});

