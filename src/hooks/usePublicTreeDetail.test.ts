import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PublicTreeMemoriesResponseError,
  PublicTreeResponseError,
  type PublicTreeDetailApi,
} from "../api/publicTreeDetail";
import { ApiErrorImpl } from "../types/api";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";
import { usePublicTreeDetail } from "./usePublicTreeDetail";

function tree(id = "tree-1"): PublicTreeDetail {
  return {
    id,
    title: `트리 ${id}`,
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 1,
  };
}

function memory(id = "memory-1", treeId = "tree-1"): PublicTreeMemory {
  return {
    id,
    treeId,
    parentId: null,
    title: `기억 ${id}`,
    memo: "메모",
    artist: "",
    source: "",
    sourceUrl: "",
    sourceType: "",
    thumbnail: "",
    emotionTags: [],
    timestamp: "2026-07-21T10:00:00.000Z",
    visibility: "public",
    channelId: null,
    channelName: null,
    channelUrl: null,
    createdAt: "2026-07-21T10:00:00.000Z",
    updatedAt: null,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe("usePublicTreeDetail", () => {
  it("loads tree and memories independently", async () => {
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn().mockResolvedValue(tree()),
      fetchMemories: vi.fn().mockResolvedValue([memory()]),
    };

    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));

    expect(result.current.tree.status).toBe("loading");
    expect(result.current.memories.status).toBe("loading");
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    await waitFor(() => expect(result.current.memories.status).toBe("success"));
    expect(result.current.tree.data?.id).toBe("tree-1");
    expect(result.current.memories.items[0].id).toBe("memory-1");
  });

  it("maps a tree 404 to a dedicated not-found state", async () => {
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn().mockRejectedValue(new ApiErrorImpl({
        status: 404,
        code: "NOT_FOUND",
        message: "not found",
        retryable: false,
        rawCategory: "social",
      })),
      fetchMemories: vi.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() => usePublicTreeDetail("missing", api));
    await waitFor(() => expect(result.current.tree.status).toBe("not-found"));
  });

  it("distinguishes malformed tree and memory responses", async () => {
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn().mockRejectedValue(new PublicTreeResponseError()),
      fetchMemories: vi.fn().mockRejectedValue(new PublicTreeMemoriesResponseError()),
    };

    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("malformed"));
    await waitFor(() => expect(result.current.memories.status).toBe("malformed"));
  });

  it("retries a failed tree request", async () => {
    const fetchTree = vi.fn()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce(tree("recovered"));
    const api: PublicTreeDetailApi = {
      fetchTree,
      fetchMemories: vi.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));

    act(() => result.current.retryTree());
    expect(result.current.tree.status).toBe("loading");
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(result.current.tree.data?.id).toBe("recovered");
    expect(fetchTree).toHaveBeenCalledTimes(2);
  });

  it("keeps a successful tree during memory failure and retries memories only", async () => {
    const fetchMemories = vi.fn()
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce([memory("recovered")]);
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn().mockResolvedValue(tree()),
      fetchMemories,
    };

    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    await waitFor(() => expect(result.current.memories.status).toBe("error"));
    expect(result.current.tree.data?.title).toBe("트리 tree-1");

    act(() => result.current.retryMemories());
    await waitFor(() => expect(result.current.memories.status).toBe("success"));
    expect(result.current.tree.status).toBe("success");
    expect(result.current.memories.items[0].id).toBe("recovered");
    expect(fetchMemories).toHaveBeenCalledTimes(2);
  });

  it("reports an empty memories state", async () => {
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn().mockResolvedValue(tree()),
      fetchMemories: vi.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(result.current.memories.status).toBe("empty"));
  });

  it("aborts both requests on unmount and ignores later completion", async () => {
    const treeRequest = deferred<PublicTreeDetail>();
    const memoriesRequest = deferred<PublicTreeMemory[]>();
    let treeSignal: AbortSignal | undefined;
    let memoriesSignal: AbortSignal | undefined;
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn((_treeId, signal) => {
        treeSignal = signal;
        return treeRequest.promise;
      }),
      fetchMemories: vi.fn((_treeId, signal) => {
        memoriesSignal = signal;
        return memoriesRequest.promise;
      }),
    };

    const { unmount } = renderHook(() => usePublicTreeDetail("tree-1", api));
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.fetchMemories).toHaveBeenCalledTimes(1));

    unmount();
    expect(treeSignal?.aborted).toBe(true);
    expect(memoriesSignal?.aborted).toBe(true);
    treeRequest.resolve(tree("late"));
    memoriesRequest.resolve([memory("late")]);
  });

  it("aborts route-change requests and rejects stale completion", async () => {
    const firstTree = deferred<PublicTreeDetail>();
    const secondTree = deferred<PublicTreeDetail>();
    const firstMemories = deferred<PublicTreeMemory[]>();
    const secondMemories = deferred<PublicTreeMemory[]>();
    const treeSignals: AbortSignal[] = [];
    const memorySignals: AbortSignal[] = [];
    let treeCall = 0;
    let memoryCall = 0;
    const api: PublicTreeDetailApi = {
      fetchTree: vi.fn((_treeId, signal) => {
        if (signal) treeSignals.push(signal);
        treeCall += 1;
        return treeCall === 1 ? firstTree.promise : secondTree.promise;
      }),
      fetchMemories: vi.fn((_treeId, signal) => {
        if (signal) memorySignals.push(signal);
        memoryCall += 1;
        return memoryCall === 1 ? firstMemories.promise : secondMemories.promise;
      }),
    };

    const { result, rerender } = renderHook(
      ({ treeId }) => usePublicTreeDetail(treeId, api),
      { initialProps: { treeId: "old-tree" } },
    );
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(1));

    rerender({ treeId: "new-tree" });
    await waitFor(() => expect(api.fetchTree).toHaveBeenCalledTimes(2));
    expect(treeSignals[0].aborted).toBe(true);
    expect(memorySignals[0].aborted).toBe(true);

    secondTree.resolve(tree("new-tree"));
    secondMemories.resolve([memory("new-memory", "new-tree")]);
    firstTree.resolve(tree("old-tree"));
    firstMemories.resolve([memory("old-memory", "old-tree")]);

    await waitFor(() => expect(result.current.tree.data?.id).toBe("new-tree"));
    await waitFor(() => expect(result.current.memories.items[0]?.id).toBe("new-memory"));
  });
});
