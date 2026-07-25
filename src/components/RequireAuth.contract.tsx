import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import RequireAuth from "./RequireAuth";

const authMocks = vi.hoisted(() => ({
  value: {
    user: null as null | { uid: string },
    loading: false,
  },
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    ...authMocks.value,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function LoginProbe() {
  const location = useLocation();
  return (
    <>
      <span>login</span>
      <span data-testid="state">{JSON.stringify(location.state)}</span>
    </>
  );
}

function renderGuard(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireAuth>
              <h1>protected child</h1>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<LoginProbe />} />
        <Route path="/public" element={<h1>public child</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    authMocks.value.user = null;
    authMocks.value.loading = false;
  });

  afterEach(cleanup);

  it("shows status while loading without rendering or redirecting", () => {
    authMocks.value.loading = true;
    renderGuard("/protected");

    expect(screen.getByRole("status")).toHaveTextContent(
      "로그인 상태를 확인하고 있습니다"
    );
    expect(screen.queryByText("protected child")).not.toBeInTheDocument();
    expect(screen.queryByText("login")).not.toBeInTheDocument();
  });

  it("redirects signed-out users with a safe return target", async () => {
    renderGuard("/protected?mode=edit#memory");

    await waitFor(() => expect(screen.getByText("login")).toBeInTheDocument());
    expect(screen.getByTestId("state")).toHaveTextContent(
      "/protected?mode=edit#memory"
    );
  });

  it("renders protected children for signed-in users", () => {
    authMocks.value.user = { uid: "u1" };
    renderGuard("/protected");

    expect(
      screen.getByRole("heading", { name: "protected child" })
    ).toBeInTheDocument();
  });

  it("does not affect public routes", () => {
    renderGuard("/public");
    expect(
      screen.getByRole("heading", { name: "public child" })
    ).toBeInTheDocument();
  });
});
