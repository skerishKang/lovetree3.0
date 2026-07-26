import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SiteHeader from "./SiteHeader";
import { HASH_SCROLL_ACTIVATION_EVENT } from "./HashScrollRestoration";

const headerMocks = vi.hoisted(() => ({
  context: null as null | {
    user: null | {
      uid: string;
      displayName: null;
      email: string;
      photoURL: null;
      emailVerified: boolean;
    };
    loading: boolean;
    tier: null;
    signInWithGoogle: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    expireSession: ReturnType<typeof vi.fn>;
  },
}));

vi.mock("../context/AuthContext", () => ({
  useAuthContext: () => headerMocks.context,
}));

function renderHeader(initialEntry = "/") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SiteHeader />
      <Routes>
        <Route path="/login" element={<span>login destination</span>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SiteHeader navigation", () => {
  beforeEach(() => {
    headerMocks.context = null;
  });

  afterEach(cleanup);

  it("renders localized home-anchor labels with real link destinations", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "소개" })).toHaveAttribute(
      "href",
      "/#about",
    );
    expect(screen.getByRole("link", { name: "주요 기능" })).toHaveAttribute(
      "href",
      "/#features",
    );
    expect(screen.queryByRole("link", { name: "About" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Features" })).not.toBeInTheDocument();
  });

  it("preserves Community, My Tree, and login destinations", () => {
    renderHeader();

    expect(screen.getByRole("link", { name: "Community" })).toHaveAttribute(
      "href",
      "/community",
    );
    expect(screen.getByRole("link", { name: "My Tree" })).toHaveAttribute(
      "href",
      "/my-trees",
    );
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("emits an explicit activation when the current hash is clicked again", async () => {
    let activationCount = 0;
    let activationDetail: unknown;
    const activationListener = (event: Event) => {
      activationCount += 1;
      activationDetail = (event as CustomEvent).detail;
    };
    window.addEventListener(HASH_SCROLL_ACTIVATION_EVENT, activationListener);
    renderHeader("/#about");

    await userEvent.setup().click(screen.getByRole("link", { name: "소개" }));

    expect(activationCount).toBe(1);
    expect(activationDetail).toEqual({ hash: "#about" });
    window.removeEventListener(HASH_SCROLL_ACTIVATION_EVENT, activationListener);
  });

  it("keeps keyboard activation semantics for repeated hash navigation", async () => {
    let activationCount = 0;
    const activationListener = () => {
      activationCount += 1;
    };
    window.addEventListener(HASH_SCROLL_ACTIVATION_EVENT, activationListener);
    renderHeader("/#features");
    const features = screen.getByRole("link", { name: "주요 기능" });

    features.focus();
    await userEvent.setup().keyboard("{Enter}");

    expect(activationCount).toBe(1);
    window.removeEventListener(HASH_SCROLL_ACTIVATION_EVENT, activationListener);
  });
});

describe("SiteHeader auth action", () => {
  beforeEach(() => {
    headerMocks.context = null;
  });

  afterEach(cleanup);

  it("shows the existing login link when signed out", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(screen.queryByRole("button", { name: "로그아웃" })).not.toBeInTheDocument();
  });

  it("shows logout without exposing user metadata or tokens", () => {
    headerMocks.context = {
      user: {
        uid: "secret-uid",
        displayName: null,
        email: "secret@example.com",
        photoURL: null,
        emailVerified: true,
      },
      loading: false,
      tier: null,
      signInWithGoogle: vi.fn(),
      signOut: vi.fn(),
      expireSession: vi.fn(),
    };
    renderHeader();

    expect(screen.getByRole("button", { name: "로그아웃" })).toBeInTheDocument();
    expect(screen.queryByText("secret-uid")).not.toBeInTheDocument();
    expect(screen.queryByText("secret@example.com")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("token");
  });

  it("suppresses duplicate logout and redirects after success", async () => {
    let resolveSignOut: () => void = () => undefined;
    const signOut = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSignOut = resolve;
        }),
    );
    headerMocks.context = {
      user: {
        uid: "u1",
        displayName: null,
        email: "u@example.com",
        photoURL: null,
        emailVerified: true,
      },
      loading: false,
      tier: null,
      signInWithGoogle: vi.fn(),
      signOut,
      expireSession: vi.fn(),
    };
    renderHeader();
    const user = userEvent.setup();
    const logout = screen.getByRole("button", { name: "로그아웃" });

    await user.click(logout);
    await user.click(logout);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(logout).toBeDisabled();

    await act(async () => {
      resolveSignOut();
    });
    await waitFor(() =>
      expect(screen.getByText("login destination")).toBeInTheDocument(),
    );
  });

  it("shows one bounded failure status and permits retry", async () => {
    const signOut = vi.fn().mockRejectedValue({
      code: "auth/raw-secret-code",
      token: "raw-token",
    });
    headerMocks.context = {
      user: {
        uid: "u1",
        displayName: null,
        email: "u@example.com",
        photoURL: null,
        emailVerified: true,
      },
      loading: false,
      tier: null,
      signInWithGoogle: vi.fn(),
      signOut,
      expireSession: vi.fn(),
    };
    renderHeader();

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "로그아웃" }));

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("로그아웃에 실패했습니다");
    expect(screen.getByRole("status")).not.toHaveTextContent("auth/raw-secret-code");
    expect(screen.getByRole("status")).not.toHaveTextContent("raw-token");
    expect(screen.getByRole("button", { name: "로그아웃" })).toBeEnabled();
  });
});
