import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublicMemoryResponseError } from "../api/publicMemoryDetail";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";
import type { PublicMemoryDetailApi } from "../api/publicMemoryDetail";
import { usePublicMemoryDetail } from "./usePublicMemoryDetail";

function detail(overrides: Partial<PublicTreeDetail> = {}): PublicTreeDetail {
  return { id: "tree-1", title: "트리", visibility: "public", createdAt: "2026-01-01T00:00:00Z", updatedAt: null, memoryCount: 3, ...overrides } as PublicTreeDetail;
}

function memory(overrides: Partial<PublicTreeMemory> = {}): PublicTreeMemory {
  return {
    id: "mem-1", treeId: "tree-1", parentId: null, title: "기억", memo: "내용",
    artist: "", source: "", sourceUrl: "", sourceType: "", thumbnail: "",
    emotionTags: [], timestamp: "2026-01-01T00:00:00Z", visibility: "public",
    channelId: null, channelName: null, channelUrl: null,
    createdAt: "2026-01-01T00:00:00Z", updatedAt: null,
    ...overrides,
  } as PublicTreeMemory;
}

function apiError(status: number) {
  const err = new Error("API error") as Error & { status: number; code: string; retryable: boolean; rawCategory: string };
  err.status = status; err.code = "ERR"; err.retryable = true; err.rawCategory = "social";
  return err;
}

function mockApi(overrides?: Partial<PublicMemoryDetailApi>): PublicMemoryDetailApi {
  return {
    fetchMemory: vi.fn().mockResolvedValue(memory()),
    fetchTree: vi.fn().mockResolvedValue(detail()),
    ...overrides,
  } as PublicMemoryDetailApi;
}

describe("usePublicMemoryDetail", () => {
  it("starts in loading", () => {
    const api = mockApi();
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    expect(result.current.memory.status).toBe("loading");
    expect(result.current.tree.status).toBe("loading");
  });

  it("transitions to success for both on resolve", async () => {
    const api = mockApi();
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(result.current.memory.data?.title).toBe("기억");
    expect(result.current.tree.data?.title).toBe("트리");
  });

  it("transitions memory to not-found on 404", async () => {
    const api = mockApi({ fetchMemory: vi.fn().mockRejectedValue(apiError(404)) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("not-found"));
  });

  it("transitions memory to malformed on PublicMemoryResponseError", async () => {
    const api = mockApi({ fetchMemory: vi.fn().mockRejectedValue(new PublicMemoryResponseError()) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("malformed"));
  });

  it("transitions memory to error on generic error", async () => {
    const api = mockApi({ fetchMemory: vi.fn().mockRejectedValue(new Error("fail")) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("error"));
  });

  it("retryMemory recovers", async () => {
    let calls = 0;
    const api = mockApi({ fetchMemory: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve(memory()); }) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("error"));
    act(() => result.current.retryMemory());
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
  });

  it("detects membership mismatch", async () => {
    const api = mockApi({ fetchMemory: vi.fn().mockResolvedValue(memory({ treeId: "other-tree" })) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("membership-mismatch"));
  });

  it("preserves memory success when tree fails (partial success)", async () => {
    const api = mockApi({ fetchTree: vi.fn().mockRejectedValue(new Error("tree fail")) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));
    expect(result.current.memory.data?.title).toBe("기억");
  });

  it("retryTree recovers", async () => {
    let calls = 0;
    const api = mockApi({ fetchTree: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve(detail()); }) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));
    act(() => result.current.retryTree());
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
  });

  it("unmount aborts memory request — final data rejected", async () => {
    let resolveMem!: (v: PublicTreeMemory) => void;
    const memPromise = new Promise<PublicTreeMemory>(resolve => { resolveMem = resolve; });
    const memorySignalRef: { current?: AbortSignal } = {};
    const api = mockApi({
      fetchMemory: vi.fn((_id: string, signal?: AbortSignal) => { memorySignalRef.current = signal; return memPromise; }),
    });
    const { result, unmount } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    unmount();
    act(() => resolveMem(memory()));
    expect(memorySignalRef.current?.aborted).toBe(true);
    expect(result.current.memory.status).toBe("loading");
  });

  it("unmount aborts tree request", async () => {
    let resolveTree!: (v: PublicTreeDetail) => void;
    const treePromise = new Promise<PublicTreeDetail>(resolve => { resolveTree = resolve; });
    const treeSignalRef: { current?: AbortSignal } = {};
    const api = mockApi({
      fetchTree: vi.fn((_id: string, signal?: AbortSignal) => { treeSignalRef.current = signal; return treePromise; }),
    });
    const { unmount } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    unmount();
    act(() => resolveTree(detail()));
    expect(treeSignalRef.current?.aborted).toBe(true);
  });

  it("uses separate AbortSignals for memory and tree", () => {
    const signals: AbortSignal[] = [];
    const api = mockApi({
      fetchMemory: vi.fn((_id: string, signal?: AbortSignal) => { signals.push(signal!); return Promise.resolve(memory()); }),
      fetchTree: vi.fn((_id: string, signal?: AbortSignal) => { signals.push(signal!); return Promise.resolve(detail()); }),
    });
    renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    expect(signals).toHaveLength(2);
    expect(signals[0]).not.toBe(signals[1]);
  });

  it("memory retry aborts previous memory controller", async () => {
    const signals: AbortSignal[] = [];
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, signal?: AbortSignal) => { signals.push(signal!); return new Promise<PublicTreeMemory>(() => {}); }) as PublicMemoryDetailApi["fetchMemory"],
      fetchTree: ((_id: string, _signal?: AbortSignal) => Promise.resolve(detail())) as PublicMemoryDetailApi["fetchTree"],
    };
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(signals.length).toBe(1));
    act(() => result.current.retryMemory());
    await waitFor(() => expect(signals.length).toBe(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("tree retry aborts previous tree controller", async () => {
    const signals: AbortSignal[] = [];
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, _signal?: AbortSignal) => Promise.resolve(memory())) as PublicMemoryDetailApi["fetchMemory"],
      fetchTree: ((_id: string, signal?: AbortSignal) => { signals.push(signal!); return new Promise<PublicTreeDetail>(() => {}); }) as PublicMemoryDetailApi["fetchTree"],
    };
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(signals.length).toBe(1));
    act(() => result.current.retryTree());
    await waitFor(() => expect(signals.length).toBe(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("memory abort does not abort tree request", async () => {
    const memSignals: AbortSignal[] = [];
    const treeSignals: AbortSignal[] = [];
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, signal?: AbortSignal) => { memSignals.push(signal!); return new Promise<PublicTreeMemory>(() => {}); }) as PublicMemoryDetailApi["fetchMemory"],
      fetchTree: ((_id: string, signal?: AbortSignal) => { treeSignals.push(signal!); return new Promise<PublicTreeDetail>(() => {}); }) as PublicMemoryDetailApi["fetchTree"],
    };
    renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(memSignals.length).toBe(1));
    await waitFor(() => expect(treeSignals.length).toBe(1));
    expect(memSignals[0].aborted).toBe(false);
    expect(treeSignals[0].aborted).toBe(false);
  });

  it("route change ignores stale memory response", async () => {
    let resolveOld!: (v: PublicTreeMemory) => void;
    const oldPromise = new Promise<PublicTreeMemory>(resolve => { resolveOld = resolve; });
    let resolveNew!: (v: PublicTreeMemory) => void;
    const newPromise = new Promise<PublicTreeMemory>(resolve => { resolveNew = resolve; });
    let callCount = 0;
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, _signal?: AbortSignal) => { callCount++; return callCount === 1 ? oldPromise : newPromise; }) as PublicMemoryDetailApi["fetchMemory"],
      fetchTree: ((_id: string, _signal?: AbortSignal) => Promise.resolve(detail())) as PublicMemoryDetailApi["fetchTree"],
    };
    const { result, rerender } = renderHook(
      (props: { tId: string; mId: string }) => usePublicMemoryDetail(props.tId, props.mId, api),
      { initialProps: { tId: "tree-1", mId: "mem-1" } },
    );
    rerender({ tId: "tree-2", mId: "mem-2" });
    act(() => { resolveNew!(memory({ id: "mem-2", title: "새 기억", treeId: "tree-2" })); });
    act(() => { resolveOld!(memory({ id: "mem-1", title: "오래된 기억", treeId: "tree-1" })); });
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
    expect(result.current.memory.data?.id).toBe("mem-2");
  });

  it("route change ignores stale tree response", async () => {
    let resolveOld!: (v: PublicTreeDetail) => void;
    const oldPromise = new Promise<PublicTreeDetail>(resolve => { resolveOld = resolve; });
    let resolveNew!: (v: PublicTreeDetail) => void;
    const newPromise = new Promise<PublicTreeDetail>(resolve => { resolveNew = resolve; });
    let callCount = 0;
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, _signal?: AbortSignal) => Promise.resolve(memory({ id: "mem-2", treeId: "tree-2" }))) as PublicMemoryDetailApi["fetchMemory"],
      fetchTree: ((_id: string, _signal?: AbortSignal) => { callCount++; return callCount === 1 ? oldPromise : newPromise; }) as PublicMemoryDetailApi["fetchTree"],
    };
    const { result, rerender } = renderHook(
      (props: { tId: string; mId: string }) => usePublicMemoryDetail(props.tId, props.mId, api),
      { initialProps: { tId: "tree-1", mId: "mem-1" } },
    );
    rerender({ tId: "tree-2", mId: "mem-2" });
    act(() => { resolveNew!(detail({ id: "tree-2", title: "새 트리" })); });
    act(() => { resolveOld!(detail({ id: "tree-1", title: "오래된 트리" })); });
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(result.current.tree.data?.id).toBe("tree-2");
  });

  it("memory retry ignores earlier stale response", async () => {
    let resolveFirst!: (v: PublicTreeMemory) => void;
    const firstPromise = new Promise<PublicTreeMemory>(resolve => { resolveFirst = resolve; });
    let resolveSecond!: (v: PublicTreeMemory) => void;
    const secondPromise = new Promise<PublicTreeMemory>(resolve => { resolveSecond = resolve; });
    let callCount = 0;
    const api = mockApi({ fetchMemory: vi.fn(() => { callCount++; return callCount === 1 ? firstPromise : secondPromise; }) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    act(() => result.current.retryMemory());
    act(() => { resolveFirst!(memory({ id: "mem-stale", title: "오래된 응답", treeId: "tree-1" })); });
    act(() => { resolveSecond!(memory({ id: "mem-retry-final", title: "최종 응답", treeId: "tree-1" })); });
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
    expect(result.current.memory.data?.id).toBe("mem-retry-final");
  });

  it("tree retry ignores earlier stale response", async () => {
    let resolveFirst!: (v: PublicTreeDetail) => void;
    const firstPromise = new Promise<PublicTreeDetail>(resolve => { resolveFirst = resolve; });
    let resolveSecond!: (v: PublicTreeDetail) => void;
    const secondPromise = new Promise<PublicTreeDetail>(resolve => { resolveSecond = resolve; });
    let callCount = 0;
    const api = mockApi({ fetchTree: vi.fn(() => { callCount++; return callCount === 1 ? firstPromise : secondPromise; }) });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    act(() => result.current.retryTree());
    act(() => { resolveFirst!(detail({ id: "tree-stale", title: "오래된 트리" })); });
    act(() => { resolveSecond!(detail({ id: "tree-final", title: "최종 트리" })); });
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
    expect(result.current.tree.data?.id).toBe("tree-final");
  });
});
