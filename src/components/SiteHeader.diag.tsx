import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import SiteHeader from "./SiteHeader";

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

function renderHeader() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <SiteHeader />
      <Routes>
        <Route path="/login" element={<span>login destination</span>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SiteHeader auth action", () => {
  beforeEach(() => {
    headerMocks.context = null;
  });

  afterEach(cleanup);

  it("shows the existing login link when signed out", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute(
      "href",
      "/login"
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
        })
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
      expect(screen.getByText("login destination")).toBeInTheDocument()
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
