import { describe, expect, it, vi } from "vitest";
import { createEmptyPublicDemoDraft, type PublicDemoDraft } from "../types/publicDemoEditor";
import {
  PUBLIC_DEMO_STORAGE_KEY,
  isValidPublicDemoDraft,
  readPublicDemoDraft,
  removePublicDemoDraft,
  writePublicDemoDraft,
} from "./publicDemoStorage";

function validDraft(): PublicDemoDraft {
  return {
    schemaVersion: 1,
    tree: { title: "테스트 트리", description: "설명" },
    nodes: [
      {
        id: "root",
        parentId: null,
        title: "첫 기억",
        date: "2026-07-26",
        emotion: "설렘",
        memo: "첫 메모",
        youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
        videoId: "c4V0FNZfEv0",
      },
    ],
    selectedNodeId: "root",
  };
}

function storageWith(raw: string | null, otherEntries: Record<string, string> = {}) {
  const values = new Map<string, string>(Object.entries(otherEntries));
  if (raw !== null) values.set(PUBLIC_DEMO_STORAGE_KEY, raw);
  return {
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => { values.set(key, value); }),
    removeItem: vi.fn((key: string) => { values.delete(key); }),
  };
}

function expectExactStoredShape(serialized: string) {
  const stored = JSON.parse(serialized) as Record<string, unknown>;
  expect(Object.keys(stored).sort()).toEqual(["nodes", "schemaVersion", "selectedNodeId", "tree"]);
  expect(Object.keys(stored.tree as Record<string, unknown>).sort()).toEqual(["description", "title"]);
  const [node] = stored.nodes as Array<Record<string, unknown>>;
  expect(Object.keys(node).sort()).toEqual([
    "date",
    "emotion",
    "id",
    "memo",
    "parentId",
    "title",
    "videoId",
    "youtubeUrl",
  ]);
}

describe("public demo storage", () => {
  it("reads and writes only the exact schema-v1 content draft", () => {
    const draft = validDraft();
    const serialized = JSON.stringify(draft);
    const storage = storageWith(serialized);
    expect(readPublicDemoDraft(storage)).toEqual(draft);
    expect(writePublicDemoDraft(draft, storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY, serialized);
    expectExactStoredShape(serialized);
    expect(serialized).not.toMatch(/access.?token|refresh.?token|jwt|firebase|credential|cookie|email|user.?id|account/i);
  });

  it("removes unknown or forbidden fields at every level and preserves other keys", () => {
    const draft = validDraft();
    const forbiddenDrafts = [
      { ...draft, email: "person@example.com" },
      { ...draft, tree: { ...draft.tree, userId: "user-1" } },
      { ...draft, nodes: [{ ...draft.nodes[0], accessToken: "secret" }] },
      { ...draft, jwt: "header.payload.signature" },
      { ...draft, nodes: [{ ...draft.nodes[0], credential: { password: "secret" } }] },
      { ...draft, firebase: { uid: "firebase-user", metadata: { createdAt: "now" } } },
    ];

    for (const forbidden of forbiddenDrafts) {
      const storage = storageWith(JSON.stringify(forbidden), { "unrelated-key": "keep" });
      expect(readPublicDemoDraft(storage)).toEqual(createEmptyPublicDemoDraft());
      expect(storage.removeItem).toHaveBeenCalledTimes(1);
      expect(storage.removeItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
      expect(storage.getItem("unrelated-key")).toBe("keep");
      expect(storage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
    }
  });

  it("does not reserialize forbidden fields after read and selection or node updates", () => {
    const storage = storageWith(JSON.stringify(validDraft()));
    const loaded = readPublicDemoDraft(storage);
    const tainted = Object.assign(
      {
        ...loaded,
        selectedNodeId: "root",
        nodes: loaded.nodes.map((node) => (
          node.id === "root" ? { ...node, title: "수정된 기억" } : node
        )),
      },
      { refreshToken: "forbidden-refresh-token" },
    ) as PublicDemoDraft;

    expect(writePublicDemoDraft(tainted, storage)).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBe(JSON.stringify(validDraft()));

    const cleanMutation: PublicDemoDraft = {
      ...loaded,
      selectedNodeId: "root",
      nodes: loaded.nodes.map((node) => (
        node.id === "root" ? { ...node, title: "수정된 기억" } : node
      )),
    };
    expect(writePublicDemoDraft(cleanMutation, storage)).toBe(true);
    const serialized = storage.getItem(PUBLIC_DEMO_STORAGE_KEY);
    expect(serialized).not.toBeNull();
    expectExactStoredShape(serialized!);
    expect(serialized).not.toMatch(/refresh.?token|access.?token|jwt|firebase|credential|cookie|email|user.?id|account/i);
  });

  it("allows only the exact initial empty draft to have a blank title", () => {
    expect(isValidPublicDemoDraft(createEmptyPublicDemoDraft())).toBe(true);
    expect(isValidPublicDemoDraft({
      ...createEmptyPublicDemoDraft(),
      tree: { title: "", description: "started" },
    })).toBe(false);
    expect(isValidPublicDemoDraft({
      ...validDraft(),
      tree: { ...validDraft().tree, title: "   " },
    })).toBe(false);
  });

  it("recovers malformed JSON, unknown schema, and invalid graph to an empty draft", () => {
    for (const raw of [
      "{bad json",
      JSON.stringify({ ...validDraft(), schemaVersion: 2 }),
      JSON.stringify({ ...validDraft(), nodes: [{ ...validDraft().nodes[0], parentId: "missing" }] }),
    ]) {
      const storage = storageWith(raw, { "unrelated-key": "keep" });
      expect(readPublicDemoDraft(storage)).toEqual(createEmptyPublicDemoDraft());
      expect(storage.removeItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
      expect(storage.getItem("unrelated-key")).toBe("keep");
    }
  });

  it("rejects noncanonical YouTube data and selected missing nodes", () => {
    const draft = validDraft();
    expect(isValidPublicDemoDraft({
      ...draft,
      nodes: [{ ...draft.nodes[0], youtubeUrl: "https://youtu.be/c4V0FNZfEv0" }],
    })).toBe(false);
    expect(isValidPublicDemoDraft({ ...draft, selectedNodeId: "missing" })).toBe(false);
  });

  it("recovers read, write, and remove exceptions without throwing", () => {
    const throwingStorage = {
      getItem: vi.fn((_key: string): string | null => { throw new Error("read"); }),
      setItem: vi.fn((_key: string, _value: string): void => { throw new Error("write"); }),
      removeItem: vi.fn((_key: string): void => { throw new Error("remove"); }),
    };
    expect(readPublicDemoDraft(throwingStorage)).toEqual(createEmptyPublicDemoDraft());
    expect(writePublicDemoDraft(validDraft(), throwingStorage)).toBe(false);
    expect(removePublicDemoDraft(throwingStorage)).toBe(false);
  });

  it("reset removes the exact draft key and never calls clear", () => {
    const storage = {
      getItem: vi.fn((_key: string) => null),
      setItem: vi.fn((_key: string, _value: string) => undefined),
      removeItem: vi.fn((_key: string) => undefined),
      clear: vi.fn(),
    };
    expect(removePublicDemoDraft(storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
    expect(storage.clear).not.toHaveBeenCalled();
  });
});
