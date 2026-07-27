import type { PublicTreeMemory } from "../types/publicTreeDetail";
import TimelineCard from "./TimelineCard";
import styles from "./TimelineSection.module.css";

interface Props {
  memories: PublicTreeMemory[];
  treeId: string;
}

export default function TimelineSection({ memories, treeId }: Props) {
  return (
    <section className={styles.timeline} aria-labelledby="public-memory-heading">
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>PUBLIC MEMORIES</span>
          <h2 id="public-memory-heading">공개 기억 타임라인</h2>
        </div>
        <span className={styles.count}>{memories.length}개</span>
      </div>

      <div className={styles.branchLine} aria-hidden="true" />
      <div className={styles.cardsGrid}>
        {memories.map((memory, index) => (
          <div
            key={memory.id}
            className={`${styles.cardWrapper} ${index % 2 === 0 ? styles.sideTop : styles.sideBottom}`}
          >
            <span className={styles.nodeDot} aria-hidden="true" data-testid="timeline-memory-node" />
            <div className={styles.cardContainer} data-testid="timeline-memory-card">
              <TimelineCard memory={memory} treeId={treeId} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
