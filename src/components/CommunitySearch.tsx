import { useState, type FormEvent } from "react";
import styles from "./CommunitySearch.module.css";
import { communitySearchPlaceholder } from "../data/communityMockData";

/**
 * 커뮤니티 검색 입력창
 *
 * BASE 인터랙션: 텍스트 입력만 허용.
 * 실제 검색 요청/필터 API 호출은 하지 않음 (금지).
 */
export default function CommunitySearch() {
  const [value, setValue] = useState("");

  const onSubmit = (e: FormEvent) => {
    // 실제 검색 요청 없음 — preventDefault만 수행
    e.preventDefault();
  };

  return (
    <form className={styles.searchBar} role="search" onSubmit={onSubmit}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        className={styles.input}
        type="search"
        value={value}
        placeholder={communitySearchPlaceholder}
        aria-label="러브트리 검색"
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}
