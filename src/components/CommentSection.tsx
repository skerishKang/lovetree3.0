import { useState } from "react";
import type { TreeComment } from "../data/treeDetailMockData";
import styles from "./CommentSection.module.css";

interface Props {
  comments: TreeComment[];
}

export default function CommentSection({ comments }: Props) {
  const [inputValue, setInputValue] = useState("");

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
              </div>
              <p className={styles.commentText}>{comment.text}</p>
              <button
                className={styles.likeBtn}
                onClick={(e) => e.preventDefault()}
                aria-label={`${comment.author}의 댓글에 좋아요`}
              >
                ♥ {comment.likes}
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* 댓글 입력 */}
      <div className={styles.inputArea}>
        <input
          type="text"
          className={styles.input}
          placeholder="댓글 달기..."
          aria-label="댓글 입력"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button
          type="submit"
          className={styles.submitBtn}
          onClick={(e) => e.preventDefault()}
          aria-label="댓글 등록"
          disabled={!inputValue.trim()}
        >
          등록
        </button>
      </div>
    </div>
  );
}
