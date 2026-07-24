import { describe, it, expect } from "vitest";
import { normalizeError, normalizeNetworkError } from "./errors";

function jsonResponse(
  status: number,
  body: unknown,
  contentType = "application/json",
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": contentType },
  });
}

function textResponse(status: number, body: string, contentType?: string): Response {
  const headers: Record<string, string> = {};
  if (contentType) headers["content-type"] = contentType;
  return new Response(body, { status, headers });
}

describe("normalizeError", () => {
  it("normalizes SocialWriteError", async () => {
    const res = jsonResponse(429, {
      error: "Rate limited",
      code: "RATE_LIMITED",
      retryAfterMs: 5000,
    });
    const err = await normalizeError(res);
    expect(err.status).toBe(429);
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.message).toBe("Rate limited");
    expect(err.retryAfterMs).toBe(5000);
    expect(err.retryable).toBe(true);
    expect(err.rawCategory).toBe("social");
  });

  it("normalizes SocialWriteError without retryAfterMs", async () => {
    const res = jsonResponse(400, {
      error: "Bad request",
      code: "BAD_REQUEST",
    });
    const err = await normalizeError(res);
    expect(err.status).toBe(400);
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.retryAfterMs).toBeUndefined();
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("social");
  });

  it("handles invalid retryAfterMs (negative)", async () => {
    const res = jsonResponse(429, {
      error: "negative",
      code: "RATE_LIMITED",
      retryAfterMs: -100,
    });
    const err = await normalizeError(res);
    expect(err.retryAfterMs).toBeUndefined();
  });

  it("handles invalid retryAfterMs (NaN)", async () => {
    const res = jsonResponse(429, {
      error: "not a number",
      code: "RATE_LIMITED",
      retryAfterMs: "string",
    });
    const err = await normalizeError(res);
    expect(err.retryAfterMs).toBeUndefined();
  });

  it("handles invalid retryAfterMs (Infinity)", async () => {
    const res = jsonResponse(429, {
      error: "inf",
      code: "RATE_LIMITED",
      retryAfterMs: Infinity,
    });
    const err = await normalizeError(res);
    expect(err.retryAfterMs).toBeUndefined();
  });

  it("handles invalid retryAfterMs (object)", async () => {
    const res = jsonResponse(429, {
      error: "object",
      code: "RATE_LIMITED",
      retryAfterMs: { value: 1000 },
    });
    const err = await normalizeError(res);
    expect(err.retryAfterMs).toBeUndefined();
  });

  it("normalizes FastAPI string detail", async () => {
    const res = jsonResponse(401, { detail: "Unauthorized" });
    const err = await normalizeError(res);
    expect(err.status).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Unauthorized");
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("fastapi");
  });

  it("normalizes FastAPI structured detail", async () => {
    const res = jsonResponse(422, {
      detail: [
        { loc: ["body", "title"], msg: "field required", type: "value_error.missing" },
      ],
    });
    const err = await normalizeError(res);
    expect(err.status).toBe(422);
    expect(err.message).toContain("field required");
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("fastapi");
  });

  it("normalizes unknown JSON envelope with code and message", async () => {
    const res = jsonResponse(403, { code: "FORBIDDEN", message: "Access denied" });
    const err = await normalizeError(res);
    expect(err.status).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Access denied");
    expect(err.rawCategory).toBe("unknown");
  });

  it("normalizes FastAPI detail as structured object", async () => {
    const res = new Response(JSON.stringify({
      detail: { reason: "validation failed", field: "title" },
    }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
    const err = await normalizeError(res);
    expect(typeof err.message).toBe("string");
    expect(err.message).toContain("validation failed");
    expect(err.message.length).toBeLessThanOrEqual(200);
  });

  it("normalizeDetail guard: JSON.stringify returning undefined handled", async () => {
    const orig = JSON.stringify.bind(JSON);
    vi.spyOn(JSON, "stringify").mockImplementation((...args: unknown[]) => {
      const val = args[0];
      if (typeof val === "object" && val !== null && "x" in val) {
        return undefined as unknown as string;
      }
      return orig(...(args as [unknown]));
    });
    const res = new Response('{"detail":{"x":1}}', {
      status: 400,
      headers: { "content-type": "application/json" },
    });
    const err = await normalizeError(res);
    expect(typeof err.message).toBe("string");
    expect(err.message).toBe("structured error detail");
    vi.restoreAllMocks();
  });

  it("normalizeDetail guard: JSON.stringify throw caught", async () => {
    const orig = JSON.stringify.bind(JSON);
    vi.spyOn(JSON, "stringify").mockImplementation((...args: unknown[]) => {
      const val = args[0];
      if (typeof val === "object" && val !== null && "x" in val) {
        throw new Error("mock failure");
      }
      return orig(...(args as [unknown]));
    });
    const res = new Response('{"detail":{"x":1}}', {
      status: 400,
      headers: { "content-type": "application/json" },
    });
    const err = await normalizeError(res);
    expect(typeof err.message).toBe("string");
    expect(err.message).toBe("structured error detail");
    vi.restoreAllMocks();
  });

  it("returns INVALID_RESPONSE for unrecognized JSON on error", async () => {
    const res = jsonResponse(400, { unrelated: "data" });
    const err = await normalizeError(res);
    expect(err.code).toBe("INVALID_RESPONSE");
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("unknown");
  });

  it("normalizes non-JSON 4xx/5xx", async () => {
    const res = textResponse(500, "Internal Server Error", "text/plain");
    const err = await normalizeError(res);
    expect(err.status).toBe(500);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
    expect(err.retryable).toBe(true);
    expect(err.rawCategory).toBe("unknown");
  });

  it("normalizes malformed JSON", async () => {
    const res = new Response("{broken", {
      status: 400,
      headers: { "content-type": "application/json" },
    });
    const err = await normalizeError(res, "{broken");
    expect(err.status).toBe(400);
    expect(err.code).toBe("INVALID_RESPONSE");
    expect(typeof err.message).toBe("string");
  });

  it("normalizes empty error body", async () => {
    const res = new Response(null, { status: 503 });
    const err = await normalizeError(res);
    expect(err.status).toBe(503);
    expect(err.retryable).toBe(true);
    expect(err.rawCategory).toBe("unknown");
  });

  it("handles 409 IDEMPOTENCY_KEY_REUSED as non-retryable", async () => {
    const res = jsonResponse(409, {
      error: "Idempotency key already used",
      code: "IDEMPOTENCY_KEY_REUSED",
    });
    const err = await normalizeError(res);
    expect(err.status).toBe(409);
    expect(err.code).toBe("IDEMPOTENCY_KEY_REUSED");
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("social");
  });

  it("limits fallback message length", async () => {
    const long = "x".repeat(1000);
    const res = textResponse(400, long, "text/plain");
    const err = await normalizeError(res);
    expect(err.message.length).toBeLessThanOrEqual(200);
  });

  it("recognizes application/problem+json as JSON", async () => {
    const res = new Response(JSON.stringify({ detail: "problem" }), {
      status: 500,
      headers: { "content-type": "application/problem+json" },
    });
    const err = await normalizeError(res);
    expect(err.rawCategory).toBe("fastapi");
    expect(err.message).toBe("problem");
  });

  it("recognizes application/vnd.api+json as JSON", async () => {
    const res = new Response(JSON.stringify({ code: "ERR", message: "api" }), {
      status: 400,
      headers: { "content-type": "application/vnd.api+json" },
    });
    const err = await normalizeError(res);
    expect(err.code).toBe("ERR");
  });
});

describe("normalizeNetworkError", () => {
  it("normalizes AbortError", () => {
    const abort = new DOMException("The user aborted a request", "AbortError");
    const err = normalizeNetworkError(abort);
    expect(err.status).toBe(0);
    expect(err.code).toBe("ABORT_ERROR");
    expect(err.retryable).toBe(false);
    expect(err.rawCategory).toBe("network");
  });

  it("normalizes fetch network failure", () => {
    const netErr = new TypeError("Failed to fetch");
    const err = normalizeNetworkError(netErr);
    expect(err.status).toBe(0);
    expect(err.code).toBe("NETWORK_ERROR");
    expect(err.retryable).toBe(true);
    expect(err.rawCategory).toBe("network");
  });

  it("normalizes unknown cause", () => {
    const err = normalizeNetworkError("something broke");
    expect(err.status).toBe(0);
    expect(err.code).toBe("NETWORK_ERROR");
    expect(typeof err.message).toBe("string");
  });
});
