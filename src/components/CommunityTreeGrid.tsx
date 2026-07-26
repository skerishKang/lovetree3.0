import type { CommunityListStatus, CommunityTreeSnapshot } from "../types/community";
import CommunityTreeCard from "./CommunityTreeCard";
import styles from "./CommunityTreeGrid.module.css";

interface CommunityTreeGridProps {
  trees: CommunityTreeSnapshot[];
  status: CommunityListStatus;
  error: string | null;
  onRetry(): void;
}

export default function CommunityTreeGrid({
  trees,
  status,
  error,
  onRetry,
}: CommunityTreeGridProps) {
  return (
    <section className={styles.section} aria-labelledby="community-title">
      <h1 id="community-title" className={styles.title}>
        <span>다른 팬들의 러브트리</span>{" "}
        <span className={styles.mobileTitleLine}>구경하기</span>
      </h1>

      {status === "loading" && (
        <div className={styles.grid} aria-label="공개 러브트리 불러오는 중">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className={styles.skeleton} data-testid="community-card-skeleton" />
          ))}
        </div>
      )}

      {status === "empty" && (
        <div className={styles.stateMessage} role="status">
          아직 공개된 러브트리가 없습니다.
        </div>
      )}

      {status === "error" && (
        <div className={styles.errorState} role="alert">
          <p>{error ?? "공개 러브트리를 불러오지 못했습니다."}</p>
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}

      {status === "success" && (
        <div className={styles.grid} data-testid="community-main-grid">
          {trees.map((tree) => (
            <CommunityTreeCard key={tree.id} tree={tree} />
          ))}
        </div>
      )}
    </section>
  );
}
