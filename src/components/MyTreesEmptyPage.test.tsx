import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import App from "../App";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user:
      window.location.pathname === "/login"
        ? null
        : {
            uid: "presentation-test-user",
            displayName: null,
            email: null,
            photoURL: null,
            emailVerified: true,
          },
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("MyTreesEmptyPage — /my-trees/empty-demo", () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("renders the empty-state heading, guidance, CTAs, and quick-start list", () => {
    renderAppAt("/my-trees/empty-demo");

    expect(
      screen.getByRole("heading", { level: 1, name: "아직 러브트리가 없어요" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("처음 좋아하게 된 순간부터 하나씩 이어보세요"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "첫 순간 기록하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "예시 러브트리 보기" })).toBeInTheDocument();

    const quickStartList = screen.getByRole("list");
    expect(within(quickStartList).getAllByRole("listitem")).toHaveLength(3);
    for (const name of ["입덕", "첫 콘서트", "최애 무대"]) {
      expect(within(quickStartList).getByRole("button", { name })).toBeInTheDocument();
    }
    expect(screen.getAllByTestId("quick-start-item")).toHaveLength(3);
    expect(screen.getAllByTestId("quick-start-description")).toHaveLength(3);
  });

  it("keeps decorative SVGs hidden and unfocusable", () => {
    const { container } = renderAppAt("/my-trees/empty-demo");
    const svgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs).toHaveLength(4);
    svgs.forEach((svg) => expect(svg).toHaveAttribute("focusable", "false"));
  });

  it("navigates the primary CTA into the public demo and reads only its exact draft key", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    renderAppAt("/my-trees/empty-demo");
    getItemSpy.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "첫 순간 기록하기" }));

    expect(window.location.pathname).toBe("/tree/new-demo");
    expect(screen.getByRole("heading", { level: 1, name: "새 러브트리" })).toBeInTheDocument();
    expect(getItemSpy).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
    expect(
      getItemSpy.mock.calls.every(([key]) => key === PUBLIC_DEMO_STORAGE_KEY),
    ).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });

  it("uses every quick-start tag as a public demo entry point", () => {
    for (const name of ["입덕", "첫 콘서트", "최애 무대"]) {
      renderAppAt("/my-trees/empty-demo");
      fireEvent.click(screen.getByRole("button", { name }));
      expect(window.location.pathname).toBe("/tree/new-demo");
      expect(screen.getByRole("heading", { level: 1, name: "새 러브트리" })).toBeInTheDocument();
      cleanup();
      window.history.pushState({}, "", "/");
    }
  });

  it("navigates the example CTA to the public community tree", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/")) {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "community-demo", title: "테스트 러버 A의 러브트리", visibility: "public", createdAt: "2023-09-28T00:00:00.000Z", updatedAt: "2024-08-01T00:00:00.000Z", memoryCount: 8, likeCount: 128, viewCount: 1420 }), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      if (urlStr.includes("/api/community/memories")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    renderAppAt("/my-trees/empty-demo");
    fireEvent.click(screen.getByRole("button", { name: "예시 러브트리 보기" }));
    expect(window.location.pathname).toBe("/tree/community-demo");
    expect(
      await screen.findByRole("heading", { name: "테스트 러버 A의 러브트리" }),
    ).toBeInTheDocument();
  });

  it("does not expose selection semantics on quick-start actions", () => {
    renderAppAt("/my-trees/empty-demo");
    for (const name of ["입덕", "첫 콘서트", "최애 무대"]) {
      const tag = screen.getByRole("button", { name });
      expect(tag).not.toHaveAttribute("aria-pressed");
      expect(tag).not.toHaveAttribute("aria-selected");
      expect(tag).not.toHaveAttribute("role", "tab");
    }
  });

  it("keeps the initial empty state free of dialogs and alerts", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("performs no fetch or XHR writes while navigating its local demo CTAs", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    renderAppAt("/my-trees/empty-demo");

    fireEvent.click(screen.getByRole("button", { name: "첫 순간 기록하기" }));

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });
});
