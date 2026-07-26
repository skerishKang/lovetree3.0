import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CommunityApi } from "../api/community";
import type { CommunityTreeSnapshot } from "../types/community";
import { useCommunityTrees } from "./useCommunityTrees";

function tree(id: string, stage = "mature"): CommunityTreeSnapshot {
  return {
    id,
    title: `트리 ${id}`,
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    representativeThumbnail: "",
    representativeMemorySourceUrl: "",
    memoryCount: stage === "growing" ? 1 : 3,
    emotionTags: ["행복"],
    stage,
    theme: "",
    timeRange: "",
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

describe("useCommunityTrees", () => {
  it("loads main and growing lists independently", async () => {
    const api: CommunityApi = {
      fetchMain: vi.fn().mockResolvedValue([tree("main")]),
      fetchGrowing: vi.fn().mockResolvedValue([tree("growing", "growing")]),
    };

    const { result } = renderHook(() => useCommunityTrees(api));

    expect(result.current.main.status).toBe("loading");
    expect(result.current.growing.status).toBe("loading");
    await waitFor(() => expect(result.current.main.status).toBe("success"));
    await waitFor(() => expect(result.current.growing.status).toBe("success"));
    expect(result.current.main.items[0].id).toBe("main");
    expect(result.current.growing.items[0].id).toBe("growing");
  });

  it("reports independent empty states", async () => {
    const api: CommunityApi = {
      fetchMain: vi.fn().mockResolvedValue([]),
      fetchGrowing: vi.fn().mockResolvedValue([]),
    };

    const { result } = renderHook(() => useCommunityTrees(api));

    await waitFor(() => expect(result.current.main.status).toBe("empty"));
    await waitFor(() => expect(result.current.growing.status).toBe("empty"));
  });

  it("supports main error and explicit retry", async () => {
    const fetchMain = vi.fn()
      .mockRejectedValueOnce(new Error("main failed"))
      .mockResolvedValueOnce([tree("recovered")]);
    const api = {
      fetchMain,
      fetchGrowing: vi.fn().mockResolvedValue([]),
    } as unknown as CommunityApi;

    const { result } = renderHook(() => useCommunityTrees(api));

    await waitFor(() => expect(result.current.main.status).toBe("error"));
    expect(result.current.main.error).toBe("공개 러브트리를 불러오지 못했습니다.");

    act(() => result.current.retryMain());

    expect(result.current.main.status).toBe("loading");
    await waitFor(() => expect(result.current.main.status).toBe("success"));
    expect(result.current.main.items[0].id).toBe("recovered");
    expect(fetchMain).toHaveBeenCalledTimes(2);
  });

  it("keeps a successful main list when growing fails and retries growing only", async () => {
    const fetchGrowing = vi.fn()
      .mockRejectedValueOnce(new Error("growing failed"))
      .mockResolvedValueOnce([tree("new", "growing")]);
    const api = {
      fetchMain: vi.fn().mockResolvedValue([tree("main")]),
      fetchGrowing,
    } as unknown as CommunityApi;

    const { result } = renderHook(() => useCommunityTrees(api));

    await waitFor(() => expect(result.current.main.status).toBe("success"));
    await waitFor(() => expect(result.current.growing.status).toBe("error"));
    expect(result.current.main.items[0].id).toBe("main");

    act(() => result.current.retryGrowing());

    await waitFor(() => expect(result.current.growing.status).toBe("success"));
    expect(result.current.growing.items[0].id).toBe("new");
    expect(fetchGrowing).toHaveBeenCalledTimes(2);
  });

  it("aborts both requests on unmount and ignores their later completion", async () => {
    const mainRequest = deferred<CommunityTreeSnapshot[]>();
    const growingRequest = deferred<CommunityTreeSnapshot[]>();
    let mainSignal: AbortSignal | undefined;
    let growingSignal: AbortSignal | undefined;
    const api: CommunityApi = {
      fetchMain: vi.fn((signal) => {
        mainSignal = signal;
        return mainRequest.promise;
      }),
      fetchGrowing: vi.fn((signal) => {
        growingSignal = signal;
        return growingRequest.promise;
      }),
    };

    const { unmount } = renderHook(() => useCommunityTrees(api));
    await waitFor(() => expect(api.fetchMain).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(api.fetchGrowing).toHaveBeenCalledTimes(1));

    unmount();

    expect(mainSignal?.aborted).toBe(true);
    expect(growingSignal?.aborted).toBe(true);
    mainRequest.resolve([tree("late-main")]);
    growingRequest.resolve([tree("late-growing", "growing")]);
  });

  it("aborts an older main request when retry starts", async () => {
    const first = deferred<CommunityTreeSnapshot[]>();
    const second = deferred<CommunityTreeSnapshot[]>();
    const signals: AbortSignal[] = [];
    const fetchMain = vi.fn((signal?: AbortSignal) => {
      if (signal) signals.push(signal);
      return signals.length === 1 ? first.promise : second.promise;
    });
    const api = {
      fetchMain,
      fetchGrowing: vi.fn().mockResolvedValue([]),
    } as unknown as CommunityApi;

    const { result } = renderHook(() => useCommunityTrees(api));
    await waitFor(() => expect(fetchMain).toHaveBeenCalledTimes(1));

    act(() => result.current.retryMain());
    expect(signals[0].aborted).toBe(true);
    second.resolve([tree("fresh")]);
    first.resolve([tree("stale")]);

    await waitFor(() => expect(result.current.main.status).toBe("success"));
    expect(result.current.main.items.map((item) => item.id)).toEqual(["fresh"]);
  });
});
