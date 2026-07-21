import type { TimelineMemory } from "../data/treeDetailMockData";
import styles from "./TimelineCard.module.css";

interface Props {
  memory: TimelineMemory;
}

export default function TimelineCard({ memory }: Props) {
  return (
    <article className={styles.card}>
      {/* 폴라로이드 사진 영역 */}
      <div className={styles.polaroidPhoto} aria-hidden="true">
        <span className={styles.emoji}>{memory.emoji}</span>
      </div>

      {/* 폴라로이드 프레임 본문 */}
      <div className={styles.polaroidFrame}>
        <time className={styles.date}>{memory.date}</time>
        <h3 className={styles.title}>{memory.title}</h3>
        <p className={styles.description}>{memory.description}</p>
        <ul className={styles.tags} aria-label="태그 목록">
          {memory.tags.map((tag) => (
            <li key={tag} className={styles.tag}>
              #{tag}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

