import type { TimelineMemory } from "../data/treeDetailMockData";
import TimelineCard from "./TimelineCard";
import styles from "./TimelineSection.module.css";

interface Props {
  memories: TimelineMemory[];
}

export default function TimelineSection({ memories }: Props) {
  return (
    <section className={styles.timeline} aria-label="기억 타임라인">
      {/* 중심 가지선 */}
      <div className={styles.branchLine} aria-hidden="true" />

      {/* 타임라인 카드들 — 중앙선 기준 위(top)/아래(bottom) 배치 */}
      <div className={styles.cardsGrid}>
        {memories.map((memory, index) => (
          <div
            key={memory.id}
            className={`${styles.cardWrapper} ${
              memory.side === "top" ? styles.sideTop : styles.sideBottom
            }`}
            style={{ "--card-index": index } as React.CSSProperties}
          >
            {/* 노드 점 */}
            <div className={styles.nodeDot} aria-hidden="true" />
            <TimelineCard memory={memory} />
          </div>
        ))}
      </div>
    </section>
  );
}
