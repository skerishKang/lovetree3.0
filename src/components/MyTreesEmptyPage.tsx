import {
  EMPTY_STATE,
  QUICK_START_TAGS,
} from "../data/myTreesEmptyMockData";
import styles from "./MyTreesEmptyPage.module.css";

export default function MyTreesEmptyPage() {
  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <span className={styles.logo}>LoveTree</span>
        <button
          type="button"
          className={styles.profileButton}
          aria-label="마이페이지"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
            <path
              d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      {/* 본문 */}
      <main className={styles.content}>
        {/* 중앙 일러스트레이션 영역 */}
        <div className={styles.illustration} aria-hidden="true">
          {/* 새싹과 떠 있는 카드 — 장식용 SVG */}
          <svg
            width="160"
            height="140"
            viewBox="0 0 160 140"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 흙더미 */}
            <ellipse cx="80" cy="125" rx="50" ry="12" fill="#e8d5c4" />
            {/* 줄기 */}
            <path
              d="M80 125V80"
              stroke="#9bd4ae"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* 잎 (좌) */}
            <path
              d="M80 85C70 75 60 78 55 85C50 92 60 100 80 90"
              fill="#b8e6c9"
            />
            {/* 잎 (우) */}
            <path
              d="M80 75C90 65 100 68 105 75C110 82 100 90 80 80"
              fill="#7bc99b"
            />
            {/* 떠 있는 카드 1 */}
            <rect x="20" y="20" width="30" height="36" rx="4" fill="#ffd6e0" opacity="0.9" />
            <line x1="26" y1="30" x2="44" y2="30" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            <line x1="26" y1="38" x2="40" y2="38" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            <line x1="26" y1="46" x2="36" y2="46" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            {/* 떠 있는 카드 2 */}
            <rect x="110" y="10" width="30" height="36" rx="4" fill="#d6ecff" opacity="0.9" />
            <line x1="116" y1="20" x2="134" y2="20" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            <line x1="116" y1="28" x2="130" y2="28" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            <line x1="116" y1="36" x2="126" y2="36" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            {/* 떠 있는 카드 3 */}
            <rect x="100" y="55" width="30" height="36" rx="4" fill="#d8f0e0" opacity="0.9" />
            <line x1="106" y1="65" x2="124" y2="65" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            <line x1="106" y1="73" x2="120" y2="73" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            <line x1="106" y1="81" x2="116" y2="81" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            {/* 연결선 */}
            <path
              d="M45 35L70 70"
              stroke="#e0d5c8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <path
              d="M110 30L90 65"
              stroke="#e0d5c8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          </svg>
        </div>

        {/* 제목 + 안내 */}
        <h1 className={styles.pageTitle}>{EMPTY_STATE.pageTitle}</h1>
        <p className={styles.pageDescription}>
          {EMPTY_STATE.pageDescription}
        </p>

        {/* 주요 CTA */}
        <button type="button" className={styles.primaryCta}>
          {EMPTY_STATE.primaryCtaLabel}
        </button>

        {/* 보조 CTA */}
        <button type="button" className={styles.secondaryCta}>
          {EMPTY_STATE.secondaryCtaLabel}
        </button>

        {/* 빠른 시작 태그 */}
        <section
          className={styles.quickStartSection}
          aria-labelledby="quick-start-heading"
        >
          <h2 id="quick-start-heading" className={styles.quickStartHeading}>
            {EMPTY_STATE.quickStartHeading}
          </h2>
          <ul className={styles.tagList}>
            {QUICK_START_TAGS.map((tag) => (
              <li key={tag.id}>
                <button type="button" className={styles.tagButton}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 1v12M1 7h12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M4 4l6 6M10 4l-6 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </svg>
                  {tag.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
