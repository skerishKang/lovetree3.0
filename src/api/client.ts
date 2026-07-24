import {
  NULL_ACCESS_TOKEN_PROVIDER,
  MANAGED_HEADERS,
  type AccessTokenProvider,
  type ClientConfig,
  type RequestOptions,
  isValidIdempotencyKey,
  isValidRequestId,
  generateRequestId,
  assertNoCrlf,
  HeaderValidationError,
  validateHttpToken,
  ApiErrorImpl,
} from "../types/api";
import { normalizeError, normalizeNetworkError } from "./errors";

function buildQueryString(query: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return "";
  return "?" + entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

function validateHeaderName(name: string): void {
  validateHttpToken(name);
  assertNoCrlf(name, `header name "${name}"`);
}

function validateHeaderValue(value: string, label: string): void {
  assertNoCrlf(value, label);
}

function buildManagedHeaders(
  requestId: string,
  idempotencyKey: string | undefined,
  token: string | null,
): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "x-lovebud-request-id": requestId,
  };
  if (idempotencyKey) {
    h["Idempotency-Key"] = idempotencyKey;
  }
  if (token !== null) {
    h["Authorization"] = `Bearer ${token}`;
  }
  return h;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly accessTokenProvider: AccessTokenProvider;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = { ...config.defaultHeaders };
    this.accessTokenProvider = config.accessTokenProvider ?? NULL_ACCESS_TOKEN_PROVIDER;

    for (const [key, value] of Object.entries(this.defaultHeaders)) {
      const lowerKey = key.toLowerCase();
      if (MANAGED_HEADERS.has(lowerKey)) {
        throw new HeaderValidationError(key,
          `managed header "${key}" cannot be set in defaultHeaders`);
      }
      validateHeaderName(key);
      validateHeaderValue(value, `default header "${key}"`);
    }
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const requestId = options.requestId ?? generateRequestId();
    if (options.requestId !== undefined) {
      if (!isValidRequestId(options.requestId)) {
        throw new HeaderValidationError("x-lovebud-request-id",
          "caller-supplied request ID is invalid (must match ^[A-Za-z0-9._:-]+$ and be <= 80 chars)");
      }
    }

    if (options.idempotencyKey !== undefined) {
      if (!isValidIdempotencyKey(options.idempotencyKey)) {
        throw new HeaderValidationError("Idempotency-Key",
          "key does not match server contract ^[A-Za-z0-9._:-]{8,128}$");
      }
    }

    const token = await this.accessTokenProvider.getAccessToken();
    const headers = buildManagedHeaders(requestId, options.idempotencyKey, token);

    for (const [key, value] of Object.entries(headers)) {
      validateHeaderValue(value, `managed header "${key}"`);
    }

    for (const [key, value] of Object.entries(this.defaultHeaders)) {
      validateHeaderValue(value, `default header "${key}"`);
      headers[key] = value;
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        const lowerKey = key.toLowerCase();
        if (MANAGED_HEADERS.has(lowerKey)) {
          throw new HeaderValidationError(key,
            `managed header "${key}" cannot be overridden per-request`);
        }
        validateHeaderName(key);
        validateHeaderValue(value, `request header "${key}"`);
        headers[key] = value;
      }
    }

    const method = (options.method ?? "GET").toUpperCase();
    const url = `${this.baseUrl}${path}${options.query ? buildQueryString(options.query as Record<string, string | number | boolean | undefined | null>) : ""}`;

    const fetchInit: RequestInit = {
      method,
      headers: new Headers(headers),
      signal: options.signal,
    };

    if (method !== "GET" && method !== "HEAD" && options.body !== undefined) {
      fetchInit.body = JSON.stringify(options.body);
    }

    let response: Response;
    try {
      response = await fetch(url, fetchInit);
    } catch (cause) {
      throw normalizeNetworkError(cause);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    let bodyText: string;
    try {
      bodyText = await response.text();
    } catch (cause) {
      throw normalizeNetworkError(cause);
    }

    if (!response.ok) {
      throw await normalizeError(response, bodyText);
    }

    if (bodyText.length === 0) {
      return undefined as T;
    }

    const responseType = options.responseType ?? "json";
    if (responseType === "text") {
      return bodyText as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const isJsonContentType = contentType.startsWith("application/json") ||
      (contentType.startsWith("application/") && contentType.includes("+json"));

    if (!isJsonContentType) {
      throw new ApiErrorImpl({
        status: response.status,
        code: "INVALID_RESPONSE",
        message: `Expected JSON but received content-type "${contentType}"`,
        retryable: false,
        rawCategory: "unknown",
      });
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      throw new ApiErrorImpl({
        status: response.status,
        code: "INVALID_RESPONSE",
        message: "Response body is not valid JSON",
        retryable: false,
        rawCategory: "unknown",
      });
    }
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }
}

export function createClient(config?: Partial<ClientConfig>): ApiClient {
  return new ApiClient({
    baseUrl: config?.baseUrl ?? "/api",
    defaultHeaders: config?.defaultHeaders,
    accessTokenProvider: config?.accessTokenProvider,
  });
}
