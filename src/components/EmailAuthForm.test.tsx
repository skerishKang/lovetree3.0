import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import EmailAuthForm, { type EmailAuthSubmitInput } from "./EmailAuthForm";
import {
  EMAIL_AUTH_MAX_EMAIL_LENGTH,
  EMAIL_AUTH_MAX_PASSWORD_LENGTH,
} from "../utils/emailAuthValidation";

function renderForm(props: Partial<Parameters<typeof EmailAuthForm>[0]> = {}) {
  const onSubmit = vi.fn<(input: EmailAuthSubmitInput) => void>();
  const utils = render(
    <EmailAuthForm pending={false} onSubmit={onSubmit} {...props} />
  );
  return { onSubmit, ...utils };
}

describe("EmailAuthForm", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders login mode with labelled fields and current-password autocomplete", () => {
    renderForm();

    const email = screen.getByLabelText("이메일");
    const password = screen.getByLabelText("비밀번호");

    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("autocomplete", "current-password");
    expect(screen.queryByLabelText("비밀번호 확인")).toBeNull();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    ).toBeInTheDocument();
  });

  it("switches to signup mode with a confirmation field and new-password autocomplete", async () => {
    renderForm();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );

    const password = screen.getByLabelText("비밀번호");
    const confirmation = screen.getByLabelText("비밀번호 확인");

    expect(password).toHaveAttribute("autocomplete", "new-password");
    expect(confirmation).toHaveAttribute("type", "password");
    expect(confirmation).toHaveAttribute("autocomplete", "new-password");
    expect(
      screen.getByRole("button", { name: "이메일로 회원가입" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "이미 계정이 있나요? 이메일로 로그인" })
    ).toBeInTheDocument();
  });

  it("submits a trimmed email and the password on valid login", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이메일"), "  user@example.com  ");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      mode: "login",
      email: "user@example.com",
      password: "secret-pw",
    });
  });

  it("rejects an invalid email before submitting and focuses the email field", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이메일"), "notanemail");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("이메일")).toHaveAttribute("aria-invalid", "true");
    expect(document.activeElement).toBe(screen.getByLabelText("이메일"));
  });

  it("rejects an empty password before submitting and focuses the password field", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("비밀번호를 입력해 주세요.")).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByLabelText("비밀번호"));
  });

  it("rejects a signup password mismatch before submitting and focuses confirmation", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-one");
    await user.type(screen.getByLabelText("비밀번호 확인"), "secret-two");
    await user.click(screen.getByRole("button", { name: "이메일로 회원가입" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.")
    ).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByLabelText("비밀번호 확인"));
  });

  it("submits signup with matching confirmation", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.click(
      screen.getByRole("button", { name: "계정이 없으신가요? 이메일로 회원가입" })
    );
    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "secret-pw");
    await user.type(screen.getByLabelText("비밀번호 확인"), "secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 회원가입" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      mode: "signup",
      email: "user@example.com",
      password: "secret-pw",
    });
  });

  it("does not submit while pending and disables the submit button", () => {
    const { onSubmit, container } = renderForm({ pending: true });

    const submitButton = container.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;
    expect(submitButton).toBeDisabled();

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("never renders password values back into DOM text", async () => {
    const { onSubmit } = renderForm();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText("이메일"), "user@example.com");
    await user.type(screen.getByLabelText("비밀번호"), "super-secret-pw");
    await user.click(screen.getByRole("button", { name: "이메일로 로그인" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain("super-secret-pw");
  });

  it("bounds input lengths with maxlength attributes", () => {
    renderForm();

    expect(screen.getByLabelText("이메일")).toHaveAttribute(
      "maxlength",
      String(EMAIL_AUTH_MAX_EMAIL_LENGTH)
    );
    expect(screen.getByLabelText("비밀번호")).toHaveAttribute(
      "maxlength",
      String(EMAIL_AUTH_MAX_PASSWORD_LENGTH)
    );
  });
});
