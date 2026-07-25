import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { AuthProvider } from "../context/AuthContext";
import * as firebaseAuth from "firebase/auth";

vi.mock("firebase/auth", () => ({
  onIdTokenChanged: vi.fn(),
}));

vi.mock("../api/auth", () => ({
  getFirebaseAuth: vi.fn(() => ({})),
  ensureFirebaseAuthReady: vi.fn(() => Promise.resolve({})),
  signOutFirebase: vi.fn(),
}));

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(firebaseAuth.onIdTokenChanged).mockReturnValue(vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns context value inside AuthProvider", () => {
    function TestComponent() {
      const auth = useAuth();
      return (
        <div>
          <div data-testid="loading">{auth.loading ? "loading" : "not loading"}</div>
          <div data-testid="user">{auth.user ? "has user" : "no user"}</div>
          <div data-testid="tier">{auth.tier ?? "null"}</div>
          <div data-testid="signOut">{typeof auth.signOut}</div>
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading").textContent).toBe("loading");
    expect(screen.getByTestId("user").textContent).toBe("no user");
    expect(screen.getByTestId("tier").textContent).toBe("null");
    expect(screen.getByTestId("signOut").textContent).toBe("function");
  });

  it("throws clear developer error outside provider", () => {
    function TestComponent() {
      useAuth();
      return <div>test</div>;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useAuth must be used within an AuthProvider");
  });

  it("does not expose nullable context", () => {
    function TestComponent() {
      const auth = useAuth();
      return (
        <div data-testid="auth">
          {auth === null ? "null" : "not null"}
        </div>
      );
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth").textContent).toBe("not null");
  });

  it("contains no navigation or redirect behavior", () => {
    function TestComponent() {
      const auth = useAuth();
      const keys = Object.keys(auth);
      return <div data-testid="keys">{keys.join(",")}</div>;
    }

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const keys = screen.getByTestId("keys").textContent;
    expect(keys).not.toContain("navigate");
    expect(keys).not.toContain("redirect");
    expect(keys).not.toContain("location");
  });
});
