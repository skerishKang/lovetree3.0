import { useEffect, useMemo, useState } from "react";
import {
  normalizeYouTubeUrl,
  type YouTubeMediaSource,
} from "../utils/youtube";
import styles from "./YouTubeMedia.module.css";

interface BaseMediaProps {
  youtubeUrl: unknown;
  title: string;
  className?: string;
}

interface YouTubeThumbnailProps extends BaseMediaProps {
  alt?: string;
  testId?: string;
}

function classes(...values: Array<string | undefined | false>) {
  return values.filter(Boolean).join(" ");
}

export function YouTubeThumbnail({
  youtubeUrl,
  title,
  alt = `${title} YouTube 썸네일`,
  className,
  testId,
}: YouTubeThumbnailProps) {
  const source = useMemo(() => normalizeYouTubeUrl(youtubeUrl), [youtubeUrl]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [source?.videoId]);

  return (
    <span
      className={classes(styles.thumbnail, className)}
      data-testid={testId}
      data-youtube-video-id={source?.videoId}
    >
      {source && !failed ? (
        <img
          className={styles.thumbnailImage}
          src={source.thumbnailUrl}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className={styles.thumbnailFallback} role="img" aria-label="영상 썸네일을 불러올 수 없음">
          <span aria-hidden="true">▶</span>
          <span>썸네일을 불러올 수 없어요</span>
        </span>
      )}
    </span>
  );
}

interface YouTubePlayerFrameProps extends BaseMediaProps {
  source?: YouTubeMediaSource | null;
}

export function YouTubePlayerFrame({
  youtubeUrl,
  source: providedSource,
  title,
  className,
}: YouTubePlayerFrameProps) {
  const parsedSource = useMemo(
    () => providedSource ?? normalizeYouTubeUrl(youtubeUrl),
    [providedSource, youtubeUrl],
  );

  if (!parsedSource) {
    return (
      <div className={classes(styles.playerFallback, className)} role="status">
        재생할 수 있는 YouTube 주소가 아니에요.
      </div>
    );
  }

  return (
    <iframe
      className={classes(styles.playerFrame, className)}
      src={parsedSource.embedUrl}
      title={`${title} YouTube 영상`}
      loading="lazy"
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      data-testid="youtube-player"
    />
  );
}

export default function YouTubeMedia({
  youtubeUrl,
  title,
  className,
}: BaseMediaProps) {
  const source = useMemo(() => normalizeYouTubeUrl(youtubeUrl), [youtubeUrl]);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [source?.videoId]);

  if (!source) {
    return (
      <div className={classes(styles.media, styles.invalidMedia, className)} role="status">
        유효한 YouTube 미디어가 없습니다.
      </div>
    );
  }

  return (
    <div className={classes(styles.media, className)} data-youtube-video-id={source.videoId}>
      <div className={styles.stage}>
        {playing ? (
          <YouTubePlayerFrame youtubeUrl={youtubeUrl} source={source} title={title} />
        ) : (
          <button
            type="button"
            className={styles.playButton}
            aria-label={`${title} 재생`}
            onClick={() => setPlaying(true)}
          >
            <YouTubeThumbnail youtubeUrl={youtubeUrl} title={title} alt="" />
            <span className={styles.playGlyph} aria-hidden="true">▶</span>
          </button>
        )}
      </div>
      <a
        className={styles.externalLink}
        href={source.watchUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        YouTube에서 보기
      </a>
    </div>
  );
}
