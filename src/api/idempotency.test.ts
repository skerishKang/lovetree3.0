import { describe, it, expect } from "vitest";
import { generateIdempotencyKey, isValidIdempotencyKey } from "./idempotency";

describe("generateIdempotencyKey", () => {
  it("generates a UUID v4 formatted string", () => {
    const key = generateIdempotencyKey();
    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it("generates unique keys", () => {
    const keys = new Set(Array.from({ length: 100 }, () => generateIdempotencyKey()));
    expect(keys.size).toBe(100);
  });

  it("generates a key matching the required pattern", () => {
    const key = generateIdempotencyKey();
    expect(isValidIdempotencyKey(key)).toBe(true);
  });
});

describe("isValidIdempotencyKey", () => {
  it("accepts a valid UUID", () => {
    expect(isValidIdempotencyKey("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidIdempotencyKey("")).toBe(false);
  });

  it("rejects too short key", () => {
    expect(isValidIdempotencyKey("abc")).toBe(false);
  });

  it("rejects key with special characters", () => {
    expect(isValidIdempotencyKey("550e8400-e29b-41d4-a716-44665544000!")).toBe(false);
  });
});
