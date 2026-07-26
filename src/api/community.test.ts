import { describe, expect, it, vi } from "vitest";
import {
  COMMUNITY_GROWING_TREES_PATH,
  COMMUNITY_TREES_PATH,
  CommunityResponseError,
  createCommunityApi,
  normalizeCommunityResponse,
  type CommunityApiClient,
} from "./community";

function snapshot(overrides: Record<string, unknown> = {}) {
  return {
    id: "tree-1",
    title: "실제 공개 러브트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    representativeThumbnail: "https://images.example.com/tree.jpg",
    representativeMemorySourceUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    memoryCount: 4,
    emotionTags: ["설렘", "행복"],
    stage: "mature",
    theme: "concert",
    timeRange: "2024-2026",
    likeCount: 0,
    viewCount: 15,
    ...overrides,
  };
}

function clientReturning(value: unknown) {
  const get = vi.fn().mockResolvedValue(value);
  return {
    get,
    client: { get } as unknown as CommunityApiClient,
  };
}

describe("community public browse adapter", () => {
  it("calls the exact main and growing paths with required query parameters", async () => {
    const main = clientReturning([snapshot()]);
    const growing = clientReturning([snapshot({ id: "growing-1", stage: "growing" })]);
    const mainSignal = new AbortController().signal;
    const growingSignal = new AbortController().signal;

    await createCommunityApi(main.client).fetchMain(mainSignal);
    await createCommunityApi(growing.client).fetchGrowing(growingSignal);

    expect(main.get).toHaveBeenCalledWith(COMMUNITY_TREES_PATH, {
      query: { view: "summary", sort: "latest", limit: 12 },
      signal: mainSignal,
    });
    expect(growing.get).toHaveBeenCalledWith(COMMUNITY_GROWING_TREES_PATH, {
      query: { limit: 6 },
      signal: growingSignal,
    });
  });

  it("maps only the allowed main response fields and preserves valid zero metrics", () => {
    const result = normalizeCommunityResponse([
      snapshot({
        author: { name: "사용하면 안 됨" },
        summary: "API 계약 밖 설명",
        commentCount: 99,
      }),
    ]);

    expect(result).toEqual([
      {
        id: "tree-1",
        title: "실제 공개 러브트리",
        visibility: "public",
        createdAt: "2026-07-20T10:00:00.000Z",
        updatedAt: "2026-07-26T10:00:00.000Z",
        representativeThumbnail: "https://images.example.com/tree.jpg",
        representativeMemorySourceUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
        memoryCount: 4,
        emotionTags: ["설렘", "행복"],
        stage: "mature",
        theme: "concert",
        timeRange: "2024-2026",
        likeCount: 0,
        viewCount: 15,
      },
    ]);
    expect(result[0]).not.toHaveProperty("author");
    expect(result[0]).not.toHaveProperty("summary");
    expect(result[0]).not.toHaveProperty("commentCount");
  });

  it("maps growing responses without inventing absent social metrics", async () => {
    const raw = snapshot({
      id: "growing-1",
      stage: "growing",
      likeCount: undefined,
      viewCount: undefined,
    });
    const fake = clientReturning([raw]);

    const result = await createCommunityApi(fake.client).fetchGrowing();

    expect(result).toHaveLength(1);
    expect(result[0].stage).toBe("growing");
    expect(result[0]).not.toHaveProperty("likeCount");
    expect(result[0]).not.toHaveProperty("viewCount");
  });

  it("omits optional metrics unless they are finite non-negative numbers", () => {
    const [invalid] = normalizeCommunityResponse([
      snapshot({ likeCount: -1, viewCount: Number.NaN }),
    ]);

    expect(invalid).not.toHaveProperty("likeCount");
    expect(invalid).not.toHaveProperty("viewCount");
  });

  it("rejects invalid top-level and materially malformed responses", () => {
    expect(() => normalizeCommunityResponse({ items: [] })).toThrow(CommunityResponseError);
    expect(() => normalizeCommunityResponse([snapshot({ memoryCount: "4" })])).toThrow(
      CommunityResponseError,
    );
    expect(() => normalizeCommunityResponse([snapshot({ updatedAt: "not-a-date" })])).toThrow(
      CommunityResponseError,
    );
  });
});
