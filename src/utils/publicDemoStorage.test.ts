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

function storageWith(raw: string | null) {
  return {
    getItem: vi.fn(() => raw),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };
}

describe("public demo storage", () => {
  it("reads and writes only schema-v1 content draft", () => {
    const draft = validDraft();
    const storage = storageWith(JSON.stringify(draft));
    expect(readPublicDemoDraft(storage)).toEqual(draft);
    expect(writePublicDemoDraft(draft, storage)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify(draft));
    const saved = storage.setItem.mock.calls[0][1];
    expect(saved).not.toMatch(/access.?token|jwt|firebase|credential|cookie|email|user.?id/i);
  });

  it("recovers malformed JSON, unknown schema, and invalid graph to an empty draft", () => {
    for (const raw of [
      "{bad json",
      JSON.stringify({ ...validDraft(), schemaVersion: 2 }),
      JSON.stringify({ ...validDraft(), nodes: [{ ...validDraft().nodes[0], parentId: "missing" }] }),
    ]) {
      const storage = storageWith(raw);
      expect(readPublicDemoDraft(storage)).toEqual(createEmptyPublicDemoDraft());
      expect(storage.removeItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
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
      getItem: vi.fn(() => { throw new Error("read"); }),
      setItem: vi.fn(() => { throw new Error("write"); }),
      removeItem: vi.fn(() => { throw new Error("remove"); }),
    };
    expect(readPublicDemoDraft(throwingStorage)).toEqual(createEmptyPublicDemoDraft());
    expect(writePublicDemoDraft(validDraft(), throwingStorage)).toBe(false);
    expect(removePublicDemoDraft(throwingStorage)).toBe(false);
  });

  it("reset removes the exact draft key and never calls clear", () => {
    const storage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    expect(removePublicDemoDraft(storage)).toBe(true);
    expect(storage.removeItem).toHaveBeenCalledTimes(1);
    expect(storage.removeItem).toHaveBeenCalledWith(PUBLIC_DEMO_STORAGE_KEY);
    expect(storage.clear).not.toHaveBeenCalled();
  });
});
