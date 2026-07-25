import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { StrictMode, useState } from "react";
import * as firebaseAuth from "firebase/auth";
import { AuthProvider, useAuthContext } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";

vi.mock("firebase/auth", () => ({
  onIdTokenChanged: vi.fn(),
}));

vi.mock("../api/auth", () => ({
  getFirebaseAuth: vi.fn(() => ({})),
  ensureFirebaseAuthReady: vi.fn(() => Promise.resolve({})),
  signOutFirebase: vi.fn(),
}));

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function createMockUser(overrides: Partial<firebaseAuth.User> = {}): firebaseAuth.User {
    return {
      uid: "test-uid",
      displayName: "Test User",
      email: "test@example.com",
      photoURL: "https://example.com/photo.jpg",
      emailVerified: true,
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
      ...overrides,
    } as any;
  }

  function setupOnIdTokenChanged() {
    let callback: ((user: firebaseAuth.User | null) => void) | null = null;
    const unsubscribe = vi.fn();

    vi.mocked(firebaseAuth.onIdTokenChanged).mockImplementation((_auth, cb) => {
      callback = typeof cb === "function" ? cb : cb.next?.bind(cb) || null;
      return unsubscribe;
    });

    return {
      triggerCallback: async (user: firebaseAuth.User | null) => {
        await waitFor(() => {
          expect(callback).not.toBeNull();
        });
        if (callback) {
          await act(async () => {
            callback!(user);
          });
        }
      },
      unsubscribe,
    };
  }

  describe("initial loading state", () => {
    it("starts with loading true", () => {
      setupOnIdTokenChanged();

      function TestComponent() {
        const { loading } = useAuth();
        return <div data-testid="loading">{loading ? "loading" : "not loading"}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId("loading").textContent).toBe("loading");
    });
  });

  describe("null user callback", () => {
    it("sets loading false and user null on first null callback", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();

      function TestComponent() {
        const { user, loading } = useAuth();
        return (
          <div>
            <div data-testid="loading">{loading ? "loading" : "not loading"}</div>
            <div data-testid="user">{user ? "has user" : "no user"}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(null);

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("not loading");
        expect(screen.getByTestId("user").textContent).toBe("no user");
      });
    });
  });

  describe("authenticated user mapping", () => {
    it("maps only minimal user metadata", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser();

      function TestComponent() {
        const { user } = useAuth();
        return (
          <div data-testid="user">
            {user ? JSON.stringify(user) : "no user"}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        const userText = screen.getByTestId("user").textContent;
        expect(userText).not.toBe("no user");
        const user = JSON.parse(userText!);
        expect(user).toEqual({
          uid: "test-uid",
          displayName: "Test User",
          email: "test@example.com",
          photoURL: "https://example.com/photo.jpg",
          emailVerified: true,
        });
      });
    });

    it("does not expose raw token or refresh token", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser();

      function TestComponent() {
        const context = useAuthContext();
        return (
          <div data-testid="context">
            {context ? JSON.stringify(Object.keys(context)) : "no context"}
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        const contextText = screen.getByTestId("context").textContent;
        expect(contextText).not.toBe("no context");
        const keys = JSON.parse(contextText!);
        expect(keys).not.toContain("token");
        expect(keys).not.toContain("idToken");
        expect(keys).not.toContain("refreshToken");
      });
    });
  });

  describe("tier claim", () => {
    it("reads string tier claim", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser({
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: { tier: "premium" } }),
      });

      function TestComponent() {
        const { tier } = useAuth();
        return <div data-testid="tier">{tier ?? "null"}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("tier").textContent).toBe("premium");
      });
    });

    it("returns null for missing tier claim", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser({
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
      });

      function TestComponent() {
        const { tier } = useAuth();
        return <div data-testid="tier">{tier ?? "null"}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("tier").textContent).toBe("null");
      });
    });

    it("returns null for non-string tier claim", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser({
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: { tier: 123 } }),
      });

      function TestComponent() {
        const { tier } = useAuth();
        return <div data-testid="tier">{tier ?? "null"}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("tier").textContent).toBe("null");
      });
    });

    it("returns null when getIdTokenResult rejects", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser({
        getIdTokenResult: vi.fn().mockRejectedValue(new Error("Token error")),
      });

      function TestComponent() {
        const { tier } = useAuth();
        return <div data-testid="tier">{tier ?? "null"}</div>;
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("tier").textContent).toBe("null");
      });
    });
  });

  describe("null user clears prior tier", () => {
    it("clears tier when user becomes null", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const mockUser = createMockUser({
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: { tier: "premium" } }),
      });

      function TestComponent() {
        const { user, tier } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? "has user" : "no user"}</div>
            <div data-testid="tier">{tier ?? "null"}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("tier").textContent).toBe("premium");
      });

      await triggerCallback(null);

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no user");
        expect(screen.getByTestId("tier").textContent).toBe("null");
      });
    });
  });

  describe("stale async result suppression", () => {
    it("does not overwrite newer state with stale async result", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();

      let resolveUserA: (value: any) => void;
      const userAPromise = new Promise((resolve) => {
        resolveUserA = resolve;
      });

      const userA = createMockUser({
        uid: "user-a",
        getIdTokenResult: vi.fn().mockReturnValue(userAPromise),
      });

      const userB = createMockUser({
        uid: "user-b",
        getIdTokenResult: vi.fn().mockResolvedValue({ claims: { tier: "user-b-tier" } }),
      });

      function TestComponent() {
        const { user, tier } = useAuth();
        return (
          <div>
            <div data-testid="uid">{user?.uid ?? "null"}</div>
            <div data-testid="tier">{tier ?? "null"}</div>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(userA);

      await triggerCallback(userB);

      await waitFor(() => {
        expect(screen.getByTestId("uid").textContent).toBe("user-b");
        expect(screen.getByTestId("tier").textContent).toBe("user-b-tier");
      });

      act(() => {
        resolveUserA({ claims: { tier: "user-a-tier" } });
      });

      await waitFor(() => {
        expect(screen.getByTestId("uid").textContent).toBe("user-b");
        expect(screen.getByTestId("tier").textContent).toBe("user-b-tier");
      });
    });
  });

  describe("unmount cleanup", () => {
    it("calls unsubscribe exactly once on unmount", async () => {
      const { unsubscribe } = setupOnIdTokenChanged();

      function TestComponent() {
        useAuth();
        return <div>test</div>;
      }

      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(firebaseAuth.onIdTokenChanged).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe("StrictMode", () => {
    it("does not leak subscriptions in StrictMode", async () => {
      const { unsubscribe } = setupOnIdTokenChanged();

      function TestComponent() {
        useAuth();
        return <div>test</div>;
      }

      const { unmount } = render(
        <StrictMode>
          <AuthProvider>
            <TestComponent />
          </AuthProvider>
        </StrictMode>
      );

      await waitFor(() => {
        expect(firebaseAuth.onIdTokenChanged).toHaveBeenCalled();
      });

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });
  });

  describe("signOut", () => {
    it("clears state on success", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const { signOutFirebase } = await import("../api/auth");
      vi.mocked(signOutFirebase).mockResolvedValue(undefined);

      const mockUser = createMockUser();

      function TestComponent() {
        const { user, signOut } = useAuth();
        return (
          <div>
            <div data-testid="user">{user ? "has user" : "no user"}</div>
            <button onClick={signOut}>Sign Out</button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("has user");
      });

      await act(async () => {
        screen.getByText("Sign Out").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("no user");
      });
    });

    it("does not create false logout state on failure", async () => {
      const { triggerCallback } = setupOnIdTokenChanged();
      const { signOutFirebase } = await import("../api/auth");
      vi.mocked(signOutFirebase).mockRejectedValue(new Error("Sign out failed"));

      const mockUser = createMockUser();

      function TestComponent() {
        const { user, signOut } = useAuth();
        const [error, setError] = useState<string | null>(null);
        return (
          <div>
            <div data-testid="user">{user ? "has user" : "no user"}</div>
            <div data-testid="error">{error ?? "no error"}</div>
            <button onClick={async () => {
              try {
                await signOut();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unknown error");
              }
            }}>Sign Out</button>
          </div>
        );
      }

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await triggerCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("has user");
      });

      await act(async () => {
        screen.getByText("Sign Out").click();
      });

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("has user");
        expect(screen.getByTestId("error").textContent).toBe("Sign out failed");
      });
    });
  });
});
