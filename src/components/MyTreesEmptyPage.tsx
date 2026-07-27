import { Link } from "react-router-dom";
import styles from "./MyTreesEmptyPage.module.css";

const EMPTY_STATE = {
  pageTitle: "아직 만든 러브트리가 없어요",
  pageDescription: "첫 기억을 연결하고 당신만의 이야기가 담긴 러브트리를 만들어 보세요.",
  secondaryCtaLabel: "다른 팬들 트리 구경하기",
};

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
          <svg className={styles.sproutSvg} width="220" height="200" viewBox="0 0 220 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
            <ellipse cx="110" cy="178" rx="60" ry="14" fill="#e8d5c4" />
            <path d="M110 178V110" stroke="#9bd4ae" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M110 120C96 106 82 110 76 120C70 130 82 140 110 126" fill="#b8e6c9" />
            <path d="M110 106C124 92 138 96 144 106C150 116 138 126 110 112" fill="#7bc99b" />
            <path d="M110 96C100 82 88 84 84 92C80 100 90 106 110 98" fill="#d4edda" />
          </svg>
          <p className={styles.visualCaption}>첫 기억을 심기 전의 조용한 시작점</p>
        </div>

        <div className={styles.actionPanel}>
          <h1 className={styles.pageTitle}>{EMPTY_STATE.pageTitle}</h1>
          <p className={styles.pageDescription}>{EMPTY_STATE.pageDescription}</p>

          <div className={styles.ctaGroup}>
            <Link to="/community" className={styles.secondaryCta}>
              {EMPTY_STATE.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
