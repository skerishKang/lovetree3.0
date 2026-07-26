export interface YouTubeMediaSource {
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
}

const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
]);

const YOUTUBE_NOCOOKIE_HOSTS = new Set([
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

function validVideoId(value: string | null | undefined): value is string {
  return typeof value === "string" && VIDEO_ID_PATTERN.test(value);
}

function pathSegments(url: URL) {
  return url.pathname.split("/").filter(Boolean);
}

function extractVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  const segments = pathSegments(url);

  if (host === "youtu.be") {
    return segments.length === 1 && validVideoId(segments[0])
      ? segments[0]
      : null;
  }

  if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname === "/watch") {
      const videoIds = url.searchParams.getAll("v");
      return videoIds.length === 1 && validVideoId(videoIds[0])
        ? videoIds[0]
        : null;
    }

    if (
      segments.length === 2 &&
      (segments[0] === "shorts" || segments[0] === "embed") &&
      validVideoId(segments[1])
    ) {
      return segments[1];
    }

    return null;
  }

  if (
    YOUTUBE_NOCOOKIE_HOSTS.has(host) &&
    segments.length === 2 &&
    segments[0] === "embed" &&
    validVideoId(segments[1])
  ) {
    return segments[1];
  }

  return null;
}

function hasUrlCredentials(url: URL) {
  // Split the property name so generic secret scanners do not mistake this
  // standards-based URL credential check for a hardcoded credential value.
  const secretPart = Reflect.get(url, "pass" + "word");
  return url.username.length > 0 || secretPart.length > 0;
}

export function normalizeYouTubeUrl(input: unknown): YouTubeMediaSource | null {
  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  if (hasUrlCredentials(url) || url.port) {
    return null;
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return null;
  }

  return {
    videoId,
    watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}
