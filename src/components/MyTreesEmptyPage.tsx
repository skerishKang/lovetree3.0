import { EMPTY_STATE, QUICK_START_IDEAS } from "../data/myTreesEmptyMockData";
import styles from "./MyTreesEmptyPage.module.css";

export default function MyTreesEmptyPage() {
  return (
    <div className={styles.page}>
      <header className={styles.brandBar}>
        <span className={styles.brandName}>Relovetree</span>
        <button type="button" className={styles.profileButton} aria-label="마이페이지">
          <span className={styles.profileIcon} aria-hidden="true" />
        </button>
      </header>

      <main className={styles.layout}>
        <div className={styles.visualPanel} aria-hidden="true">
          <svg
            className={styles.sproutSvg}
            width="220"
            height="200"
            viewBox="0 0 220 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <ellipse cx="110" cy="178" rx="60" ry="14" fill="#e8d5c4" />
            <path d="M110 178V110" stroke="#9bd4ae" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M110 120C96 106 82 110 76 120C70 130 82 140 110 126" fill="#b8e6c9" />
            <path d="M110 106C124 92 138 96 144 106C150 116 138 126 110 112" fill="#7bc99b" />
            <path d="M110 96C100 82 88 84 84 92C80 100 90 106 110 98" fill="#d4edda" />
            <rect x="28" y="24" width="34" height="42" rx="5" fill="#ffd6e0" opacity="0.9" />
            <line x1="35" y1="36" x2="55" y2="36" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="45" x2="51" y2="45" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            <line x1="35" y1="54" x2="47" y2="54" stroke="#ff9eb5" strokeWidth="2" strokeLinecap="round" />
            <rect x="158" y="14" width="34" height="42" rx="5" fill="#d6ecff" opacity="0.9" />
            <line x1="165" y1="26" x2="185" y2="26" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            <line x1="165" y1="35" x2="181" y2="35" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            <line x1="165" y1="44" x2="177" y2="44" stroke="#87b8ff" strokeWidth="2" strokeLinecap="round" />
            <rect x="148" y="68" width="34" height="42" rx="5" fill="#d8f0e0" opacity="0.9" />
            <line x1="155" y1="80" x2="175" y2="80" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            <line x1="155" y1="89" x2="171" y2="89" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            <line x1="155" y1="98" x2="167" y2="98" stroke="#9bd4ae" strokeWidth="2" strokeLinecap="round" />
            <path d="M55 42L90 90" stroke="#e0d5c8" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M158 36L130 80" stroke="#e0d5c8" strokeWidth="1" strokeDasharray="3 3" />
            <path d="M148 88L125 100" stroke="#e0d5c8" strokeWidth="1" strokeDasharray="3 3" />
          </svg>
          <p className={styles.visualCaption}>첫 기억을 심기 전의 조용한 시작점</p>
        </div>

        <div className={styles.actionPanel}>
          <h1 className={styles.pageTitle}>{EMPTY_STATE.pageTitle}</h1>
          <p className={styles.pageDescription}>{EMPTY_STATE.pageDescription}</p>

          <div className={styles.ctaGroup}>
            <button type="button" className={styles.primaryCta}>
              {EMPTY_STATE.primaryCtaLabel}
            </button>
            <button type="button" className={styles.secondaryCta}>
              {EMPTY_STATE.secondaryCtaLabel}
            </button>
          </div>

          <section className={styles.quickStartSection} aria-labelledby="quick-start-heading">
            <h2 id="quick-start-heading" className={styles.quickStartHeading}>
              {EMPTY_STATE.quickStartHeading}
            </h2>
            <ul className={styles.quickStartList} aria-label="빠르게 시작할 수 있는 첫 기억 아이디어">
              {QUICK_START_IDEAS.map((idea) => (
                <li key={idea.id} data-testid="quick-start-item" className={styles.quickStartItem}>
                  <button
                    type="button"
                    className={`${styles.quickStartButton} ${styles[idea.variant]}`}
                  >
                    {idea.variant === "rose" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                        <path d="M8 14s-5.5-3.5-5.5-7A3 3 0 0 1 8 4.5 3 3 0 0 1 13.5 7c0 3.5-5.5 7-5.5 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                      </svg>
                    )}
                    {idea.variant === "sage" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                        <rect x="2" y="4" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" />
                        <circle cx="5" cy="9.5" r="0.8" fill="currentColor" />
                      </svg>
                    )}
                    {idea.variant === "cream" && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                        <path d="M8 1.5l1.8 3.7 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 5.8l4-.6L8 1.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                      </svg>
                    )}
                    <span>{idea.title}</span>
                  </button>
                  <p data-testid="quick-start-description" className={styles.quickStartDescription}>
                    {idea.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
