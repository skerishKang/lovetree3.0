import { describe, it, expect, vi } from "vitest";
import { generateIdempotencyKey } from "./idempotency";
import { isValidIdempotencyKey, IDEMPOTENCY_KEY_PATTERN } from "../types/api";

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

  it("uses crypto.randomUUID", () => {
    const spy = vi.spyOn(crypto, "randomUUID");
    generateIdempotencyKey();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("fails closed when crypto.randomUUID is unavailable", () => {
    const orig = crypto.randomUUID;
    Object.defineProperty(crypto, "randomUUID", { value: undefined, configurable: true });
    expect(() => generateIdempotencyKey()).toThrow("crypto.randomUUID is not available");
    Object.defineProperty(crypto, "randomUUID", { value: orig, configurable: true });
  });
});

describe("IDEMPOTENCY_KEY_PATTERN", () => {
  it("matches the pattern /^[A-Za-z0-9._:-]{8,128}$/", () => {
    expect(IDEMPOTENCY_KEY_PATTERN.source).toBe("^[A-Za-z0-9._:-]{8,128}$");
  });
});

describe("isValidIdempotencyKey", () => {
  it("accepts a valid UUID (36 chars)", () => {
    expect(isValidIdempotencyKey("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
  });

  it("accepts minimum length (8 chars)", () => {
    expect(isValidIdempotencyKey("abcdef12")).toBe(true);
  });

  it("accepts maximum length (128 chars)", () => {
    const key = "a".repeat(128);
    expect(isValidIdempotencyKey(key)).toBe(true);
  });

  it("rejects 129 chars", () => {
    const key = "a".repeat(129);
    expect(isValidIdempotencyKey(key)).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidIdempotencyKey("")).toBe(false);
  });

  it("rejects too short (7 chars)", () => {
    expect(isValidIdempotencyKey("abc1234")).toBe(false);
  });

  it("rejects whitespace", () => {
    expect(isValidIdempotencyKey("abc def12")).toBe(false);
  });

  it("rejects Unicode", () => {
    expect(isValidIdempotencyKey("abc\u00e9def12")).toBe(false);
  });

  it("rejects CR/LF", () => {
    expect(isValidIdempotencyKey("abc\ndef12")).toBe(false);
    expect(isValidIdempotencyKey("abc\r\ndef12")).toBe(false);
  });

  it("rejects special characters like !@#$%^&*", () => {
    expect(isValidIdempotencyKey("550e8400-e29b-41d4-a716-44665544000!")).toBe(false);
    expect(isValidIdempotencyKey("550e8400-e29b-41d4-a716-44665544000@")).toBe(false);
  });
});
