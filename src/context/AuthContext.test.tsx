import { StrictMode, useState } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as firebaseAuth from "firebase/auth";
import { AuthProvider, useAuthContext } from "./AuthContext";
import { useAuth } from "../hooks/useAuth";

const authApiMocks = vi.hoisted(() => ({
  ensureFirebaseAuthReady: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOutFirebase: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  onIdTokenChanged: vi.fn(),
}));

vi.mock("../api/auth", () => ({
  ensureFirebaseAuthReady: authApiMocks.ensureFirebaseAuthReady,
  signInWithGoogle: authApiMocks.signInWithGoogle,
  signOutFirebase: authApiMocks.signOutFirebase,
}));

interface ListenerHarness {
  emit(user: firebaseAuth.User | null): Promise<void>;
  unsubscribe: ReturnType<typeof vi.fn>;
}

function createMockUser(
  overrides: Partial<firebaseAuth.User> = {}
): firebaseAuth.User {
  return {
    uid: "test-uid",
    displayName: "Test User",
    email: "test@example.com",
    photoURL: "https://example.com/photo.jpg",
    emailVerified: true,
    getIdTokenResult: vi.fn().mockResolvedValue({ claims: {} }),
    ...overrides,
  } as firebaseAuth.User;
}

function setupListener(): ListenerHarness {
  let callback: ((user: firebaseAuth.User | null) => void) | null = null;
  const unsubscribe = vi.fn();

  vi.mocked(firebaseAuth.onIdTokenChanged).mockImplementation((_auth, observer) => {
    callback =
      typeof observer === "function"
        ? observer
        : observer.next?.bind(observer) ?? null;
    return unsubscribe;
  });

  return {
    async emit(user) {
      await waitFor(() => expect(callback).not.toBeNull());
      await act(async () => {
        callback?.(user);
      });
    },
    unsubscribe,
  };
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authApiMocks.ensureFirebaseAuthReady.mockResolvedValue({});
    authApiMocks.signInWithGoogle.mockResolvedValue(undefined);
    authApiMocks.signOutFirebase.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("starts loading and transitions to signed out", async () => {
    const listener = setupListener();

    function Probe() {
      const { loading, user } = useAuth();
      return (
        <>
          <span data-testid="loading">{String(loading)}</span>
          <span data-testid="user">{user?.uid ?? "none"}</span>
        </>
      );
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("true");
    await listener.emit(null);
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("maps signed-in user metadata and tier without raw token fields", async () => {
    const listener = setupListener();
    const user = createMockUser({
      getIdTokenResult: vi.fn().mockResolvedValue({
        claims: { tier: "premium", rawToken: "must-not-leak" },
      }),
    });

    function Probe() {
      const context = useAuth();
      return <pre data-testid="context">{JSON.stringify(context)}</pre>;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await listener.emit(user);

    await waitFor(() => {
      const serialized = screen.getByTestId("context").textContent ?? "";
      expect(serialized).toContain('"uid":"test-uid"');
      expect(serialized).toContain('"tier":"premium"');
      expect(serialized).not.toContain("rawToken");
      expect(serialized).not.toContain("idToken");
      expect(serialized).not.toContain("refreshToken");
    });
  });

  it("exposes the minimal UI methods and calls Google sign-in once", async () => {
    setupListener();

    function Probe() {
      const context = useAuth();
      return (
        <>
          <span data-testid="keys">{Object.keys(context).sort().join(",")}</span>
          <button onClick={context.signInWithGoogle}>Google</button>
        </>
      );
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await userEvent.setup().click(screen.getByRole("button", { name: "Google" }));

    expect(authApiMocks.signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("keys")).toHaveTextContent(
      "expireSession,loading,signInWithGoogle,signOut,tier,user"
    );
  });

  it("clears state only after successful normal sign-out", async () => {
    const listener = setupListener();
    const user = createMockUser();

    function Probe() {
      const { user: authUser, signOut } = useAuth();
      const [error, setError] = useState("");
      return (
        <>
          <span data-testid="user">{authUser?.uid ?? "none"}</span>
          <span data-testid="error">{error}</span>
          <button
            onClick={async () => {
              try {
                await signOut();
              } catch {
                setError("failed");
              }
            }}
          >
            Logout
          </button>
        </>
      );
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await listener.emit(user);

    authApiMocks.signOutFirebase.mockRejectedValueOnce(new Error("raw"));
    await userEvent.setup().click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("test-uid");
      expect(screen.getByTestId("error")).toHaveTextContent("failed");
    });

    authApiMocks.signOutFirebase.mockResolvedValueOnce(undefined);
    await userEvent.setup().click(screen.getByRole("button", { name: "Logout" }));
    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });
  });

  it("expires an unusable session even when Firebase signOut rejects", async () => {
    const listener = setupListener();
    authApiMocks.signOutFirebase.mockRejectedValue(new Error("raw"));

    function Probe() {
      const { user, expireSession } = useAuth();
      return (
        <>
          <span data-testid="user">{user?.uid ?? "none"}</span>
          <button onClick={expireSession}>Expire</button>
        </>
      );
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await listener.emit(createMockUser());

    await userEvent.setup().click(screen.getByRole("button", { name: "Expire" }));

    await waitFor(() => {
      expect(authApiMocks.signOutFirebase).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("user")).toHaveTextContent("none");
    });
  });

  it("suppresses stale tier results after a newer auth callback", async () => {
    const listener = setupListener();
    let resolveFirst: (value: { claims: Record<string, unknown> }) => void = () => undefined;
    const first = createMockUser({
      uid: "first",
      getIdTokenResult: vi.fn().mockReturnValue(
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
      ),
    });
    const second = createMockUser({
      uid: "second",
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { tier: "second" } }),
    });

    function Probe() {
      const { user, tier } = useAuth();
      return <span data-testid="state">{`${user?.uid ?? "none"}:${tier ?? "none"}`}</span>;
    }

    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    await listener.emit(first);
    await listener.emit(second);
    await waitFor(() => {
      expect(screen.getByTestId("state")).toHaveTextContent("second:second");
    });

    await act(async () => {
      resolveFirst({ claims: { tier: "first" } });
      await Promise.resolve();
    });
    expect(screen.getByTestId("state")).toHaveTextContent("second:second");
  });

  it("cleans listeners in StrictMode and ignores post-unmount readiness", async () => {
    const listener = setupListener();
    let resolveReady: (value: object) => void = () => undefined;
    authApiMocks.ensureFirebaseAuthReady.mockReturnValue(
      new Promise((resolve) => {
        resolveReady = resolve;
      })
    );

    function Probe() {
      useAuth();
      return <span>probe</span>;
    }

    const { unmount } = render(
      <StrictMode>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </StrictMode>
    );

    unmount();
    await act(async () => {
      resolveReady({});
    });

    expect(listener.unsubscribe.mock.calls.length).toBeLessThanOrEqual(
      vi.mocked(firebaseAuth.onIdTokenChanged).mock.calls.length
    );
  });

  it("returns null context outside the provider", () => {
    function Probe() {
      return <span>{useAuthContext() === null ? "null" : "value"}</span>;
    }

    render(<Probe />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });
});
