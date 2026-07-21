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
      <div className={styles.titleArea}>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.subtitle}>{data.subtitle}</p>
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
    </header>
  );
}

