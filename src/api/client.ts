import {
  NULL_ACCESS_TOKEN_PROVIDER,
  MANAGED_HEADERS,
  type AccessTokenProvider,
  type ClientConfig,
  type BaseRequestOptions,
  type JsonRequestOptions,
  type TextRequestOptions,
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

function isTextOptions(options: RequestOptions): boolean {
  return options.responseType === "text";
}

type ReplayableBody =
  | { type: "none" }
  | { type: "json"; serialized: string }
  | { type: "blob"; blob: Blob }
  | { type: "arraybuffer"; buffer: ArrayBuffer }
  | { type: "typedarray"; view: ArrayBufferView }
  | { type: "formdata"; entries: Array<[string, string | File]> }
  | { type: "non-replayable" };

function classifyBody(body: unknown, method: string): ReplayableBody {
  if (method === "GET" || method === "HEAD" || body === undefined) {
    return { type: "none" };
  }

  if (body instanceof Blob) {
    return { type: "blob", blob: body };
  }

  if (body instanceof ArrayBuffer) {
    return { type: "arraybuffer", buffer: body };
  }

  if (ArrayBuffer.isView(body)) {
    return { type: "typedarray", view: body };
  }

  if (body instanceof FormData) {
    const entries: Array<[string, string | File]> = [];
    body.forEach((value, key) => {
      entries.push([key, value]);
    });
    return { type: "formdata", entries };
  }

  if (body instanceof ReadableStream) {
    return { type: "non-replayable" };
  }

  try {
    const serialized = JSON.stringify(body);
    return { type: "json", serialized };
  } catch {
    return { type: "non-replayable" };
  }
}

function createBodyFromPlan(plan: ReplayableBody): BodyInit | undefined {
  switch (plan.type) {
    case "none":
      return undefined;
    case "json":
      return plan.serialized;
    case "blob":
      return plan.blob;
    case "arraybuffer":
      return plan.buffer.slice(0);
    case "typedarray": {
      const view = plan.view;
      const buffer = view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength);
      return new Uint8Array(buffer) as BodyInit;
    }
    case "formdata": {
      const formData = new FormData();
      for (const [key, value] of plan.entries) {
        if (value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, value);
        }
      }
      return formData;
    }
    case "non-replayable":
      return undefined;
  }
}

function shouldSetJsonContentType(plan: ReplayableBody): boolean {
  return plan.type === "json";
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

  request(path: string, options: TextRequestOptions): Promise<string | undefined>;
  request<T>(path: string, options?: JsonRequestOptions): Promise<T | undefined>;
  async request<T>(path: string, options: RequestOptions = {}): Promise<T | string | undefined> {
    const isText = isTextOptions(options);

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

    const method = (options.method ?? "GET").toUpperCase();
    const url = `${this.baseUrl}${path}${options.query ? buildQueryString(options.query as Record<string, string | number | boolean | undefined | null>) : ""}`;

    const bodyPlan = classifyBody(options.body, method);

    const executeRequest = async (token: string | null): Promise<Response> => {
      const headers = buildManagedHeaders(requestId, options.idempotencyKey, token);

      if (shouldSetJsonContentType(bodyPlan)) {
        headers["Content-Type"] = "application/json";
      }

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

      const fetchInit: RequestInit = {
        method,
        headers: new Headers(headers),
        signal: options.signal,
      };

      const body = createBodyFromPlan(bodyPlan);
      if (body !== undefined) {
        fetchInit.body = body;
      }

      return fetch(url, fetchInit);
    };

    const parseResponse = async (response: Response): Promise<T | string | undefined> => {
      if (response.status === 204) {
        return undefined;
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

      if (isText) {
        return bodyText;
      }

      if (bodyText.length === 0) {
        return undefined;
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
    };

    const token = await this.accessTokenProvider.getAccessToken();

    let response: Response;
    try {
      response = await executeRequest(token);
    } catch (cause) {
      if (cause instanceof HeaderValidationError) {
        throw cause;
      }
      throw normalizeNetworkError(cause);
    }

    if (response.status !== 401) {
      return parseResponse(response);
    }

    const originalError = await normalizeError(response, await response.text());

    if (bodyPlan.type === "non-replayable") {
      throw originalError;
    }

    if (options.signal?.aborted) {
      throw originalError;
    }

    let refreshedToken: string | null;
    try {
      refreshedToken = await this.accessTokenProvider.getAccessToken({ forceRefresh: true });
    } catch {
      throw originalError;
    }

    if (refreshedToken === null) {
      throw originalError;
    }

    let retryResponse: Response;
    try {
      retryResponse = await executeRequest(refreshedToken);
    } catch (cause) {
      if (cause instanceof HeaderValidationError) {
        throw cause;
      }
      throw normalizeNetworkError(cause);
    }

    return parseResponse(retryResponse);
  }

  requestText(path: string, options?: Omit<BaseRequestOptions, "responseType">): Promise<string | undefined> {
    return this.request(path, { ...options, responseType: "text" } as TextRequestOptions);
  }

  get<T>(path: string, options?: JsonRequestOptions): Promise<T | undefined> {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T>(path: string, body?: unknown, options?: JsonRequestOptions): Promise<T | undefined> {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T>(path: string, body?: unknown, options?: JsonRequestOptions): Promise<T | undefined> {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  delete<T>(path: string, options?: JsonRequestOptions): Promise<T | undefined> {
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
