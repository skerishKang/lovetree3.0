import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { AppRoutes } from "../App";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null, loading: false, tier: null,
    signInWithGoogle: vi.fn(), signOut: vi.fn(), expireSession: vi.fn(),
  }),
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location" style={{ display: "none" }}>{location.pathname}</div>;
}

function renderRoute(initialEntries: string[]) {
  const router = createMemoryRouter([{ path: "*", element: <><AppRoutes /><LocationProbe /></> }], { initialEntries });
  render(<RouterProvider router={router} />);
  return router;
}

function currentLocation() {
  return screen.getByTestId("location").textContent ?? "";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8" } });
}

function mockMemoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "mem-abc", treeId: "tree-abc", parentId: null,
    title: "테스트 기억", memo: "기억 본문 내용",
    artist: "테스트 아티스트", source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc123",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    emotionTags: ["설렘", "행복"],
    timestamp: "2026-07-20T10:00:00.000Z",
    visibility: "public",
    channelId: "UC123", channelName: "테스트 채널",
    channelUrl: "https://www.youtube.com/@test",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    ...overrides,
  };
}

function mockTreePayload() {
  return { id: "tree-abc", title: "트리", visibility: "public", createdAt: "2026-07-20T10:00:00.000Z", updatedAt: "2026-07-26T10:00:00.000Z", memoryCount: 5, likeCount: 3, viewCount: 10 };
}

function setupApi(memoryPayload: unknown, treePayload: unknown, memStatus = 200, treeStatus = 200) {
  vi.stubGlobal("fetch", vi.fn((url: RequestInfo | URL) => {
    const urlStr = typeof url === "string" ? url : url.toString();
    if (urlStr.includes("/api/memories/")) return Promise.resolve(jsonResponse(memoryPayload, memStatus));
    if (urlStr.includes("/api/trees/")) return Promise.resolve(jsonResponse(treePayload, treeStatus));
    return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
  }));
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

describe("MemoryDetailPage — /tree/:treeId/memory/:memoryId", () => {
  it("shows loading state on direct entry", () => {
    setupApi(new Promise(() => {}), new Promise(() => {}));
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(screen.getByRole("status")).toHaveTextContent("공개 기억을 불러오는 중입니다");
  });

  it("renders success memory with full details", async () => {
    setupApi(mockMemoryPayload(), mockTreePayload());
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByText("테스트 기억")).toBeInTheDocument();
    expect(screen.getByText("기억 본문 내용")).toBeInTheDocument();
    expect(screen.getByText("테스트 아티스트")).toBeInTheDocument();
    expect(screen.getAllByText("YouTube").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("테스트 채널")).toBeInTheDocument();
    expect(screen.getByText("#설렘")).toBeInTheDocument();
    expect(screen.getByText("#행복")).toBeInTheDocument();
  });

  it("renders tree context when tree API succeeds", async () => {
    setupApi(mockMemoryPayload(), mockTreePayload());
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByTestId("memory-tree-context")).toHaveTextContent("트리");
    expect(screen.getByText("기억 5개")).toBeInTheDocument();
  });

  it("shows tree-context partial failure warning when tree API fails", async () => {
    setupApi(mockMemoryPayload(), mockTreePayload(), 200, 500);
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByText("테스트 기억")).toBeInTheDocument();
    expect(screen.getByTestId("memory-tree-partial")).toHaveTextContent("트리 정보를 불러오지 못했습니다.");
  });

  it("shows 404 state", async () => {
    setupApi({ error: "not found", code: "NOT_FOUND", message: "Not Found", retryable: false, rawCategory: "social" }, mockTreePayload(), 404);
    renderRoute(["/tree/tree-abc/memory/mem-xyz"]);
    expect(await screen.findByText("공개 기억을 찾을 수 없습니다.")).toBeInTheDocument();
  });

  it("shows malformed state with retry", async () => {
    setupApi({ invalid: true }, mockTreePayload());
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByRole("alert")).toHaveTextContent("공개 기억 응답을 확인할 수 없습니다.");
  });

  it("shows error state with retry and recovers", async () => {
    let calls = 0;
    vi.stubGlobal("fetch", vi.fn((url: RequestInfo | URL) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/memories/")) {
        calls++;
        return calls === 1 ? Promise.reject(new Error("fail")) : Promise.resolve(jsonResponse(mockMemoryPayload()));
      }
      if (urlStr.includes("/api/trees/")) return Promise.resolve(jsonResponse(mockTreePayload()));
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    }));
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByRole("alert")).toHaveTextContent("공개 기억을 불러오지 못했습니다.");
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(await screen.findByText("테스트 기억")).toBeInTheDocument();
  });

  it("shows membership mismatch for unrelated treeId", async () => {
    setupApi(mockMemoryPayload({ treeId: "other-tree" }), mockTreePayload());
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    expect(await screen.findByText(/속하지 않습니다/)).toBeInTheDocument();
  });

  it("sends no Authorization header", async () => {
    const fetchSpy = vi.fn((url: RequestInfo | URL) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/memories/")) return Promise.resolve(jsonResponse(mockMemoryPayload()));
      if (urlStr.includes("/api/trees/")) return Promise.resolve(jsonResponse(mockTreePayload()));
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    });
    vi.stubGlobal("fetch", fetchSpy);
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    await screen.findByText("테스트 기억");
    const apiCalls = fetchSpy.mock.calls.filter((c: unknown[]) => typeof c[0] === "string" && (c[0] as string).includes("/api/"));
    expect(apiCalls.length).toBeGreaterThan(0);
    for (const call of apiCalls) {
      const args = call as unknown[];
      const init = args.length > 1 ? args[1] : undefined;
      if (init && typeof init === "object" && init !== null && "headers" in (init as Record<string, unknown>)) {
        const h = new Headers((init as Record<string, unknown>).headers as HeadersInit);
        expect(h.has("Authorization")).toBe(false);
      }
    }
  });

  it("back button navigates to /tree/:treeId", async () => {
    setupApi(mockMemoryPayload(), mockTreePayload());
    renderRoute(["/tree/tree-abc/memory/mem-abc"]);
    await screen.findByText("테스트 기억");
    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/tree/tree-abc");
  });

  it("shows mock placeholder on /memory/detail-demo", async () => {
    renderRoute(["/memory/detail-demo"]);
    expect(screen.getByText("기억 상세")).toBeInTheDocument();
    expect(screen.getByText("기억 상세 연결 준비 중")).toBeInTheDocument();
  });
});
