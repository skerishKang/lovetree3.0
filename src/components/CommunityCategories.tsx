import { useState } from "react";
import styles from "./CommunityCategories.module.css";

const COMMUNITY_CATEGORIES = [
  { id: "popular", label: "인기" },
  { id: "latest", label: "최신" },
  { id: "stan", label: "입덕" },
  { id: "concert", label: "콘서트" },
  { id: "fancam", label: "직캠" },
  { id: "comeback", label: "컴백" },
] as const;

type CommunityCategoryId = (typeof COMMUNITY_CATEGORIES)[number]["id"];

/**
 * backend category 계약이 생기기 전까지 선택 상태만 로컬에 유지합니다.
 */
export default function CommunityCategories() {
  const [active, setActive] = useState<CommunityCategoryId>(
    COMMUNITY_CATEGORIES[0].id,
  );

  return (
    <nav className={styles.categories} aria-label="커뮤니티 카테고리">
      {COMMUNITY_CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          className={`${styles.chip} ${active === category.id ? styles.active : ""}`}
          aria-pressed={active === category.id}
          onClick={() => setActive(category.id)}
        >
          {category.label}
        </button>
      ))}
    </nav>
  );
}
