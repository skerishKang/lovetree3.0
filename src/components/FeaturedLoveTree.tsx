import styles from "./FeaturedLoveTree.module.css";
import { featuredLoveTree } from "../data/communityMockData";
import CommunityTreePreview from "./CommunityTreePreview";

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
      <div className={styles.sectionHeader}>
        <span id="featured-label" className={styles.label}>
          🌟 {feat.label}
        </span>
        <span className={styles.featuredBadge}>이주의 추천 트리</span>
      </div>
      <article className={`${styles.card} featuredCard`}>
        <div
          className={styles.thumbnail}
          style={{ background: feat.thumbnail }}
          aria-hidden="true"
        >
          <div className={styles.treePreviewWrapper}>
            <CommunityTreePreview variant="featured" />
          </div>
          <span className={styles.previewNote}>{feat.previewNote}</span>
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{feat.title}</h2>
          <p className={styles.summary}>{feat.summary}</p>

          <div className={styles.middleRow}>
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
            <span className={styles.updated}>{feat.updatedLabel}</span>
          </div>

          <div className={styles.meta}>
            <div className={styles.leftMeta}>
              <span className={styles.memoryCount}>🌳 총 {feat.memoryCount}개의 소중한 기억 노드 연결됨</span>
            </div>
            <div className={styles.rightMeta}>
              <span className={styles.metaItem}>♥ {feat.likes}</span>
              <span className={styles.metaItem}>💬 {feat.comments}</span>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
