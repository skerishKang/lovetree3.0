import { MOCK_MEDIA_RESULTS, MEDIA_CATEGORIES } from "../data/mediaSearchMockData";
import styles from "./MediaSearchPage.module.css";

export default function MediaSearchPage() {
  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <h1 className={styles.screenTitle}>미디어 검색</h1>
      </header>

      {/* 검색창 */}
      <div className={styles.searchSection}>
        <input
          type="search"
          className={styles.searchInput}
          aria-label="미디어 검색"
          placeholder="무대, 직캠, 영상 링크 검색"
          readOnly
        />
      </div>

      {/* 검색 결과 */}
      <section className={styles.resultSection} aria-label="검색 결과">
        <ul className={styles.resultList}>
          {MOCK_MEDIA_RESULTS.map((item) => (
            <li key={item.id} className={styles.resultItem}>
              <article
                className={styles.resultCard}
                aria-labelledby={`media-title-${item.id}`}
              >
                <div
                  className={`${styles.thumbnail} ${styles[`thumbColor_${item.thumbnailColorKey}`]}`}
                  aria-hidden="true"
                />
                <div className={styles.cardBody}>
                  <h2 id={`media-title-${item.id}`} className={styles.cardTitle}>
                    {item.title}
                  </h2>
                  <time className={styles.cardDate}>{item.date}</time>
                  <span className={styles.cardChannel}>{item.channelName}</span>
                </div>
                <button type="button" className={styles.addButton} aria-label={`${item.title} 러브트리에 추가`}>
                  러브트리에 추가
                </button>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* 하단 카테고리 필터 */}
      <footer className={styles.filterBar}>
        <div className={styles.filterGroup} role="group" aria-label="카테고리 필터">
          {MEDIA_CATEGORIES.map((cat) => (
            <button key={cat} type="button" className={styles.filterButton}>
              {cat}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
}
