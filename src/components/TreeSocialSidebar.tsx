import type { TreeDetailData } from "../data/treeDetailMockData";
import CommentSection from "./CommentSection";
import styles from "./TreeSocialSidebar.module.css";

interface Props {
  data: TreeDetailData;
}

export default function TreeSocialSidebar({ data }: Props) {
  return (
    <div className={styles.sidebar}>
      {/* 소셜 액션 버튼 */}
      <div className={styles.socialActions}>
        <button
          className={styles.actionBtn}
          onClick={(e) => e.preventDefault()}
          aria-label="좋아요"
        >
          <span aria-hidden="true">❤️</span>
          <span className={styles.count}>{data.likeCount}</span>
        </button>

        <button
          className={styles.actionBtn}
          onClick={(e) => e.preventDefault()}
          aria-label="댓글"
        >
          <span aria-hidden="true">💬</span>
          <span className={styles.count}>{data.commentCount}</span>
        </button>

        <button
          className={styles.actionBtn}
          onClick={(e) => e.preventDefault()}
          aria-label="공유"
        >
          <span aria-hidden="true">🔗</span>
          <span className={styles.count}>{data.shareCount}</span>
        </button>
      </div>

      {/* 저장 버튼 (시각적 UI만, 기능 없음) */}
      <button
        className={styles.saveBtn}
        onClick={(e) => e.preventDefault()}
        aria-label="내 러브트리에 저장"
      >
        ♡ 내 러브트리에 저장
      </button>

      {/* 댓글 영역 */}
      <CommentSection comments={data.comments} />
    </div>
  );
}
