import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
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
    signInWithEmail: vi.fn(),
    signUpWithEmail: vi.fn(),
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
    authMocks.value.signInWithEmail.mockReset();
    authMocks.value.signInWithEmail.mockResolvedValue(undefined);
    authMocks.value.signUpWithEmail.mockReset();
    authMocks.value.signUpWithEmail.mockResolvedValue(undefined);
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

  it("keeps the email login toggle enabled and collapsed by default", () => {
    render(createTree("/login"));
    const email = screen.getByRole("button", { name: "이메일로 로그인" });

    expect(email).toBeEnabled();
    expect(email).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("이메일")).toBeNull();
  });

  it("reveals the email login form and switches to signup mode", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(screen.getByLabelText("이메일")).toBeInTheDocument();
    expect(screen.getByLabelText("비밀번호")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );

    expect(screen.getByLabelText("비밀번호 확인")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "이메일로 회원가입" })
    ).toBeInTheDocument();
  });

  it("performs zero Firebase calls for client-invalid email input", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "notanemail");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(authMocks.value.signInWithEmail).not.toHaveBeenCalled();
    expect(authMocks.value.signUpWithEmail).not.toHaveBeenCalled();
    expect(
      screen.getByText("이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.")
    ).toBeInTheDocument();
  });

  it("performs zero Firebase calls for a signup password mismatch", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-one");
    await user.type(screen.getByLabelText("비밀번호 확인"), "secret-two");
    await user.click(screen.getByRole("button", { name: "이메일로 회원가입" }));

    expect(authMocks.value.signUpWithEmail).not.toHaveBeenCalled();
    expect(authMocks.value.signInWithEmail).not.toHaveBeenCalled();
  });

  it("calls the adapter once for a valid email login", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "  user@example.com  ");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(authMocks.value.signInWithEmail).toHaveBeenCalledTimes(1);
    expect(authMocks.value.signInWithEmail).toHaveBeenCalledWith(
      "user@example.com",
      "secret-pw"
    );
    expect(authMocks.value.signUpWithEmail).not.toHaveBeenCalled();
  });

  it("calls signup once for a valid email signup", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.type(screen.getByLabelText("비밀번호 확인"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 회원가입" }));

    expect(authMocks.value.signUpWithEmail).toHaveBeenCalledTimes(1);
    expect(authMocks.value.signUpWithEmail).toHaveBeenCalledWith(
      "user@example.com",
      "secret-pw"
    );
  });

  it("submits Firebase once under a rapid repeated submit race", async () => {
    let resolveSignIn: () => void = () => undefined;
    authMocks.value.signInWithEmail.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      })
    );
    const { container } = render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");

    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(authMocks.value.signInWithEmail).toHaveBeenCalledTimes(1);

    resolveSignIn();
  });

  it.each([
    ["invalid-credential", "이메일 또는 비밀번호가 올바르지 않습니다"],
    ["user-not-found", "이메일 또는 비밀번호가 올바르지 않습니다"],
    ["wrong-password", "이메일 또는 비밀번호가 올바르지 않습니다"],
    ["email-already-in-use", "이미 사용 중인 이메일입니다"],
    ["weak-password", "비밀번호가 요구사항을 충족하지 않습니다"],
    ["too-many-requests", "시도 횟수가 많습니다"],
    ["network-request-failed", "네트워크 연결을 확인한 뒤"],
  ])("maps email provider failure %s to one bounded status", async (reason, message) => {
    authMocks.value.signInWithEmail.mockRejectedValue({
      name: "EmailAuthError",
      reason,
      code: "auth/raw-code",
      token: "raw-token",
    });
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent(message);
    expect(screen.getByRole("status")).not.toHaveTextContent("auth/raw-code");
    expect(screen.getByRole("status")).not.toHaveTextContent("raw-token");
    expect(screen.getByRole("status")).not.toHaveTextContent("secret-pw");
  });

  it("surfaces email failure status under StrictMode double-mount", async () => {
    authMocks.value.signInWithEmail.mockRejectedValue({
      name: "EmailAuthError",
      reason: "invalid-credential",
      code: "auth/raw-code",
      token: "raw-token",
    });
    render(<StrictMode>{createTree("/login")}</StrictMode>);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "이메일 또는 비밀번호가 올바르지 않습니다"
      );
    });
    expect(screen.getByRole("status")).not.toHaveTextContent(
      "로그인 처리 중입니다"
    );
  });

  it("follows the safe return target after a synthetic email login success", async () => {
    const initialEntry = {
      pathname: "/login",
      state: { returnTo: "/tree/new-demo?source=login#editor" },
    };
    const tree = createTree(initialEntry);
    const { rerender } = render(tree);
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

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

  it("never opens the Google popup from the email flow", async () => {
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(authMocks.value.signInWithGoogle).not.toHaveBeenCalled();
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

  it("locks the Google button while an email request is pending", async () => {
    let resolveEmail: () => void = () => undefined;
    authMocks.value.signInWithEmail.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveEmail = resolve;
      })
    );
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    const google = screen.getByRole("button", {
      name: "구글 계정으로 계속하기",
    });
    expect(google).toBeDisabled();

    resolveEmail();
  });

  it("locks the email toggle while a Google request is pending", async () => {
    let resolveGoogle: () => void = () => undefined;
    authMocks.value.signInWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveGoogle = resolve;
      })
    );
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));

    const emailToggle = screen.getByRole("button", { name: "이메일로 로그인" });
    expect(emailToggle).toBeDisabled();

    resolveGoogle();
  });

  it("locks the email form controls while a Google request is pending", async () => {
    let resolveGoogle: () => void = () => undefined;
    authMocks.value.signInWithGoogle.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveGoogle = resolve;
      })
    );
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));

    expect(screen.getByLabelText("이메일")).toBeDisabled();
    expect(screen.getByLabelText("비밀번호")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    ).toBeDisabled();

    resolveGoogle();
  });

  it("cross-provider click race results in exactly one provider call", async () => {
    let resolveEmail: () => void = () => undefined;
    authMocks.value.signInWithEmail.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveEmail = resolve;
      })
    );
    render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    await user.click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));

    expect(authMocks.value.signInWithEmail).toHaveBeenCalledTimes(1);
    expect(authMocks.value.signInWithGoogle).not.toHaveBeenCalled();

    resolveEmail();
  });

  it("ignores late email rejection after unmount with no React warning", async () => {
    let rejectEmail: (error: unknown) => void = () => undefined;
    authMocks.value.signInWithEmail.mockReturnValue(
      new Promise<void>((_resolve, reject) => {
        rejectEmail = reject;
      })
    );

    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };

    const { unmount } = render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    unmount();

    await act(async () => {
      rejectEmail({ name: "EmailAuthError", reason: "network-request-failed" });
      await Promise.resolve();
    });

    console.error = originalError;

    expect(errors).not.toContain(
      expect.stringContaining("Can't perform a React state update on an unmounted component")
    );
    expect(authMocks.value.signInWithEmail).toHaveBeenCalledTimes(1);
  });

  it("ignores late Google rejection after unmount with no React warning", async () => {
    let rejectGoogle: (error: unknown) => void = () => undefined;
    authMocks.value.signInWithGoogle.mockReturnValue(
      new Promise<void>((_resolve, reject) => {
        rejectGoogle = reject;
      })
    );

    const errors: string[] = [];
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(args.map(String).join(" "));
    };

    const { unmount } = render(createTree("/login"));
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "구글 계정으로 계속하기" }));

    unmount();

    await act(async () => {
      rejectGoogle({ reason: "auth-failed" });
      await Promise.resolve();
    });

    console.error = originalError;

    expect(errors).not.toContain(
      expect.stringContaining("Can't perform a React state update on an unmounted component")
    );
    expect(authMocks.value.signInWithGoogle).toHaveBeenCalledTimes(1);
  });

  it("has no clickable no-op controls while configured and idle", () => {
    render(createTree("/login"));
    const google = screen.getByRole("button", {
      name: "구글 계정으로 계속하기",
    });
    const emailToggle = screen.getByRole("button", { name: "이메일로 로그인" });

    expect(google).toBeEnabled();
    expect(emailToggle).toBeEnabled();
  });
});
