import type { TimelineMemory } from "../data/treeDetailMockData";
import styles from "./TimelineCard.module.css";
import { YouTubeThumbnail } from "./YouTubeMedia";

interface Props {
  memory: TimelineMemory;
}

export default function TimelineCard({ memory }: Props) {
  return (
    <article className={styles.card}>
      <div className={styles.polaroidPhoto}>
        {memory.youtubeUrl ? (
          <YouTubeThumbnail
            youtubeUrl={memory.youtubeUrl}
            title={memory.title}
            alt={`${memory.title} YouTube 썸네일`}
            testId="timeline-youtube-thumbnail"
          />
        ) : (
          <span className={styles.emoji} aria-hidden="true">
            {memory.emoji}
          </span>
        )}
        {memory.isFeatured ? (
          <span className={styles.featuredBadge} data-testid="timeline-featured-badge">
            ★ 대표 기억
          </span>
        ) : null}
      </div>

      <div className={styles.polaroidFrame}>
        <div className={styles.cardMetaHeader}>
          <span className={styles.typeBadge}>{memory.typeLabel}</span>
          {memory.mediaLabel ? (
            <span className={styles.mediaBadge}>{memory.mediaLabel}</span>
          ) : null}
        </div>

        <time className={styles.date}>{memory.date}</time>
        <h3 className={styles.title}>{memory.title}</h3>
        <p className={styles.description}>{memory.description}</p>

        {memory.locationLabel ? (
          <div className={styles.locationInfo}>
            📍 <span className={styles.locationName}>{memory.locationLabel}</span>
          </div>
        ) : null}

        <ul className={styles.tags} aria-label="태그 목록">
          {memory.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              #{tag}
            </li>
          ))}
        </ul>

        <div className={styles.reactionFooter}>
          <span className={styles.reactionText}>❤️ 반응 {memory.reactionCount}</span>
        </div>
      </div>
    </article>
  );
}
