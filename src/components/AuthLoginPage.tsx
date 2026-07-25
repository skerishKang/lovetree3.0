import { Link } from "react-router-dom";
import AuthBrand from "./AuthBrand";
import LoginPanel from "./LoginPanel";
import AuthLegalNotice from "./AuthLegalNotice";
import styles from "./AuthLoginPage.module.css";
import { TRUST_CONTEXT } from "../data/authMockData";

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
          <Link to="/community" className={styles.communityLink}>
            커뮤니티 둘러보기
          </Link>
        </div>
      </div>
      <section className={styles.trustContext} aria-labelledby="auth-trust-title">
        <h2 id="auth-trust-title">{TRUST_CONTEXT.title}</h2>
        <p>{TRUST_CONTEXT.description}</p>
      </section>
    </div>
  );
}
