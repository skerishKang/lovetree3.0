import { useRef, useState, type FormEvent } from "react";
import styles from "./EmailAuthForm.module.css";
import {
  EMAIL_AUTH_MAX_EMAIL_LENGTH,
  EMAIL_AUTH_MAX_PASSWORD_LENGTH,
  hasValidEmailShape,
  hasValidPasswordLength,
  normalizeEmailInput,
} from "../utils/emailAuthValidation";

export type EmailAuthMode = "login" | "signup";

export interface EmailAuthSubmitInput {
  mode: EmailAuthMode;
  email: string;
  password: string;
}

interface EmailAuthFormProps {
  pending: boolean;
  disabled?: boolean;
  onSubmit(input: EmailAuthSubmitInput): void;
}

type FieldName = "email" | "password" | "confirmation";

const EMAIL_FIELD_ERROR = "이메일 형식이 올바르지 않습니다. 다시 확인해 주세요.";
const PASSWORD_FIELD_ERROR = "비밀번호를 입력해 주세요.";
const PASSWORD_LENGTH_ERROR = "입력 값이 너무 깁니다. 다시 확인해 주세요.";
const CONFIRMATION_FIELD_ERROR = "비밀번호가 일치하지 않습니다. 다시 확인해 주세요.";

export default function EmailAuthForm({
  pending,
  disabled = false,
  onSubmit,
}: EmailAuthFormProps) {
  const [mode, setMode] = useState<EmailAuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmationRef = useRef<HTMLInputElement>(null);

  const isSignup = mode === "signup";
  const inputDisabled = disabled || pending;

  const switchMode = () => {
    if (inputDisabled) {
      return;
    }
    setMode((current) => (current === "login" ? "signup" : "login"));
    setFieldErrors({});
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (inputDisabled) {
      return;
    }

    const errors: Partial<Record<FieldName, string>> = {};

    if (!hasValidEmailShape(email)) {
      errors.email = EMAIL_FIELD_ERROR;
    }

    if (password.length === 0) {
      errors.password = PASSWORD_FIELD_ERROR;
    } else if (!hasValidPasswordLength(password)) {
      errors.password = PASSWORD_LENGTH_ERROR;
    }

    if (isSignup && confirmation !== password) {
      errors.confirmation = CONFIRMATION_FIELD_ERROR;
    }

    if (errors.email || errors.password || errors.confirmation) {
      setFieldErrors(errors);
      if (errors.email) {
        emailRef.current?.focus();
      } else if (errors.password) {
        passwordRef.current?.focus();
      } else {
        confirmationRef.current?.focus();
      }
      return;
    }

    setFieldErrors({});
    onSubmit({
      mode,
      email: normalizeEmailInput(email),
      password,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.field}>
        <label className={styles.label} htmlFor="email-auth-email">
          이메일
        </label>
        <input
          ref={emailRef}
          id="email-auth-email"
          className={styles.input}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={EMAIL_AUTH_MAX_EMAIL_LENGTH}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={inputDisabled}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? "email-auth-email-error" : undefined}
        />
        {fieldErrors.email ? (
          <p id="email-auth-email-error" className={styles.fieldError}>
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="email-auth-password">
          비밀번호
        </label>
        <input
          ref={passwordRef}
          id="email-auth-password"
          className={styles.input}
          type="password"
          autoComplete={isSignup ? "new-password" : "current-password"}
          maxLength={EMAIL_AUTH_MAX_PASSWORD_LENGTH}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={inputDisabled}
          aria-invalid={fieldErrors.password ? true : undefined}
          aria-describedby={fieldErrors.password ? "email-auth-password-error" : undefined}
        />
        {fieldErrors.password ? (
          <p id="email-auth-password-error" className={styles.fieldError}>
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {isSignup ? (
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email-auth-confirmation">
            비밀번호 확인
          </label>
          <input
            ref={confirmationRef}
            id="email-auth-confirmation"
            className={styles.input}
            type="password"
            autoComplete="new-password"
            maxLength={EMAIL_AUTH_MAX_PASSWORD_LENGTH}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={inputDisabled}
            aria-invalid={fieldErrors.confirmation ? true : undefined}
            aria-describedby={
              fieldErrors.confirmation ? "email-auth-confirmation-error" : undefined
            }
          />
          {fieldErrors.confirmation ? (
            <p id="email-auth-confirmation-error" className={styles.fieldError}>
              {fieldErrors.confirmation}
            </p>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        className={styles.submitButton}
        disabled={inputDisabled}
        aria-busy={pending || undefined}
      >
        {pending ? "처리 중..." : isSignup ? "이메일로 회원가입" : "이메일로 로그인"}
      </button>

      <button
        type="button"
        className={styles.modeSwitch}
        onClick={switchMode}
        disabled={inputDisabled}
      >
        {isSignup
          ? "이미 계정이 있나요? 이메일로 로그인"
          : "계정이 없으신가요? 이메일로 회원가입"}
      </button>
    </form>
  );
}
