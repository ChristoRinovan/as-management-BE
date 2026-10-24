import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../configs/env.config";
import { ResponseError } from "./errors/response-error.util";

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
  status: string;
  [key: string]: unknown;
}

export class JWTUtil {
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  static generateRefreshToken(payload: { id: string }): string {
    const options: SignOptions = {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
  }

  static verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
    } catch {
      throw new ResponseError("AUTHENTICATION_REQUIRED", "Token akses tidak valid atau telah kedaluwarsa.");
    }
  }

  static verifyRefreshToken(token: string): { id: string } {
    try {
      return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
    } catch {
      throw new ResponseError("AUTHENTICATION_REQUIRED", "Refresh token tidak valid atau telah kedaluwarsa.");
    }
  }
}
