import { describe, expect, it, vi } from "vitest";
import {
  createCreateTreeApi,
  normalizeCreatedTree,
  CreateTreeResponseError,
  CreateTreeInputError,
} from "./createTree";

function mockClient() {
  return { post: vi.fn() };
}

function treePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "t-new",
    title: "내 러브트리",
    visibility: "public",
    groupName: "",
    keywords: [],
    createdAt: "2026-07-27T10:00:00.000Z",
    updatedAt: null,
    memoryCount: 0,
    ...overrides,
  };
}

describe("normalizeCreatedTree", () => {
  it("maps exact fields", () => {
    const r = normalizeCreatedTree(treePayload());
    expect(r.id).toBe("t-new");
    expect(r.title).toBe("내 러브트리");
    expect(r.visibility).toBe("public");
    expect(r.groupName).toBe("");
    expect(r.keywords).toEqual([]);
    expect(r.memoryCount).toBe(0);
  });

  it("accepts private visibility", () => {
    const r = normalizeCreatedTree(treePayload({ visibility: "private" }));
    expect(r.visibility).toBe("private");
  });

  it("rejects missing id", () => expect(() => normalizeCreatedTree(treePayload({ id: "" }))).toThrow(CreateTreeResponseError));
  it("rejects missing title", () => expect(() => normalizeCreatedTree(treePayload({ title: "" }))).toThrow(CreateTreeResponseError));
  it("rejects unknown visibility", () => expect(() => normalizeCreatedTree(treePayload({ visibility: "unknown" }))).toThrow(CreateTreeResponseError));
  it("rejects missing memoryCount", () => expect(() => normalizeCreatedTree(treePayload({ memoryCount: undefined }))).toThrow(CreateTreeResponseError));
  it("rejects null input", () => expect(() => normalizeCreatedTree(null)).toThrow(CreateTreeResponseError));
  it("rejects non-object input", () => expect(() => normalizeCreatedTree([])).toThrow(CreateTreeResponseError));
});

describe("createCreateTreeApi — write-boundary input validation", () => {
  it("calls POST /trees with title and visibility", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    await api.createTree({ title: "내 트리", visibility: "public" });
    expect(client.post).toHaveBeenCalledWith("/trees", {
      title: "내 트리",
      visibility: "public",
    }, { signal: undefined });
  });

  it("sends trimmed title", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    await api.createTree({ title: "  내 트리  ", visibility: "public" });
    expect(client.post).toHaveBeenCalledWith("/trees", {
      title: "내 트리",
      visibility: "public",
    }, { signal: undefined });
  });

  it("does not send description in payload", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    await api.createTree({ title: "내 트리", visibility: "public" });
    const payload = client.post.mock.calls[0][1];
    expect(payload).not.toHaveProperty("description");
    expect(Object.keys(payload)).toEqual(["title", "visibility"]);
  });

  it("forwards AbortSignal", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    const ctrl = new AbortController();
    await api.createTree({ title: "내 트리", visibility: "public" }, ctrl.signal);
    expect(client.post).toHaveBeenCalledWith("/trees", {
      title: "내 트리",
      visibility: "public",
    }, { signal: ctrl.signal });
  });

  it("throws on undefined response", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(undefined);
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "내 트리", visibility: "public" })).rejects.toThrow(CreateTreeResponseError);
  });

  it("throws on invalid item", async () => {
    const client = mockClient();
    client.post.mockResolvedValue({});
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "내 트리", visibility: "public" })).rejects.toThrow(CreateTreeResponseError);
  });

  it("blocks empty title — POST 0", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "", visibility: "public" })).rejects.toThrow(CreateTreeInputError);
    expect(client.post).not.toHaveBeenCalled();
  });

  it("blocks whitespace-only title — POST 0", async () => {
    const client = mockClient();
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "   ", visibility: "public" })).rejects.toThrow(CreateTreeInputError);
    expect(client.post).not.toHaveBeenCalled();
  });

  it("allows 80-character title — POST 1", async () => {
    const client = mockClient();
    client.post.mockResolvedValue(treePayload());
    const api = createCreateTreeApi(client);
    const title80 = "a".repeat(80);
    await api.createTree({ title: title80, visibility: "public" });
    expect(client.post).toHaveBeenCalledTimes(1);
    expect(client.post).toHaveBeenCalledWith("/trees", { title: title80, visibility: "public" }, { signal: undefined });
  });

  it("blocks 81-character title — POST 0", async () => {
    const client = mockClient();
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "a".repeat(81), visibility: "public" })).rejects.toThrow(CreateTreeInputError);
    expect(client.post).not.toHaveBeenCalled();
  });

  it("blocks invalid visibility runtime value — POST 0", async () => {
    const client = mockClient();
    const api = createCreateTreeApi(client);
    await expect(api.createTree({ title: "내 트리", visibility: "unknown" as "public" })).rejects.toThrow(CreateTreeInputError);
    expect(client.post).not.toHaveBeenCalled();
  });

  it("CreateTreeInputError has correct field name", async () => {
    const client = mockClient();
    const api = createCreateTreeApi(client);
    let err: unknown;
    try { await api.createTree({ title: "", visibility: "public" }); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(CreateTreeInputError);
    expect((err as CreateTreeInputError).field).toBe("title");
  });
});
