import type { TreeDetailData } from "../data/treeDetailMockData";
import CommentSection from "./CommentSection";
import styles from "./TreeSocialSidebar.module.css";

interface Props {
  data: TreeDetailData;
}

export default function TreeSocialSidebar({ data }: Props) {
  // Find featured memory card info
  const featuredMemory = data.memories.find(m => m.id === data.featuredMemoryId);

  return (
    <div className={styles.sidebar}>
      {/* 작성자 정보 카드 */}
      <div className={styles.authorCard}>
        <h4 className={styles.sidebarLabel}>작성자 프로필</h4>
        <div className={styles.authorHeader}>
          <span className={styles.authorAvatarCircle} aria-hidden="true">
            {data.authorAvatar}
          </span>
          <div className={styles.authorText}>
            <strong className={styles.authorNameText}>{data.authorName}</strong>
            <span className={styles.authorHandleText}>{data.authorHandle}</span>
          </div>
        </div>
      </div>

      {/* 트리 통계 요약 */}
      <div className={styles.statsCard}>
        <h4 className={styles.sidebarLabel}>트리 정보</h4>
        <ul className={styles.statsList}>
          <li className={styles.statsItem}>
            <span className={styles.statLabel}>조회수</span>
            <span className={styles.statVal}>{data.viewCount}회</span>
          </li>
          <li className={styles.statsItem}>
            <span className={styles.statLabel}>생성일</span>
            <span className={styles.statVal}>{data.createdLabel}</span>
          </li>
          <li className={styles.statsItem}>
            <span className={styles.statLabel}>최근 업데이트</span>
            <span className={styles.statVal}>{data.updatedLabel}</span>
          </li>
        </ul>
      </div>

      {/* 대표 기억 요약 */}
      {featuredMemory && (
        <div className={styles.featuredMemoryBox}>
          <h4 className={styles.sidebarLabel}>대표 기억 노드</h4>
          <div className={styles.featuredSummary}>
            <span className={styles.featuredEmoji} aria-hidden="true">{featuredMemory.emoji}</span>
            <div className={styles.featuredText}>
              <strong className={styles.featuredTitle}>{featuredMemory.title}</strong>
              <p className={styles.featuredDesc}>{featuredMemory.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* 소셜 액션 버튼 (presentation-only) */}
      <div className={styles.socialActions}>
        <button
          type="button"
          className={styles.actionBtn}
          aria-label="좋아요"
          onClick={(e) => e.preventDefault()}
        >
          <span className={styles.icon}>❤️</span>
          <span className={styles.btnLabel}>좋아요</span>
          <span className={styles.count}>{data.likeCount}</span>
        </button>

        <button
          type="button"
          className={styles.actionBtn}
          aria-label="댓글"
          onClick={(e) => e.preventDefault()}
        >
          <span className={styles.icon}>💬</span>
          <span className={styles.btnLabel}>댓글</span>
          <span className={styles.count}>{data.commentCount}</span>
        </button>

        <button
          type="button"
          className={styles.actionBtn}
          aria-label="공유"
          onClick={(e) => e.preventDefault()}
        >
          <span className={styles.icon}>↗️</span>
          <span className={styles.btnLabel}>공유</span>
          <span className={styles.count}>{data.shareCount}</span>
        </button>
      </div>

      {/* 저장 버튼 (presentation-only) */}
      <button
        type="button"
        className={styles.saveBtn}
        aria-label="내 러브트리에 저장"
        onClick={(e) => e.preventDefault()}
      >
        내 러브트리에 저장
      </button>

      {/* 댓글 영역 */}
      <CommentSection comments={data.comments} />
    </div>
  );
}

