import type { ErrorCode } from "@obraos/shared";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
  static notFound(code: ErrorCode, message: string) { return new AppError(code, message, 404); }
  static forbidden(message = "Sem permissão para esta ação.") { return new AppError("FORBIDDEN", message, 403); }
  static unauthenticated(message = "Sessão inválida ou expirada.") { return new AppError("UNAUTHENTICATED", message, 401); }
  static conflict(code: ErrorCode, message: string) { return new AppError(code, message, 409); }
}
