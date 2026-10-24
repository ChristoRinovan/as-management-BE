import { Role, UserStatus } from "@prisma/client";

export interface InviteUserInput {
  email: string;
  name?: string;
  role?: Role;
}

export interface ActivateAccountInput {
  token: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface UserProfileDto {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  status: UserStatus;
  createdAt: Date;
}

export interface AuthSessionResponse {
  user: UserProfileDto;
  accessToken: string;
  refreshToken: string;
}

