import { ZodType } from "zod";

export function validate<T>(schema: ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

