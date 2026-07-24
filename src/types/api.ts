export type ApiErrorCode =
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
  | "UNKNOWN"
  | string;

export type RawCategory = "social" | "fastapi" | "network" | "unknown";

export interface ApiError {
  status: number;
  code: ApiErrorCode;
  message: string;
  retryAfterMs?: number;
  retryable: boolean;
  rawCategory: RawCategory;
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === "object" &&
    value !== null &&
    "status" in value &&
    "code" in value &&
    "message" in value &&
    "rawCategory" in value
  );
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

export interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  idempotencyKey?: string;
  requestId?: string;
}

export interface ClientConfig {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  accessTokenProvider?: AccessTokenProvider;
}
