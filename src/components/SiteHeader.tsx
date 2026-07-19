import styles from "./SiteHeader.module.css";
import { brandLogo, navMenuItems } from "../data/mockData";

/**
 * 상단 헤더
 * - 왼쪽: 텍스트 로고 "Relovetree"
 * - 오른쪽: About, Features, Community, My Tree
 *
 * 첫 정적 구현에서는 이동을 연결하지 않습니다.
 */
export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>{brandLogo}</span>
      <nav className={styles.nav} aria-label="주요 메뉴">
        {navMenuItems.map((item) => (
          <a
            key={item}
            className={styles.navItem}
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            {item}
          </a>
        ))}
      </nav>
    </header>
  );
}
