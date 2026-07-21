import { MOCK_MEMORY_DETAIL } from "../data/memoryDetailMockData";
import styles from "./MemoryDetailPage.module.css";

export default function MemoryDetailPage() {
  const data = MOCK_MEMORY_DETAIL;

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className={styles.screenTitle}>기억 상세</h1>
      </header>

      {/* 미디어 영역 */}
      <div className={styles.mediaSection}>
        <div className={styles.mediaPlaceholder}>
          <button type="button" className={styles.playButton} aria-label="기억 영상 재생">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
              <circle cx="24" cy="24" r="23" fill="rgba(0,0,0,0.35)" stroke="white" strokeWidth="2" />
              <path d="M20 16L32 24L20 32V16Z" fill="white" />
            </svg>
          </button>
        </div>
      </div>

      {/* 기억 정보 */}
      <section className={styles.infoSection}>
        <h2 className={styles.memoryTitle}>{data.title}</h2>
        <time className={styles.date}>{data.date}</time>

        <ul className={styles.tagList}>
          {data.tags.map((tag) => (
            <li key={tag}>
              <span className={styles.tag}>{tag}</span>
            </li>
          ))}
        </ul>

        <p className={styles.memo}>{data.memo}</p>
      </section>

      {/* 관련 기억 섹션 */}
      <section className={styles.relatedSection} aria-labelledby="related-heading">
        <h2 id="related-heading" className={styles.relatedHeading}>
          이 순간과 이어진 기억
        </h2>
        <ul className={styles.relatedList}>
          {data.relatedMemories.map((mem) => (
            <li key={mem.id} className={styles.relatedItem}>
              <article
                className={styles.relatedCard}
                aria-labelledby={`rel-title-${mem.id}`}
              >
                <div
                  className={`${styles.relatedThumb} ${styles[`thumbColor_${mem.thumbnailColorKey}`]}`}
                  aria-hidden="true"
                />
                <div className={styles.relatedBody}>
                  <h3 id={`rel-title-${mem.id}`} className={styles.relatedCardTitle}>
                    {mem.title}
                  </h3>
                  <time className={styles.relatedDate}>{mem.date}</time>
                  <p className={styles.relatedDesc}>{mem.description}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </section>

      {/* 하단 액션 영역 */}
      <footer className={styles.actionBar}>
        <button type="button" className={styles.actionButton} aria-label="좋아요">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className={styles.actionLabel}>
            <span className={styles.visuallyHidden}>좋아요 </span>
            {data.likeCount}
          </span>
        </button>

        <button type="button" className={styles.actionButton} aria-label="댓글">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5426 20 9.15871 19.644 7.94583 19.0091L3 20L4.19762 15.9208C3.44581 14.6225 3 13.1147 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className={styles.actionLabel}>
            <span className={styles.visuallyHidden}>댓글 </span>
            {data.commentCount}
          </span>
        </button>

        <button type="button" className={styles.actionButton} aria-label="공유">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.19951 15.0197 5.39434 15.0577 5.58281L9.27528 8.58759C8.61825 8.22013 7.84089 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14C7.84089 14 8.61825 13.7799 9.27528 13.4124L15.0577 16.4172C15.0197 16.6057 15 16.8005 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.1591 14 16.3818 14.2201 15.7247 14.5876L9.94232 11.5828C9.98028 11.3943 10 11.1995 10 11C10 10.8005 9.98028 10.6057 9.94232 10.4172L15.7247 7.41241C16.3818 7.77987 17.1591 8 18 8Z" stroke="currentColor" strokeWidth="1.8" />
          </svg>
          <span className={styles.actionLabel}>공유</span>
        </button>

        <button type="button" className={styles.actionButton} aria-label="수정">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 21H21M7 17L17 7L15 5L5 15L7 17Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className={styles.actionLabel}>수정</span>
        </button>
      </footer>
    </div>
  );
}
