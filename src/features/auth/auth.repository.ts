import { Role, User, UserStatus } from "@prisma/client";
import { prisma } from "../../configs/database.config";

export class AuthRepository {
  static async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  static async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  static async createInvitedUserWithToken(params: {
    email: string;
    name?: string;
    role: Role;
    token: string;
    expiresAt: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: params.email.toLowerCase(),
          name: params.name ?? null,
          role: params.role,
          status: UserStatus.PENDING,
        },
      });

      const invitation = await tx.invitationToken.create({
        data: {
          token: params.token,
          userId: user.id,
          expiresAt: params.expiresAt,
        },
      });

      return { user, invitation };
    });
  }

  static async findInvitationToken(token: string) {
    return prisma.invitationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  static async activateUserAtomically(params: {
    userId: string;
    tokenId: string;
    passwordHash: string;
  }) {
    return prisma.$transaction(async (tx) => {
      // Tandai token terpakai
      await tx.invitationToken.update({
        where: { id: params.tokenId },
        data: { usedAt: new Date() },
      });

      // Update password & status akun menjadi ACTIVE
      const updatedUser = await tx.user.update({
        where: { id: params.userId },
        data: {
          password: params.passwordHash,
          status: UserStatus.ACTIVE,
        },
      });

      return updatedUser;
    });
  }

  static async createRefreshToken(params: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data: {
        userId: params.userId,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
      },
    });
  }

  static async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  static async revokeRefreshToken(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }
}

