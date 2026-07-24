import styles from "./SiteHeader.module.css";
import { Link } from "react-router-dom";
import { brandLogo, navMenuItems } from "../data/mockData";

const navRoutes: Record<typeof navMenuItems[number], string> = {
  About: "/#about",
  Features: "/#features",
  Community: "/community",
  "My Tree": "/my-trees",
};

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        {brandLogo}
      </Link>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {navMenuItems.map((item) => (
          <Link
            key={item}
            className={styles.navItem}
            to={navRoutes[item]}
          >
            {item}
          </Link>
        ))}
      </nav>
      <Link to="/login" className={styles.loginLink} aria-label="로그인">
        로그인
      </Link>
    </header>
  );
}
