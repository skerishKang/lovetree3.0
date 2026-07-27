import { describe, expect, it, vi } from "vitest";
import {
  createPublicMemoryDetailApi,
  normalizePublicMemory,
  publicMemoryPath,
} from "./publicMemoryDetail";

function mockClient() {
  return { get: vi.fn() };
}

function memoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "mem-abc",
    treeId: "tree-abc",
    parentId: null,
    title: "기억 제목",
    memo: "기억 본문",
    artist: "아티스트",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc/mqdefault.jpg",
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

describe("publicMemoryPath", () => {
  it("encodes memoryId", () => {
    expect(publicMemoryPath("abc")).toBe("/memories/abc");
  });
  it("encodes special characters", () => {
    expect(publicMemoryPath("a/b c?d")).toBe("/memories/a%2Fb%20c%3Fd");
  });
});

describe("normalizePublicMemory", () => {
  it("maps exact fields", () => {
    const r = normalizePublicMemory(memoryPayload());
    expect(r.id).toBe("mem-abc");
    expect(r.title).toBe("기억 제목");
    expect(r.emotionTags).toEqual(["설렘"]);
  });
  it("rejects missing id", () => { expect(() => normalizePublicMemory(memoryPayload({ id: "" }))).toThrow(); });
  it("rejects missing title", () => { expect(() => normalizePublicMemory(memoryPayload({ title: "" }))).toThrow(); });
  it("rejects missing visibility", () => { expect(() => normalizePublicMemory(memoryPayload({ visibility: "" }))).toThrow(); });
  it("rejects non-array emotionTags", () => { expect(() => normalizePublicMemory(memoryPayload({ emotionTags: "x" }))).toThrow(); });
  it("accepts null parentId", () => { expect(normalizePublicMemory(memoryPayload({ parentId: null })).parentId).toBeNull(); });
  it("rejects null input", () => { expect(() => normalizePublicMemory(null)).toThrow(); });
  it("rejects non-object input", () => { expect(() => normalizePublicMemory([])).toThrow(); });
});

describe("createPublicMemoryDetailApi", () => {
  it("fetchMemory calls exact GET /memories/:memoryId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(memoryPayload());
    const api = createPublicMemoryDetailApi(client);
    await api.fetchMemory("abc");
    expect(client.get).toHaveBeenCalledWith("/memories/abc", { signal: undefined });
  });
  it("fetchMemory encodes memoryId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(memoryPayload());
    const api = createPublicMemoryDetailApi(client);
    await api.fetchMemory("a/b?c");
    expect(client.get).toHaveBeenCalledWith("/memories/a%2Fb%3Fc", { signal: undefined });
  });
  it("fetchTree calls exact GET /trees/:treeId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({ id: "t1", title: "트리", visibility: "public", createdAt: null, updatedAt: null, memoryCount: 3 });
    const api = createPublicMemoryDetailApi(client);
    await api.fetchTree("t1");
    expect(client.get).toHaveBeenCalledWith("/trees/t1", { signal: undefined });
  });
  it("fetchTree encodes treeId", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({ id: "t1", title: "트리", visibility: "public", createdAt: null, updatedAt: null, memoryCount: 3 });
    const api = createPublicMemoryDetailApi(client);
    await api.fetchTree("a/b?c");
    expect(client.get).toHaveBeenCalledWith("/trees/a%2Fb%3Fc", { signal: undefined });
  });
  it("fetchMemory normalizes payload", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(memoryPayload());
    const api = createPublicMemoryDetailApi(client);
    const r = await api.fetchMemory("m1");
    expect(r.title).toBe("기억 제목");
  });
  it("fetchMemory throws on invalid payload", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({});
    const api = createPublicMemoryDetailApi(client);
    await expect(api.fetchMemory("m1")).rejects.toThrow();
  });
  it("fetchTree normalizes payload", async () => {
    const client = mockClient();
    client.get.mockResolvedValue({ id: "t1", title: "트리", visibility: "public", createdAt: null, updatedAt: null, memoryCount: 3 });
    const api = createPublicMemoryDetailApi(client);
    const r = await api.fetchTree("t1");
    expect(r.title).toBe("트리");
  });
  it("forwards AbortSignal", async () => {
    const client = mockClient();
    client.get.mockResolvedValue(memoryPayload());
    const api = createPublicMemoryDetailApi(client);
    const ctrl = new AbortController();
    await api.fetchMemory("m1", ctrl.signal);
    expect(client.get).toHaveBeenCalledWith("/memories/m1", { signal: ctrl.signal });
  });
});
