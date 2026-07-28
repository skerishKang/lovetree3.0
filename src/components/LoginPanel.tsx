import { useState, type RefObject } from "react";
import {
  LOGIN_BUTTONS,
  PREVIEW_PROFILE,
  AUTH_FEATURES,
} from "../data/authMockData";
import SocialLoginButton from "./SocialLoginButton";
import EmailAuthForm, { type EmailAuthSubmitInput } from "./EmailAuthForm";
import styles from "./LoginPanel.module.css";

const EMAIL_FORM_REGION_ID = "email-auth-form-region";

interface LoginPanelProps {
  configured: boolean;
  googlePending: boolean;
  emailPending: boolean;
  statusMessage: string | null;
  statusRef: RefObject<HTMLParagraphElement | null>;
  onGoogleSignIn(): void;
  onEmailSubmit(input: EmailAuthSubmitInput): void;
}

const FeatureIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <rect width="16" height="16" rx="4" fill="#d4a88a" />
  </svg>
);

export default function LoginPanel({
  configured,
  googlePending,
  emailPending,
  statusMessage,
  statusRef,
  onGoogleSignIn,
  onEmailSubmit,
}: LoginPanelProps) {
  const [emailFormOpen, setEmailFormOpen] = useState(false);
  const googleButton = LOGIN_BUTTONS.find((button) => button.id === "google");
  const emailButton = LOGIN_BUTTONS.find((button) => button.id === "email");
  const anyPending = googlePending || emailPending;

  return (
    <div className={styles.loginPanel}>
      {googleButton ? (
        <SocialLoginButton
          icon={googleButton.icon}
          label={googleButton.label}
          variant={googleButton.variant}
          disabled={!configured || anyPending}
          pending={googlePending}
          onClick={onGoogleSignIn}
        />
      ) : null}

      {emailButton ? (
        <SocialLoginButton
          icon={emailButton.icon}
          label={emailFormOpen ? "이메일 로그인 닫기" : emailButton.label}
          variant={emailButton.variant}
          disabled={!configured || anyPending}
          expanded={emailFormOpen}
          controls={EMAIL_FORM_REGION_ID}
          onClick={() => setEmailFormOpen((open) => !open)}
        />
      ) : null}

      {emailFormOpen ? (
        <div id={EMAIL_FORM_REGION_ID} className={styles.emailFormRegion}>
          <EmailAuthForm
            pending={emailPending}
            disabled={!configured || googlePending || emailPending}
            onSubmit={onEmailSubmit}
          />
        </div>
      ) : null}

      {statusMessage ? (
        <p
          ref={statusRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={styles.statusMessage}
        >
          {statusMessage}
        </p>
      ) : null}

      <div className={styles.profilePreview}>
        <div className={styles.avatar}>{PREVIEW_PROFILE.avatarInitial}</div>
        <div className={styles.previewInfo}>
          <p className={styles.previewLabel}>로그인 후 내 프로필</p>
          <p className={styles.previewName}>{PREVIEW_PROFILE.displayName}</p>
        </div>
        <span className={styles.previewBadge}>프로필 미리보기</span>
      </div>

      <div className={styles.featureList}>
        <p className={styles.featureTitle}>로그인하면 이용할 수 있는 기능</p>
        <div className={styles.featureItems}>
          {AUTH_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className={styles.featureItem}
              data-testid="auth-value-item"
            >
              <span className={styles.featureItemIcon}>
                <FeatureIcon />
              </span>
              <div>
                <p className={styles.featureLabel}>{feature.label}</p>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
