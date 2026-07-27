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

function corePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "t1",
    title: "내 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: null,
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

  it("accepts core-only canonical owner item", () => {
    const r = normalizeTreeItem(corePayload());
    expect(r.id).toBe("t1");
    expect(r.title).toBe("내 트리");
    expect(r.visibility).toBe("public");
  });

  it("accepts missing groupName", () => {
    const r = normalizeTreeItem(corePayload());
    expect(r.groupName).toBeUndefined();
  });

  it("accepts missing keywords", () => {
    const r = normalizeTreeItem(corePayload());
    expect(r.keywords).toBeUndefined();
  });

  it("accepts missing memoryCount", () => {
    const r = normalizeTreeItem(corePayload());
    expect(r.memoryCount).toBeUndefined();
  });

  it("accepts all optional fields absent", () => {
    const r = normalizeTreeItem(corePayload());
    expect(r.groupName).toBeUndefined();
    expect(r.keywords).toBeUndefined();
    expect(r.memoryCount).toBeUndefined();
    expect(r.likeCount).toBeUndefined();
    expect(r.viewCount).toBeUndefined();
  });

  it("preserves valid likeCount and viewCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 3, viewCount: 10 }));
    expect(r.likeCount).toBe(3);
    expect(r.viewCount).toBe(10);
  });

  it("rejects negative likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: -1 }))).toThrow(MyTreesResponseError);
  });

  it("rejects fractional likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: 1.5 }))).toThrow(MyTreesResponseError);
  });

  it("rejects NaN likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: NaN }))).toThrow(MyTreesResponseError);
  });

  it("rejects Infinity likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: Infinity }))).toThrow(MyTreesResponseError);
  });

  it("rejects string likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: "5" }))).toThrow(MyTreesResponseError);
  });

  it("rejects null likeCount", () => {
    expect(() => normalizeTreeItem(treePayload({ likeCount: null }))).toThrow(MyTreesResponseError);
  });

  it("includes zero likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 0 }));
    expect(r.likeCount).toBe(0);
  });

  it("includes positive likeCount", () => {
    const r = normalizeTreeItem(treePayload({ likeCount: 5 }));
    expect(r.likeCount).toBe(5);
  });

  it("rejects negative viewCount", () => {
    expect(() => normalizeTreeItem(treePayload({ viewCount: -1 }))).toThrow(MyTreesResponseError);
  });

  it("rejects fractional viewCount", () => {
    expect(() => normalizeTreeItem(treePayload({ viewCount: 1.5 }))).toThrow(MyTreesResponseError);
  });

  it("rejects string viewCount", () => {
    expect(() => normalizeTreeItem(treePayload({ viewCount: "10" }))).toThrow(MyTreesResponseError);
  });

  it("rejects null viewCount", () => {
    expect(() => normalizeTreeItem(treePayload({ viewCount: null }))).toThrow(MyTreesResponseError);
  });

  it("includes zero viewCount", () => {
    const r = normalizeTreeItem(treePayload({ viewCount: 0 }));
    expect(r.viewCount).toBe(0);
  });

  it("rejects invalid present groupName", () => {
    expect(() => normalizeTreeItem(treePayload({ groupName: 123 }))).toThrow(MyTreesResponseError);
  });

  it("rejects invalid present keywords (non-array)", () => {
    expect(() => normalizeTreeItem(treePayload({ keywords: "string" }))).toThrow(MyTreesResponseError);
  });

  it("rejects invalid present keywords (non-string elements)", () => {
    expect(() => normalizeTreeItem(treePayload({ keywords: [1, 2] }))).toThrow(MyTreesResponseError);
  });

  it("rejects negative memoryCount", () => {
    expect(() => normalizeTreeItem(treePayload({ memoryCount: -1 }))).toThrow(MyTreesResponseError);
  });

  it("rejects fractional memoryCount", () => {
    expect(() => normalizeTreeItem(treePayload({ memoryCount: 1.5 }))).toThrow(MyTreesResponseError);
  });

  it("rejects invalid core id", () => {
    expect(() => normalizeTreeItem(treePayload({ id: "" }))).toThrow(MyTreesResponseError);
  });

  it("rejects invalid core title", () => {
    expect(() => normalizeTreeItem(treePayload({ title: "" }))).toThrow(MyTreesResponseError);
  });

  it("rejects invalid visibility", () => {
    expect(() => normalizeTreeItem(treePayload({ visibility: "" }))).toThrow(MyTreesResponseError);
  });

  it("rejects unknown visibility", () => {
    expect(() => normalizeTreeItem(treePayload({ visibility: "unknown" }))).toThrow(MyTreesResponseError);
  });

  it("rejects whitespace visibility", () => {
    expect(() => normalizeTreeItem(treePayload({ visibility: "  " }))).toThrow(MyTreesResponseError);
  });

  it("rejects null input", () => expect(() => normalizeTreeItem(null)).toThrow(MyTreesResponseError));
  it("rejects non-object input", () => expect(() => normalizeTreeItem([])).toThrow(MyTreesResponseError));

  it("accepts public visibility", () => {
    expect(normalizeTreeItem(treePayload({ visibility: "public" })).visibility).toBe("public");
  });

  it("accepts private visibility", () => {
    expect(normalizeTreeItem(treePayload({ visibility: "private" })).visibility).toBe("private");
  });

  it("valid optional keywords preserved", () => {
    const r = normalizeTreeItem(treePayload({ keywords: ["a", "b"] }));
    expect(r.keywords).toEqual(["a", "b"]);
  });

  it("valid optional memoryCount preserved", () => {
    const r = normalizeTreeItem(treePayload({ memoryCount: 3 }));
    expect(r.memoryCount).toBe(3);
  });

  it("zero memoryCount accepted", () => {
    const r = normalizeTreeItem(treePayload({ memoryCount: 0 }));
    expect(r.memoryCount).toBe(0);
  });
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

  it("accepts core-only item with no optional metadata", async () => {
    const client = mockClient();
    client.get.mockResolvedValue([{ id: "t1", title: "내 트리", visibility: "public", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: null }]);
    const api = createMyTreesApi(client);
    const items = await api.fetchTrees();
    expect(items).toHaveLength(1);
    expect(items[0].groupName).toBeUndefined();
    expect(items[0].keywords).toBeUndefined();
    expect(items[0].memoryCount).toBeUndefined();
  });
});
