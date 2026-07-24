import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiClient, createClient } from "./client";
import { ApiErrorImpl, type AccessTokenProvider } from "../types/api";

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
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBe("Bearer test-token");
    });

    it("omits Authorization when token is null", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Authorization"]).toBeUndefined();
    });
  });

  describe("request ID", () => {
    it("adds x-lovebud-request-id header", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["x-lovebud-request-id"]).toBeDefined();
      expect(typeof headers["x-lovebud-request-id"]).toBe("string");
    });

    it("uses caller-provided request ID", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees", { requestId: "my-custom-id" });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["x-lovebud-request-id"]).toBe("my-custom-id");
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
        const headers = call[1]?.headers as Record<string, string>;
        ids.add(headers["x-lovebud-request-id"]);
      }
      expect(ids.size).toBe(10);
      fetchSpy.mockRestore();
    });
  });

  describe("Idempotency-Key", () => {
    it("passes Idempotency-Key header when provided", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/comments", {
        method: "POST",
        idempotencyKey: "key-123",
      });
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Idempotency-Key"]).toBe("key-123");
    });

    it("omits Idempotency-Key when not provided", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.request("/trees");
      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers["Idempotency-Key"]).toBeUndefined();
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
      const headers = init.headers as Record<string, string>;
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("does not include body for GET requests", async () => {
      const fetchSpy = mockFetch(new Response("{}", { status: 200 }));
      const client = createClient();
      await client.get("/trees", { body: { should: "be ignored" } as unknown as undefined });
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

    it("handles 204 No Content", async () => {
      mockFetch(new Response(null, { status: 204 }));
      const client = createClient();
      const result = await client.request("/trees/123");
      expect(result).toBeUndefined();
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
      expect(vi.mocked(provider.getAccessToken)).toHaveBeenCalledTimes(1);
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
    const headers = vi.mocked(fetch).mock.calls[0][1]?.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
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
