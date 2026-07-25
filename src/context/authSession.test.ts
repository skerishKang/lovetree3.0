import { describe, expect, it, vi } from "vitest";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  buildSafeReturnTarget,
  emitSessionExpired,
  isSafeInternalReturnTarget,
  resolveSafeReturnTarget,
} from "./authSession";

describe("authSession return-target contract", () => {
  it.each([
    "/",
    "/my-trees",
    "/tree/new-demo?source=login#editor",
    "/community?page=2",
  ])("accepts safe same-app target %s", (target) => {
    expect(isSafeInternalReturnTarget(target)).toBe(true);
    expect(resolveSafeReturnTarget(target)).toBe(target);
  });

  it.each([
    "",
    " ",
    "my-trees",
    "http://example.com",
    "https://example.com",
    "//example.com/path",
    "\\\\example.com",
    "/\\example.com",
    "javascript:alert(1)",
    "data:text/html,test",
    "%2F%2Fexample.com",
    "/%2F%2Fexample.com",
    "/%68%74%74%70%73%3A%2F%2Fexample.com",
    "/login",
    "/login?returnTo=/my-trees",
    "/login/again",
  ])("rejects unsafe target %s", (target) => {
    expect(isSafeInternalReturnTarget(target)).toBe(false);
    expect(resolveSafeReturnTarget(target)).toBe("/my-trees");
  });

  it("rejects non-string targets", () => {
    expect(isSafeInternalReturnTarget(null)).toBe(false);
    expect(isSafeInternalReturnTarget({ pathname: "/my-trees" })).toBe(false);
  });

  it("builds a safe path with search and hash", () => {
    expect(
      buildSafeReturnTarget({
        pathname: "/tree/new-demo",
        search: "?source=login",
        hash: "#editor",
      })
    ).toBe("/tree/new-demo?source=login#editor");
  });

  it("does not build a login-loop target", () => {
    expect(buildSafeReturnTarget({ pathname: "/login", search: "?again=1" })).toBeNull();
  });

  it("emits the typed event without mutating caller detail", () => {
    const listener = vi.fn();
    const detail = { returnTo: "/my-trees", source: "persistent-401" as const };
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);

    emitSessionExpired(detail);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual(detail);
    expect(event.detail).not.toBe(detail);

    window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, listener);
  });
});
