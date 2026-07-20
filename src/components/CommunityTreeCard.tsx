import styles from "./CommunityTreeCard.module.css";
import type { CommunityTreeCard as CardData } from "../data/communityMockData";

/**
 * 일반 러브트리 카드 (1개)
 *
 * BASE 인터랙션: hover / keyboard focus 허용.
 * 실제 좋아요/댓글/트리 저장 요청은 하지 않음 (금지).
 */
export default function CommunityTreeCard({ card }: { card: CardData }) {
  return (
    <article className={styles.card} tabIndex={0}>
      <div
        className={styles.thumbnail}
        style={{ background: card.thumbnail }}
        aria-hidden="true"
      >
        <span className={styles.playIcon} aria-hidden="true">
          ▶
        </span>
      </div>
      <div className={styles.body}>
        <h2 className={styles.cardTitle}>{card.title}</h2>
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
        <div className={styles.tags}>
          {card.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <div className={styles.meta}>
          <span className={styles.metaItem}>♥ {card.likes}</span>
          <span className={styles.metaItem}>💬 {card.comments}</span>
        </div>
      </div>
    </article>
  );
}
