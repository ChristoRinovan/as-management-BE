import type { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ResponseError } from "../utils/errors/response-error.util";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Data input yang dikirim tidak valid.",
      error: {
        code: "VALIDATION_ERROR",
        fields: err.flatten().fieldErrors,
      },
    });
  }

  // 2. Custom Business Error (ResponseError)
  if (err instanceof ResponseError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: {
        code: err.code,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    });
  }

  // 3. Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: "Data duplikat telah terdaftar di sistem.",
        error: {
          code: "CONFLICT",
        },
      });
    }
    if (err.code === "P2025") {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Data yang diminta tidak ditemukan di database.",
        error: {
          code: "RESOURCE_NOT_FOUND",
        },
      });
    }
  }

  // 4. Fallback Internal Server Error
  console.error("[UNHANDLED_ERROR]", err);
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Terjadi kesalahan internal pada server.",
    error: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}

