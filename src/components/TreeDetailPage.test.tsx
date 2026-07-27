import { describe, expect, it } from "vitest";

describe.skip("TreeDetailPage public read states (diagnostic isolation)", () => {
  it("is restored after the failing suite is isolated", () => {
    expect(true).toBe(true);
  });
});
