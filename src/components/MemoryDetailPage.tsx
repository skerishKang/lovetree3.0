import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { usePublicMemoryDetail } from "../hooks/usePublicMemoryDetail";
import { useBackWithFallback } from "../hooks/useBackWithFallback";
import { normalizeYouTubeUrl } from "../utils/youtube";
import { YouTubeThumbnail } from "./YouTubeMedia";
import styles from "./MemoryDetailPage.module.css";

function normalizeHttpsUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function formatDate(value: string | null) {
  if (!value || !Number.isFinite(Date.parse(value))) return null;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function MediaFallback() {
  return (
    <div className={styles.mediaFallback} role="img" aria-label="기억 미디어 없음" data-testid="memory-media-fallback">
      <span aria-hidden="true">🌿</span>
      <span>연결된 미디어가 없습니다</span>
    </div>
  );
}

function SafeImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  if (failed) return <MediaFallback />;
  return (
    <img className={styles.mediaImage} src={src} alt={`${title} 기억 이미지`} loading="lazy" referrerPolicy="no-referrer" data-testid="memory-image-thumbnail" onError={() => setFailed(true)} />
  );
}

function MemoryMedia({ memory }: { memory: import("../types/publicTreeDetail").PublicTreeMemory }) {
  const youtube = normalizeYouTubeUrl(memory.sourceUrl);
  const thumbnail = normalizeHttpsUrl(memory.thumbnail);
  if (youtube) {
    return <YouTubeThumbnail youtubeUrl={youtube.watchUrl} title={memory.title} alt={`${memory.title} YouTube 썸네일`} className={styles.youtubeThumbnail} testId="memory-youtube-thumbnail" />;
  }
  if (thumbnail) return <SafeImage src={thumbnail} title={memory.title} />;
  return <MediaFallback />;
}

function MemoryRequestState({ kind, message, onRetry }: { kind: "loading" | "error" | "malformed" | "not-found" | "membership-mismatch"; message: string; onRetry?: () => void }) {
  return (
    <section className={styles.fullState} role={kind === "loading" ? "status" : "alert"}>
      <span className={styles.stateIcon} aria-hidden="true">
        {kind === "loading" ? "🌱" : kind === "not-found" ? "🍂" : kind === "membership-mismatch" ? "⚠️" : "🌿"}
      </span>
      <h1>{kind === "loading" ? "공개 기억을 불러오는 중입니다" : message}</h1>
      {onRetry ? <button type="button" className={styles.retryButton} onClick={onRetry}>다시 시도</button> : null}
      <Link className={styles.communityLink} to="/community">Community로 돌아가기</Link>
    </section>
  );
}

export default function MemoryDetailPage() {
  const { treeId = "", memoryId = "" } = useParams<{ treeId: string; memoryId: string }>();
  const isMockRoute = !treeId && !memoryId;
  const { memory, tree, retryMemory, retryTree } = usePublicMemoryDetail(treeId || "mock", memoryId || "mock");

  const handleBack = useBackWithFallback(treeId ? `/tree/${encodeURIComponent(treeId)}` : "/community");

  if (isMockRoute) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <div className={styles.mainArea}>
            <header className={styles.topBar}>
              <button type="button" className={styles.backButton} aria-label="뒤로 가기" onClick={handleBack}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
              <h1 className={styles.screenTitle}>기억 상세</h1>
            </header>
            <section className={styles.infoSection}>
              <div className={styles.memoSection}>
                <p className={styles.memoText}>기억 상세 연결 준비 중</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (memory.status === "loading" && memory.data === null) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <MemoryRequestState kind="loading" message="" />
        </div>
      </div>
    );
  }

  if (memory.status === "not-found") {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <MemoryRequestState kind="not-found" message="공개 기억을 찾을 수 없습니다." />
        </div>
      </div>
    );
  }

  if (memory.status === "membership-mismatch") {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <MemoryRequestState kind="membership-mismatch" message="이 기억은 요청된 트리에 속하지 않습니다." />
        </div>
      </div>
    );
  }

  if (memory.status === "malformed") {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <MemoryRequestState kind="malformed" message={memory.error ?? "공개 기억 응답을 확인할 수 없습니다."} onRetry={retryMemory} />
        </div>
      </div>
    );
  }

  if (memory.status === "error" || memory.data === null) {
    return (
      <div className={styles.page}>
        <div className={styles.panel}>
          <MemoryRequestState kind="error" message={memory.error ?? "공개 기억을 불러오지 못했습니다."} onRetry={retryMemory} />
        </div>
      </div>
    );
  }

  const mem = memory.data;
  const date = formatDate(mem.timestamp) ?? formatDate(mem.createdAt);
  const treeFailed = tree.status === "error" || tree.status === "malformed" || tree.status === "not-found";

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.mainArea}>
          <header className={styles.topBar}>
            <button type="button" className={styles.backButton} aria-label="뒤로 가기" onClick={handleBack}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <h1 className={styles.screenTitle}>기억 상세</h1>
          </header>

          {mem.sourceUrl || mem.thumbnail ? (
            <section className={styles.mediaSection} aria-label="미디어 영역">
              <div className={styles.mediaCard}><MemoryMedia memory={mem} /></div>
              <ul className={styles.mediaMeta} aria-label="미디어 정보">
                {mem.source ? <li><span className={styles.metaLabel}>출처</span><span className={styles.metaValue}>{mem.source}</span></li> : null}
                {mem.sourceType ? <li><span className={styles.metaLabel}>형식</span><span className={styles.metaValue}>{mem.sourceType}</span></li> : null}
              </ul>
            </section>
          ) : null}

          <section className={styles.infoSection}>
            <h2 className={styles.memoryTitle}>{mem.title}</h2>
            {date ? <time className={styles.date}>{date}</time> : null}
            {mem.emotionTags.length > 0 ? (
              <ul className={styles.tagList}>
                {mem.emotionTags.map((tag) => <li key={tag} className={styles.tagItem}><span className={styles.tag}>#{tag}</span></li>)}
              </ul>
            ) : null}
          </section>

          {mem.memo ? (
            <section className={styles.memoSection} aria-label="기억 본문">
              <h3 className={styles.memoLabel}>Memo</h3>
              <div className={styles.memoBody}>
                <p className={styles.memoText}>{mem.memo}</p>
              </div>
            </section>
          ) : null}

          {mem.artist || mem.source || mem.channelName || mem.channelId ? (
            <section className={styles.metadataSection} aria-label="메타데이터">
              <dl className={styles.metadataList}>
                {mem.artist ? <div><dt>아티스트</dt><dd>{mem.artist}</dd></div> : null}
                {mem.source ? <div><dt>출처</dt><dd>{mem.source}</dd></div> : null}
                {mem.channelName || mem.channelId ? (
                  <div>
                    <dt>채널</dt>
                    <dd>{normalizeHttpsUrl(mem.channelUrl) ? <a href={normalizeHttpsUrl(mem.channelUrl)!} target="_blank" rel="noopener noreferrer">{mem.channelName || mem.channelId}</a> : (mem.channelName || mem.channelId)}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

          {treeFailed ? (
            <section className={styles.inlineError} role="alert" data-testid="memory-tree-partial">
              <p><strong>트리 정보를 불러오지 못했습니다.</strong> 기억 내용은 유지됩니다.</p>
              {retryTree ? <button type="button" className={styles.retryButton} onClick={retryTree}>트리 다시 시도</button> : null}
              <Link className={styles.communityLink} to="/community">Community로 돌아가기</Link>
            </section>
          ) : tree.data ? (
            <div className={styles.treeContextCard} data-testid="memory-tree-context">
              <span className={styles.treeContextLabel}>트리</span>
              <Link to={`/tree/${encodeURIComponent(tree.data.id)}`} className={styles.treeContextLink}>
                <strong>{tree.data.title}</strong>
                <span>기억 {tree.data.memoryCount}개</span>
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
