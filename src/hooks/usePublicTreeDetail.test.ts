import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PublicTreeMemoriesResponseError,
  PublicTreeResponseError,
} from "../api/publicTreeDetail";
import type { PublicTreeDetailApi } from "../api/publicTreeDetail";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";
import { usePublicTreeDetail } from "./usePublicTreeDetail";

function detail(overrides: Record<string, unknown> = {}) {
  return {
    id: "tree-1",
    title: "공개 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 3,
    ...overrides,
  };
}

function memories(overrides: Array<Record<string, unknown>> = [{}]) {
  return overrides.map((o, i) => ({
    id: `mem-${i}`,
    treeId: "tree-1",
    parentId: null,
    title: "기억",
    memo: "본문",
    artist: "",
    source: "",
    sourceUrl: "",
    sourceType: "",
    thumbnail: "",
    emotionTags: [],
    timestamp: "2026-07-20T10:00:00.000Z",
    visibility: "public",
    channelId: null,
    channelName: null,
    channelUrl: null,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    ...o,
  }));
}

function apiError(status: number) {
  const err = new Error("API error") as Error & {
    status: number;
    code: string;
    retryable: boolean;
    rawCategory: string;
  };
  err.status = status;
  err.code = "ERR";
  err.retryable = true;
  err.rawCategory = "social";
  return err;
}

function mockApi(responses?: {
  tree?: PublicTreeDetailApi["fetchTree"];
  memories?: PublicTreeDetailApi["fetchMemories"];
}): PublicTreeDetailApi {
  return {
    fetchTree: responses?.tree ?? vi.fn().mockResolvedValue(detail() as never) as PublicTreeDetailApi["fetchTree"],
    fetchMemories: responses?.memories ?? vi.fn().mockResolvedValue(memories() as never) as PublicTreeDetailApi["fetchMemories"],
  };
}

describe("usePublicTreeDetail", () => {
  it("starts in loading for tree and memories", () => {
    const api = mockApi();
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    expect(result.current.tree.status).toBe("loading");
    expect(result.current.memories.status).toBe("loading");
  });

  it("transitions to success for both on resolve", async () => {
    const api = mockApi();
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.tree.status).toBe("success");
    });
    await waitFor(() => {
      expect(result.current.memories.status).toBe("success");
    });
    expect(result.current.tree.data?.title).toBe("공개 트리");
    expect(result.current.memories.items).toHaveLength(1);
  });

  it("transitions tree to not-found on 404", async () => {
    const api = mockApi({
      tree: () => Promise.reject(apiError(404)),
      memories: () => Promise.resolve(memories()),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.tree.status).toBe("not-found");
    });
    expect(result.current.tree.data).toBeNull();
  });

  it("transitions tree to malformed on PublicTreeResponseError", async () => {
    const api = mockApi({
      tree: () => Promise.reject(new PublicTreeResponseError()),
      memories: () => Promise.resolve(memories()),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.tree.status).toBe("malformed");
    });
    expect(result.current.tree.error).toBeTruthy();
  });

  it("transitions tree to error on generic error", async () => {
    const api = mockApi({
      tree: () => Promise.reject(new Error("network down")),
      memories: () => Promise.resolve(memories()),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.tree.status).toBe("error");
    });
    expect(result.current.tree.error).toBeTruthy();
  });

  it("retryTree re-fetches tree and recovers", async () => {
    let calls = 0;
    const api = mockApi({
      tree: () => {
        calls += 1;
        return calls === 1
          ? Promise.reject(new Error("fail"))
          : Promise.resolve(detail());
      },
      memories: () => Promise.resolve(memories()),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));
    act(() => result.current.retryTree());
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(calls).toBe(2);
  });

  it("retryMemories re-fetches memories and recovers", async () => {
    let calls = 0;
    const api = mockApi({
      tree: () => Promise.resolve(detail()),
      memories: () => {
        calls += 1;
        return calls === 1
          ? Promise.reject(new Error("fail"))
          : Promise.resolve(memories());
      },
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.memories.status).toBe("error"));
    act(() => result.current.retryMemories());
    await waitFor(() => expect(result.current.memories.status).toBe("success"));
    expect(calls).toBe(2);
  });

  it("transitions memories to empty when empty array returned", async () => {
    const api = mockApi({
      tree: () => Promise.resolve(detail()),
      memories: () => Promise.resolve([]),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.memories.status).toBe("empty");
    });
  });

  it("transitions memories to malformed on PublicTreeMemoriesResponseError", async () => {
    const api = mockApi({
      memories: () => Promise.reject(new PublicTreeMemoriesResponseError()),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.memories.status).toBe("malformed");
    });
    expect(result.current.memories.error).toBeTruthy();
  });

  it("transitions memories to error on generic error", async () => {
    const api = mockApi({
      memories: () => Promise.reject(new Error("timeout")),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.memories.status).toBe("error");
    });
    expect(result.current.memories.error).toBeTruthy();
  });

  it("partial success: tree header preserved when memories fail", async () => {
    const api = mockApi({
      tree: () => Promise.resolve(detail({ title: "유지된 헤더" })),
      memories: () => Promise.reject(new Error("memories fail")),
    });
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => {
      expect(result.current.tree.status).toBe("success");
    });
    await waitFor(() => {
      expect(result.current.memories.status).toBe("error");
    });
    expect(result.current.tree.data?.title).toBe("유지된 헤더");
  });

  it("ignores stale tree response after treeId change", async () => {
    let resolveOld!: (v: PublicTreeDetail) => void;
    const oldPromise = new Promise<PublicTreeDetail>((resolve) => {
      resolveOld = resolve;
    });
    let resolveNew!: (v: PublicTreeDetail) => void;
    const newPromise = new Promise<PublicTreeDetail>((resolve) => {
      resolveNew = resolve;
    });
    let callCount = 0;
    const api: PublicTreeDetailApi = {
      fetchTree: ((_id: string, _signal?: AbortSignal) => {
        callCount += 1;
        return callCount === 1 ? oldPromise : newPromise;
      }) as PublicTreeDetailApi["fetchTree"],
      fetchMemories: ((_id: string, _signal?: AbortSignal) => {
        return Promise.resolve(memories() as PublicTreeMemory[]);
      }) as PublicTreeDetailApi["fetchMemories"],
    };
    const { result, rerender } = renderHook(
      ({ id }) => usePublicTreeDetail(id, api),
      { initialProps: { id: "old-id" } },
    );
    rerender({ id: "new-id" });
    act(() => {
      resolveNew!(detail({ id: "new-id", title: "새 트리" }));
    });
    act(() => {
      resolveOld!(detail({ id: "old-id", title: "오래된 응답" }));
    });
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(result.current.tree.data?.id).toBe("new-id");
  });

  it("ignores stale memories response after retry", async () => {
    let resolveOldMemories!: (v: PublicTreeMemory[]) => void;
    const oldMemoriesPromise = new Promise<PublicTreeMemory[]>((resolve) => {
      resolveOldMemories = resolve;
    });
    let resolveNewMemories!: (v: PublicTreeMemory[]) => void;
    const newMemoriesPromise = new Promise<PublicTreeMemory[]>((resolve) => {
      resolveNewMemories = resolve;
    });
    let callCount = 0;
    const api: PublicTreeDetailApi = {
      fetchTree: ((_id: string, _signal?: AbortSignal) => {
        return Promise.resolve(detail() as PublicTreeDetail);
      }) as PublicTreeDetailApi["fetchTree"],
      fetchMemories: ((_id: string, _signal?: AbortSignal) => {
        callCount += 1;
        return callCount === 1 ? oldMemoriesPromise : newMemoriesPromise;
      }) as PublicTreeDetailApi["fetchMemories"],
    };
    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    result.current.retryMemories();
    act(() => {
      resolveNewMemories!(memories([{ title: "새 기억" }]));
    });
    act(() => {
      resolveOldMemories!(memories([{ title: "오래된 기억" }]));
    });
    await waitFor(() => expect(result.current.memories.status).toBe("success"));
    expect(result.current.memories.items[0]?.title).toBe("새 기억");
  });

  it("unmount ignores pending responses", async () => {
    let resolveTree!: (v: PublicTreeDetail) => void;
    const treePromise = new Promise<PublicTreeDetail>((resolve) => {
      resolveTree = resolve;
    });
    const api: PublicTreeDetailApi = {
      fetchTree: ((_id: string, _signal?: AbortSignal) => {
        return treePromise;
      }) as PublicTreeDetailApi["fetchTree"],
      fetchMemories: ((_id: string, _signal?: AbortSignal) => {
        return Promise.resolve(memories() as PublicTreeMemory[]);
      }) as PublicTreeDetailApi["fetchMemories"],
    };
    const { result, unmount } = renderHook(() => usePublicTreeDetail("tree-1", api));
    unmount();
    act(() => {
      resolveTree!(detail());
    });
    expect(result.current.tree.status).toBe("loading");
  });

  it("uses separate AbortControllers for tree and memories", () => {
    const api = mockApi();
    const spyTree = vi.spyOn(api, "fetchTree");
    const spyMemories = vi.spyOn(api, "fetchMemories");
    renderHook(() => usePublicTreeDetail("tree-1", api));
    expect(spyTree).toHaveBeenCalledWith("tree-1", expect.objectContaining({}));
    expect(spyMemories).toHaveBeenCalledWith("tree-1", expect.objectContaining({}));
    const treeSignal = spyTree.mock.calls[0][1];
    const memoriesSignal = spyMemories.mock.calls[0][1];
    expect(treeSignal).not.toBe(memoriesSignal);
  });
});
