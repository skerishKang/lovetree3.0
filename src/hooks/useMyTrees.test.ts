import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api/myTrees", () => ({
  MyTreesResponseError: class MyTreesResponseError extends Error {
    constructor() {
      super("내 트리 응답 형식이 올바르지 않습니다.");
      this.name = "MyTreesResponseError";
    }
  },
  myTreesApi: { fetchTrees: vi.fn() },
}));

vi.mock("../context/authSession", () => ({
  emitSessionExpired: vi.fn(),
}));

import { MyTreesResponseError } from "../api/myTrees";
import type { OwnerTreeSummary } from "../types/myTrees";
import type { MyTreesApi } from "../api/myTrees";
import { emitSessionExpired } from "../context/authSession";
import { useMyTrees } from "./useMyTrees";

function item(overrides: Partial<OwnerTreeSummary> = {}): OwnerTreeSummary {
  return { id: "t1", title: "내 트리", visibility: "public", groupName: "", keywords: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: null, memoryCount: 3, ...overrides } as OwnerTreeSummary;
}

function apiError(status: number) {
  const err = new Error("API error") as Error & { status: number; code: string; retryable: boolean; rawCategory: string };
  err.status = status; err.code = "ERR"; err.retryable = true; err.rawCategory = "social";
  return err;
}

function mockApi(override?: Partial<MyTreesApi>): MyTreesApi {
  return { fetchTrees: vi.fn().mockResolvedValue([item()]), ...override } as MyTreesApi;
}

describe("useMyTrees", () => {
  it("starts in loading", () => {
    const api = mockApi();
    const { result } = renderHook(() => useMyTrees(api));
    expect(result.current.status).toBe("loading");
  });

  it("transitions to success with items", async () => {
    const api = mockApi();
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(1);
  });

  it("transitions to empty on []", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockResolvedValue([]) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("empty"));
  });

  it("transitions to server-error on 500", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(500)) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("server-error"));
  });

  it("transitions to network-error on generic error", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(new Error("network")) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("network-error"));
  });

  it("transitions to malformed on MyTreesResponseError", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(new MyTreesResponseError()) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("malformed"));
  });

  it("transitions to forbidden on 403", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(403)) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("forbidden"));
  });

  it("401 fires emitSessionExpired with source persistent-401 returnTo /my-trees exactly once", async () => {
    const single = vi.mocked(emitSessionExpired);
    single.mockClear();
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(401)) });
    const { result, rerender } = renderHook((a: MyTreesApi = api) => useMyTrees(a));
    await waitFor(() => expect(result.current.status).toBe("unauthorized"));
    expect(single).toHaveBeenCalledTimes(1);
    expect(single).toHaveBeenCalledWith({ source: "persistent-401", returnTo: "/my-trees" });
    rerender(api);
    await waitFor(() => expect(result.current.status).toBe("unauthorized"));
    expect(single).toHaveBeenCalledTimes(1);
    const api2 = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(401)) });
    rerender(api2);
    await new Promise(r => setTimeout(r, 50));
    expect(single).toHaveBeenCalledTimes(1);
  });

  it("transitions to retrying on user retry, then success", async () => {
    let calls = 0;
    const api = mockApi({
      fetchTrees: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve([item()]); }),
    });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("network-error"));
    act(() => result.current.retry());
    expect(result.current.status).toBe("retrying");
    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("retry aborts previous request signal", async () => {
    const signals: AbortSignal[] = [];
    const api: MyTreesApi = {
      fetchTrees: ((signal?: AbortSignal) => { signals.push(signal!); return new Promise<OwnerTreeSummary[]>(() => {}); }) as MyTreesApi["fetchTrees"],
    };
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(signals.length).toBe(1));
    act(() => result.current.retry());
    await waitFor(() => expect(signals.length).toBe(2));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
  });

  it("stale first success cannot overwrite second success", async () => {
    let resolveFirst!: (v: OwnerTreeSummary[]) => void;
    const firstPromise = new Promise<OwnerTreeSummary[]>(r => { resolveFirst = r; });
    let resolveSecond!: (v: OwnerTreeSummary[]) => void;
    const secondPromise = new Promise<OwnerTreeSummary[]>(r => { resolveSecond = r; });
    let callCount = 0;
    const api: MyTreesApi = {
      fetchTrees: ((_signal?: AbortSignal) => { callCount++; return callCount === 1 ? firstPromise : secondPromise; }) as MyTreesApi["fetchTrees"],
    };
    const { result } = renderHook(() => useMyTrees(api));
    act(() => result.current.retry());
    act(() => { resolveSecond!([item({ id: "t2", title: "최종" })]); });
    act(() => { resolveFirst!([item({ id: "t1", title: "오래된" })]); });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items[0].id).toBe("t2");
  });

  it("stale first failure cannot overwrite second success", async () => {
    let rejectFirst!: (e: Error) => void;
    const firstPromise = new Promise<OwnerTreeSummary[]>((_, reject) => { rejectFirst = reject; });
    let resolveSecond!: (v: OwnerTreeSummary[]) => void;
    const secondPromise = new Promise<OwnerTreeSummary[]>(r => { resolveSecond = r; });
    let callCount = 0;
    const api: MyTreesApi = {
      fetchTrees: ((_signal?: AbortSignal) => { callCount++; return callCount === 1 ? firstPromise : secondPromise; }) as MyTreesApi["fetchTrees"],
    };
    const { result } = renderHook(() => useMyTrees(api));
    act(() => result.current.retry());
    act(() => { resolveSecond!([item()]); });
    act(() => { rejectFirst!(new Error("stale")); });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(1);
  });

  it("unmount aborts request and ignores resolution", async () => {
    let resolve!: (v: OwnerTreeSummary[]) => void;
    const signalRef: { current?: AbortSignal } = {};
    const api: MyTreesApi = {
      fetchTrees: ((signal?: AbortSignal) => { signalRef.current = signal; return new Promise<OwnerTreeSummary[]>(r => { resolve = r; }); }) as MyTreesApi["fetchTrees"],
    };
    const { result, unmount } = renderHook(() => useMyTrees(api));
    unmount();
    act(() => resolve([item()]));
    expect(signalRef.current?.aborted).toBe(true);
    expect(result.current.status).toBe("loading");
  });

  it("multiple retries preserve newest generation only", async () => {
    const signals: AbortSignal[] = [];
    const resolves: Array<(v: OwnerTreeSummary[]) => void> = [];
    const api: MyTreesApi = {
      fetchTrees: ((signal?: AbortSignal) => {
        signals.push(signal!);
        return new Promise<OwnerTreeSummary[]>(r => { resolves.push(r); });
      }) as MyTreesApi["fetchTrees"],
    };
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(signals.length).toBe(1));
    act(() => result.current.retry());
    act(() => result.current.retry());
    act(() => result.current.retry());
    await waitFor(() => expect(signals.length).toBe(4));
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(true);
    expect(signals[2].aborted).toBe(true);
    expect(signals[3].aborted).toBe(false);
    act(() => { resolves[3]!([item({ id: "t-latest", title: "최신" })]); });
    act(() => { resolves[0]!([item({ id: "t-stale", title: "stale" })]); });
    act(() => { resolves[1]!([item({ id: "t-stale2", title: "stale2" })]); });
    act(() => { resolves[2]!([item({ id: "t-stale3", title: "stale3" })]); });
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items[0].id).toBe("t-latest");
  });
});
