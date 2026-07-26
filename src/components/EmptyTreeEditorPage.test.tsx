import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import App from "../App";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

vi.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuthContext: () => null,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function renderStart() {
  window.history.pushState({}, "", "/tree/new-demo");
  render(<App />);
}

describe("EmptyTreeEditorPage — interactive public start", () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("renders the public interactive start semantics", () => {
    renderStart();
    expect(window.location.pathname).toBe("/tree/new-demo");
    expect(screen.getByRole("heading", { level: 1, name: "새 러브트리" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("러브트리 제목")).toBeRequired();
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
  });
});
