import AuthBrand from "./AuthBrand";
import LoginPanel from "./LoginPanel";
import AuthLegalNotice from "./AuthLegalNotice";
import styles from "./AuthLoginPage.module.css";

export default function AuthLoginPage() {
  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <section className={styles.brandColumn}>
          <AuthBrand />
        </section>

        <section className={styles.loginColumn}>
          <LoginPanel />
        </section>

        <div className={styles.legalRow}>
          <AuthLegalNotice />
        </div>
      </div>
    </div>
  );
}
