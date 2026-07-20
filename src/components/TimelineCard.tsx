import type { TimelineMemory } from "../data/treeDetailMockData";
import styles from "./TimelineCard.module.css";

interface Props {
  memory: TimelineMemory;
}

export default function TimelineCard({ memory }: Props) {
  return (
    <article className={styles.card}>
      {/* 아이콘 영역 */}
      <div className={styles.iconArea} aria-hidden="true">
        <span className={styles.emoji}>{memory.emoji}</span>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        {/* 날짜 */}
        <time className={styles.date}>{memory.date}</time>

        {/* 제목 */}
        <h3 className={styles.title}>{memory.title}</h3>

        {/* 설명 */}
        <p className={styles.description}>{memory.description}</p>

        {/* 태그 */}
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
