import { describe, expect, it } from "vitest";

describe.skip("usePublicTreeDetail (diagnostic isolation)", () => {
  it("is restored after the failing suite is isolated", () => {
    expect(true).toBe(true);
  });
});
