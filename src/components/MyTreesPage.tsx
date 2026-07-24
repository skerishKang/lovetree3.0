import { MOCK_MY_TREES } from "../data/myTreesMockData";
import styles from "./MyTreesPage.module.css";

export default function MyTreesPage() {
  const data = MOCK_MY_TREES;

  return (
    <div className={styles.page}>
      {/* 상단 헤더 */}
      <header className={styles.topBar}>
        <div className={styles.brandArea}>
          <button type="button" className={styles.iconButton} aria-label="메뉴 열기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <span className={styles.logo}>Relovetree</span>
        </div>

        <div className={styles.topBarRight}>
          <button type="button" className={styles.iconButton} aria-label="알림 보기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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

      {/* 대시보드 타이틀 + CTA */}
      <section className={styles.intro}>
        <div className={styles.introMain}>
          <h1 className={styles.pageTitle}>{data.headerTitle}</h1>
          <p className={styles.pageDescription}>{data.headerDescription}</p>
        </div>
        <button type="button" className={styles.newTreeButton} disabled>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span>{data.newTreeCtaText}</span>
        </button>
      </section>

      {/* 대시보드 본문: 트리 그리드 + 우측 측면 사이드바 */}
      <div className={styles.contentGrid}>
        {/* 트리 카드 목록 메인 섹션 */}
        <section className={styles.treeListSection} aria-label={data.cardsTitle}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{data.cardsTitle}</h2>
            <span className={styles.treeCountBadge}>총 {data.trees.length}개</span>
          </div>

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
                    {/* 썸네일 및 미니 트리 시각화 */}
                    <div
                      className={`${styles.thumbnail} ${styles[`thumb_${tree.thumbnailColorKey}`]}`}
                      aria-hidden="true"
                    >
                      {/* 선택된 트리의 정적 배지 */}
                      {isSelected && (
                        <span className={styles.selectedBadge}>현재 편집 중</span>
                      )}

                      {/* 미니 트리 가지 및 노드 그래픽 */}
                      <div className={styles.miniTreeGraphic}>
                        <svg width="100%" height="100%" viewBox="0 0 240 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                          <line
                            x1="20"
                            y1="80"
                            x2="220"
                            y2="80"
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                          <path
                            d="M120 80 Q90 60 70 35"
                            stroke="rgba(255,255,255,0.75)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M120 80 Q150 60 170 35"
                            stroke="rgba(255,255,255,0.75)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <path
                            d="M120 80 L120 25"
                            stroke="rgba(255,255,255,0.9)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                          />
                          <circle cx="70" cy="35" r={tree.memoryCount > 50 ? "6" : "4"} fill="rgba(255,255,255,0.9)" />
                          <circle cx="120" cy="25" r={tree.memoryCount > 100 ? "8" : "5"} fill="#ffffff" />
                          <circle cx="170" cy="35" r={tree.memoryCount > 50 ? "6" : "4"} fill="rgba(255,255,255,0.9)" />
                          {tree.memoryCount > 80 && (
                            <>
                              <circle cx="95" cy="50" r="4" fill="rgba(255,255,255,0.8)" />
                              <circle cx="145" cy="50" r="4" fill="rgba(255,255,255,0.8)" />
                            </>
                          )}
                        </svg>
                      </div>
                    </div>

                    {/* 카드 본문 정보 */}
                    <div className={styles.cardBody}>
                      <div className={styles.cardHeader}>
                        <h3 id={`my-tree-title-${tree.id}`} className={styles.treeTitle}>
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
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

                      {/* 카드 액션 버튼 4개 */}
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

        {/* 우측 사이드바: 최근 수정한 순간 */}
        <aside className={styles.sidebar} aria-label={data.sidebarTitle}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>{data.sidebarTitle}</h2>
            <span className={styles.sidebarBadge}>최신활동</span>
          </div>
          <p className={styles.sidebarDescription}>
            선택한 트리의 최근 기록 업데이트 목록입니다.
          </p>

          <ul className={styles.recentList}>
            {data.recentMoments.map((moment) => (
              <li key={moment.id} className={styles.recentItem}>
                <span
                  className={`${styles.recentThumb} ${styles[`thumb_${moment.thumbnailColorKey}`]}`}
                  aria-hidden="true"
                >
                  <span className={styles.recentThumbIcon}>🌱</span>
                </span>
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
