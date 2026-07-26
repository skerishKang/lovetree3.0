import styles from "./MemoryPreviewCard.module.css";
import type { MemoryCardData } from "../data/mockData";
import { DotsMenuIcon, PlayIcon } from "./icons";
import { YouTubeThumbnail } from "./YouTubeMedia";

interface MemoryPreviewCardProps {
  card: MemoryCardData;
  onPlay: (card: MemoryCardData, trigger: HTMLButtonElement) => void;
}

export default function MemoryPreviewCard({
  card,
  onPlay,
}: MemoryPreviewCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        <YouTubeThumbnail
          youtubeUrl={card.youtubeUrl}
          title={card.memo}
          alt={`${card.memo} YouTube 썸네일`}
        />
        <button
          type="button"
          className={styles.playBtn}
          aria-label={`${card.memo} 영상 재생`}
          data-testid="memory-play-affordance"
          onClick={(event) => onPlay(card, event.currentTarget)}
        >
          <PlayIcon className={styles.playIcon} aria-hidden="true" focusable="false" />
        </button>
        <span
          className={styles.dots}
          aria-hidden="true"
          data-testid="memory-dots-affordance"
        >
          <DotsMenuIcon className={styles.dotsIcon} focusable="false" />
        </span>
      </div>

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
