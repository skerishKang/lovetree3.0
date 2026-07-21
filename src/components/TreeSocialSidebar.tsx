import type { TreeDetailData } from "../data/treeDetailMockData";
import CommentSection from "./CommentSection";
import styles from "./TreeSocialSidebar.module.css";

interface Props {
  data: TreeDetailData;
}

export default function TreeSocialSidebar({ data }: Props) {
  return (
    <div className={styles.sidebar}>
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
