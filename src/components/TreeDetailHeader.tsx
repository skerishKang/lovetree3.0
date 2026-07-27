import { useBackWithFallback } from "../hooks/useBackWithFallback";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";
import styles from "./TreeDetailHeader.module.css";

interface Props {
  tree: PublicTreeDetail;
  memories: PublicTreeMemory[];
}

function formatDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function memoryDateRange(memories: PublicTreeMemory[]) {
  const timestamps = memories
    .map((memory) => memory.timestamp || memory.createdAt)
    .filter((value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)))
    .map((value) => new Date(value).getTime())
    .sort((a, b) => a - b);

  if (timestamps.length === 0) return null;
  const first = formatDate(new Date(timestamps[0]).toISOString());
  const last = formatDate(new Date(timestamps[timestamps.length - 1]).toISOString());
  if (!first || !last) return null;
  return first === last ? first : `${first} ~ ${last}`;
}

export default function TreeDetailHeader({ tree, memories }: Props) {
  const handleBack = useBackWithFallback("/community");
  const created = formatDate(tree.createdAt);
  const updated = formatDate(tree.updatedAt);
  const range = memoryDateRange(memories);

  return (
    <header className={styles.header}>
      <div className={styles.backRow}>
        <button
          type="button"
          className={styles.backButton}
          aria-label="뒤로 가기"
          onClick={handleBack}
        >
          &lt;
        </button>
      </div>

      <div className={styles.mainHeaderContent}>
        <div className={styles.titleArea}>
          <span className={styles.visibilityBadge}>공개 범위: {tree.visibility}</span>
          <h1 className={styles.title}>{tree.title}</h1>

          <div className={styles.metaSummary} aria-label="트리 정보">
            <span className={styles.metaItem}>기억 {tree.memoryCount}개</span>
            {created ? <span className={styles.metaItem}>생성 {created}</span> : null}
            {updated ? <span className={styles.metaItem}>업데이트 {updated}</span> : null}
            {range ? <span className={styles.metaItem}>기억 기간 {range}</span> : null}
          </div>

          {tree.likeCount !== undefined || tree.viewCount !== undefined ? (
            <div className={styles.statsSummary} aria-label="공개 지표">
              {tree.likeCount !== undefined ? (
                <span className={styles.statItem}>좋아요 {tree.likeCount}</span>
              ) : null}
              {tree.viewCount !== undefined ? (
                <span className={styles.statItem}>조회 {tree.viewCount}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
