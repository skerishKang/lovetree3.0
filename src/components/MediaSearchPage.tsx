import { useNavigate } from "react-router-dom";
import {
  MOCK_MEDIA_RESULTS,
  MOCK_MEDIA_CONTEXT,
  MEDIA_CATEGORIES,
} from "../data/mediaSearchMockData";
import { useBackWithFallback } from "../hooks/useBackWithFallback";
import styles from "./MediaSearchPage.module.css";

export default function MediaSearchPage() {
  const navigate = useNavigate();
  const context = MOCK_MEDIA_CONTEXT;
  const results = MOCK_MEDIA_RESULTS;
  const handleBack = useBackWithFallback("/memory/connect-demo");

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label="뒤로 가기" onClick={handleBack}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className={styles.screenTitle}>미디어 검색</h1>
      </header>

      <div className={styles.desktopWorkspace}>
        <main className={styles.mainContent}>
          <div className={styles.searchSection}>
            <div className={styles.searchInputWrap}>
              <svg
                className={styles.searchIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className={styles.searchInput}
                aria-label="미디어 검색"
                placeholder="무대, 직캠, 영상 링크 검색"
                readOnly
              />
            </div>
          </div>

          <section className={styles.searchContext} aria-label="검색 맥락">
            <p className={styles.contextScope}>{context.sourceScope}</p>
            <p className={styles.contextQuery}>
              "<strong>{context.searchQuery}</strong>" ·{" "}
              <span data-testid="result-count">{context.resultCount}건</span>
            </p>
            <div className={styles.keywordSection}>
              <span className={styles.keywordLabel}>최근 검색</span>
              <div className={styles.keywordList}>
                {context.recentKeywords.map((kw) => (
                  <span key={kw} className={styles.keywordTag}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <footer className={styles.filterBar}>
            <ul className={styles.filterGroup} aria-label="카테고리 필터">
              {MEDIA_CATEGORIES.map((category) => {
                const selected = category === context.selectedCategory;
                return (
                  <li key={category}>
                    <span
                      className={`${styles.filterChip} ${
                        selected ? styles.filterSelected : ""
                      }`}
                      data-selected={selected ? "true" : "false"}
                    >
                      {category}
                    </span>
                  </li>
                );
              })}
            </ul>
          </footer>

          <section className={styles.resultSection} aria-label="검색 결과">
            <ul className={styles.resultList} aria-label="미디어 검색 결과 목록">
              {results.map((item) => (
                <li key={item.id} className={styles.resultItem}>
                  <article
                    className={styles.resultCard}
                    aria-labelledby={`media-title-${item.id}`}
                  >
                    <div
                      className={`${styles.thumbnail} ${styles[`thumbColor_${item.thumbnailColorKey}`]}`}
                      aria-hidden="true"
                    >
                      <svg
                        className={styles.playOverlay}
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                        focusable="false"
                      >
                        <path d="M8 5.14v13.72c0 .79.87 1.27 1.54.84l10.78-6.86c.62-.39.62-1.29 0-1.68L9.54 4.3C8.87 3.87 8 4.35 8 5.14z" />
                      </svg>
                      <span className={styles.durationBadge}>{item.duration}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMetaRow}>
                        <span className={styles.contentTypeBadge}>
                          {item.contentType}
                        </span>
                        <time className={styles.cardDate}>{item.date}</time>
                      </div>
                      <h2 id={`media-title-${item.id}`} className={styles.cardTitle}>
                        {item.title}
                      </h2>
                      <span className={styles.cardChannel}>{item.channelName}</span>
                      <div className={styles.cardTags}>
                        {item.tags.map((tag) => (
                          <span key={tag} className={styles.cardTag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.addButton}
                      aria-label={`${item.title} 러브트리에 추가`}
                      disabled
                    >
                      러브트리에
                      <br />
                      추가
                    </button>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </main>

        <aside className={styles.treeSidebar} aria-label="추가 대상 트리">
          <div className={styles.treeSidebarCard}>
            <h2 className={styles.treeSidebarTitle}>추가 대상 러브트리</h2>
            <div className={styles.treeSummaryItem}>
              <span className={styles.treeSummaryIcon} aria-hidden="true">🌳</span>
              <div className={styles.treeSummaryText}>
                <strong className={styles.treeSummaryName}>MY_STARLINE</strong>
                <span className={styles.treeSummaryCount}>검색 결과 {context.resultCount}건</span>
                <span className={styles.treeSummaryDesc}>
                  선택한 미디어가 이 트리에 추가됩니다
                </span>
              </div>
            </div>
            <p className={styles.treeSidebarHint} data-testid="tree-context">
              선택한 미디어를 "<strong>MY_STARLINE</strong>" 러브트리에 추가할 수 있습니다
            </p>
          </div>
        </aside>
      </div>

      <div className={styles.ctaArea} data-testid="mobile-cta">
        <div className={styles.ctaPanel}>
          <p className={styles.ctaContext} data-testid="cta-context-mobile">
            선택한 미디어를 "<strong>{MOCK_MEDIA_RESULTS[0].treeName}</strong>" 러브트리에 추가할 수 있습니다
          </p>
          <div className={styles.ctaTreeInfo}>
            <span className={styles.ctaTreeIcon} aria-hidden="true">🌳</span>
            <span className={styles.ctaTreeName}>MY_STARLINE 러브트리</span>
          </div>
          <button
            type="button"
            className={styles.reviewBtn}
            aria-label="결과 검토"
            onClick={() => navigate("/memory/connect-demo")}
          >
            결과 검토
          </button>
        </div>
      </div>
    </div>
  );
}
