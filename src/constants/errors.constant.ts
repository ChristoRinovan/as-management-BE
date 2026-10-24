import { StatusCodes } from "http-status-codes";

export const AppErrors = {
  // Auth & Token
  AUTHENTICATION_REQUIRED: {
    code: "AUTHENTICATION_REQUIRED",
    status: StatusCodes.UNAUTHORIZED,
    message: "Sesi Anda telah berakhir atau token tidak ditemukan.",
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    status: StatusCodes.UNAUTHORIZED,
    message: "Email atau kata sandi tidak sesuai.",
  },
  ACCOUNT_INACTIVE: {
    code: "ACCOUNT_INACTIVE",
    status: StatusCodes.FORBIDDEN,
    message: "Akun Anda berstatus nonaktif atau belum diaktivasi. Silakan hubungi Ketua Tim.",
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    status: StatusCodes.FORBIDDEN,
    message: "Anda tidak memiliki wewenang untuk mengakses sumber daya ini.",
  },
  TOKEN_EXPIRED: {
    code: "TOKEN_EXPIRED",
    status: StatusCodes.BAD_REQUEST,
    message: "Tautan undangan sudah kedaluwarsa (melebihi 24 jam). Silakan minta undangan baru.",
  },
  TOKEN_INVALID: {
    code: "TOKEN_INVALID",
    status: StatusCodes.BAD_REQUEST,
    message: "Token verifikasi tidak valid atau sudah pernah digunakan.",
  },

  // Resource / Conflict
  EMAIL_ALREADY_REGISTERED: {
    code: "EMAIL_ALREADY_REGISTERED",
    status: StatusCodes.CONFLICT,
    message: "Alamat email sudah terdaftar di dalam sistem.",
  },
  RESOURCE_NOT_FOUND: {
    code: "RESOURCE_NOT_FOUND",
    status: StatusCodes.NOT_FOUND,
    message: "Data yang diminta tidak ditemukan.",
  },
  RESOURCE_CONFLICT: {
    code: "RESOURCE_CONFLICT",
    status: StatusCodes.CONFLICT,
    message: "Data sudah ada atau sedang diproses oleh request lain.",
  },
  INVALID_STATE_TRANSITION: {
    code: "INVALID_STATE_TRANSITION",
    status: StatusCodes.BAD_REQUEST,
    message: "Aksi tidak dapat dilakukan pada status transaksi saat ini.",
  },

  // Server
  INTERNAL_SERVER_ERROR: {
    code: "INTERNAL_SERVER_ERROR",
    status: StatusCodes.INTERNAL_SERVER_ERROR,
    message: "Terjadi gangguan pada server internal.",
  },
} as const;

export type AppErrorKey = keyof typeof AppErrors;

