import { useNavigate } from "react-router-dom";
import { MOCK_MEMORY_DETAIL } from "../data/memoryDetailMockData";
import styles from "./MemoryDetailPage.module.css";

export default function MemoryDetailPage() {
  const navigate = useNavigate();
  const data = MOCK_MEMORY_DETAIL;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        {/* ── Main Area ── */}
        <div className={styles.mainArea}>
          {/* Top Bar */}
          <header className={styles.topBar}>
            <button
              type="button"
              className={styles.backButton}
              aria-label="뒤로 가기"
              onClick={() => navigate(-1)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <h1 className={styles.screenTitle}>기억 상세</h1>
            <button
              type="button"
              className={styles.menuButton}
              aria-label="더보기 메뉴"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </header>

          {/* Media Section */}
          <section className={styles.mediaSection} aria-label="미디어 영역">
            <div className={styles.mediaCard}>
              <div className={styles.mediaPlaceholder}>
                <button
                  type="button"
                  className={styles.playButton}
                  aria-label="기억 영상 재생"
                >
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="28"
                      cy="28"
                      r="27"
                      fill="rgba(0,0,0,0.3)"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path d="M22 17L40 28L22 39V17Z" fill="white" />
                  </svg>
                </button>
              </div>
              <div className={styles.mediaOverlay}>
                <span className={styles.mediaOverlayText}>
                  VIDEO: FIRST CONCERT THRILL
                </span>
                <span className={styles.mediaOverlaySubtext}>
                  {data.media.format} · {data.media.duration}
                </span>
              </div>
            </div>
            <ul className={styles.mediaMeta} aria-label="미디어 정보">
              <li>
                <span className={styles.metaLabel}>출처</span>
                <span className={styles.metaValue}>{data.media.source}</span>
              </li>
              <li>
                <span className={styles.metaLabel}>형식</span>
                <span className={styles.metaValue}>{data.media.format}</span>
              </li>
              <li>
                <span className={styles.metaLabel}>길이</span>
                <span className={styles.metaValue}>{data.media.duration}</span>
              </li>
            </ul>
          </section>

          {/* Memory Info */}
          <section className={styles.infoSection}>
            <h2 className={styles.memoryTitle}>{data.title}</h2>
            <div className={styles.infoMeta}>
              <time className={styles.date}>{data.date}</time>
              <span className={styles.memoryTypeBadge}>{data.memoryType}</span>
            </div>
            <ul className={styles.tagList}>
              {data.tags.map((tag) => (
                <li key={tag} className={styles.tagItem}>
                  <span className={styles.tag}>{tag}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Memo Section */}
          <section className={styles.memoSection} aria-label="기억 본문">
            <h3 className={styles.memoLabel}>Memo</h3>
            <div className={styles.memoBody}>
              <p className={styles.memoText}>{data.memo}</p>
            </div>
          </section>

          {/* Related Memories */}
          <section
            className={styles.relatedSection}
            aria-labelledby="related-heading"
          >
            <h2 id="related-heading" className={styles.relatedHeading}>
              이 순간과 이어진 기억
            </h2>
            <ul className={styles.relatedList} aria-label="연관 기억 목록">
              {data.relatedMemories.map((mem) => (
                <li key={mem.id} className={styles.relatedItem}>
                  <article
                    className={styles.relatedCard}
                    aria-labelledby={`rel-title-${mem.id}`}
                  >
                    <div
                      className={`${styles.relatedThumb} ${styles[`thumbColor_${mem.thumbnailColorKey}`]}`}
                      aria-hidden="true"
                    >
                      <span className={styles.relatedThumbType}>{mem.type}</span>
                    </div>
                    <div className={styles.relatedBody}>
                      <h3
                        id={`rel-title-${mem.id}`}
                        className={styles.relatedCardTitle}
                      >
                        {mem.title}
                      </h3>
                      <div className={styles.relatedMeta}>
                        <time className={styles.relatedDate}>{mem.date}</time>
                        <span className={styles.relatedRelation}>
                          {mem.relation}
                        </span>
                      </div>
                      <p className={styles.relatedDesc}>{mem.description}</p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Sidebar (Desktop) ── */}
        <aside className={styles.sidebar} aria-label="작성자 및 반응 정보">
          {/* Author / Tree Context */}
          <div className={styles.authorSection}>
            <div className={styles.authorAvatar} aria-hidden="true">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
              >
                <circle cx="16" cy="16" r="16" fill="#e8ddd0" />
                <circle cx="16" cy="12" r="5" fill="#b8a898" />
                <path
                  d="M6 28C6 22.477 10.477 18 16 18C21.523 18 26 22.477 26 28"
                  fill="#b8a898"
                />
              </svg>
            </div>
            <div className={styles.authorInfo}>
              <span className={styles.authorName}>{data.author.name}</span>
              <span className={styles.authorTree}>{data.author.treeName}</span>
              <span className={styles.authorRelation}>
                {data.author.treeRelation}
              </span>
            </div>
          </div>

          {/* Reaction Stats */}
          <div className={styles.statsSection}>
            <h3 className={styles.statsHeading}>반응</h3>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
                      fill={data.actions.liked ? "#b87a7a" : "none"}
                      stroke={data.actions.liked ? "#b87a7a" : "currentColor"}
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span className={styles.statValue}>{data.actions.likeCount}</span>
                <span className={styles.statLabel}>좋아요</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5426 20 9.15871 19.644 7.94583 19.0091L3 20L4.19762 15.9208C3.44581 14.6225 3 13.1147 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span className={styles.statValue}>
                  {data.actions.commentCount}
                </span>
                <span className={styles.statLabel}>댓글</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statIcon} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.19951 15.0197 5.39434 15.0577 5.58281L9.27528 8.58759C8.61825 8.22013 7.84089 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14C7.84089 14 8.61825 13.7799 9.27528 13.4124L15.0577 16.4172C15.0197 16.6057 15 16.8005 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.1591 14 16.3818 14.2201 15.7247 14.5876L9.94232 11.5828C9.98028 11.3943 10 11.1995 10 11C10 10.8005 9.98028 10.6057 9.94232 10.4172L15.7247 7.41241C16.3818 7.77987 17.1591 8 18 8Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                </span>
                <span className={styles.statValue}>
                  {data.actions.shareCount}
                </span>
                <span className={styles.statLabel}>공유</span>
              </div>
            </div>
          </div>

          {/* Tree Context Card */}
          <div className={styles.treeContextCard}>
            <h3 className={styles.treeContextHeading}>기억 트리</h3>
            <div className={styles.treeContextBody}>
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="20" cy="20" r="18" fill="#f2e5d8" stroke="#d4cdc4" strokeWidth="1" />
                <path
                  d="M20 8C20 8 14 14 14 20C14 23.3 16.7 26 20 26C23.3 26 26 23.3 26 20C26 14 20 8 20 8Z"
                  fill="#b8a898"
                  opacity="0.6"
                />
                <path
                  d="M20 26V34"
                  stroke="#b8a898"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className={styles.treeContextInfo}>
                <span className={styles.treeContextName}>
                  {data.author.treeName}
                </span>
                <span className={styles.treeContextRelation}>
                  {data.author.treeRelation}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Mobile Bottom Action Bar ── */}
      <footer className={styles.actionBar} role="toolbar" aria-label="기억 액션">
        <button
          type="button"
          className={`${styles.actionButton} ${data.actions.liked ? styles.actionLiked : ""}`}
          aria-label={`좋아요 ${data.actions.likeCount}`}
          aria-pressed={data.actions.liked}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
              fill={data.actions.liked ? "#b87a7a" : "none"}
              stroke={data.actions.liked ? "#b87a7a" : "currentColor"}
              strokeWidth="1.8"
            />
          </svg>
          <span className={styles.actionLabel}>{data.actions.likeCount}</span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          aria-label={`댓글 ${data.actions.commentCount}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M21 11.5C21 16.1944 16.9706 20 12 20C10.5426 20 9.15871 19.644 7.94583 19.0091L3 20L4.19762 15.9208C3.44581 14.6225 3 13.1147 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <span className={styles.actionLabel}>{data.actions.commentCount}</span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          aria-label="공유"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.19951 15.0197 5.39434 15.0577 5.58281L9.27528 8.58759C8.61825 8.22013 7.84089 8 7 8C5.34315 8 4 9.34315 4 11C4 12.6569 5.34315 14 7 14C7.84089 14 8.61825 13.7799 9.27528 13.4124L15.0577 16.4172C15.0197 16.6057 15 16.8005 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.1591 14 16.3818 14.2201 15.7247 14.5876L9.94232 11.5828C9.98028 11.3943 10 11.1995 10 11C10 10.8005 9.98028 10.6057 9.94232 10.4172L15.7247 7.41241C16.3818 7.77987 17.1591 8 18 8Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
          <span className={styles.actionLabel}>공유</span>
        </button>

        <button
          type="button"
          className={styles.actionButton}
          aria-label="수정"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 21H21M7 17L17 7L15 5L5 15L7 17Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className={styles.actionLabel}>수정</span>
        </button>
      </footer>
    </div>
  );
}
