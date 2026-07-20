import styles from "./FeaturedLoveTree.module.css";
import { featuredLoveTree } from "../data/communityMockData";

/**
 * Featured LoveTree 영역
 *
 * BASE 구현: 라벨 + 제목 + 작성자 + 미니 트리 미리보기 블록.
 * 원본의 중앙 tall 카드 배치는 정밀 시각 보정(VISUAL)으로 이관.
 */
export default function FeaturedLoveTree() {
  const feat = featuredLoveTree;
  return (
    <section className={styles.section} aria-labelledby="featured-label">
      <span id="featured-label" className={styles.label}>
        {feat.label}
      </span>
      <article className={styles.card}>
        <div
          className={styles.thumbnail}
          style={{ background: feat.thumbnail }}
          aria-hidden="true"
        >
          <span className={styles.previewNote}>{feat.previewNote}</span>
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{feat.title}</h2>
          <div className={styles.author}>
            <span
              className={styles.avatar}
              style={{ background: feat.author.avatarColor }}
              aria-hidden="true"
            >
              {feat.author.initial}
            </span>
            <span className={styles.handle}>{feat.author.handle}</span>
          </div>
        </div>
      </article>
    </section>
  );
}
