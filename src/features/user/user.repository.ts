import { UserStatus } from "@prisma/client";
import { prisma } from "../../configs/database.config";
import { ListUsersQuery, UserItemDto } from "./user.types";

export class UserRepository {
  private static readonly USER_SELECT = {
    id: true,
    email: true,
    name: true,
    role: true,
    status: true,
    createdAt: true,
    updatedAt: true,
  };

  static async findUsers(query?: ListUsersQuery): Promise<UserItemDto[]> {
    return prisma.user.findMany({
      where: {
        ...(query?.status ? { status: query.status } : {}),
        ...(query?.role ? { role: query.role } : {}),
        ...(query?.search
          ? {
              OR: [
                { email: { contains: query.search, mode: "insensitive" } },
                { name: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      select: this.USER_SELECT,
      orderBy: { createdAt: "desc" },
    });
  }

  static async findUserById(id: string): Promise<UserItemDto | null> {
    return prisma.user.findUnique({
      where: { id },
      select: this.USER_SELECT,
    });
  }

  static async updateUserStatus(
    id: string,
    status: UserStatus
  ): Promise<UserItemDto> {
    return prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id },
        data: { status },
        select: this.USER_SELECT,
      });

      // Jika dinonaktifkan (INACTIVE), cabut semua refresh token aktif agar session berakhir
      if (status === UserStatus.INACTIVE) {
        await tx.refreshToken.updateMany({
          where: { userId: id, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }

      return updatedUser;
    });
  }
}

