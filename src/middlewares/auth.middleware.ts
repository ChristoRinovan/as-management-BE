import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { JWTUtil } from "../utils/jwt.util";
import { ResponseError } from "../utils/errors/response-error.util";

export class AuthMiddleware {
  static authenticated() {
    return (req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
      }

      if (!token) {
        return next(new ResponseError("AUTHENTICATION_REQUIRED"));
      }

      try {
        const payload = JWTUtil.verifyAccessToken(token);
        res.locals.user = payload;
        next();
      } catch (err) {
        next(err);
      }
    };
  }

  static authorized(allowedRoles: Role[]) {
    return (_req: Request, res: Response, next: NextFunction) => {
      const user = res.locals.user;
      if (!user || !allowedRoles.includes(user.role)) {
        return next(
          new ResponseError("FORBIDDEN", "Anda tidak memiliki wewenang untuk mengakses sumber daya ini.")
        );
      }
      next();
    };
  }
}

