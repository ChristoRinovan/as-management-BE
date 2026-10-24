import { Role, UserStatus } from "@prisma/client";
import { AuthRepository } from "./auth.repository";
import {
  ActivateAccountInput,
  AuthSessionResponse,
  InviteUserInput,
  LoginInput,
  UserProfileDto,
} from "./auth.types";
import { ResponseError } from "../../utils/errors/response-error.util";
import { HashUtil } from "../../utils/hash.util";
import { JWTUtil } from "../../utils/jwt.util";
import { MailerUtil } from "../../utils/mailer.util";

export class AuthService {
  static async inviteUser(input: InviteUserInput): Promise<UserProfileDto> {
    const existingUser = await AuthRepository.findUserByEmail(input.email);
    if (existingUser) {
      throw new ResponseError(
        "EMAIL_ALREADY_REGISTERED",
        `Alamat email ${input.email} sudah terdaftar di dalam sistem.`
      );
    }

    const token = HashUtil.generateRandomToken(32);
    // Batas kedaluwarsa tepat 24 jam sejak pembuatan
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const { user } = await AuthRepository.createInvitedUserWithToken({
      email: input.email,
      name: input.name,
      role: input.role ?? Role.STAFF,
      token,
      expiresAt,
    });

    // Kirim email undangan aktivasi dengan tautan 24 jam
    await MailerUtil.sendInvitationEmail(user.email, token);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  static async activateAccount(input: ActivateAccountInput): Promise<UserProfileDto> {
    const invitation = await AuthRepository.findInvitationToken(input.token);

    if (!invitation || invitation.usedAt !== null) {
      throw new ResponseError(
        "TOKEN_INVALID",
        "Token aktivasi tidak valid atau sudah pernah digunakan."
      );
    }

    // Periksa apakah batas waktu 24 jam telah lewat
    if (new Date() > invitation.expiresAt) {
      throw new ResponseError(
        "TOKEN_EXPIRED",
        "Tautan undangan sudah kedaluwarsa (melebihi 24 jam). Silakan minta Ketua Tim mengirim ulang undangan."
      );
    }

    const passwordHash = await HashUtil.hashPassword(input.password);
    const updatedUser = await AuthRepository.activateUserAtomically({
      userId: invitation.userId,
      tokenId: invitation.id,
      passwordHash,
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      status: updatedUser.status,
      createdAt: updatedUser.createdAt,
    };
  }

  static async login(input: LoginInput): Promise<AuthSessionResponse> {
    const user = await AuthRepository.findUserByEmail(input.email);

    if (!user || !user.password) {
      throw new ResponseError(
        "INVALID_CREDENTIALS",
        "Alamat email atau kata sandi tidak sesuai."
      );
    }

    const isPasswordValid = await HashUtil.comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new ResponseError(
        "INVALID_CREDENTIALS",
        "Alamat email atau kata sandi tidak sesuai."
      );
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new ResponseError(
        "ACCOUNT_INACTIVE",
        "Akun Anda tidak aktif atau belum diaktivasi. Silakan hubungi Ketua Tim."
      );
    }

    // Buat JWT Access Token
    const accessToken = JWTUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    // Buat Refresh Token aman (RTR dengan SHA-256)
    const rawRefreshToken = HashUtil.generateRandomToken(32);
    const tokenHash = HashUtil.sha256(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 hari

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
      },
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }

  static async refreshToken(rawRefreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenHash = HashUtil.sha256(rawRefreshToken);
    const storedToken = await AuthRepository.findRefreshToken(tokenHash);

    if (!storedToken || storedToken.revokedAt !== null || new Date() > storedToken.expiresAt) {
      throw new ResponseError(
        "AUTHENTICATION_REQUIRED",
        "Sesi refresh token tidak valid atau telah kedaluwarsa."
      );
    }

    // Cabut (revoke) token lama untuk mencegah replay attack
    await AuthRepository.revokeRefreshToken(storedToken.id);

    const user = storedToken.user;
    if (user.status !== UserStatus.ACTIVE) {
      throw new ResponseError("ACCOUNT_INACTIVE");
    }

    // Terbitkan token baru
    const newAccessToken = JWTUtil.generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    const newRawRefreshToken = HashUtil.generateRandomToken(32);
    const newTokenHash = HashUtil.sha256(newRawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await AuthRepository.createRefreshToken({
      userId: user.id,
      tokenHash: newTokenHash,
      expiresAt,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRawRefreshToken,
    };
  }

  static async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await AuthRepository.findUserById(userId);
    if (!user) {
      throw new ResponseError("RESOURCE_NOT_FOUND", "Pengguna tidak ditemukan.");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}

