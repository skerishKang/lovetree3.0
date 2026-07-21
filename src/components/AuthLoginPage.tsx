import AuthBrand from "./AuthBrand";
import LoginPanel from "./LoginPanel";
import AuthLegalNotice from "./AuthLegalNotice";
import styles from "./AuthLoginPage.module.css";

export default function AuthLoginPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <AuthBrand />
        <LoginPanel />
        <AuthLegalNotice />
      </div>
    </div>
  );
}