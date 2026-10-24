import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export class ResponseHelper {
  static success<T>(
    res: Response,
    data: T,
    message = "Permintaan berhasil diproses.",
    statusCode = StatusCodes.OK
  ) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created<T>(
    res: Response,
    data: T,
    message = "Data berhasil dibuat."
  ) {
    return this.success(res, data, message, StatusCodes.CREATED);
  }
}

