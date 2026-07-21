import { MOCK_MY_TREES } from "../data/myTreesMockData";
import styles from "./MyTreesPage.module.css";

export default function MyTreesPage() {
  const data = MOCK_MY_TREES;

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <button type="button" className={styles.iconButton} aria-label="메뉴 열기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <span className={styles.logo}>LoveTree</span>
        <div className={styles.topBarRight}>
          <button type="button" className={styles.iconButton} aria-label="알림 보기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className={styles.profileButton} aria-label="마이페이지">
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
        </div>
      </header>

      {/* 제목 + CTA */}
      <section className={styles.intro}>
        <div className={styles.introMain}>
          <h1 className={styles.pageTitle}>{data.headerTitle}</h1>
          <p className={styles.pageDescription}>{data.headerDescription}</p>
        </div>
        <button type="button" className={styles.newTreeButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{data.newTreeCtaText}</span>
        </button>
      </section>

      {/* 본문: 트리 카드 그리드 + 사이드바 */}
      <div className={styles.contentGrid}>
        {/* 트리 카드 목록 */}
        <section className={styles.treeListSection} aria-label={data.cardsTitle}>
          <h2 className={styles.sectionTitle}>{data.cardsTitle}</h2>
          <ul className={styles.treeList}>
            {data.trees.map((tree) => {
              const isSelected = tree.id === data.selectedTreeId;
              return (
                <li key={tree.id} className={styles.treeListItem}>
                  <article
                    className={`${styles.treeCard} ${isSelected ? styles.treeCardSelected : ""}`}
                    data-selected={isSelected ? "true" : "false"}
                    aria-current={isSelected ? "true" : undefined}
                    aria-labelledby={`my-tree-title-${tree.id}`}
                  >
                    {/* 썸네일 영역 */}
                    <div
                      className={`${styles.thumbnail} ${styles[`thumb_${tree.thumbnailColorKey}`]}`}
                      aria-hidden="true"
                    />
                    {/* 카드 본문 */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <h3
                          id={`my-tree-title-${tree.id}`}
                          className={styles.treeTitle}
                        >
                          {tree.title}
                        </h3>
                        <span
                          className={`${styles.visibilityBadge} ${
                            tree.visibility === "public"
                              ? styles.visibilityPublic
                              : styles.visibilityPrivate
                          }`}
                        >
                          {tree.visibility === "public" ? "공개" : "비공개"}
                        </span>
                      </div>
                      <p className={styles.treeDescription}>{tree.description}</p>
                      <dl className={styles.cardMeta}>
                        <div className={styles.metaItem}>
                          <dt className={styles.metaLabel}>마지막 업데이트</dt>
                          <dd className={styles.metaValue}>{tree.updatedAt}</dd>
                        </div>
                        <div className={styles.metaItem}>
                          <dt className={styles.metaLabel}>기억</dt>
                          <dd className={styles.metaValue}>{tree.memoryCount}개</dd>
                        </div>
                      </dl>
                      <div className={styles.cardStats}>
                        <span className={styles.statItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          <span className={styles.visuallyHidden}>조회 </span>
                          <span>{tree.views}</span>
                        </span>
                        <span className={styles.statItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.2l7.8-7.7 1-1.1a5.5 5.5 0 000-7.8z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className={styles.visuallyHidden}>좋아요 </span>
                          <span>{tree.likes}</span>
                        </span>
                        <span className={styles.statItem}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path
                              d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className={styles.visuallyHidden}>댓글 </span>
                          <span>{tree.comments}</span>
                        </span>
                      </div>
                      {/* 카드 하단 액션 */}
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          aria-label={`${tree.title} 편집`}
                        >
                          편집
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          aria-label={`${tree.title} 공유`}
                        >
                          공유
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          aria-label={`${tree.title} 복제`}
                        >
                          복제
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          aria-label={`${tree.title} 삭제`}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 사이드바: 최근 수정한 순간 */}
        <aside className={styles.sidebar} aria-label={data.sidebarTitle}>
          <h2 className={styles.sidebarTitle}>{data.sidebarTitle}</h2>
          <ul className={styles.recentList}>
            {data.recentMoments.map((moment) => (
              <li key={moment.id} className={styles.recentItem}>
                <span
                  className={`${styles.recentThumb} ${styles[`thumb_${moment.thumbnailColorKey}`]}`}
                  aria-hidden="true"
                />
                <div className={styles.recentText}>
                  <span className={styles.recentTitle}>{moment.title}</span>
                  <span className={styles.recentDate}>{moment.updatedAt}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
