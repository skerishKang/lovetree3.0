import { describe, expect, it } from "vitest";
import {
  EMAIL_AUTH_MAX_EMAIL_LENGTH,
  EMAIL_AUTH_MAX_PASSWORD_LENGTH,
  hasValidEmailShape,
  hasValidPasswordLength,
  normalizeEmailInput,
} from "./emailAuthValidation";

describe("emailAuthValidation", () => {
  it("normalizes email by trimming surrounding whitespace", () => {
    expect(normalizeEmailInput("  user@example.com  ")).toBe("user@example.com");
    expect(normalizeEmailInput("\tuser@example.com\n")).toBe("user@example.com");
  });

  it.each([
    "user@example.com",
    "first.last@sub.example.co.kr",
    "a+b@example.com",
  ])("accepts a valid email shape: %s", (email) => {
    expect(hasValidEmailShape(email)).toBe(true);
  });

  it.each([
    "",
    "   ",
    "plainaddress",
    "missing@domain",
    "@example.com",
    "user@.com",
    "user @example.com",
    "user@@example.com",
  ])("rejects an invalid email shape: %s", (email) => {
    expect(hasValidEmailShape(email)).toBe(false);
  });

  it("accepts an email at the bounded maximum length", () => {
    const local = "a";
    const domain = `${"b".repeat(EMAIL_AUTH_MAX_EMAIL_LENGTH - 6)}.com`;
    const email = `${local}@${domain}`;
    expect(email.length).toBe(EMAIL_AUTH_MAX_EMAIL_LENGTH);
    expect(hasValidEmailShape(email)).toBe(true);
  });

  it("rejects an email beyond the bounded maximum length", () => {
    const email = `a@${"b".repeat(EMAIL_AUTH_MAX_EMAIL_LENGTH)}.com`;
    expect(email.length).toBeGreaterThan(EMAIL_AUTH_MAX_EMAIL_LENGTH);
    expect(hasValidEmailShape(email)).toBe(false);
  });

  it("rejects an empty password", () => {
    expect(hasValidPasswordLength("")).toBe(false);
  });

  it("accepts a password within the bounded maximum length", () => {
    expect(hasValidPasswordLength("x")).toBe(true);
    expect(hasValidPasswordLength("x".repeat(EMAIL_AUTH_MAX_PASSWORD_LENGTH))).toBe(true);
  });

  it("rejects a password beyond the bounded maximum length", () => {
    expect(hasValidPasswordLength("x".repeat(EMAIL_AUTH_MAX_PASSWORD_LENGTH + 1))).toBe(
      false
    );
  });
});
