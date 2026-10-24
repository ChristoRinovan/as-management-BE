import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Locals {
      user: {
        id: string;
        email: string;
        role: Role;
        status: string;
        [key: string]: unknown;
      };
    }
  }
}

