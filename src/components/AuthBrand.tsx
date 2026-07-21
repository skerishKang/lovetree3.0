import { APP_BRAND, LOGIN_HEADING, LOGIN_DESCRIPTION } from "../data/authMockData";
import styles from "./AuthBrand.module.css";

export default function AuthBrand() {
  return (
    <div className={styles.authBrand}>
      <div className={styles.brandContainer}>
        <span className={styles.brandName}>{APP_BRAND}</span>
      </div>
      <h1 className={styles.heading}>{LOGIN_HEADING}</h1>
      <p className={styles.description}>{LOGIN_DESCRIPTION}</p>
    </div>
  );
}