import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AuthSessionController from "./AuthSessionController";
import { emitSessionExpired } from "../context/authSession";

const authMocks = vi.hoisted(() => ({
  expireSession: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: { uid: "u1" },
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: authMocks.expireSession,
  }),
}));

function Probe() {
  const location = useLocation();
  return (
    <>
      <span data-testid="path">{location.pathname}</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </>
  );
}

function renderController(path = "/my-trees") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthSessionController />
      <Routes>
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AuthSessionController", () => {
  beforeEach(() => {
    authMocks.expireSession.mockReset();
    authMocks.expireSession.mockResolvedValue(undefined);
  });

  afterEach(cleanup);

  it("expires the session, redirects, and preserves one safe return target", async () => {
    renderController("/tree/new-demo?from=editor#memory");

    act(() => {
      emitSessionExpired({ source: "persistent-401" });
    });

    await waitFor(() => {
      expect(authMocks.expireSession).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("path")).toHaveTextContent("/login");
    });
    expect(screen.getByTestId("state")).toHaveTextContent("session-expired");
    expect(screen.getByTestId("state")).toHaveTextContent(
      "/tree/new-demo?from=editor#memory"
    );
  });

  it("coalesces duplicate events while handling", async () => {
    let resolveExpire: () => void = () => undefined;
    authMocks.expireSession.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveExpire = resolve;
      })
    );
    renderController();

    act(() => {
      emitSessionExpired();
      emitSessionExpired();
    });

    expect(authMocks.expireSession).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveExpire();
    });
    await waitFor(() =>
      expect(screen.getByTestId("path")).toHaveTextContent("/login")
    );
  });

  it("rejects unsafe event targets", async () => {
    renderController("/settings/visibility-demo");

    act(() => {
      emitSessionExpired({ returnTo: "https://example.com" });
    });

    await waitFor(() =>
      expect(screen.getByTestId("path")).toHaveTextContent("/login")
    );
    expect(screen.getByTestId("state")).toHaveTextContent(
      "/settings/visibility-demo"
    );
    expect(screen.getByTestId("state")).not.toHaveTextContent("example.com");
  });

  it("does not create a /login redirect loop", async () => {
    renderController("/login");

    act(() => {
      emitSessionExpired();
    });

    await waitFor(() => {
      expect(authMocks.expireSession).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId("path")).toHaveTextContent("/login");
    });
    expect(screen.getByTestId("state")).not.toHaveTextContent("returnTo");
  });

  it("removes its listener on unmount", () => {
    const { unmount } = renderController();
    unmount();

    act(() => {
      emitSessionExpired();
    });

    expect(authMocks.expireSession).not.toHaveBeenCalled();
  });
});
