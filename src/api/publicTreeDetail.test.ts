import { describe, expect, it, vi } from "vitest";
import {
  PUBLIC_TREE_MEMORIES_PATH,
  PUBLIC_TREE_MEMORY_LIMIT,
  createPublicTreeDetailApi,
  normalizePublicTree,
  normalizePublicTreeMemories,
  publicTreePath,
} from "./publicTreeDetail";

function mockClient() {
  const get = vi.fn();
  return { get };
}

function treePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "tree-abc",
    title: "공개 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 5,
    ...overrides,
  };
}

function memoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "mem-1",
    treeId: "tree-abc",
    parentId: null,
    title: "기억 제목",
    memo: "기억 본문",
    artist: "아티스트",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc123",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    emotionTags: ["설렘"],
    timestamp: "2026-07-20T10:00:00.000Z",
    visibility: "public",
    channelId: null,
    channelName: null,
    channelUrl: null,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("publicTreePath", () => {
  it("encodes treeId into exact path", () => {
    expect(publicTreePath("abc")).toBe("/trees/abc");
  });

  it("encodes special characters", () => {
    expect(publicTreePath("a/b c?d")).toBe("/trees/a%2Fb%20c%3Fd");
  });
});

describe("normalizePublicTree", () => {
  it("maps exact fields", () => {
    const result = normalizePublicTree(treePayload());
    expect(result).toEqual({
      id: "tree-abc",
      title: "공개 트리",
      visibility: "public",
      createdAt: "2026-07-20T10:00:00.000Z",
      updatedAt: "2026-07-26T10:00:00.000Z",
      memoryCount: 5,
    });
  });

  it("includes valid likeCount and viewCount", () => {
    const result = normalizePublicTree(treePayload({ likeCount: 10, viewCount: 3 }));
    expect(result.likeCount).toBe(10);
    expect(result.viewCount).toBe(3);
  });

  it("includes zero likeCount and viewCount", () => {
    const result = normalizePublicTree(treePayload({ likeCount: 0, viewCount: 0 }));
    expect(result.likeCount).toBe(0);
    expect(result.viewCount).toBe(0);
  });

  it("omits negative likeCount", () => {
    const result = normalizePublicTree(treePayload({ likeCount: -1 }));
    expect(result.likeCount).toBeUndefined();
  });

  it("omits negative viewCount", () => {
    const result = normalizePublicTree(treePayload({ viewCount: -5 }));
    expect(result.viewCount).toBeUndefined();
  });

  it("keeps non-integer likeCount as valid metric", () => {
    const result = normalizePublicTree(treePayload({ likeCount: 1.5 }));
    expect(result.likeCount).toBe(1.5);
  });

  it("omits non-numeric likeCount", () => {
    const result = normalizePublicTree(treePayload({ likeCount: "10" }));
    expect(result.likeCount).toBeUndefined();
  });

  it("accepts null timestamps", () => {
    const result = normalizePublicTree(treePayload({ createdAt: null, updatedAt: null }));
    expect(result.createdAt).toBeNull();
    expect(result.updatedAt).toBeNull();
  });

  it("rejects missing id", () => {
    expect(() => normalizePublicTree(treePayload({ id: "" }))).toThrow();
  });

  it("rejects missing title", () => {
    expect(() => normalizePublicTree(treePayload({ title: "" }))).toThrow();
  });

  it("rejects missing visibility", () => {
    expect(() => normalizePublicTree(treePayload({ visibility: "" }))).toThrow();
  });

  it("rejects missing memoryCount", () => {
    expect(() => normalizePublicTree(treePayload({ memoryCount: undefined }))).toThrow();
  });

  it("rejects non-array input", () => {
    expect(() => normalizePublicTree([])).toThrow();
  });

  it("rejects null input", () => {
    expect(() => normalizePublicTree(null)).toThrow();
  });
});

describe("normalizePublicTreeMemories", () => {
  it("maps exact memory fields", () => {
    const result = normalizePublicTreeMemories([memoryPayload()]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("mem-1");
    expect(result[0].title).toBe("기억 제목");
    expect(result[0].emotionTags).toEqual(["설렘"]);
  });

  it("rejects top-level non-array", () => {
    expect(() => normalizePublicTreeMemories({})).toThrow();
  });

  it("rejects item with missing id", () => {
    expect(() => normalizePublicTreeMemories([memoryPayload({ id: "" })])).toThrow();
  });

  it("rejects item with missing title", () => {
    expect(() => normalizePublicTreeMemories([memoryPayload({ title: "" })])).toThrow();
  });

  it("rejects item with non-string memo", () => {
    expect(() => normalizePublicTreeMemories([memoryPayload({ memo: 5 })])).toThrow();
  });

  it("rejects item with non-array emotionTags", () => {
    expect(() => normalizePublicTreeMemories([memoryPayload({ emotionTags: "태그" })])).toThrow();
  });

  it("rejects item with invalid emotionTag entry", () => {
    expect(() => normalizePublicTreeMemories([memoryPayload({ emotionTags: [5] })])).toThrow();
  });

  it("accepts empty array", () => {
    const result = normalizePublicTreeMemories([]);
    expect(result).toEqual([]);
  });

  it("accepts null parentId", () => {
    const result = normalizePublicTreeMemories([memoryPayload({ parentId: null })]);
    expect(result[0].parentId).toBeNull();
  });
});

describe("createPublicTreeDetailApi", () => {
  it("fetchTree calls exact GET /trees/:treeId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(treePayload());
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await api.fetchTree("abc123");

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith("/trees/abc123", { signal: undefined });
  });

  it("fetchTree encodes treeId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(treePayload());
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await api.fetchTree("a/b?c");

    expect(client.get).toHaveBeenCalledWith("/trees/a%2Fb%3Fc", { signal: undefined });
  });

  it("fetchMemories calls exact GET /community/memories with query", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([memoryPayload()]);
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await api.fetchMemories("abc123");

    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith(PUBLIC_TREE_MEMORIES_PATH, {
      query: { treeId: "abc123", limit: PUBLIC_TREE_MEMORY_LIMIT },
      signal: undefined,
    });
  });

  it("fetchTree normalizes tree payload", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(treePayload({ likeCount: 5 }));
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    const result = await api.fetchTree("t1");
    expect(result.likeCount).toBe(5);
  });

  it("fetchMemories normalizes memory array", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([memoryPayload()]);
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    const result = await api.fetchMemories("t1");
    expect(result).toHaveLength(1);
  });

  it("fetchTree throws on invalid envelope", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({});
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await expect(api.fetchTree("t1")).rejects.toThrow();
  });

  it("fetchMemories throws on non-array response", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({ error: "x" });
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await expect(api.fetchMemories("t1")).rejects.toThrow();
  });

  it("fetchMemories throws on invalid memory item", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([{}]);
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);

    await expect(api.fetchMemories("t1")).rejects.toThrow();
  });

  it("forwards AbortSignal to client.get", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(treePayload());
    const api = createPublicTreeDetailApi(client as ReturnType<typeof mockClient>);
    const controller = new AbortController();

    await api.fetchTree("t1", controller.signal);

    expect(client.get).toHaveBeenCalledWith("/trees/t1", { signal: controller.signal });
  });
});
