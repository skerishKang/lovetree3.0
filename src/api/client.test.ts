import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient, createClient } from "./client";
import { ApiErrorImpl, HeaderValidationError, isApiError, type AccessTokenProvider } from "../types/api";

function mockFetch(body: string, status = 200, contentType = "application/json") {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(body, { status, headers: { "content-type": contentType } }),
  );
}

describe("ApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("base URL", () => {
    it("uses /api as default", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees");
      expect(fetchSpy).toHaveBeenCalledWith("/api/trees", expect.anything());
    });

    it("accepts custom base URL", async () => {
      const fetchSpy = mockFetch("{}");
      const client = new ApiClient({ baseUrl: "https://example.com/proxy" });
      await client.request("/trees");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://example.com/proxy/trees",
        expect.anything(),
      );
    });

    it("strips trailing slash from base URL", async () => {
      const fetchSpy = mockFetch("{}");
      const client = new ApiClient({ baseUrl: "/api/" });
      await client.request("/trees");
      expect(fetchSpy).toHaveBeenCalledWith("/api/trees", expect.anything());
    });
  });

  describe("Authorization header", () => {
    it("includes Authorization when token is available", async () => {
      const provider: AccessTokenProvider = {
        getAccessToken: async () => "test-token",
      };
      const fetchSpy = mockFetch("{}");
      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer test-token");
    });

    it("omits Authorization when token is null", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBeNull();
    });

    it("rejects token with CR/LF", async () => {
      const provider: AccessTokenProvider = {
        getAccessToken: async () => "token\r\nmalicious",
      };
      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await expect(client.request("/trees")).rejects.toThrow("CR/LF detected");
    });
  });

  describe("request ID", () => {
    it("adds x-lovebud-request-id header", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("x-lovebud-request-id")).toBeDefined();
    });

    it("uses caller-provided request ID", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees", { requestId: "my-custom-id" });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("x-lovebud-request-id")).toBe("my-custom-id");
    });

    it("rejects invalid caller-provided request ID", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { requestId: "invalid id with space" }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("rejects oversized caller-provided request ID (81 chars)", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { requestId: "x".repeat(81) }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("accepts 80-char caller-provided request ID", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      const id = "a".repeat(80);
      await client.request("/trees", { requestId: id });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("x-lovebud-request-id")).toBe(id);
    });

    it("generates unique request IDs across calls", async () => {
      const client = createClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      let callCount = 0;
      fetchSpy.mockImplementation(() => {
        callCount++;
        return Promise.resolve(new Response(JSON.stringify({ call: callCount }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }));
      });
      const ids = new Set<string>();
      for (let i = 0; i < 10; i++) {
        await client.request("/trees");
        const call = fetchSpy.mock.calls[i];
        const headers = call[1]?.headers as Headers;
        ids.add(headers.get("x-lovebud-request-id")!);
      }
      expect(ids.size).toBe(10);
      fetchSpy.mockRestore();
    });
  });

  describe("Idempotency-Key", () => {
    it("passes valid Idempotency-Key header", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/comments", {
        method: "POST",
        idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
      });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Idempotency-Key")).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("omits Idempotency-Key when not provided", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Idempotency-Key")).toBeNull();
    });

    it("rejects invalid idempotency key (too short, 7 chars)", async () => {
      const client = createClient();
      await expect(
        client.request("/comments", { method: "POST", idempotencyKey: "abc1234" }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("rejects idempotency key with CR/LF", async () => {
      const client = createClient();
      await expect(
        client.request("/comments", { method: "POST", idempotencyKey: "key\nvalue" }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("does not call fetch for invalid idempotency key", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      const client = createClient();
      try {
        await client.request("/comments", { method: "POST", idempotencyKey: "" });
      } catch { /* expected */ }
      expect(fetchSpy).not.toHaveBeenCalled();
      fetchSpy.mockRestore();
    });
  });

  describe("managed header override protection", () => {
    it("refuses to override Authorization via options.headers", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { Authorization: "Bearer hack" } }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("refuses to override Idempotency-Key via options.headers", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { "Idempotency-Key": "hack" } }),
      ).rejects.toThrow(HeaderValidationError);
    });

    it("refuses to override x-lovebud-request-id via options.headers", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { "x-lovebud-request-id": "hack" } }),
      ).rejects.toThrow(HeaderValidationError);
    });
  });

  describe("header validation", () => {
    it("rejects CR/LF in per-request header name", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { "x-invalid\nheader": "val" } }),
      ).rejects.toThrow();
    });

    it("rejects CR/LF in per-request header value", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { "x-custom": "val\r\ninjected" } }),
      ).rejects.toThrow();
    });
  });

  describe("JSON body", () => {
    it("sends JSON body with Content-Type", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees", {
        method: "POST",
        body: { title: "My Tree" },
      });
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.body).toBe(JSON.stringify({ title: "My Tree" }));
      const headers = init.headers as Headers;
      expect(headers.get("Content-Type")).toBe("application/json");
    });

    it("does not include body for GET requests", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.get("/trees");
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.body).toBeUndefined();
    });
  });

  describe("query encoding", () => {
    it("encodes query parameters", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees", {
        query: { limit: 10, view: "summary" },
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/trees?limit=10&view=summary",
        expect.anything(),
      );
    });

    it("skips undefined and null query parameters", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees", {
        query: { limit: 10, offset: undefined, extra: null },
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/trees?limit=10",
        expect.anything(),
      );
    });

    it("encodes special characters in query values", async () => {
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/search", {
        query: { q: "hello world&more" },
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/search?q=hello%20world%26more",
        expect.anything(),
      );
    });
  });

  describe("success responses", () => {
    it("parses 200 JSON response", async () => {
      mockFetch(JSON.stringify({ id: "123" }));
      const client = createClient();
      const result = await client.request<{ id: string }>("/trees/123");
      expect(result).toEqual({ id: "123" });
    });

    it("parses JSON with charset", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "content-type": "application/json; charset=utf-8" },
        }),
      );
      const client = createClient();
      const result = await client.request<{ ok: boolean }>("/trees");
      expect(result).toEqual({ ok: true });
    });

    it("recognizes application/problem+json as JSON", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ detail: "problem" }), {
          status: 500,
          headers: { "content-type": "application/problem+json" },
        }),
      );
      const client = createClient();
      await expect(client.request("/trees")).rejects.toThrow(ApiErrorImpl);
    });

    it("handles 204 No Content", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
      const client = createClient();
      const result = await client.request("/trees/123");
      expect(result).toBeUndefined();
    });

    it("throws INVALID_RESPONSE for malformed successful JSON", async () => {
      const client = createClient();
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      fetchSpy.mockResolvedValue(new Response("{broken", {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      const err = await client.request<unknown>("/trees").catch((e) => e);
      expect(err).toBeInstanceOf(ApiErrorImpl);
      expect((err as ApiErrorImpl).code).toBe("INVALID_RESPONSE");
      fetchSpy.mockRestore();
    });

    it("throws INVALID_RESPONSE for malformed JSON (no charset)", async () => {
      const res = new Response("not-json", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
      vi.spyOn(globalThis, "fetch").mockResolvedValue(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e);
      expect((err as ApiErrorImpl).code).toBe("INVALID_RESPONSE");
    });
  });

  describe("error responses", () => {
    it("throws normalized error on 4xx", async () => {
      mockFetch(JSON.stringify({ detail: "Not found" }), 404);
      const client = createClient();
      await expect(client.request("/trees/999")).rejects.toThrow(ApiErrorImpl);
    });

    it("throws normalized error on 5xx", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        }),
      );
      const client = createClient();
      await expect(client.request("/trees")).rejects.toThrow(ApiErrorImpl);
    });
  });

  describe("AbortSignal", () => {
    it("passes AbortSignal to fetch", async () => {
      const controller = new AbortController();
      const fetchSpy = mockFetch("{}");
      const client = createClient();
      await client.request("/trees", { signal: controller.signal });
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.signal).toBe(controller.signal);
    });
  });

  describe("body stream errors", () => {
    it("normalizes response.text() TypeError as NETWORK_ERROR", async () => {
      const res = new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
      vi.spyOn(res, "text").mockRejectedValue(new TypeError("stream error"));
      vi.spyOn(globalThis, "fetch").mockResolvedValue(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e) as ApiErrorImpl;
      expect(err.code).toBe("NETWORK_ERROR");
      expect(err.retryable).toBe(true);
    });

    it("normalizes response.text() AbortError as ABORT_ERROR", async () => {
      const res = new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
      vi.spyOn(res, "text").mockRejectedValue(
        new DOMException("stream abort", "AbortError"),
      );
      vi.spyOn(globalThis, "fetch").mockResolvedValue(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e) as ApiErrorImpl;
      expect(err.code).toBe("ABORT_ERROR");
      expect(err.retryable).toBe(false);
    });
  });
});

describe("AccessTokenProvider seam", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses null provider by default", async () => {
    mockFetch("{}");
    const client = createClient();
    await client.request("/trees");
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("calls custom provider", async () => {
    const getAccessToken = vi.fn().mockResolvedValue("custom-token");
    const provider: AccessTokenProvider = { getAccessToken };
    mockFetch("{}");
    const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
    await client.request("/trees");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("does not call forceRefresh automatically", async () => {
    const getAccessToken = vi.fn().mockResolvedValue("token");
    const provider: AccessTokenProvider = { getAccessToken };
    mockFetch("{}");
    const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
    await client.request("/trees");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });
});

describe("defaultHeaders managed header protection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects default Authorization override", () => {
    expect(() => new ApiClient({
      baseUrl: "/api",
      defaultHeaders: { Authorization: "Bearer hack" },
    })).toThrow(HeaderValidationError);
  });

  it("rejects default Idempotency-Key override", () => {
    expect(() => new ApiClient({
      baseUrl: "/api",
      defaultHeaders: { "Idempotency-Key": "key" },
    })).toThrow(HeaderValidationError);
  });

  it("rejects default x-lovebud-request-id override", () => {
    expect(() => new ApiClient({
      baseUrl: "/api",
      defaultHeaders: { "x-lovebud-request-id": "custom" },
    })).toThrow(HeaderValidationError);
  });

  it("does not call fetch when defaultHeaders has managed header", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      new ApiClient({ baseUrl: "/api", defaultHeaders: { Authorization: "x" } });
    } catch { /* expected */ }
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("allows custom non-managed default headers", () => {
    const client = new ApiClient({
      baseUrl: "/api",
      defaultHeaders: { "x-custom": "value" },
    });
    expect(client).toBeDefined();
  });
});

describe("type-level overloads", () => {
  it("json mode permits generic T and returns Promise<T | undefined>", () => {
    type _Check1 = Promise<{ id: string } | undefined> extends ReturnType<ApiClient["request"]> ? true : false;
    const _check1: _Check1 = true;
    expect(_check1).toBe(true);
  });

  it("requestText returns Promise<string | undefined>", () => {
    type _Check2 = ReturnType<ApiClient["requestText"]>;
    const _check2: _Check2 extends Promise<string | undefined> ? true : false = true;
    expect(_check2).toBe(true);
  });
});

describe("responseType", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("default json mode accepts JSON response", async () => {
    mockFetch(JSON.stringify({ id: "123" }));
    const client = createClient();
    const result = await client.request<{ id: string }>("/trees");
    expect(result).toEqual({ id: "123" });
  });

  it("default json mode rejects text/plain response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not json", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const client = createClient();
    const err = await client.request("/trees").catch((e) => e) as ApiErrorImpl;
    expect(err.code).toBe("INVALID_RESPONSE");
    expect(err.message).toContain("text/plain");
  });

  it("text mode accepts text/plain response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("hello world", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const client = createClient();
    const result = await client.requestText("/trees");
    expect(result).toBe("hello world");
  });

  it("text mode empty body returns empty string", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const client = createClient();
    const result = await client.requestText("/trees");
    expect(result).toBe("");
  });

  it("json mode empty body returns undefined", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createClient();
    const result = await client.request("/trees");
    expect(result).toBeUndefined();
  });

  it("text mode returns string type at runtime", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("12345", {
        status: 200,
        headers: { "content-type": "text/plain" },
      }),
    );
    const client = createClient();
    const result = await client.requestText("/trees");
    expect(typeof result).toBe("string");
  });
});

  it("rejects null retryAfterMs", () => {
    expect(isApiError({
      status: 429,
      code: "RATE_LIMITED",
      message: "x",
      retryAfterMs: null,
      retryable: true,
      rawCategory: "social",
    })).toBe(false);
  });

  it("rejects negative retryAfterMs", () => {
    expect(isApiError({
      status: 429,
      code: "RATE_LIMITED",
      message: "x",
      retryAfterMs: -100,
      retryable: true,
      rawCategory: "social",
    })).toBe(false);
  });

describe("isApiError type guard", () => {
  it("accepts valid ApiErrorImpl", () => {
    const err = new ApiErrorImpl({
      status: 404,
      code: "NOT_FOUND",
      message: "not found",
      retryable: false,
      rawCategory: "fastapi",
    });
    expect(isApiError(err)).toBe(true);
  });

  it("accepts valid ApiError with retryAfterMs", () => {
    const err = new ApiErrorImpl({
      status: 429,
      code: "RATE_LIMITED",
      message: "too fast",
      retryAfterMs: 5000,
      retryable: true,
      rawCategory: "social",
    });
    expect(isApiError(err)).toBe(true);
  });

  it("rejects null", () => {
    expect(isApiError(null)).toBe(false);
  });

  it("rejects non-object", () => {
    expect(isApiError("error")).toBe(false);
  });

  it("rejects missing retryable", () => {
    expect(isApiError({ status: 500, code: "ERR", message: "x", rawCategory: "unknown" })).toBe(false);
  });

  it("rejects wrong field types (status string)", () => {
    expect(isApiError({
      status: "500",
      code: "ERR",
      message: "x",
      retryable: true,
      rawCategory: "unknown",
    })).toBe(false);
  });

  it("rejects wrong field types (code not string)", () => {
    expect(isApiError({
      status: 500,
      code: 123,
      message: "x",
      retryable: true,
      rawCategory: "unknown",
    })).toBe(false);
  });

  it("rejects invalid rawCategory", () => {
    expect(isApiError({
      status: 500,
      code: "ERR",
      message: "x",
      retryable: true,
      rawCategory: "foobar",
    })).toBe(false);
  });

  it("rejects retryAfterMs as string", () => {
    expect(isApiError({
      status: 429,
      code: "RATE_LIMITED",
      message: "x",
      retryAfterMs: "1000",
      retryable: true,
      rawCategory: "social",
    })).toBe(false);
  });

  it("rejects Infinity status", () => {
    expect(isApiError({
      status: Infinity,
      code: "ERR",
      message: "x",
      retryable: true,
      rawCategory: "unknown",
    })).toBe(false);
  });

  it("rejects NaN status", () => {
    expect(isApiError({
      status: NaN,
      code: "ERR",
      message: "x",
      retryable: true,
      rawCategory: "unknown",
    })).toBe(false);
  });
});

describe("ApiClient 401 refresh-and-retry", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function createMockProvider(tokens: Array<string | null | Error>): AccessTokenProvider {
    let callIndex = 0;
    return {
      getAccessToken: vi.fn(async (_options?: { forceRefresh?: boolean }) => {
        const result = tokens[callIndex++];
        if (result instanceof Error) {
          throw result;
        }
        return result;
      }),
    };
  }

  describe("refresh flow", () => {
    it("200 success: fetch once, no force refresh", async () => {
      const provider = createMockProvider(["token-1"]);
      const fetchSpy = mockFetch('{"success":true}');
      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      const result = await client.request("/trees");

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledWith();
      expect(result).toEqual({ success: true });
    });

    it("initial 401: one forced refresh and one retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      const result = await client.request("/trees");

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(2);
      expect(provider.getAccessToken).toHaveBeenNthCalledWith(1);
      expect(provider.getAccessToken).toHaveBeenNthCalledWith(2, { forceRefresh: true });
      expect(result).toEqual({ success: true });
    });

    it("retry uses refreshed Authorization", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees");

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      expect(firstHeaders.get("Authorization")).toBe("Bearer token-1");
      expect(secondHeaders.get("Authorization")).toBe("Bearer token-2");
    });

    it("second 401 stops after two fetches", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"error":"Still Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(2);
    });

    it("force refresh called exactly once", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees");

      const forceRefreshCalls = (provider.getAccessToken as any).mock.calls.filter(
        (call: any[]) => call[0]?.forceRefresh === true
      );
      expect(forceRefreshCalls).toHaveLength(1);
    });

    it("refresh throws: original normalized 401 is thrown", async () => {
      const provider = createMockProvider(["token-1", new Error("Refresh failed")]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("refresh returns null: original normalized 401 is thrown", async () => {
      const provider = createMockProvider(["token-1", null]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 401,
        code: "UNAUTHORIZED",
      });
    });

    it("403 does not trigger refresh", async () => {
      const provider = createMockProvider(["token-1"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Forbidden","code":"FORBIDDEN"}', {
          status: 403,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 403,
        code: "FORBIDDEN",
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it("429 does not trigger refresh", async () => {
      const provider = createMockProvider(["token-1"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Rate limited","code":"RATE_LIMITED"}', {
          status: 429,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 429,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it("500 does not trigger refresh", async () => {
      const provider = createMockProvider(["token-1"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Internal error","code":"INTERNAL_SERVER_ERROR"}', {
          status: 500,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 500,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it("already-aborted signal does not trigger retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const controller = new AbortController();
      controller.abort();

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees", { signal: controller.signal })).rejects.toMatchObject({
        status: 401,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it("network failure during retry is normalized correctly", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockRejectedValueOnce(new TypeError("Network error"));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        code: "NETWORK_ERROR",
      });
    });

    it("response parsing remains correct after retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"data":"value"}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      const result = await client.request<{ data: string }>("/trees");

      expect(result).toEqual({ data: "value" });
    });
  });

  describe("request identity preservation", () => {
    it("URL remains identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees/123");

      expect(fetchSpy.mock.calls[0][0]).toBe("/api/trees/123");
      expect(fetchSpy.mock.calls[1][0]).toBe("/api/trees/123");
    });

    it("query string remains identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { query: { page: 1, limit: 10 } });

      expect(fetchSpy.mock.calls[0][0]).toBe("/api/trees?page=1&limit=10");
      expect(fetchSpy.mock.calls[1][0]).toBe("/api/trees?page=1&limit=10");
    });

    it("HTTP method remains identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: { name: "test" } });

      expect(fetchSpy.mock.calls[0][1]?.method).toBe("POST");
      expect(fetchSpy.mock.calls[1][1]?.method).toBe("POST");
    });

    it("x-lovebud-request-id remains identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { requestId: "test-request-id" });

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      expect(firstHeaders.get("x-lovebud-request-id")).toBe("test-request-id");
      expect(secondHeaders.get("x-lovebud-request-id")).toBe("test-request-id");
    });

    it("Idempotency-Key remains identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", {
        method: "POST",
        body: { name: "test" },
        idempotencyKey: "test-key-12345678",
      });

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      expect(firstHeaders.get("Idempotency-Key")).toBe("test-key-12345678");
      expect(secondHeaders.get("Idempotency-Key")).toBe("test-key-12345678");
    });

    it("non-Authorization headers remain identical", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", {
        headers: { "X-Custom-Header": "custom-value" },
      });

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      expect(firstHeaders.get("X-Custom-Header")).toBe("custom-value");
      expect(secondHeaders.get("X-Custom-Header")).toBe("custom-value");
    });

    it("no new request ID is generated", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees");

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      const firstRequestId = firstHeaders.get("x-lovebud-request-id");
      const secondRequestId = secondHeaders.get("x-lovebud-request-id");

      expect(firstRequestId).toBe(secondRequestId);
    });

    it("no new idempotency key is generated", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", {
        method: "POST",
        body: { name: "test" },
        idempotencyKey: "test-key-12345678",
      });

      const firstHeaders = fetchSpy.mock.calls[0][1]?.headers as Headers;
      const secondHeaders = fetchSpy.mock.calls[1][1]?.headers as Headers;

      const firstKey = firstHeaders.get("Idempotency-Key");
      const secondKey = secondHeaders.get("Idempotency-Key");

      expect(firstKey).toBe(secondKey);
    });

    it("total fetch count never exceeds two", async () => {
      const provider = createMockProvider(["token-1", "token-2", "token-3"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees")).rejects.toMatchObject({
        status: 401,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("replayable bodies", () => {
    it("no body", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "GET" });

      expect(fetchSpy.mock.calls[0][1]?.body).toBeUndefined();
      expect(fetchSpy.mock.calls[1][1]?.body).toBeUndefined();
    });

    it("JSON object", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: { name: "test", value: 123 } });

      const firstBody = fetchSpy.mock.calls[0][1]?.body;
      const secondBody = fetchSpy.mock.calls[1][1]?.body;

      expect(firstBody).toBe('{"name":"test","value":123}');
      expect(secondBody).toBe('{"name":"test","value":123}');
    });

    it("primitive JSON value", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: 42 });

      const firstBody = fetchSpy.mock.calls[0][1]?.body;
      const secondBody = fetchSpy.mock.calls[1][1]?.body;

      expect(firstBody).toBe("42");
      expect(secondBody).toBe("42");
    });

    it("string under JSON contract", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: "test string" });

      const firstBody = fetchSpy.mock.calls[0][1]?.body;
      const secondBody = fetchSpy.mock.calls[1][1]?.body;

      expect(firstBody).toBe('"test string"');
      expect(secondBody).toBe('"test string"');
    });

    it("Blob", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const blob = new Blob(["test data"], { type: "text/plain" });
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: blob });

      const firstBody = fetchSpy.mock.calls[0][1]?.body;
      const secondBody = fetchSpy.mock.calls[1][1]?.body;

      expect(firstBody).toBe(blob);
      expect(secondBody).toBe(blob);
    });

    it("ArrayBuffer", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const data = new Uint8Array([116, 101, 115, 116, 32, 100, 97, 116, 97]);
      const buffer = data.buffer;
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: buffer });

      const firstBody = fetchSpy.mock.calls[0][1]?.body;
      const secondBody = fetchSpy.mock.calls[1][1]?.body;

      expect(firstBody).toBeDefined();
      expect(secondBody).toBeDefined();

      const firstBytes = firstBody instanceof ArrayBuffer
        ? new Uint8Array(firstBody)
        : firstBody instanceof Uint8Array
        ? firstBody
        : new Uint8Array(0);
      const secondBytes = secondBody instanceof ArrayBuffer
        ? new Uint8Array(secondBody)
        : secondBody instanceof Uint8Array
        ? secondBody
        : new Uint8Array(0);

      expect(Array.from(firstBytes)).toEqual([116, 101, 115, 116, 32, 100, 97, 116, 97]);
      expect(Array.from(secondBytes)).toEqual([116, 101, 115, 116, 32, 100, 97, 116, 97]);
    });

    it("typed array", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const typedArray = new Uint8Array([116, 101, 115, 116]);
      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: typedArray });

      const firstBody = fetchSpy.mock.calls[0][1]?.body as Uint8Array;
      const secondBody = fetchSpy.mock.calls[1][1]?.body as Uint8Array;

      expect(Array.from(firstBody)).toEqual([116, 101, 115, 116]);
      expect(Array.from(secondBody)).toEqual([116, 101, 115, 116]);
    });

    it("FormData string field", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const formData = new FormData();
      formData.append("field1", "value1");
      formData.append("field2", "value2");

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: formData });

      const firstBody = fetchSpy.mock.calls[0][1]?.body as FormData;
      const secondBody = fetchSpy.mock.calls[1][1]?.body as FormData;

      expect(firstBody.get("field1")).toBe("value1");
      expect(firstBody.get("field2")).toBe("value2");
      expect(secondBody.get("field1")).toBe("value1");
      expect(secondBody.get("field2")).toBe("value2");
    });

    it("FormData File entry with filename preservation", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const file = new File(["file content"], "test.txt", { type: "text/plain" });
      const formData = new FormData();
      formData.append("file", file);

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response('{"success":true}', {
          status: 200,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees", { method: "POST", body: formData });

      const firstBody = fetchSpy.mock.calls[0][1]?.body as FormData;
      const secondBody = fetchSpy.mock.calls[1][1]?.body as FormData;

      const firstFile = firstBody.get("file") as File;
      const secondFile = secondBody.get("file") as File;

      expect(firstFile.name).toBe("test.txt");
      expect(secondFile.name).toBe("test.txt");
    });
  });

  describe("non-replayable bodies", () => {
    it("ReadableStream does not retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("test"));
          controller.close();
        },
      });

      const fetchSpy = vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees", { method: "POST", body: stream })).rejects.toMatchObject({
        status: 401,
      });

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
    });

    it("locked stream does not retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("test"));
          controller.close();
        },
      });
      stream.getReader();

      const fetchSpy = vi.spyOn(globalThis, "fetch");

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });

      await expect(client.request("/trees", { method: "POST", body: stream })).rejects.toMatchObject({
        status: 0,
        code: "NETWORK_ERROR",
      });

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("responseType text behavior preserved", () => {
    it("text responseType works after retry", async () => {
      const provider = createMockProvider(["token-1", "token-2"]);
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(new Response('{"error":"Unauthorized","code":"UNAUTHORIZED"}', {
          status: 401,
          headers: { "content-type": "application/json" },
        }))
        .mockResolvedValueOnce(new Response("plain text response", {
          status: 200,
          headers: { "content-type": "text/plain" },
        }));

      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      const result = await client.requestText("/trees");

      expect(result).toBe("plain text response");
    });
  });
});
