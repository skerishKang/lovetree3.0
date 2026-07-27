import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PublicMemoryResponseError } from "../api/publicMemoryDetail";
import type { PublicTreeDetail, PublicTreeMemory } from "../types/publicTreeDetail";
import type { PublicMemoryDetailApi } from "../api/publicMemoryDetail";
import { usePublicMemoryDetail } from "./usePublicMemoryDetail";

function detail(overrides: Record<string, unknown> = {}): PublicTreeDetail {
  return { id: "tree-1", title: "트리", visibility: "public", createdAt: "2026-01-01T00:00:00Z", updatedAt: null, memoryCount: 3, ...overrides } as PublicTreeDetail;
}

function memory(overrides: Record<string, unknown> = {}): PublicTreeMemory {
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
  it("starts in loading for memory and tree", () => {
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
    const api = mockApi({
      fetchMemory: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve(memory()); }),
    });
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
    const api = mockApi({
      fetchTree: vi.fn().mockRejectedValue(new Error("tree fail")),
    });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.memory.status).toBe("success"));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));
    expect(result.current.memory.data?.title).toBe("기억");
  });

  it("retryTree recovers", async () => {
    let calls = 0;
    const api = mockApi({
      fetchTree: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve(detail()); }),
    });
    const { result } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    await waitFor(() => expect(result.current.tree.status).toBe("error"));
    act(() => result.current.retryTree());
    await waitFor(() => expect(result.current.tree.status).toBe("success"));
  });

  it("unmount ignores responses", async () => {
    let resolveMem!: (v: PublicTreeMemory) => void;
    const memPromise = new Promise<PublicTreeMemory>(resolve => { resolveMem = resolve; });
    const api = mockApi({ fetchMemory: vi.fn(() => memPromise) });
    const { result, unmount } = renderHook(() => usePublicMemoryDetail("tree-1", "mem-1", api));
    unmount();
    act(() => resolveMem(memory()));
    expect(result.current.memory.status).toBe("loading");
  });

  it("ignores stale memory response after route change", async () => {
    let resolveOld!: (v: PublicTreeMemory) => void;
    const oldPromise = new Promise<PublicTreeMemory>(resolve => { resolveOld = resolve; });
    let resolveNew!: (v: PublicTreeMemory) => void;
    const newPromise = new Promise<PublicTreeMemory>(resolve => { resolveNew = resolve; });
    let callCount = 0;
    const api: PublicMemoryDetailApi = {
      fetchMemory: ((_id: string, _signal?: AbortSignal) => {
        callCount++;
        return callCount === 1 ? oldPromise : newPromise;
      }) as PublicMemoryDetailApi["fetchMemory"],
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
});
