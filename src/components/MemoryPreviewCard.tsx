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
 *   2. 중앙 재생 버튼
 *   3. 우측 상단 점 3개 메뉴
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
        <button
          type="button"
          className={styles.playBtn}
          aria-label="기억 재생"
          onClick={(e) => e.preventDefault()}
        >
          <PlayIcon className={styles.playIcon} />
        </button>
        <button
          type="button"
          className={styles.dots}
          aria-label="카드 메뉴"
          onClick={(e) => e.preventDefault()}
        >
          <DotsMenuIcon className={styles.dotsIcon} />
        </button>
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
