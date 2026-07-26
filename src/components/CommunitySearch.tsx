import { useState, type FormEvent } from "react";
import styles from "./CommunitySearch.module.css";

const SEARCH_PLACEHOLDER = "팬심 가득한 러브트리 검색";

/**
 * 이번 API slice에는 keyword search 계약이 없으므로 입력 상태만 로컬에 유지합니다.
 */
export default function CommunitySearch() {
  const [value, setValue] = useState("");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
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
        placeholder={SEARCH_PLACEHOLDER}
        aria-label="러브트리 검색"
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
}
