import { describe, expect, it } from "vitest";
import { normalizeYouTubeUrl } from "./youtube";

const VIDEO_ID = "jNQXAC9IVRw";

function expectNormalized(input: string) {
  expect(normalizeYouTubeUrl(input)).toEqual({
    videoId: VIDEO_ID,
    watchUrl: `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${VIDEO_ID}/hqdefault.jpg`,
  });
}

describe("normalizeYouTubeUrl", () => {
  it.each([
    `https://youtube.com/watch?v=${VIDEO_ID}`,
    `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    `https://m.youtube.com/watch?v=${VIDEO_ID}`,
    `https://music.youtube.com/watch?v=${VIDEO_ID}`,
    `https://youtu.be/${VIDEO_ID}`,
    `https://www.youtube.com/shorts/${VIDEO_ID}`,
    `https://www.youtube.com/embed/${VIDEO_ID}`,
    `https://youtube-nocookie.com/embed/${VIDEO_ID}`,
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}`,
  ])("normalizes supported URL %s", (input) => {
    expectNormalized(input);
  });

  it("ignores unrelated query parameters and fragments", () => {
    expectNormalized(
      `https://www.youtube.com/watch?feature=share&v=${VIDEO_ID}&t=10#details`,
    );
    expectNormalized(`https://youtu.be/${VIDEO_ID}?si=demo#fragment`);
  });

  it("does not add autoplay to normalized URLs", () => {
    const result = normalizeYouTubeUrl(
      `https://www.youtube.com/watch?v=${VIDEO_ID}`,
    );

    expect(result?.embedUrl).not.toContain("autoplay");
    expect(result?.watchUrl).not.toContain("autoplay");
  });

  it.each([
    null,
    undefined,
    123,
    {},
    [],
    "",
    "   ",
    "not a url",
    `javascript:alert(1)`,
    `data:text/html,${VIDEO_ID}`,
    `file:///tmp/${VIDEO_ID}`,
    `https://youtube.com.evil.example/watch?v=${VIDEO_ID}`,
    `https://evil-youtube.com/watch?v=${VIDEO_ID}`,
    `https://www.youtu.be/${VIDEO_ID}`,
    `https://user:pass@www.youtube.com/watch?v=${VIDEO_ID}`,
    `https://www.youtube.com:444/watch?v=${VIDEO_ID}`,
    "https://www.youtube.com/watch",
    "https://www.youtube.com/watch?list=PL123",
    `https://www.youtube.com/watch?v=short`,
    `https://youtu.be/${VIDEO_ID}extra`,
    `https://www.youtube.com/shorts/`,
    `https://www.youtube.com/embed/invalid!id`,
    `https://www.youtube-nocookie.com/watch?v=${VIDEO_ID}`,
    `https://www.youtube.com/channel/${VIDEO_ID}`,
    `https://www.youtube.com/live/${VIDEO_ID}`,
    `https://www.youtube.com/watch?v=${VIDEO_ID}&v=dQw4w9WgXcQ`,
    `ftp://www.youtube.com/watch?v=${VIDEO_ID}`,
  ])("rejects invalid input %p", (input) => {
    expect(normalizeYouTubeUrl(input)).toBeNull();
  });
});
