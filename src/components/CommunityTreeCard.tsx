import { useEffect, useId, useState } from "react";
import type { CommunityTreeSnapshot } from "../types/community";
import { normalizeYouTubeUrl } from "../utils/youtube";
import { YouTubeThumbnail } from "./YouTubeMedia";
import styles from "./CommunityTreeCard.module.css";

function normalizeHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function SafeThumbnail({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) return <MediaFallback />;

  return (
    <img
      className={styles.thumbnailImage}
      src={src}
      alt={`${title} 대표 이미지`}
      loading="lazy"
      referrerPolicy="no-referrer"
      data-testid="community-image-thumbnail"
      onError={() => setFailed(true)}
    />
  );
}

function MediaFallback() {
  return (
    <span
      className={styles.mediaFallback}
      role="img"
      aria-label="대표 미디어 없음"
      data-testid="community-media-fallback"
    >
      <span aria-hidden="true">🌿</span>
      <span>대표 미디어 준비 중</span>
    </span>
  );
}

function CommunityMedia({ tree }: { tree: CommunityTreeSnapshot }) {
  const youtube = normalizeYouTubeUrl(tree.representativeMemorySourceUrl);
  if (youtube) {
    return (
      <YouTubeThumbnail
        youtubeUrl={youtube.watchUrl}
        title={tree.title}
        alt={`${tree.title} YouTube 대표 썸네일`}
        className={styles.youtubeThumbnail}
        testId="community-youtube-thumbnail"
      />
    );
  }

  const thumbnail = normalizeHttpsUrl(tree.representativeThumbnail);
  if (thumbnail) return <SafeThumbnail src={thumbnail} title={tree.title} />;

  return <MediaFallback />;
}

export default function CommunityTreeCard({ tree }: { tree: CommunityTreeSnapshot }) {
  const headingId = useId();
  const timestamp = tree.updatedAt ?? tree.createdAt;
  const timestampKind = tree.updatedAt ? "업데이트" : "생성";

  return (
    <article
      className={`${styles.card} card`}
      aria-labelledby={headingId}
      data-testid="community-tree-card"
      data-tree-id={tree.id}
    >
      <div className={styles.thumbnail}>
        <CommunityMedia tree={tree} />
        <span className={styles.pendingBadge}>상세 연결 준비 중</span>
      </div>

      <div className={styles.body}>
        <div className={styles.topInfo}>
          <span className={styles.visibility}>공개 범위: {tree.visibility}</span>
          <span className={styles.stage}>단계: {tree.stage}</span>
        </div>

        <h2 id={headingId} className={styles.cardTitle}>{tree.title}</h2>

        <div className={styles.facts}>
          {tree.theme && <span>테마: {tree.theme}</span>}
          {tree.timeRange && <span>기간: {tree.timeRange}</span>}
          {timestamp && (
            <time dateTime={timestamp}>
              {timestampKind}: {formatTimestamp(timestamp)}
            </time>
          )}
        </div>

        {tree.emotionTags.length > 0 && (
          <div className={styles.tags} aria-label="감정 태그">
            {tree.emotionTags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          <span className={styles.memoryCount}>🌳 기억 {tree.memoryCount}개</span>
          <div className={styles.rightMeta}>
            {tree.likeCount !== undefined && (
              <span className={styles.metaItem} aria-label={`좋아요 ${tree.likeCount}`}>
                ♥ {tree.likeCount}
              </span>
            )}
            {tree.viewCount !== undefined && (
              <span className={styles.metaItem} aria-label={`조회 ${tree.viewCount}`}>
                조회 {tree.viewCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
