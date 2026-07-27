import { Link, useParams } from "react-router-dom";
import { usePublicTreeDetail } from "../hooks/usePublicTreeDetail";
import TreeDetailHeader from "./TreeDetailHeader";
import TimelineSection from "./TimelineSection";
import styles from "./TreeDetailPage.module.css";

function TreeRequestState({
  kind,
  message,
  onRetry,
}: {
  kind: "loading" | "malformed" | "error";
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className={styles.fullState} role={kind === "loading" ? "status" : "alert"}>
      <span className={styles.stateIcon} aria-hidden="true">
        {kind === "loading" ? "🌱" : "🌿"}
      </span>
      <h1>{kind === "loading" ? "공개 러브트리를 불러오는 중입니다" : message}</h1>
      {onRetry ? (
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          다시 시도
        </button>
      ) : null}
      <Link className={styles.communityLink} to="/community">
        Community로 돌아가기
      </Link>
    </section>
  );
}

export default function TreeDetailPage() {
  const { treeId = "" } = useParams<{ treeId: string }>();
  const { tree, memories, retryTree, retryMemories } = usePublicTreeDetail(treeId);

  if (tree.status === "loading" && tree.data === null) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <TreeRequestState kind="loading" message="" />
        </div>
      </div>
    );
  }

  if (tree.status === "not-found") {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <section className={styles.fullState} role="status">
            <span className={styles.stateIcon} aria-hidden="true">🍂</span>
            <h1>공개 러브트리를 찾을 수 없습니다</h1>
            <p>삭제되었거나 공개 범위가 변경된 트리일 수 있습니다.</p>
            <Link className={styles.communityLink} to="/community">
              Community로 돌아가기
            </Link>
          </section>
        </div>
      </div>
    );
  }

  if (tree.status === "malformed") {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <TreeRequestState
            kind="malformed"
            message={tree.error ?? "공개 러브트리 응답을 확인할 수 없습니다."}
            onRetry={retryTree}
          />
        </div>
      </div>
    );
  }

  if (tree.status === "error" || tree.data === null) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <TreeRequestState
            kind="error"
            message={tree.error ?? "공개 러브트리를 불러오지 못했습니다."}
            onRetry={retryTree}
          />
        </div>
      </div>
    );
  }

  const memoriesFailed = memories.status === "error" || memories.status === "malformed";

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <main className={styles.mainArea}>
          <TreeDetailHeader tree={tree.data} memories={memories.items} />

          {memories.status === "loading" && memories.items.length === 0 ? (
            <section className={styles.inlineState} role="status">
              공개 기억을 불러오는 중입니다.
            </section>
          ) : null}

          {memories.status === "empty" ? (
            <section className={styles.inlineState} role="status">
              <strong>아직 공개된 기억이 없습니다.</strong>
              <span>트리 정보는 정상적으로 불러왔습니다.</span>
            </section>
          ) : null}

          {memoriesFailed ? (
            <section className={styles.inlineError} role="alert" data-testid="partial-success">
              <div>
                <strong>{memories.error}</strong>
                <span>트리 정보는 유지됩니다. 기억 목록만 다시 불러올 수 있습니다.</span>
              </div>
              <button type="button" className={styles.retryButton} onClick={retryMemories}>
                기억 다시 시도
              </button>
            </section>
          ) : null}

          {memories.items.length > 0 ? <TimelineSection memories={memories.items} treeId={treeId} /> : null}

          {memories.status === "loading" && memories.items.length > 0 ? (
            <p className={styles.refreshing} role="status">기억 목록을 다시 확인하는 중입니다.</p>
          ) : null}
        </main>
      </div>
    </div>
  );
}
