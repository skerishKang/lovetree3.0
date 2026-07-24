export type KnownApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "METHOD_NOT_ALLOWED"
  | "CONFLICT"
  | "IDEMPOTENCY_KEY_REUSED"
  | "RATE_LIMITED"
  | "RATE_LIMITED_MEMORY"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_SERVER_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "NETWORK_ERROR"
  | "ABORT_ERROR"
  | "INVALID_RESPONSE"
  | "UNKNOWN";

export type ApiErrorCode = KnownApiErrorCode | (string & { __brand?: never });

export type RawCategory = "social" | "fastapi" | "network" | "unknown";

const RAW_CATEGORIES: readonly string[] = ["social", "fastapi", "network", "unknown"];

export interface ApiError {
  status: number;
  code: ApiErrorCode;
  message: string;
  retryAfterMs?: number;
  retryable: boolean;
  rawCategory: RawCategory;
}

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  if (typeof obj.status !== "number" || !Number.isFinite(obj.status)) return false;
  if (typeof obj.code !== "string") return false;
  if (typeof obj.message !== "string") return false;
  if (typeof obj.retryable !== "boolean") return false;
  if (typeof obj.rawCategory !== "string") return false;
  if (!RAW_CATEGORIES.includes(obj.rawCategory)) return false;
  if (obj.retryAfterMs !== undefined) {
    if (obj.retryAfterMs === null) return false;
    if (typeof obj.retryAfterMs !== "number" || !Number.isFinite(obj.retryAfterMs as number)) {
      return false;
    }
    if ((obj.retryAfterMs as number) < 0) return false;
  }
  return true;
}

export class ApiErrorImpl extends Error implements ApiError {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly retryAfterMs?: number;
  readonly retryable: boolean;
  readonly rawCategory: RawCategory;

  constructor(params: ApiError) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.retryAfterMs = params.retryAfterMs;
    this.retryable = params.retryable;
    this.rawCategory = params.rawCategory;
  }
}

export interface AccessTokenProvider {
  getAccessToken(options?: {
    forceRefresh?: boolean;
  }): Promise<string | null>;
}

export const NULL_ACCESS_TOKEN_PROVIDER: AccessTokenProvider = {
  getAccessToken: async () => null,
};

export interface BaseRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  idempotencyKey?: string;
  requestId?: string;
}

export interface JsonRequestOptions extends BaseRequestOptions {
  responseType?: "json";
}

export interface TextRequestOptions extends BaseRequestOptions {
  responseType: "text";
}

export type RequestOptions = JsonRequestOptions | TextRequestOptions;

export interface ClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  accessTokenProvider?: AccessTokenProvider;
}

export const MANAGED_HEADERS = new Set([
  "authorization",
  "idempotency-key",
  "x-lovebud-request-id",
  "content-type",
]);

export const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;
const REQUEST_ID_MAX_LENGTH = 80;

export function isValidIdempotencyKey(key: string): boolean {
  return IDEMPOTENCY_KEY_PATTERN.test(key);
}

export function isValidRequestId(id: string): boolean {
  return REQUEST_ID_PATTERN.test(id) && id.length <= REQUEST_ID_MAX_LENGTH;
}

export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  throw new Error("crypto.randomUUID is not available");
}

export function assertNoCrlf(value: string, label: string): void {
  if (/[\r\n]/.test(value)) {
    throw new Error(`Invalid ${label}: CR/LF detected`);
  }
}

export class HeaderValidationError extends Error {
  readonly headerName: string;
  constructor(headerName: string, reason: string) {
    super(`${headerName}: ${reason}`);
    this.name = "HeaderValidationError";
    this.headerName = headerName;
  }
}

export function validateHttpToken(name: string): void {
  if (!/^[!#$%&'*+\-.^_`|~a-zA-Z0-9]+$/.test(name)) {
    throw new HeaderValidationError(name, "invalid HTTP token characters");
  }
}
