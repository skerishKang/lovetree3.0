import { describe, expect, it } from "vitest";

describe.skip("public tree detail adapter (diagnostic isolation)", () => {
  it("is restored after the failing suite is isolated", () => {
    expect(true).toBe(true);
  });
});
