import {
  NULL_ACCESS_TOKEN_PROVIDER,
  type AccessTokenProvider,
  type ClientConfig,
  type RequestOptions,
} from "../types/api";
import { normalizeError, normalizeNetworkError } from "./errors";

function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildQueryString(query: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(query).filter(
    ([, v]) => v !== undefined && v !== null,
  );
  if (entries.length === 0) return "";
  return "?" + entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly accessTokenProvider: AccessTokenProvider;

  constructor(config: ClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.defaultHeaders = { ...config.defaultHeaders };
    this.accessTokenProvider = config.accessTokenProvider ?? NULL_ACCESS_TOKEN_PROVIDER;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const requestId = options.requestId ?? generateRequestId();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-lovebud-request-id": requestId,
      ...this.defaultHeaders,
    };

    if (options.idempotencyKey) {
      headers["Idempotency-Key"] = options.idempotencyKey;
    }

    const token = await this.accessTokenProvider.getAccessToken();
    if (token !== null) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        assertSafeHeader(key, value);
        headers[key] = value;
      }
    }

    const method = (options.method ?? "GET").toUpperCase();
    const url = `${this.baseUrl}${path}${options.query ? buildQueryString(options.query as Record<string, string | number | boolean | undefined | null>) : ""}`;

    const fetchInit: RequestInit = {
      method,
      headers,
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

    const bodyText = await response.text();

    if (!response.ok) {
      throw await normalizeError(response, bodyText);
    }

    if (bodyText.length === 0) {
      return undefined as T;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.startsWith("application/json")) {
      return bodyText as T;
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      return bodyText as T;
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

function assertSafeHeader(key: string, value: string): void {
  if (/[\r\n]/.test(key) || /[\r\n]/.test(value)) {
    throw new Error(`Invalid header: CRLF detected in "${key}"`);
  }
}

export function createClient(config?: Partial<ClientConfig>): ApiClient {
  return new ApiClient({
    baseUrl: config?.baseUrl ?? "/api",
    defaultHeaders: config?.defaultHeaders,
    accessTokenProvider: config?.accessTokenProvider,
  });
}
