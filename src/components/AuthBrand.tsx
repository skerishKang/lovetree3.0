import { APP_BRAND, LOGIN_HEADING, LOGIN_DESCRIPTION } from "../data/authMockData";
import styles from "./AuthBrand.module.css";

export default function AuthBrand() {
  return (
    <div className={styles.authBrand}>
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="24" cy="24" r="20" fill="#e8c9b0" />
      </svg>
      <h1 className={styles.brandName}>{APP_BRAND}</h1>
      <p className={styles.heading}>{LOGIN_HEADING}</p>
      <p className={styles.description}>{LOGIN_DESCRIPTION}</p>
    </div>
  );
}
