import { Link } from "react-router-dom";
import styles from "./CommunityTreeCard.module.css";
import type { CommunityTreeCard as CardData } from "../data/communityMockData";
import { YouTubeThumbnail } from "./YouTubeMedia";

export default function CommunityTreeCard({ card }: { card: CardData }) {
  return (
    <Link
      to="/tree/community-demo"
      className={`${styles.card} card`}
      aria-label={`${card.title} 러브트리 보기`}
    >
      <div className={styles.thumbnail}>
        <YouTubeThumbnail
          youtubeUrl={card.youtubeUrl}
          title={card.title}
          alt={`${card.title} 공개 YouTube 예시 썸네일`}
          testId="community-youtube-thumbnail"
        />
        <span className={styles.videoBadge}>
          공개 YouTube 예시
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.topInfo}>
          <span className={styles.category}>{card.category}</span>
          <span className={styles.visibility}>{card.visibilityLabel}</span>
        </div>
        <h2 className={styles.cardTitle}>{card.title}</h2>
        <p className={styles.summary}>{card.summary}</p>

        <div className={styles.middleRow}>
          <div className={styles.author}>
            <span
              className={styles.avatar}
              style={{ background: card.author.avatarColor }}
              aria-hidden="true"
            >
              {card.author.initial}
            </span>
            <span className={styles.handle}>{card.author.handle}</span>
          </div>
          <span className={styles.updated}>{card.updatedLabel}</span>
        </div>

        <div className={styles.tags}>
          {card.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.meta}>
          <div className={styles.leftMeta}>
            <span className={styles.memoryCount}>🌳 기억 {card.memoryCount}개</span>
          </div>
          <div className={styles.rightMeta}>
            <span className={styles.metaItem}>♥ {card.likes}</span>
            <span className={styles.metaItem}>💬 {card.comments}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
