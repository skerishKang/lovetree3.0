import { LEGAL_NOTICE } from "../data/authMockData";
import styles from "./AuthLegalNotice.module.css";

export default function AuthLegalNotice() {
  return (
    <div className={styles.legalNotice}>
      <p className={styles.legalText}>{LEGAL_NOTICE}</p>
    </div>
  );
}
