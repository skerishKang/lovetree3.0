/**
 * LT3-EDITOR-001 — EmptyTreeEditorPage
 * 빈 트리 에디터 UI BASE — presentation-only, no side effects
 */

import { SIDEBAR_MENU_ITEMS } from "../data/emptyTreeEditorMockData";
import styles from "./EmptyTreeEditorPage.module.css";

export default function EmptyTreeEditorPage() {
  return (
    <div className={styles.page}>
      {/* 좌측 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>LoveTree</div>

        <nav aria-label="에디터 메뉴">
          <ul className={styles.menuList}>
            {SIDEBAR_MENU_ITEMS.map((item) => (
              <li key={item.id}>
                <button type="button" className={styles.menuButton}>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.profileSection} aria-label="사용자 프로필">
          <div className={styles.avatar} aria-hidden="true" />
          <span className={styles.profileName}>사용자</span>
        </div>
      </aside>

      {/* 중앙 빈 에디터 */}
      <main className={styles.mainArea}>
        <section
          className={styles.emptyState}
          aria-labelledby="new-tree-heading"
        >
          {/* 장식 SVG — 빈 캔버스 표현 */}
          <div className={styles.decorativeBranch} aria-hidden="true">
            <svg
              width="200"
              height="160"
              viewBox="0 0 200 160"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 120 Q60 100 80 110 Q100 120 110 100 Q120 80 140 85 Q160 90 170 70"
                stroke="#d4c9bd"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M80 110 Q75 95 65 90"
                stroke="#d4c9bd"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M110 100 Q115 85 125 80"
                stroke="#d4c9bd"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse cx="65" cy="88" rx="6" ry="8" fill="#e8e0d8" />
              <ellipse cx="125" cy="78" rx="5" ry="7" fill="#e8e0d8" />
              <ellipse cx="140" cy="83" rx="7" ry="9" fill="#e8e0d8" />
            </svg>
          </div>

          <h1 id="new-tree-heading" className={styles.heading}>
            새 러브트리
          </h1>
          <p className={styles.description}>
            첫 순간을 추가해 러브트리를 시작하세요
          </p>
          <button type="button" className={styles.primaryCta}>
            첫 순간 추가
          </button>
        </section>
      </main>
    </div>
  );
}
