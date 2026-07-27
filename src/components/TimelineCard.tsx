import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { PublicTreeMemory } from "../types/publicTreeDetail";
import { normalizeYouTubeUrl } from "../utils/youtube";
import { YouTubeThumbnail } from "./YouTubeMedia";
import styles from "./TimelineCard.module.css";

interface Props {
  memory: PublicTreeMemory;
  treeId: string;
}

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
    <span className={styles.mediaFallback} role="img" aria-label="기억 미디어 없음" data-testid="timeline-media-fallback">
      <span aria-hidden="true">🌿</span>
      <span>연결된 미디어가 없습니다</span>
    </span>
  );
}

function SafeImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (failed) return <MediaFallback />;

  return (
    <img
      className={styles.image}
      src={src}
      alt={`${title} 기억 이미지`}
      loading="lazy"
      referrerPolicy="no-referrer"
      data-testid="timeline-image-thumbnail"
      onError={() => setFailed(true)}
    />
  );
}

export default function TimelineCard({ memory, treeId }: Props) {
  const youtube = normalizeYouTubeUrl(memory.sourceUrl);
  const thumbnail = normalizeHttpsUrl(memory.thumbnail);
  const sourceUrl = normalizeHttpsUrl(memory.sourceUrl);
  const channelUrl = normalizeHttpsUrl(memory.channelUrl);
  const date = formatDate(memory.timestamp) ?? formatDate(memory.createdAt);
  const detailPath = `/tree/${encodeURIComponent(treeId)}/memory/${encodeURIComponent(memory.id)}`;

  return (
    <Link to={detailPath} className={styles.cardLink} aria-label={`${memory.title} 기억 상세 보기`}>
      <article className={styles.card} aria-labelledby={`memory-${memory.id}`}>
        <div className={styles.polaroidPhoto}>
          {youtube ? (
            <YouTubeThumbnail
              youtubeUrl={youtube.watchUrl}
              title={memory.title}
              alt={`${memory.title} YouTube 썸네일`}
              className={styles.youtubeThumbnail}
              testId="timeline-youtube-thumbnail"
            />
          ) : thumbnail ? (
            <SafeImage src={thumbnail} title={memory.title} />
          ) : (
            <MediaFallback />
          )}
        </div>

        <div className={styles.polaroidFrame}>
          {date ? <time className={styles.date}>{date}</time> : null}
          <h3 id={`memory-${memory.id}`} className={styles.title}>{memory.title}</h3>
          {memory.memo ? <p className={styles.description}>{memory.memo}</p> : null}

          <dl className={styles.metadata}>
            {memory.artist ? (
              <div><dt>아티스트</dt><dd>{memory.artist}</dd></div>
            ) : null}
            {memory.source ? (
              <div><dt>출처</dt><dd>{memory.source}</dd></div>
            ) : null}
            {memory.sourceType ? (
              <div><dt>형식</dt><dd>{memory.sourceType}</dd></div>
            ) : null}
            {memory.channelName || memory.channelId ? (
              <div>
                <dt>채널</dt>
                <dd>
                  {channelUrl ? (
                    <a href={channelUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      {memory.channelName || memory.channelId}
                    </a>
                  ) : (memory.channelName || memory.channelId)}
                </dd>
              </div>
            ) : null}
          </dl>

          {memory.emotionTags.length > 0 ? (
            <ul className={styles.tags} aria-label="감정 태그">
              {memory.emotionTags.map((tag) => (
                <li key={tag} className={styles.tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.footer}>
            <span className={styles.pending}>기억 상세 보기</span>
            {sourceUrl ? (
              <a className={styles.sourceLink} href={sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                원본 보기
              </a>
            ) : null}
          </div>
        </div>
      </article>
    </Link>
  );
}
