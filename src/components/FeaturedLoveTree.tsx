import type { CommunityListStatus, CommunityTreeSnapshot } from "../types/community";
import CommunityTreeCard from "./CommunityTreeCard";
import styles from "./FeaturedLoveTree.module.css";

interface GrowingLoveTreesProps {
  trees: CommunityTreeSnapshot[];
  status: CommunityListStatus;
  error: string | null;
  onRetry(): void;
}

/**
 * 기존 Featured mock 영역을 실제 growing public browse 결과로 대체합니다.
 */
export default function FeaturedLoveTree({
  trees,
  status,
  error,
  onRetry,
}: GrowingLoveTreesProps) {
  return (
    <section className={styles.section} aria-labelledby="growing-community-title">
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>공개 API · 성장 단계</span>
          <h2 id="growing-community-title" className={styles.title}>
            새로 자라는 러브트리
          </h2>
        </div>
        <p className={styles.description}>공개 기억이 막 연결되기 시작한 트리입니다.</p>
      </div>

      {status === "loading" && (
        <div className={styles.grid} aria-label="새로 자라는 러브트리 불러오는 중">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className={styles.skeleton} data-testid="growing-card-skeleton" />
          ))}
        </div>
      )}

      {status === "empty" && (
        <div className={styles.stateMessage} role="status">
          지금은 새로 자라는 공개 러브트리가 없습니다.
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorState} role="alert">
          <p>{error ?? "새로 자라는 러브트리를 불러오지 못했습니다."}</p>
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            새 트리 다시 불러오기
          </button>
        </div>
      )}

      {status === "success" && (
        <div className={styles.grid} data-testid="community-growing-grid">
          {trees.map((tree) => (
            <CommunityTreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      )}
    </section>
  );
}
