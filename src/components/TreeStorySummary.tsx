import type { TreeDetailData } from "../data/treeDetailMockData";
import styles from "./TreeStorySummary.module.css";

interface Props {
  data: TreeDetailData;
}

export default function TreeStorySummary({ data }: Props) {
  // Find featured memory metadata
  const featuredMemory = data.memories.find(m => m.id === data.featuredMemoryId);
  const latestMemory = data.memories[data.memories.length - 1];

  return (
    <section className={styles.storyCard} aria-label="러브트리 이야기 요약">
      <div className={styles.topBar}>
        <span className={styles.label}>트리 이야기 요약</span>
        <span className={styles.period}>{data.recordingPeriodLabel}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.storyText}>{data.story}</p>
        
        <div className={styles.grid}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>총 기억 노드</span>
            <strong className={styles.statVal}>{data.memoryCount}개</strong>
          </div>
          
          <div className={styles.statBox}>
            <span className={styles.statLabel}>대표 기억</span>
            <strong className={styles.statVal}>
              {featuredMemory ? `${featuredMemory.emoji} ${featuredMemory.title}` : "-"}
            </strong>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statLabel}>최근 기록</span>
            <strong className={styles.statVal}>
              {latestMemory ? `${latestMemory.emoji} ${latestMemory.title}` : "-"}
            </strong>
          </div>

          <div className={styles.statBox}>
            <span className={styles.statLabel}>주요 테마</span>
            <strong className={styles.statVal}>
              {data.treeTags[0]} / {data.treeTags[1] || "-"}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
