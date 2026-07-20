import styles from "./CommunityHeader.module.css";
import { brandLogo } from "../data/mockData";

/**
 * 커뮤니티 헤더 — 텍스트 로고만 (검색창/메뉴는 별도 컴포넌트)
 * 홈 SiteHeader와 성급하게 범용화하지 않음.
 */
export default function CommunityHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>{brandLogo}</span>
    </header>
  );
}
