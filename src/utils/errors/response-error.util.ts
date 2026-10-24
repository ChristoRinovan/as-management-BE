import { AppErrors, AppErrorKey } from "../../constants/errors.constant";

export class ResponseError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly fields?: Record<string, string[]>;

  constructor(
    errorKey: AppErrorKey,
    customMessage?: string,
    fields?: Record<string, string[]>
  ) {
    const errorDef = AppErrors[errorKey];
    super(customMessage ?? errorDef.message);

    this.statusCode = errorDef.status;
    this.code = errorDef.code;
    if (fields) this.fields = fields;

    Object.setPrototypeOf(this, ResponseError.prototype);
  }
}

