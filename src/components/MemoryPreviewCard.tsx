import type { CSSProperties } from "react";
import styles from "./MemoryPreviewCard.module.css";
import type { MemoryCardData } from "../data/mockData";
import { PlayIcon, DotsMenuIcon } from "./icons";

interface MemoryPreviewCardProps {
  card: MemoryCardData;
}

/**
 * 기억 카드 1개
 *
 * 구조:
 *   1. 상단 미디어 썸네일 (CSS radial-gradient 보케)
 *   2. 중앙 재생 affordance (decorative — aria-hidden, 비인터랙티브)
 *   3. 우측 상단 점 3개 affordance (decorative — aria-hidden, 비인터랙티브)
 *   4. 날짜
 *   5. 감정 태그
 *   6. 짧은 메모
 *
 * 영상 재생, 메뉴 열기는 이번 범위에서 제외.
 */
export default function MemoryPreviewCard({ card }: MemoryPreviewCardProps) {
  const bokehStyle: CSSProperties = {
    background: `
      radial-gradient(circle at 24% 30%, ${card.bokeh.c1} 0 7%, transparent 8%),
      radial-gradient(circle at 70% 25%, ${card.bokeh.c2} 0 10%, transparent 11%),
      radial-gradient(circle at 58% 66%, ${card.bokeh.c3} 0 9%, transparent 10%),
      ${card.bokeh.base}
    `,
  };

  return (
    <article className={styles.card}>
      {/* 썸네일 */}
      <div className={styles.thumb} style={bokehStyle}>
        <span
          className={styles.playBtn}
          aria-hidden="true"
          data-testid="memory-play-affordance"
        >
          <PlayIcon className={styles.playIcon} focusable="false" />
        </span>
        <span
          className={styles.dots}
          aria-hidden="true"
          data-testid="memory-dots-affordance"
        >
          <DotsMenuIcon className={styles.dotsIcon} focusable="false" />
        </span>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        <span className={styles.date}>{card.date}</span>
        <div className={styles.tags}>
          {card.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <p className={styles.memo}>{card.memo}</p>
      </div>
    </article>
  );
}
