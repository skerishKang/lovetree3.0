import {
  LOGIN_BUTTONS,
  PREVIEW_PROFILE,
  TRUST_CONTEXT,
  AUTH_FEATURES,
} from "../data/authMockData";
import SocialLoginButton from "./SocialLoginButton";
import styles from "./LoginPanel.module.css";

export default function LoginPanel() {
  return (
    <div className={styles.loginPanel}>
      {/* Login buttons */}
      {LOGIN_BUTTONS.map((btn) => (
        <SocialLoginButton key={btn.id} icon={btn.icon} label={btn.label} variant={btn.variant} />
      ))}

      {/* Trust context */}
      <div className={styles.trustContext}>
        <h2 className={styles.trustTitle}>{TRUST_CONTEXT.title}</h2>
        <p className={styles.trustDescription}>{TRUST_CONTEXT.description}</p>
      </div>

      {/* Profile preview */}
      <div className={styles.profilePreview}>
        <div className={styles.avatar}>{PREVIEW_PROFILE.avatarInitial}</div>
        <div className={styles.previewInfo}>
          <p className={styles.previewLabel}>로그인 후 내 프로필</p>
          <p className={styles.previewName}>{PREVIEW_PROFILE.displayName}</p>
        </div>
        <span className={styles.previewBadge}>프로필 미리보기</span>
      </div>

      {/* Core values list */}
      <div className={styles.valueList}>
        <h3 className={styles.valueTitle}>로그인 후 이용할 수 있는 핵심 가치</h3>
        <div className={styles.valueItems}>
          {AUTH_FEATURES.map((f) => (
            <div key={f.id} className={styles.valueItem}>
              <span className={styles.valueIcon} aria-hidden="true">{f.icon}</span>
              <div>
                <p className={styles.valueLabel}>{f.label}</p>
                <p className={styles.valueDesc}>{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}