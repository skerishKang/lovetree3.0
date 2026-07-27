import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PUBLIC_TREE_MEMORIES_PATH,
  PUBLIC_TREE_MEMORY_LIMIT,
  PublicTreeMemoriesResponseError,
  PublicTreeResponseError,
  createPublicTreeDetailApi,
  normalizePublicTree,
  normalizePublicTreeMemories,
  publicTreePath,
  type PublicTreeDetailApiClient,
} from "./publicTreeDetail";

function tree(overrides: Record<string, unknown> = {}) {
  return {
    id: "tree-1",
    title: "실제 공개 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 2,
    likeCount: 0,
    viewCount: 12,
    ...overrides,
  };
}

function memory(overrides: Record<string, unknown> = {}) {
  return {
    id: "memory-1",
    treeId: "tree-1",
    parentId: null,
    title: "첫 기억",
    memo: "실제 메모",
    artist: "실제 아티스트",
    source: "실제 출처",
    sourceUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    sourceType: "youtube",
    thumbnail: "https://images.example.com/memory.jpg",
    emotionTags: ["설렘"],
    timestamp: "2026-07-21T10:00:00.000Z",
    visibility: "public",
    channelId: "channel-1",
    channelName: "실제 채널",
    channelUrl: "https://www.youtube.com/@example",
    createdAt: "2026-07-21T10:00:00.000Z",
    updatedAt: "2026-07-22T10:00:00.000Z",
    ...overrides,
  };
}

function clientReturning(value: unknown) {
  const get = vi.fn().mockResolvedValue(value);
  return { get, client: { get } as unknown as PublicTreeDetailApiClient };
}

describe("public tree detail adapter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("constructs the exact GET paths and query while encoding treeId", async () => {
    const treeClient = clientReturning(tree());
    const memoryClient = clientReturning([memory()]);
    const treeSignal = new AbortController().signal;
    const memoriesSignal = new AbortController().signal;
    const encodedId = "tree/한글 space";

    await createPublicTreeDetailApi(treeClient.client).fetchTree(encodedId, treeSignal);
    await createPublicTreeDetailApi(memoryClient.client).fetchMemories(encodedId, memoriesSignal);

    expect(publicTreePath(encodedId)).toBe("/trees/tree%2F%ED%95%9C%EA%B8%80%20space");
    expect(treeClient.get).toHaveBeenCalledWith(
      "/trees/tree%2F%ED%95%9C%EA%B8%80%20space",
      { signal: treeSignal },
    );
    expect(memoryClient.get).toHaveBeenCalledWith(PUBLIC_TREE_MEMORIES_PATH, {
      query: { treeId: encodedId, limit: PUBLIC_TREE_MEMORY_LIMIT },
      signal: memoriesSignal,
    });
  });

  it("normalizes only verified tree fields and keeps valid zero metrics", () => {
    const result = normalizePublicTree(tree({
      authorName: "사용 금지",
      subtitle: "사용 금지",
      commentCount: 99,
    }));

    expect(result).toEqual({
      id: "tree-1",
      title: "실제 공개 트리",
      visibility: "public",
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-26T10:00:00.000Z",
      memoryCount: 2,
      likeCount: 0,
      viewCount: 12,
    });
    expect(result).not.toHaveProperty("authorName");
    expect(result).not.toHaveProperty("subtitle");
    expect(result).not.toHaveProperty("commentCount");
  });

  it("omits optional metrics unless they are finite non-negative numbers", () => {
    const result = normalizePublicTree(tree({ likeCount: -1, viewCount: Number.NaN }));
    expect(result).not.toHaveProperty("likeCount");
    expect(result).not.toHaveProperty("viewCount");
  });

  it("normalizes exact memory fields without synthetic metadata", () => {
    const rawMemory = memory({
      reactionCount: 88,
      locationLabel: "사용 금지",
      connectionLabel: "사용 금지",
    });
    const [result] = normalizePublicTreeMemories([rawMemory]);

    expect(result).toEqual(memory());
    expect(result.emotionTags).not.toBe(rawMemory.emotionTags);
    expect(result).not.toHaveProperty("reactionCount");
    expect(result).not.toHaveProperty("locationLabel");
    expect(result).not.toHaveProperty("connectionLabel");
  });

  it("rejects malformed tree envelopes and fields", () => {
    expect(() => normalizePublicTree({ tree: tree() })).toThrow(PublicTreeResponseError);
    expect(() => normalizePublicTree(tree({ memoryCount: "2" }))).toThrow(PublicTreeResponseError);
    expect(() => normalizePublicTree(tree({ updatedAt: "not-a-date" }))).toThrow(
      PublicTreeResponseError,
    );
  });

  it("rejects malformed memory envelopes and items", () => {
    expect(() => normalizePublicTreeMemories({ items: [] })).toThrow(
      PublicTreeMemoriesResponseError,
    );
    expect(() => normalizePublicTreeMemories([memory({ emotionTags: ["ok", 1] })])).toThrow(
      PublicTreeMemoriesResponseError,
    );
    expect(() => normalizePublicTreeMemories([memory({ channelName: 123 })])).toThrow(
      PublicTreeMemoriesResponseError,
    );
  });

  it("uses browser-facing /api paths with GET only and no Authorization", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(tree()), {
      status: 200,
      headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("crypto", { randomUUID: () => "public-tree-request-id" });
    vi.stubGlobal("fetch", fetchMock);

    await createPublicTreeDetailApi().fetchTree("tree-1");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/trees/tree-1");
    expect(init.method).toBe("GET");
    const headers = init.headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
    expect(init.body).toBeUndefined();
  });
});
