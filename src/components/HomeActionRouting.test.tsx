import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

interface TestUser {
  uid: string;
  displayName: null;
  email: null;
  photoURL: null;
  emailVerified: boolean;
}

const routeAuth = vi.hoisted(() => ({
  user: null as TestUser | null,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: routeAuth.user,
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

async function clickHomeAction(page: HTMLElement, linkName: string) {
  const link = page.querySelector(`a[href]`)?.closest("a");
  // Find the link with matching text
  const allLinks = Array.from(document.querySelectorAll("a"));
  const target = allLinks.find(l => l.textContent?.includes(linkName));
  if (!target) throw new Error(`Link "${linkName}" not found`);
  const user = userEvent.setup();
  await user.click(target);
}

describe("Home action routing", () => {
  afterEach(() => {
    cleanup();
    routeAuth.user = null;
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
  });

  describe("signed-out Hero primary", () => {
    it("navigates to /login with returnTo /tree/new", async () => {
      routeAuth.user = null;
      renderAppAt("/");

      const primary = screen.getByRole("link", { name: "첫 러브트리 만들기" });
      expect(primary).toHaveAttribute("href", "/tree/new");

      const user = userEvent.setup();
      await user.click(primary);

      await waitFor(() => expect(window.location.pathname).toBe("/login"));
      expect(
        screen.getByRole("heading", {
          level: 1,
          name: "내 러브트리를 계속 이어가려면 로그인하세요",
        }),
      ).toBeInTheDocument();

      const state = window.history.state as Record<string, unknown> | null;
      const returnTo = (state?.usr as Record<string, unknown> | undefined)?.returnTo ?? state?.returnTo;
      expect(returnTo).toBe("/tree/new");
    });
  });

  describe("signed-in Hero primary", () => {
    it("navigates to /tree/new and renders create form", async () => {
      routeAuth.user = {
        uid: "test-user",
        displayName: null,
        email: null,
        photoURL: null,
        emailVerified: true,
      };
      renderAppAt("/");

      const primary = screen.getByRole("link", { name: "첫 러브트리 만들기" });
      const user = userEvent.setup();
      await user.click(primary);

      await waitFor(() => expect(window.location.pathname).toBe("/tree/new"));
      expect(
        screen.getByRole("heading", { level: 1, name: "새 러브트리 만들기" }),
      ).toBeInTheDocument();
      expect(screen.getByLabelText("러브트리 제목")).toBeInTheDocument();
    });
  });

  describe("signed-out My Trees action", () => {
    it("navigates to /login with returnTo /my-trees", async () => {
      routeAuth.user = null;
      renderAppAt("/");

      const replayLink = screen.getByRole("link", { name: "다시 보기 — 내 러브트리 보기" });
      expect(replayLink).toHaveAttribute("href", "/my-trees");

      const user = userEvent.setup();
      await user.click(replayLink);

      await waitFor(() => expect(window.location.pathname).toBe("/login"));
      const state = window.history.state as Record<string, unknown> | null;
      const returnTo = (state?.usr as Record<string, unknown> | undefined)?.returnTo ?? state?.returnTo;
      expect(returnTo).toBe("/my-trees");
    });
  });

  describe("public demo action", () => {
    it("navigates to /tree/new-demo without login", async () => {
      routeAuth.user = null;
      renderAppAt("/");

      const connectLink = screen.getByText("연결하기").closest("a");
      expect(connectLink).not.toBeNull();
      expect(connectLink).toHaveAttribute("href", "/tree/new-demo");

      const user = userEvent.setup();
      await user.click(connectLink!);

      await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));
      expect(
        screen.getByRole("heading", { level: 1, name: "새 러브트리" }),
      ).toBeInTheDocument();
    });
  });

  describe("public Community actions", () => {
    it("Hero secondary navigates to /community", async () => {
      routeAuth.user = null;
      renderAppAt("/");

      const secondary = screen.getByRole("link", { name: "다른 러브트리 구경하기" });
      expect(secondary).toHaveAttribute("href", "/community");

      const user = userEvent.setup();
      await user.click(secondary);

      await waitFor(() => expect(window.location.pathname).toBe("/community"));
    });

    it("feature share navigates to /community", async () => {
      routeAuth.user = null;
      renderAppAt("/");

      const shareLink = screen.getByRole("link", { name: "공유하기 — Community 보기" });
      expect(shareLink).toHaveAttribute("href", "/community");

      const user = userEvent.setup();
      await user.click(shareLink);

      await waitFor(() => expect(window.location.pathname).toBe("/community"));
    });
  });

  describe("write safety", () => {
    it("no non-GET request is made during navigation-only clicks", async () => {
      routeAuth.user = null;
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      renderAppAt("/");
      const user = userEvent.setup();

      // Click feature links from home without navigating away
      const heroSecondary = screen.getByRole("link", { name: "다른 러브트리 구경하기" });
      await user.click(heroSecondary);
      await waitFor(() => expect(window.location.pathname).toBe("/community"));

      const nonGetCalls = fetchSpy.mock.calls.filter(([_, init]) => {
        if (!init || typeof init !== "object") return false;
        const method = (init as RequestInit).method;
        return method && method !== "GET" && method !== undefined;
      });
      expect(nonGetCalls).toHaveLength(0);
    });

    it("public demo navigation makes no POST request", async () => {
      routeAuth.user = null;
      const fetchSpy = vi.spyOn(globalThis, "fetch");

      renderAppAt("/");
      const user = userEvent.setup();

      const connectLink = screen.getByText("연결하기").closest("a")!;
      await user.click(connectLink);
      await waitFor(() => expect(window.location.pathname).toBe("/tree/new-demo"));

      const nonGetCalls = fetchSpy.mock.calls.filter(([_, init]) => {
        if (!init || typeof init !== "object") return false;
        const method = (init as RequestInit).method;
        return method && method !== "GET" && method !== undefined;
      });
      expect(nonGetCalls).toHaveLength(0);
    });
  });
});
