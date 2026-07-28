import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import LoginPanel from "./LoginPanel";
import type { EmailAuthSubmitInput } from "./EmailAuthForm";

function renderPanel(props: Partial<Parameters<typeof LoginPanel>[0]> = {}) {
  const onGoogleSignIn = vi.fn();
  const onEmailSubmit = vi.fn<(input: EmailAuthSubmitInput) => void>();
  const utils = render(
    <LoginPanel
      configured={true}
      googlePending={false}
      emailPending={false}
      statusMessage={null}
      statusRef={{ current: null }}
      onGoogleSignIn={onGoogleSignIn}
      onEmailSubmit={onEmailSubmit}
      {...props}
    />
  );
  const rerenderPanel = (newProps: Partial<Parameters<typeof LoginPanel>[0]>) =>
    utils.rerender(
      <LoginPanel
        configured={true}
        googlePending={false}
        emailPending={false}
        statusMessage={null}
        statusRef={{ current: null }}
        onGoogleSignIn={onGoogleSignIn}
        onEmailSubmit={onEmailSubmit}
        {...newProps}
      />
    );
  return { onGoogleSignIn, onEmailSubmit, rerenderPanel, ...utils };
}

describe("LoginPanel", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders the Google button and email toggle when configured", () => {
    renderPanel();

    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeEnabled();
  });

  it("disables both controls when not configured", () => {
    renderPanel({ configured: false });

    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeDisabled();
  });

  it("disables the Google button while an email request is pending", () => {
    renderPanel({ emailPending: true });

    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeDisabled();
  });

  it("disables the email toggle while a Google request is pending", () => {
    renderPanel({ googlePending: true });

    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeDisabled();
  });

  it("disables the email form controls while a Google request is pending", async () => {
    const { rerenderPanel } = renderPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    expect(document.getElementById("email-auth-email")).not.toBeDisabled();

    rerenderPanel({ googlePending: true });

    expect(document.getElementById("email-auth-email")).toBeDisabled();
    expect(document.getElementById("email-auth-password")).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    ).toBeDisabled();
  });

  it("shows the email form when the toggle is clicked and configured", async () => {
    renderPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(document.getElementById("email-auth-email")).toBeInTheDocument();
    expect(document.getElementById("email-auth-password")).toBeInTheDocument();
  });

  it("calls onGoogleSignIn when the Google button is clicked", async () => {
    const { onGoogleSignIn } = renderPanel();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    );

    expect(onGoogleSignIn).toHaveBeenCalledTimes(1);
  });

  it("calls onEmailSubmit with trimmed email and password on valid login", async () => {
    const { onEmailSubmit } = renderPanel();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));
    await user.type(document.getElementById("email-auth-email") as HTMLInputElement, "  user@example.com  ");
    await user.type(document.getElementById("email-auth-password") as HTMLInputElement, "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(onEmailSubmit).toHaveBeenCalledTimes(1);
    expect(onEmailSubmit).toHaveBeenCalledWith({
      mode: "login",
      email: "user@example.com",
      password: "secret-pw",
    });
  });

  it("renders the status message when provided", () => {
    renderPanel({ statusMessage: "테스트 상태 메시지" });

    expect(screen.getByRole("status")).toHaveTextContent("테스트 상태 메시지");
  });

  it("has no clickable no-op controls when configured and idle", () => {
    renderPanel();

    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeEnabled();
  });
});
