import { Role, UserStatus } from "@prisma/client";

export interface UserItemDto {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListUsersQuery {
  status?: UserStatus;
  role?: Role;
  search?: string;
}

export interface UpdateUserStatusInput {
  status: UserStatus;
}

