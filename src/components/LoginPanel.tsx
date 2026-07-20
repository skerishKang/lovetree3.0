import {
  LOGIN_BUTTONS,
  PREVIEW_PROFILE,
  AUTH_FEATURES,
} from "../data/authMockData";
import SocialLoginButton from "./SocialLoginButton";
import styles from "./LoginPanel.module.css";

export default function LoginPanel() {
  return (
    <div className={styles.loginPanel}>
      {/* Login buttons */}
      {LOGIN_BUTTONS.map((btn) => (
        <SocialLoginButton key={btn.id} icon={btn.icon} label={btn.label} />
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
              <span className={styles.featureItemIcon}>{f.icon}</span>
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
