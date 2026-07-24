import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient, createClient } from "./client";
import { ApiErrorImpl, HeaderValidationError, isApiError, type AccessTokenProvider } from "../types/api";

function mockFetch(response: Response) {
  return vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("ApiClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("base URL", () => {
    it("uses /api as default", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees");
      expect(fetchSpy).toHaveBeenCalledWith("/api/trees", expect.anything());
    });

    it("accepts custom base URL", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = new ApiClient({ baseUrl: "https://example.com/proxy" });
      await client.request("/trees");
      expect(fetchSpy).toHaveBeenCalledWith(
        "https://example.com/proxy/trees",
        expect.anything(),
      );
    });

    it("strips trailing slash from base URL", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Authorization")).toBe("Bearer test-token");
    });

    it("omits Authorization when token is null", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("x-lovebud-request-id")).toBeDefined();
    });

    it("uses caller-provided request ID", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/comments", {
        method: "POST",
        idempotencyKey: "550e8400-e29b-41d4-a716-446655440000",
      });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Headers;
      expect(headers.get("Idempotency-Key")).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("omits Idempotency-Key when not provided", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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

    it("refuses to override Content-Type via options.headers", async () => {
      const client = createClient();
      await expect(
        client.request("/trees", { headers: { "Content-Type": "text/plain" } }),
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.get("/trees");
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.body).toBeUndefined();
    });
  });

  describe("query encoding", () => {
    it("encodes query parameters", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
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
      mockFetch(new Response(JSON.stringify({ id: "123" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }));
      const client = createClient();
      const result = await client.request<{ id: string }>("/trees/123");
      expect(result).toEqual({ id: "123" });
    });

    it("parses JSON with charset", async () => {
      mockFetch(new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json; charset=utf-8" },
      }));
      const client = createClient();
      const result = await client.request<{ ok: boolean }>("/trees");
      expect(result).toEqual({ ok: true });
    });

    it("recognizes application/problem+json as JSON", async () => {
      mockFetch(new Response(JSON.stringify({ detail: "problem" }), {
        status: 500,
        headers: { "content-type": "application/problem+json" },
      }));
      const client = createClient();
      await expect(client.request("/trees")).rejects.toThrow(ApiErrorImpl);
    });

    it("handles 204 No Content", async () => {
      mockFetch(new Response(null, { status: 204 }));
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
      mockFetch(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e);
      expect((err as ApiErrorImpl).code).toBe("INVALID_RESPONSE");
    });
  });

  describe("error responses", () => {
    it("throws normalized error on 4xx", async () => {
      mockFetch(new Response(JSON.stringify({ detail: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      }));
      const client = createClient();
      await expect(client.request("/trees/999")).rejects.toThrow(ApiErrorImpl);
    });

    it("throws normalized error on 5xx", async () => {
      mockFetch(new Response("Server Error", {
        status: 500,
        statusText: "Internal Server Error",
      }));
      const client = createClient();
      await expect(client.request("/trees")).rejects.toThrow(ApiErrorImpl);
    });
  });

  describe("AbortSignal", () => {
    it("passes AbortSignal to fetch", async () => {
      const controller = new AbortController();
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees", { signal: controller.signal });
      const init = fetchSpy.mock.calls[0][1] as RequestInit;
      expect(init.signal).toBe(controller.signal);
    });
  });

  describe("body stream errors", () => {
    it("normalizes response.text() TypeError as NETWORK_ERROR", async () => {
      const res = new Response("{}", { status: 200 });
      vi.spyOn(res, "text").mockRejectedValue(new TypeError("stream error"));
      mockFetch(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e) as ApiErrorImpl;
      expect(err.code).toBe("NETWORK_ERROR");
      expect(err.retryable).toBe(true);
    });

    it("normalizes response.text() AbortError as ABORT_ERROR", async () => {
      const res = new Response("{}", { status: 200 });
      vi.spyOn(res, "text").mockRejectedValue(
        new DOMException("stream abort", "AbortError"),
      );
      mockFetch(res);
      const client = createClient();
      const err = await client.request("/trees").catch((e) => e) as ApiErrorImpl;
      expect(err.code).toBe("ABORT_ERROR");
      expect(err.retryable).toBe(false);
    });
  });

  describe("401 no refresh retry", () => {
    it("does not retry on 401", async () => {
      const provider: AccessTokenProvider = {
        getAccessToken: vi.fn().mockResolvedValue("token"),
      };
      const fetchSpy = mockFetch(
        new Response(JSON.stringify({ detail: "Unauthorized" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      );
      const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
      await expect(client.request("/trees")).rejects.toThrow(ApiErrorImpl);
      expect(provider.getAccessToken).toHaveBeenCalledTimes(1);
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});

describe("AccessTokenProvider seam", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("uses null provider by default", async () => {
    mockFetch(new Response("{}", { status: 200 }));
    const client = createClient();
    await client.request("/trees");
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("calls custom provider", async () => {
    const getAccessToken = vi.fn().mockResolvedValue("custom-token");
    const provider: AccessTokenProvider = { getAccessToken };
    mockFetch(new Response("{}", { status: 200 }));
    const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
    await client.request("/trees");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("does not call forceRefresh automatically", async () => {
    const getAccessToken = vi.fn().mockResolvedValue("token");
    const provider: AccessTokenProvider = { getAccessToken };
    mockFetch(new Response("{}", { status: 200 }));
    const client = new ApiClient({ baseUrl: "/api", accessTokenProvider: provider });
    await client.request("/trees");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });
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
