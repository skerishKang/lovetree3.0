import { describe, expect, it, vi } from "vitest";
import {
  createMyTreesApi,
  normalizeTreeItem,
  MyTreesResponseError,
} from "./myTrees";

function mockClient() {
  return { get: vi.fn() };
}

function treePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "t1",
    title: "내 트리",
    visibility: "public",
    groupName: "그룹",
    keywords: ["키워드"],
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 5,
    ...overrides,
  };
}

describe("normalizeTreeItem", () => {
  it("maps exact fields", () => {
    const r = normalizeTreeItem(treePayload());
    expect(r.id).toBe("t1");
    expect(r.title).toBe("내 트리");
    expect(r.visibility).toBe("public");
    expect(r.memoryCount).toBe(5);
    expect(r.groupName).toBe("그룹");
    expect(r.keywords).toEqual(["키워드"]);
  });

  it("includes valid likeCount and viewCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 3, viewCount: 10 }));
    expect(r.likeCount).toBe(3);
    expect(r.viewCount).toBe(10);
  });

  it("omits negative likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: -1 }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits negative likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: -1 }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits non-integer likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 1.5 }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits NaN likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: NaN }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits Infinity likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: Infinity }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits string likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: "5" }));
    expect(r.likeCount).toBeUndefined();
  });

  it("omits null likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: null }));
    expect(r.likeCount).toBeUndefined();
  });

  it("includes zero likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 0 }));
    expect(r.likeCount).toBe(0);
  });

  it("includes zero likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 0 }));
    expect(r.likeCount).toBe(0);
  });

  it("rejects missing id", () => expect(() => normalizeTreeItem(treePayload({ id: "" }))).toThrow());
  it("rejects missing title", () => expect(() => normalizeTreeItem(treePayload({ title: "" }))).toThrow());
  it("rejects missing visibility", () => expect(() => normalizeTreeItem(treePayload({ visibility: "" }))).toThrow());
  it("rejects missing memoryCount", () => expect(() => normalizeTreeItem(treePayload({ memoryCount: undefined }))).toThrow());
  it("rejects null input", () => expect(() => normalizeTreeItem(null)).toThrow());
  it("rejects non-object input", () => expect(() => normalizeTreeItem([])).toThrow());
  it("accepts public visibility", () => expect(normalizeTreeItem(treePayload({ visibility: "public" })).visibility).toBe("public"));
  it("accepts private visibility", () => expect(normalizeTreeItem(treePayload({ visibility: "private" })).visibility).toBe("private"));
  it("rejects empty visibility", () => expect(() => normalizeTreeItem(treePayload({ visibility: "" }))).toThrow());
  it("rejects unknown visibility", () => expect(() => normalizeTreeItem(treePayload({ visibility: "unknown" }))).toThrow());
  it("rejects whitespace visibility", () => expect(() => normalizeTreeItem(treePayload({ visibility: "  " }))).toThrow());
});

describe("createMyTreesApi", () => {
  it("fetchTrees calls exact GET /trees with limit=100", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([treePayload()]);
    const api = createMyTreesApi(client);
    await api.fetchTrees();
    expect(client.get).toHaveBeenCalledWith("/trees", {
      query: { limit: "100" },
      signal: undefined,
    });
  });

  it("fetchTrees normalizes items", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([treePayload()]);
    const api = createMyTreesApi(client);
    const items = await api.fetchTrees();
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("내 트리");
  });

  it("fetchTrees throws on non-array response", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({});
    const api = createMyTreesApi(client);
    await expect(api.fetchTrees()).rejects.toThrow(MyTreesResponseError);
  });

  it("fetchTrees throws on invalid item", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([{}]);
    const api = createMyTreesApi(client);
    await expect(api.fetchTrees()).rejects.toThrow(MyTreesResponseError);
  });

  it("fetchTrees accepts empty array", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([]);
    const api = createMyTreesApi(client);
    await expect(api.fetchTrees()).resolves.toEqual([]);
  });

  it("forwards AbortSignal", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([treePayload()]);
    const api = createMyTreesApi(client);
    const ctrl = new AbortController();
    await api.fetchTrees(ctrl.signal);
    expect(client.get).toHaveBeenCalledWith("/trees", {
      query: { limit: "100" },
      signal: ctrl.signal,
    });
  });
});
