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
