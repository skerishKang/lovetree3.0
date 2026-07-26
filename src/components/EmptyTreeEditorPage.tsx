/**
 * LT3-EDITOR-001 — EmptyTreeEditorPage
 * 빈 트리 에디터 UI — presentation-only, no side effects
 */

import { useNavigate } from "react-router-dom";
import { SIDEBAR_MENU_ITEMS } from "../data/emptyTreeEditorMockData";
import styles from "./EmptyTreeEditorPage.module.css";

export default function EmptyTreeEditorPage() {
  const navigate = useNavigate();
  return (
    <div className={styles.page}>
      {/* 좌측 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.brandArea}>
          <span className={styles.brandIcon} aria-hidden="true">🌿</span>
          <span className={styles.brandName}>Relovetree</span>
        </div>

        <nav className={styles.menuNav} aria-label="에디터 메뉴">
          <ul className={styles.menuList}>
            {SIDEBAR_MENU_ITEMS.map((item) => {
              const handleClick = () => {
                if (item.id === "my-trees") navigate("/my-trees");
                else if (item.id === "explore") navigate("/");
                else if (item.id === "settings") navigate("/settings/visibility-demo");
              };
              return (
                <li key={item.id} className={styles.menuItem}>
                  <button
                    type="button"
                    className={`${styles.menuButton} ${
                      item.active ? styles.menuButtonActive : ""
                    }`}
                    aria-current={item.active ? "page" : undefined}
                    onClick={handleClick}
                  >
                  <span className={styles.menuIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span className={styles.menuLabel}>{item.label}</span>
                </button>
              </li>
            );
          })}
          </ul>
        </nav>

        <div className={styles.profileSection} aria-label="사용자 프로필">
          <div className={styles.avatar} aria-hidden="true">
            <span className={styles.avatarInitial}>U</span>
          </div>
          <div className={styles.profileMeta}>
            <span className={styles.profileName}>사용자</span>
            <span className={styles.profileBadge}>무료 플랜</span>
          </div>
        </div>
      </aside>

      {/* 중앙 에디터 작업공간 */}
      <main className={styles.mainArea}>
        {/* 에디터 워크스페이스 맥락 헤더 */}
        <header className={styles.contextHeader}>
          <div className={styles.contextInfo}>
            <span className={styles.contextIcon} aria-hidden="true">📝</span>
            <span className={styles.contextLabel}>새 러브트리 작업공간</span>
          </div>
          <span className={styles.contextStatus}>초기화 상태</span>
        </header>

        {/* 빈 에디터 캔버스 */}
        <div className={styles.canvasSurface}>
          <section
            className={styles.onboardingCard}
            aria-labelledby="new-tree-heading"
          >
            {/* 장식 SVG — 첫 노드 시작점 시각화 */}
            <div className={styles.decorativeRootAnchor} aria-hidden="true">
              <svg
                width="220"
                height="130"
                viewBox="0 0 220 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                {/* 캔버스 그리드 안내선 */}
                <line
                  x1="20"
                  y1="110"
                  x2="200"
                  y2="110"
                  stroke="#e8dfd5"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
                {/* 루트 노드 앵커 링 */}
                <circle cx="110" cy="110" r="10" fill="#ffffff" stroke="#8a7a6a" strokeWidth="2.5" />
                <circle cx="110" cy="110" r="4" fill="#8a7a6a" />
                {/* 줄기 및 가지 곡선 */}
                <path
                  d="M110 100 Q80 80 65 50"
                  stroke="#b8a99a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M110 100 Q140 80 155 45"
                  stroke="#b8a99a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M110 100 L110 32"
                  stroke="#8a7a6a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* 노드 포인트 */}
                <circle cx="65" cy="50" r="5" fill="#d4c9bd" stroke="#8a7a6a" strokeWidth="1.5" />
                <circle cx="110" cy="32" r="7" fill="#b8a99a" stroke="#8a7a6a" strokeWidth="1.5" />
                <circle cx="155" cy="45" r="5" fill="#d4c9bd" stroke="#8a7a6a" strokeWidth="1.5" />
              </svg>
            </div>

            <h1 id="new-tree-heading" className={styles.heading}>
              새 러브트리
            </h1>
            <p className={styles.description}>
              첫 순간을 추가해 러브트리를 시작하세요
            </p>

            <div className={styles.onboardingGuide}>
              <span className={styles.guideTag}>온보딩 팁</span>
              <p className={styles.guideText}>
                소중한 기억이나 덕질의 첫 순간부터 차곡차곡 기록을 이어보세요.
              </p>
            </div>

            <button type="button" className={styles.primaryCta} onClick={() => navigate("/memory/connect-demo")}>
              첫 순간 추가
            </button>
            <button type="button" className={styles.mediaSearchBtn} aria-label="미디어 찾기" onClick={() => navigate("/media/search-demo")}>
              미디어 찾기
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
