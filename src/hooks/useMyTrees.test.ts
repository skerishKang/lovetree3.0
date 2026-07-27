import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MyTreesResponseError } from "../api/myTrees";
import type { OwnerTreeSummary } from "../types/myTrees";
import type { MyTreesApi } from "../api/myTrees";
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
    expect(result.current.items[0].title).toBe("내 트리");
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

  it("transitions to unauthorized on 401", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(401)) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("unauthorized"));
  });

  it("transitions to forbidden on 403", async () => {
    const api = mockApi({ fetchTrees: vi.fn().mockRejectedValue(apiError(403)) });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("forbidden"));
  });

  it("retry recovers after error", async () => {
    let calls = 0;
    const api = mockApi({
      fetchTrees: vi.fn(() => { calls++; return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve([item()]); }),
    });
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(result.current.status).toBe("network-error"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toHaveLength(1);
  });

  it("unmount aborts request", async () => {
    let resolve!: (v: OwnerTreeSummary[]) => void;
    const api = mockApi({ fetchTrees: vi.fn(() => new Promise<OwnerTreeSummary[]>(r => { resolve = r; })) });
    const { result, unmount } = renderHook(() => useMyTrees(api));
    expect(result.current.status).toBe("loading");
    unmount();
    act(() => resolve([item()]));
    expect(result.current.status).toBe("loading");
  });

  it("retry aborts previous request", async () => {
    const signals: AbortSignal[] = [];
    const api: MyTreesApi = {
      fetchTrees: ((signal?: AbortSignal) => { signals.push(signal!); return new Promise<OwnerTreeSummary[]>(() => {}); }) as MyTreesApi["fetchTrees"],
    };
    const { result } = renderHook(() => useMyTrees(api));
    await waitFor(() => expect(signals.length).toBe(1));
    act(() => result.current.retry());
    await waitFor(() => expect(signals.length).toBe(2));
    expect(signals[0].aborted).toBe(true);
  });
});
