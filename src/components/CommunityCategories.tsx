import { useState } from "react";
import styles from "./CommunityCategories.module.css";
import { communityCategories } from "../data/communityMockData";

/**
 * 커뮤니티 카테고리 메뉴
 *
 * BASE 인터랙션: 카테고리 선택 상태만 허용.
 * 실제 필터 API 호출은 하지 않음 (금지).
 */
export default function CommunityCategories() {
  const [active, setActive] = useState(communityCategories[0].id);

  return (
    <nav className={styles.categories} aria-label="커뮤니티 카테고리">
      {communityCategories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          className={`${styles.chip} ${active === cat.id ? styles.active : ""}`}
          aria-pressed={active === cat.id}
          onClick={() => setActive(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </nav>
  );
}
