import type { TreeComment } from "../data/treeDetailMockData";
import styles from "./CommentSection.module.css";

interface Props {
  comments: TreeComment[];
}

export default function CommentSection({ comments }: Props) {
  return (
    <div className={styles.commentSection}>
      {/* 댓글 개수 */}
      <h3 className={styles.heading}>
        댓글 <span className={styles.count}>{comments.length}</span>
      </h3>

      {/* 댓글 목록 */}
      <ul className={styles.commentList}>
        {comments.map((comment) => (
          <li key={comment.id} className={styles.commentItem}>
            <span className={styles.commentAvatar} aria-hidden="true">
              {comment.avatar}
            </span>
            <div className={styles.commentBody}>
              <div className={styles.commentHeader}>
                <strong className={styles.commentAuthor}>
                  {comment.author}
                </strong>
                <span className={styles.commentHandle}>
                  {comment.authorHandle}
                </span>
                <span className={styles.commentTime} data-testid="comment-time-label">
                  {comment.timeLabel}
                </span>
              </div>
              <p className={styles.commentText}>{comment.text}</p>
              <button
                type="button"
                className={styles.likeBtn}
                aria-label={`${comment.author}의 댓글에 좋아요`}
                onClick={(e) => e.preventDefault()}
              >
                ♥ {comment.likes}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 댓글 입력 (presentation-only) */}
      <div className={styles.inputArea}>
        <span className={styles.currentUserAvatar} aria-hidden="true">
          👤
        </span>
        <input
          type="text"
          className={styles.input}
          placeholder="댓글 달기..."
          aria-label="댓글 입력"
          readOnly
        />
        <button
          type="button"
          className={styles.submitBtn}
          aria-label="댓글 등록"
          onClick={(e) => e.preventDefault()}
        >
          등록
        </button>
      </div>
    </div>
  );
}
