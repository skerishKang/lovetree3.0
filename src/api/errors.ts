import { ApiErrorImpl, type ApiError, type ApiErrorCode } from "../types/api";

const MAX_FALLBACK_LENGTH = 200;

function defaultCodeForStatus(status: number): ApiErrorCode {
  if (status === 400) return "BAD_REQUEST";
  if (status === 401) return "UNAUTHORIZED";
  if (status === 403) return "FORBIDDEN";
  if (status === 404) return "NOT_FOUND";
  if (status === 405) return "METHOD_NOT_ALLOWED";
  if (status === 409) return "CONFLICT";
  if (status === 429) return "TOO_MANY_REQUESTS";
  if (status >= 500 && status < 600) return "INTERNAL_SERVER_ERROR";
  return "UNKNOWN";
}

function isRetryable(status: number, code: ApiErrorCode): boolean {
  if (code === "INVALID_RESPONSE") return false;
  if (status === 409 && code === "IDEMPOTENCY_KEY_REUSED") return false;
  if (status === 401) return false;
  if (status === 422) return false;
  if (status === 429) return true;
  if (status >= 500 && status < 600) return true;
  if (status === 0) return true;
  return false;
}

export interface SocialWriteErrorBody {
  error: string;
  code: string;
  retryAfterMs?: unknown;
}

export function isSocialWriteErrorBody(body: unknown): body is SocialWriteErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as Record<string, unknown>).error === "string" &&
    "code" in body &&
    typeof (body as Record<string, unknown>).code === "string"
  );
}

function extractRetryAfterMs(raw: unknown): number | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw >= 0 ? raw : undefined;
  }
  return undefined;
}

interface FastApiDetailBody {
  detail: unknown;
}

function isFastApiDetailBody(body: unknown): body is FastApiDetailBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "detail" in body
  );
}

function normalizeDetail(detail: unknown): string {
  if (typeof detail === "string") return detail.slice(0, MAX_FALLBACK_LENGTH);
  if (Array.isArray(detail)) {
    return detail.map((d) => {
      if (typeof d === "object" && d !== null && "msg" in d) {
        return String((d as Record<string, unknown>).msg);
      }
      return String(d);
    }).join("; ").slice(0, MAX_FALLBACK_LENGTH);
  }
  if (typeof detail === "object" && detail !== null) {
    try {
      const serialized = JSON.stringify(detail);
      return typeof serialized === "string"
        ? serialized.slice(0, MAX_FALLBACK_LENGTH)
        : "structured error detail";
    } catch {
      return "structured error detail";
    }
  }
  return String(detail).slice(0, MAX_FALLBACK_LENGTH);
}

async function tryParseJson(text: string): Promise<unknown> {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function isJsonContentType(contentType: string): boolean {
  const ct = contentType.toLowerCase().trim();
  return ct.startsWith("application/json") || ct.startsWith("application/") && ct.includes("+json");
}

export async function normalizeError(
  response: Response,
  bodyText?: string,
): Promise<ApiError> {
  const status = response.status;
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = bodyText ?? await response.text().catch(() => "");

  if (isJsonContentType(contentType) || rawBody.length > 0) {
    const parsed = await tryParseJson(rawBody);

    if (parsed !== null) {
      if (isSocialWriteErrorBody(parsed)) {
        const code = parsed.code as ApiErrorCode;
        return new ApiErrorImpl({
          status,
          code,
          message: parsed.error.slice(0, MAX_FALLBACK_LENGTH),
          retryAfterMs: extractRetryAfterMs(parsed.retryAfterMs),
          retryable: isRetryable(status, code),
          rawCategory: "social",
        });
      }

      if (isFastApiDetailBody(parsed)) {
        return new ApiErrorImpl({
          status,
          code: defaultCodeForStatus(status),
          message: normalizeDetail(parsed.detail),
          retryable: isRetryable(status, defaultCodeForStatus(status)),
          rawCategory: "fastapi",
        });
      }

      const maybeCode = (parsed as Record<string, unknown>).code;
      const maybeMessage = (parsed as Record<string, unknown>).message;
      if (typeof maybeCode === "string" && typeof maybeMessage === "string") {
        return new ApiErrorImpl({
          status,
          code: maybeCode as ApiErrorCode,
          message: maybeMessage.slice(0, MAX_FALLBACK_LENGTH),
          retryable: isRetryable(status, maybeCode as ApiErrorCode),
          rawCategory: "unknown",
        });
      }
    }

    if (isJsonContentType(contentType)) {
      return new ApiErrorImpl({
        status,
        code: "INVALID_RESPONSE",
        message: parsed === null ? "Response body is not valid JSON" : "unexpected JSON response structure",
        retryable: false,
        rawCategory: "unknown",
      });
    }
  }

  const fallbackMessage = (response.statusText || "Unknown error").slice(0, MAX_FALLBACK_LENGTH);
  return new ApiErrorImpl({
    status,
    code: defaultCodeForStatus(status),
    message: rawBody
      ? rawBody.slice(0, MAX_FALLBACK_LENGTH)
      : fallbackMessage,
    retryable: isRetryable(status, defaultCodeForStatus(status)),
    rawCategory: status === 0 ? "network" : "unknown",
  });
}

export function normalizeNetworkError(cause: unknown): ApiError {
  if (cause instanceof DOMException && cause.name === "AbortError") {
    return new ApiErrorImpl({
      status: 0,
      code: "ABORT_ERROR",
      message: "Request was aborted",
      retryable: false,
      rawCategory: "network",
    });
  }

  const message = cause instanceof Error ? cause.message : "Network request failed";
  return new ApiErrorImpl({
    status: 0,
    code: "NETWORK_ERROR",
    message: message.slice(0, MAX_FALLBACK_LENGTH),
    retryable: true,
    rawCategory: "network",
  });
}
