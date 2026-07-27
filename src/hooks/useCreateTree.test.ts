import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../api/createTree", () => ({
  CreateTreeInputError: class CreateTreeInputError extends Error {
    field: "title" | "visibility";
    constructor(field: "title" | "visibility", message: string) {
      super(message);
      this.name = "CreateTreeInputError";
      this.field = field;
    }
  },
  CreateTreeResponseError: class CreateTreeResponseError extends Error {
    constructor() {
      super("트리 생성 응답 형식이 올바르지 않습니다.");
      this.name = "CreateTreeResponseError";
    }
  },
  createTreeApi: { createTree: vi.fn() },
}));

vi.mock("../context/authSession", () => ({
  emitSessionExpired: vi.fn(),
}));

import { CreateTreeResponseError } from "../api/createTree";
import type { CreateTreeApi } from "../api/createTree";
import type { CreatedTree } from "../types/createTree";
import { emitSessionExpired } from "../context/authSession";
import { useCreateTree } from "./useCreateTree";

function createdPayload(overrides: Record<string, unknown> = {}): CreatedTree {
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
  } as CreatedTree;
}

function apiError(status: number) {
  const err = new Error("API error") as Error & { status: number; code: string; retryable: boolean; rawCategory: string };
  err.status = status; err.code = "ERR"; err.retryable = true; err.rawCategory = "social";
  return err;
}

function mockApi(override?: Partial<CreateTreeApi>): CreateTreeApi {
  return { createTree: vi.fn().mockResolvedValue(createdPayload()), ...override } as CreateTreeApi;
}

describe("useCreateTree", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useCreateTree(mockApi()));
    expect(result.current.status).toBe("idle");
  });

  it("transitions to submitting then idle on success", async () => {
    const api = mockApi();
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    expect(result.current.status).toBe("submitting");
    await vi.waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.created?.title).toBe("내 러브트리");
  });

  it("double-click produces single POST", async () => {
    const api = mockApi();
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    act(() => result.current.submit({ title: "두 번째", visibility: "public" }));
    expect(api.createTree).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => expect(result.current.status).toBe("idle"));
    expect(api.createTree).toHaveBeenCalledTimes(1);
  });

  it("Enter/click race produces single POST", async () => {
    const api = mockApi();
    const { result } = renderHook(() => useCreateTree(api));
    act(() => { result.current.submit({ title: "첫 번째", visibility: "public" }); });
    act(() => { result.current.submit({ title: "두 번째", visibility: "public" }); });
    act(() => { result.current.submit({ title: "세 번째", visibility: "public" }); });
    expect(api.createTree).toHaveBeenCalledTimes(1);
  });

  it("unmount aborts request and ignores completion", async () => {
    let resolve!: (v: CreatedTree) => void;
    const signalRef: { current?: AbortSignal } = {};
    const api: CreateTreeApi = {
      createTree: ((_input: unknown, signal?: AbortSignal) => {
        signalRef.current = signal;
        return new Promise<CreatedTree>(r => { resolve = r; });
      }) as CreateTreeApi["createTree"],
    };
    const { result, unmount } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    unmount();
    act(() => resolve(createdPayload()));
    expect(signalRef.current?.aborted).toBe(true);
    expect(result.current.status).toBe("submitting");
  });

  it("unmount 후 late success — state update 없음", async () => {
    let resolve!: (v: CreatedTree) => void;
    const api: CreateTreeApi = {
      createTree: ((_input: unknown, _signal?: AbortSignal) => {
        return new Promise<CreatedTree>(r => { resolve = r; });
      }) as CreateTreeApi["createTree"],
    };
    const { result, unmount } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    expect(result.current.status).toBe("submitting");
    unmount();
    act(() => resolve(createdPayload({ id: "t-late", title: "늦음" })));
    expect(result.current.status).toBe("submitting");
    expect(result.current.created).toBeNull();
  });

  it("unmount 후 late failure — state update 없음", async () => {
    let reject!: (e: Error) => void;
    const api: CreateTreeApi = {
      createTree: ((_input: unknown, _signal?: AbortSignal) => {
        return new Promise<CreatedTree>((_, rj) => { reject = rj; });
      }) as CreateTreeApi["createTree"],
    };
    const { result, unmount } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    expect(result.current.status).toBe("submitting");
    unmount();
    act(() => reject(new Error("late failure")));
    expect(result.current.status).toBe("submitting");
  });

  it("transitions to validation-error on 400", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(400)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("validation-error"));
  });

  it("transitions to validation-error on 422", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(422)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("validation-error"));
  });

  it("401 fires emitSessionExpired with source persistent-401 returnTo /tree/new exactly once", async () => {
    const single = vi.mocked(emitSessionExpired);
    single.mockClear();
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(401)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("unauthorized"));
    expect(single).toHaveBeenCalledTimes(1);
    expect(single).toHaveBeenCalledWith({ source: "persistent-401", returnTo: "/tree/new" });
  });

  it("transitions to forbidden on 403", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(403)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "private" }));
    await vi.waitFor(() => expect(result.current.status).toBe("forbidden"));
  });

  it("transitions to conflict on 409", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(409)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("conflict"));
  });

  it("transitions to too-large on 413", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(413)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("too-large"));
  });

  it("transitions to ambiguous on 500", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(500)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("ambiguous"));
  });

  it("transitions to ambiguous on 503", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(503)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("ambiguous"));
  });

  it("transitions to ambiguous on network error", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(new Error("network")) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("ambiguous"));
  });

  it("transitions to malformed on CreateTreeResponseError", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(new CreateTreeResponseError()) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("malformed"));
  });

  it("no automatic retry after ambiguous result", async () => {
    const api = mockApi({ createTree: vi.fn().mockRejectedValue(apiError(500)) });
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("ambiguous"));
    expect(api.createTree).toHaveBeenCalledTimes(1);
  });

  it("sets correct created on success", async () => {
    const api = mockApi();
    const { result } = renderHook(() => useCreateTree(api));
    act(() => result.current.submit({ title: "내 트리", visibility: "public" }));
    await vi.waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.created).not.toBeNull();
    expect(result.current.created?.id).toBe("t-new");
    expect(Object.keys(result.current.created!)).not.toContain("ownerId");
  });
});
