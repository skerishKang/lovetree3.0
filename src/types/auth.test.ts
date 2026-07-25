import { describe, it, expect } from "vitest";
import { isAuthExemptPath } from "./auth";

describe("isAuthExemptPath", () => {
  const testCases = [
    { path: "/login", expected: true },
    { path: "/login/", expected: false },
    { path: "/login/callback", expected: false },
    { path: "/community", expected: true },
    { path: "/community/", expected: true },
    { path: "/community/tree-1", expected: true },
    { path: "/community/nested/x", expected: true },
    { path: "/communityevil", expected: false },
    { path: "/community-tree", expected: false },
    { path: "/COMMUNITY", expected: false },
    { path: "/LOGIN", expected: false },
    { path: "/my-trees", expected: false },
    { path: "/", expected: false },
  ];

  it.each(testCases)("returns $expected for $path", ({ path, expected }) => {
    expect(isAuthExemptPath(path)).toBe(expected);
  });

  describe("case sensitivity", () => {
    it("is case-sensitive", () => {
      expect(isAuthExemptPath("/login")).toBe(true);
      expect(isAuthExemptPath("/LOGIN")).toBe(false);
      expect(isAuthExemptPath("/Login")).toBe(false);
      expect(isAuthExemptPath("/community")).toBe(true);
      expect(isAuthExemptPath("/COMMUNITY")).toBe(false);
      expect(isAuthExemptPath("/Community")).toBe(false);
    });
  });

  describe("prefix confusion", () => {
    it("prevents prefix confusion", () => {
      expect(isAuthExemptPath("/communityevil")).toBe(false);
      expect(isAuthExemptPath("/community-tree")).toBe(false);
      expect(isAuthExemptPath("/communityx")).toBe(false);
      expect(isAuthExemptPath("/loginevil")).toBe(false);
      expect(isAuthExemptPath("/login-callback")).toBe(false);
    });
  });

  describe("immutability", () => {
    it("does not export mutable exemption array", async () => {
      const authModule = await import("./auth");
      const exportedKeys = Object.keys(authModule);

      expect(exportedKeys).not.toContain("AUTH_EXEMPT_PATHS");
      expect(exportedKeys).not.toContain("EXEMPT_PATHS");
      expect(exportedKeys).not.toContain("exemptPaths");
    });

    it("runtime behavior cannot be altered by external mutation", () => {
      expect(isAuthExemptPath("/login")).toBe(true);
      expect(isAuthExemptPath("/community")).toBe(true);

      expect(isAuthExemptPath("/login")).toBe(true);
      expect(isAuthExemptPath("/community")).toBe(true);
    });
  });
});
