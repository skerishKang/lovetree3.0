import { Link, useNavigate } from "react-router-dom";
import styles from "./MyTreesEmptyPage.module.css";

const EMPTY_STATE = {
  pageTitle: "아직 만든 러브트리가 없어요",
  pageDescription: "첫 기억을 연결하고 당신만의 이야기가 담긴 러브트리를 만들어 보세요.",
  primaryCtaLabel: "새 러브트리 만들기",
  secondaryCtaLabel: "다른 팬들 트리 구경하기",
};

const QUICK_START_IDEAS = [
  { id: "qs-1", title: "첫사랑 노래", description: "가장 처음 좋아하게 된 곡을 기록해 보세요.", variant: "rose" },
  { id: "qs-2", title: "직캠 모음", description: "최애의 무대 직캠을 모아보세요.", variant: "sage" },
  { id: "qs-3", title: "콘서트 후기", description: "가장 기억에 남는 공연의 감동을 기록해 보세요.", variant: "cream" },
];

export default function MyTreesEmptyPage() {
  const navigate = useNavigate();
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
            <button type="button" className={styles.primaryCta} onClick={() => navigate("/tree/new")}>
              {EMPTY_STATE.primaryCtaLabel}
            </button>
            <Link to="/community" className={styles.secondaryCta}>
              {EMPTY_STATE.secondaryCtaLabel}
            </Link>
          </div>

          <section className={styles.quickStartSection} aria-labelledby="quick-start-heading">
            <h2 id="quick-start-heading" className={styles.quickStartHeading}></h2>
            <ul className={styles.quickStartList} aria-label="빠르게 시작할 수 있는 첫 기억 아이디어">
              {QUICK_START_IDEAS.map((idea) => (
                <li key={idea.id} data-testid="quick-start-item" className={styles.quickStartItem}>
                  <button type="button" className={`${styles.quickStartButton} ${styles[idea.variant]}`} onClick={() => navigate("/tree/new")}>
                    <span>{idea.title}</span>
                  </button>
                  <p data-testid="quick-start-description" className={styles.quickStartDescription}>{idea.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
