import type { TreeDetailData } from "../data/treeDetailMockData";
import styles from "./TreeDetailHeader.module.css";

interface Props {
  data: TreeDetailData;
}

export default function TreeDetailHeader({ data }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.backRow}>
        <button
          className={styles.backButton}
          aria-label="뒤로 가기"
          onClick={(e) => e.preventDefault()}
        >
          &lt;
        </button>
      </div>

      <div className={styles.mainHeaderContent}>
        <div className={styles.titleArea}>
          <div className={styles.categoryBadge}>{data.category}</div>
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.subtitle}</p>
          
          <div className={styles.metaSummary}>
            <span className={styles.metaItem}>기억 {data.memoryCount}개</span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.metaItem}>기록 {data.recordingPeriodLabel}</span>
            <span className={styles.metaDivider}>·</span>
            <span className={styles.metaItem}>최근 업데이트 {data.updatedLabel}</span>
          </div>

          <div className={styles.tagList}>
            {data.treeTags.map(tag => (
              <span key={tag} className={styles.treeTag}>#{tag}</span>
            ))}
          </div>

          <div className={styles.statsSummary}>
            <span className={styles.statItem}>조회수 {data.viewCount}</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.statItem}>좋아요 {data.likeCount}</span>
            <span className={styles.statDivider}>·</span>
            <span className={styles.statItem}>댓글 {data.commentCount}</span>
          </div>
        </div>

        <div className={styles.authorArea}>
          <span className={styles.avatar} aria-hidden="true">
            {data.authorAvatar}
          </span>
          <div className={styles.authorInfo}>
            <strong className={styles.authorName}>{data.authorName}</strong>
            <span className={styles.authorHandle}>{data.authorHandle}</span>
            <span className={styles.badge}>🌐 {data.visibility}</span>
          </div>
        </div>
      </div>
    </header>
  );
}


