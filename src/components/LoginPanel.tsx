import {
  LOGIN_BUTTONS,
  PREVIEW_PROFILE,
  AUTH_FEATURES,
} from "../data/authMockData";
import SocialLoginButton from "./SocialLoginButton";
import styles from "./LoginPanel.module.css";

interface LoginPanelProps {
  configured: boolean;
  pending: boolean;
  statusMessage: string | null;
  onGoogleSignIn(): void;
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
  pending,
  statusMessage,
  onGoogleSignIn,
}: LoginPanelProps) {
  return (
    <div className={styles.loginPanel}>
      {LOGIN_BUTTONS.map((button) => {
        const isGoogle = button.id === "google";

        return (
          <SocialLoginButton
            key={button.id}
            icon={button.icon}
            label={button.label}
            variant={button.variant}
            disabled={isGoogle ? !configured : true}
            pending={isGoogle && pending}
            describedBy={isGoogle ? undefined : "email-login-availability"}
            onClick={isGoogle ? onGoogleSignIn : undefined}
          />
        );
      })}

      <p id="email-login-availability" className={styles.availabilityNote}>
        이메일 로그인은 준비 중입니다.
      </p>

      {statusMessage ? (
        <p role="status" aria-live="polite" className={styles.statusMessage}>
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
