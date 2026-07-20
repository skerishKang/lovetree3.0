import { APP_BRAND, LOGIN_HEADING, LOGIN_DESCRIPTION } from "../data/authMockData";
import styles from "./AuthBrand.module.css";

export default function AuthBrand() {
  return (
    <div className={styles.authBrand}>
      <h1 className={styles.brandName}>{APP_BRAND}</h1>
      <p className={styles.heading}>{LOGIN_HEADING}</p>
      <p className={styles.description}>{LOGIN_DESCRIPTION}</p>
    </div>
  );
}
