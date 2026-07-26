import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AuthLoginPage from "./AuthLoginPage";
import CommunityPage from "./CommunityPage";
import HomePage from "./HomePage";
import {
  APP_BRAND,
  AUTH_FEATURES,
  LEGAL_NOTICE,
  LOGIN_DESCRIPTION,
  LOGIN_HEADING,
  TRUST_CONTEXT,
} from "../data/authMockData";

const authMocks = vi.hoisted(() => ({
  value: {
    user: null as null | {
      uid: string;
      displayName: null;
      email: null;
      photoURL: null;
      emailVerified: boolean;
    },
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  },
  configStatus: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => authMocks.value,
}));

vi.mock("../api/auth", () => ({
  getFirebaseAuthConfigStatus: authMocks.configStatus,
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <>
      <span data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</span>
      <span data-testid="location-state">{JSON.stringify(location.state)}</span>
    </>
  );
}

function createTree(initialEntry: string | { pathname: string; state?: unknown }) {
  return (
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="*" element={<p>destination</p>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>
  );
}

describe("Auth login screen (LT3-AUTH-001)", () => {
  beforeEach(() => {
    authMocks.value.user = null;
    authMocks.value.loading = false;
    authMocks.value.signInWithGoogle.mockReset();
    authMocks.value.signInWithGoogle.mockResolvedValue(undefined);
    authMocks.value.signOut.mockReset();
    authMocks.value.expireSession.mockReset();
    authMocks.configStatus.mockReset();
    authMocks.configStatus.mockReturnValue({
      configured: true,
      missingKeys: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("preserves the exact visual hierarchy and copy contracts", () => {
    const { container } = render(createTree("/login"));

    expect(screen.getAllByText(APP_BRAND)).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 1, name: LOGIN_HEADING })
    ).toHaveTextContent(LOGIN_HEADING);
    expect(screen.getAllByText(LOGIN_DESCRIPTION)).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "구글 계정으로 계속하기" })
    ).toHaveLength(1);
    expect(
      screen.getAllByRole("button", { name: "이메일로 로그인" })
    ).toHaveLength(1);
    expect(screen.getAllByRole("button")).toHaveLength(2);
    expect(screen.getAllByTestId("auth-value-item")).toHaveLength(3);
    expect(screen.getAllByText(LEGAL_NOTICE)).toHaveLength(1);
    expect(
      screen.getByRole("heading", { level: 2, name: TRUST_CONTEXT.title })
    ).toBeInTheDocument();
    expect(screen.getByText(TRUST_CONTEXT.description)).toBeInTheDocument();

    AUTH_FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.label)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });

    const decorativeSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(decorativeSvgs).toHaveLength(4);
    decorativeSvgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });

    expect(screen.queryAllByRole("status")).toHaveLength(0);
    expect(screen.queryAllByRole("alert")).toHaveLength(0);
    expect(screen.queryAllByRole("alertdialog")).toHaveLength(0);
  });

  it("calls Google sign-in once and suppresses duplicate pending clicks", async () => {
    let resolveSignIn: () => void = () => undefined;
    authMocks.value.signInWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      })
    );
    render(createTree("/login"));
    const user = userEvent.setup();
    const google = screen.getByRole("button", {
      name: "구글 계정으로 계속하기",
    });

    await user.click(google);
    await user.click(google);

    expect(authMocks.value.signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(google).toBeDisabled();
    expect(google).toHaveAttribute("aria-busy", "true");
    expect(screen.getAllByRole("status")).toHaveLength(1);

    resolveSignIn();
  });

  it("keeps email login present and disabled with an accessible description", () => {
    render(createTree("/login"));
    const email = screen.getByRole("button", { name: "이메일로 로그인" });

    expect(email).toBeDisabled();
    expect(email).toHaveAccessibleDescription("이메일 로그인은 준비 중입니다.");
  });

  it("bounds missing configuration and never opens Google popup", async () => {
    authMocks.configStatus.mockReturnValue({
      configured: false,
      missingKeys: ["VITE_FIREBASE_API_KEY"],
    });
    render(createTree("/login"));
    const google = screen.getByRole("button", {
      name: "구글 계정으로 계속하기",
    });

    expect(google).toBeDisabled();
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "VITE_FIREBASE_API_KEY"
    );
    await userEvent.setup().click(google);
    expect(authMocks.value.signInWithGoogle).not.toHaveBeenCalled();
  });

  it.each([
    ["popup-closed", "로그인이 취소되었습니다"],
    ["popup-cancelled", "로그인이 취소되었습니다"],
    ["popup-blocked", "팝업이 차단되었습니다"],
    ["auth-failed", "로그인에 실패했습니다"],
  ])("maps %s to one bounded status", async (reason, message) => {
    authMocks.value.signInWithGoogle.mockRejectedValue({
      reason,
      code: "auth/raw-code",
      token: "raw-token",
    });
    render(createTree("/login"));

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent(message);
    expect(screen.getByRole("status")).not.toHaveTextContent("auth/raw-code");
    expect(screen.getByRole("status")).not.toHaveTextContent("raw-token");
    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeEnabled();
  });

  it("redirects to the safe target after AuthContext observes the user", async () => {
    const initialEntry = {
      pathname: "/login",
      state: { returnTo: "/tree/new-demo?source=login#editor" },
    };
    const tree = createTree(initialEntry);
    const { rerender } = render(tree);

    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));
    authMocks.value.user = {
      uid: "u1",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };
    rerender(createTree(initialEntry));

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent(
        "/tree/new-demo?source=login#editor"
      );
    });
  });

  it("rejects unsafe return targets and redirects authenticated users to /my-trees", async () => {
    authMocks.value.user = {
      uid: "u1",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };
    render(
      createTree({
        pathname: "/login",
        state: { returnTo: "https://example.com/steal" },
      })
    );

    await waitFor(() => {
      expect(screen.getByTestId("location")).toHaveTextContent("/my-trees");
    });
  });

  it("shows one session-expired notice", () => {
    render(
      createTree({
        pathname: "/login",
        state: {
          authNotice: "session-expired",
          returnTo: "/my-trees",
        },
      })
    );

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent("세션이 만료되었습니다");
  });

  it("keeps / and /community public", () => {
    render(createTree("/"));
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })
    ).toBeInTheDocument();

    cleanup();
    render(createTree("/community"));
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });
});
