import { UserStatus } from "@prisma/client";
import { UserRepository } from "./user.repository";
import { ListUsersQuery, UpdateUserStatusInput, UserItemDto } from "./user.types";
import { ResponseError } from "../../utils/errors/response-error.util";

export class UserService {
  static async listUsers(query?: ListUsersQuery): Promise<UserItemDto[]> {
    return UserRepository.findUsers(query);
  }

  static async getUserById(id: string): Promise<UserItemDto> {
    const user = await UserRepository.findUserById(id);
    if (!user) {
      throw new ResponseError("RESOURCE_NOT_FOUND", "Anggota tim tidak ditemukan.");
    }
    return user;
  }

  static async updateUserStatus(
    targetUserId: string,
    currentUserId: string,
    input: UpdateUserStatusInput
  ): Promise<UserItemDto> {
    const existingUser = await UserRepository.findUserById(targetUserId);
    if (!existingUser) {
      throw new ResponseError("RESOURCE_NOT_FOUND", "Anggota tim tidak ditemukan.");
    }

    // Mencegah Ketua Tim menonaktifkan status akunnya sendiri
    if (targetUserId === currentUserId && input.status === UserStatus.INACTIVE) {
      throw new ResponseError(
        "FORBIDDEN",
        "Anda tidak dapat menonaktifkan status akun Anda sendiri."
      );
    }

    return UserRepository.updateUserStatus(targetUserId, input.status);
  }
}

