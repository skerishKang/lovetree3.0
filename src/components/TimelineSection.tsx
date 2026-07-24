import { useNavigate } from "react-router-dom";
import type { TimelineMemory } from "../data/treeDetailMockData";
import TimelineCard from "./TimelineCard";
import styles from "./TimelineSection.module.css";

interface Props {
  memories: TimelineMemory[];
}

export default function TimelineSection({ memories }: Props) {
  const navigate = useNavigate();
  return (
    <section className={styles.timeline} aria-label="기억 타임라인">
      {/* 중심 가지선 */}
      <div className={styles.branchLine} aria-hidden="true" />

      {/* 타임라인 카드들 — 중앙선 기준 위(top)/아래(bottom) 배치 */}
      <div className={styles.cardsGrid}>
        {memories.map((memory, index) => {
          // Generate a connector line for each node to represent relationships
          const nextNode = memories[index + 1];
          const hasNext = !!nextNode;

          return (
            <div
              key={memory.id}
              className={`${styles.cardWrapper} ${
                memory.side === "top" ? styles.sideTop : styles.sideBottom
              }`}
              style={{ "--card-index": index } as React.CSSProperties}
            >
              {/* 노드 점 */}
              <div
                className={styles.nodeDot}
                aria-hidden="true"
                data-testid="timeline-memory-node"
              />

              {/* 연결 관계 라벨 또는 노드별 연결선 */}
              {hasNext && (
                <div
                  className={styles.connectorLine}
                  aria-hidden="true"
                  data-testid="timeline-connection"
                >
                  <span className={styles.connectionPathText}>{memory.connectionLabel}</span>
                </div>
              )}

              {/* 기억 카드 */}
              <div data-testid="timeline-memory-card" className={styles.cardContainer} onClick={() => navigate("/memory/detail-demo")}>
                <TimelineCard memory={memory} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

