import {
  LOGIN_BUTTONS,
  PREVIEW_PROFILE,
  AUTH_FEATURES,
} from "../data/authMockData";
import SocialLoginButton from "./SocialLoginButton";
import styles from "./LoginPanel.module.css";

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

export default function LoginPanel() {
  return (
    <div className={styles.loginPanel}>
      {/* Login buttons */}
      {LOGIN_BUTTONS.map((btn) => (
        <SocialLoginButton
          key={btn.id}
          icon={btn.icon}
          label={btn.label}
          variant={btn.variant}
        />
      ))}

      {/* Profile preview */}
      <div className={styles.profilePreview}>
        <div className={styles.avatar}>{PREVIEW_PROFILE.avatarInitial}</div>
        <div className={styles.previewInfo}>
          <p className={styles.previewLabel}>로그인 후 내 프로필</p>
          <p className={styles.previewName}>{PREVIEW_PROFILE.displayName}</p>
        </div>
        <span className={styles.previewBadge}>프로필 미리보기</span>
      </div>

      {/* Feature list */}
      <div className={styles.featureList}>
        <p className={styles.featureTitle}>로그인하면 이용할 수 있는 기능</p>
        <div className={styles.featureItems}>
          {AUTH_FEATURES.map((f) => (
            <span key={f.id} className={styles.featureItem}>
              <span className={styles.featureItemIcon}>
                <FeatureIcon />
              </span>
              <div>
                <p className={styles.featureLabel}>{f.label}</p>
                <p className={styles.featureDescription}>{f.description}</p>
              </div>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
