import { randomUUID } from "crypto";

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "QUOTA_EXCEEDED"
  | "AI_PROVIDER_ERROR"
  | "INTERNAL_ERROR";

/** User-facing Arabic copy. Never leaks internals. */
const MESSAGES: Record<AppErrorCode, string> = {
  UNAUTHORIZED: "يجب تسجيل الدخول للمتابعة.",
  FORBIDDEN: "ليس لديك صلاحية للوصول إلى هذا المحتوى.",
  NOT_FOUND: "لم يتم العثور على العنصر المطلوب.",
  VALIDATION_ERROR: "تحقق من البيانات المدخلة ثم حاول مرة أخرى.",
  RATE_LIMITED: "عدد المحاولات كبير. انتظر قليلًا ثم حاول مرة أخرى.",
  QUOTA_EXCEEDED: "لقد استهلكت حد الاستخدام في خطتك الحالية. قم بالترقية للمتابعة.",
  AI_PROVIDER_ERROR: "حدث خطأ أثناء إنشاء المحتوى. حاول مرة أخرى.",
  INTERNAL_ERROR: "حدث خطأ غير متوقع. حاول مرة أخرى.",
};

const STATUS: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  RATE_LIMITED: 429,
  QUOTA_EXCEEDED: 402,
  AI_PROVIDER_ERROR: 502,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly publicMessage: string;
  readonly requestId: string;

  constructor(code: AppErrorCode, publicMessage?: string, internalMessage?: string) {
    super(internalMessage ?? code);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS[code];
    this.publicMessage = publicMessage ?? MESSAGES[code];
    this.requestId = randomUUID();
  }
}

export function messageFor(code: AppErrorCode): string {
  return MESSAGES[code];
}

const SECRET_KEY_PATTERN = /(api[_-]?key|password|token|secret|authorization)/i;

/**
 * Structured server-side log. Deliberately logs *shape*, not payloads, so no
 * credential or user content can end up in a log aggregator.
 */
export function logError(
  error: unknown,
  context: { endpoint: string; userId?: string; requestId?: string }
): string {
  const requestId =
    context.requestId ?? (error instanceof AppError ? error.requestId : randomUUID());

  const raw = error instanceof Error ? error.message : "unknown error";
  const message = SECRET_KEY_PATTERN.test(raw) ? "[redacted]" : raw.slice(0, 300);

  console.error(
    JSON.stringify({
      level: "error",
      requestId,
      endpoint: context.endpoint,
      userId: context.userId ?? null,
      code: error instanceof AppError ? error.code : "INTERNAL_ERROR",
      message,
      timestamp: new Date().toISOString(),
    })
  );

  return requestId;
}

/** Converts anything thrown into a safe `{ message, code, requestId }` payload. */
export function toPublicError(error: unknown, endpoint: string, userId?: string) {
  const requestId = logError(error, { endpoint, userId });
  if (error instanceof AppError) {
    return { message: error.publicMessage, code: error.code, requestId, status: error.status };
  }
  return {
    message: MESSAGES.INTERNAL_ERROR,
    code: "INTERNAL_ERROR" as const,
    requestId,
    status: 500,
  };
}
