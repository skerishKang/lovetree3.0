import styles from "./SiteHeader.module.css";
import { useNavigate } from "react-router-dom";
import { brandLogo, navMenuItems } from "../data/mockData";

const navRoutes: Record<typeof navMenuItems[number], string> = {
  About: "/",
  Features: "/",
  Community: "/community",
  "My Tree": "/my-trees",
};

export default function SiteHeader() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <span className={styles.logo}>{brandLogo}</span>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {navMenuItems.map((item) => (
          <a
            key={item}
            className={styles.navItem}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate(navRoutes[item]);
            }}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
