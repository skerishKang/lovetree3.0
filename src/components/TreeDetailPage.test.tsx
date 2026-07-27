import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, within, fireEvent } from "@testing-library/react";
import { createMemoryRouter, RouterProvider, useLocation } from "react-router-dom";
import { AppRoutes } from "../App";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location" style={{ display: "none" }}>
      {location.pathname}
    </div>
  );
}

function renderRoute(initialEntries: string[]) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <>
            <AppRoutes />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function currentLocation() {
  return screen.getByTestId("location").textContent ?? "";
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function mockTreePayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "tree-abc",
    title: "공개 테스트 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 2,
    likeCount: 5,
    viewCount: 100,
    ...overrides,
  };
}

function mockMemoryPayload(overrides: Record<string, unknown> = {}) {
  return {
    id: "mem-1",
    treeId: "tree-abc",
    parentId: null,
    title: "기억 제목",
    memo: "기억 본문",
    artist: "아티스트",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc123",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    emotionTags: ["설렘"],
    timestamp: "2026-07-20T10:00:00.000Z",
    visibility: "public",
    channelId: null,
    channelName: null,
    channelUrl: null,
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    ...overrides,
  };
}

function setupApi(
  treePayload: unknown,
  memoriesPayload: unknown,
  treeStatus = 200,
  memoriesStatus = 200,
) {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: RequestInfo | URL) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/")) {
        return Promise.resolve(jsonResponse(treePayload, treeStatus));
      }
      if (urlStr.includes("/api/community/memories")) {
        return Promise.resolve(jsonResponse(memoriesPayload, memoriesStatus));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    }),
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("TreeDetailPage — /tree/:treeId public read states", () => {
  it("renders a tree loading skeleton on direct entry", () => {
    setupApi(
      new Promise(() => {}),
      new Promise(() => {}),
    );
    renderRoute(["/tree/tree-abc"]);

    expect(screen.getByRole("status")).toHaveTextContent(
      "공개 러브트리를 불러오는 중입니다",
    );
  });

  it("renders tree success with header and memories", async () => {
    setupApi(mockTreePayload(), [mockMemoryPayload()]);
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByRole("heading", { name: "공개 테스트 트리" })).toBeInTheDocument();
    expect(screen.getByText("기억 2개")).toBeInTheDocument();
    expect(await screen.findByText("기억 제목")).toBeInTheDocument();
    expect(screen.getByText("좋아요 5")).toBeInTheDocument();
    expect(screen.getByText("조회 100")).toBeInTheDocument();
  });

  it("renders tree 404 state", async () => {
    setupApi({ error: "not found", code: "NOT_FOUND", message: "Not Found", retryable: false, rawCategory: "social" }, [], 404);
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByText("공개 러브트리를 찾을 수 없습니다")).toBeInTheDocument();
    expect(screen.getByText(/삭제되었거나 공개 범위가 변경된/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Community로 돌아가기" })).toHaveAttribute("href", "/community");
  });

  it("renders tree malformed state with retry", async () => {
    setupApi({ invalid: true }, []);
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "공개 러브트리 응답을 확인할 수 없습니다.",
    );
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeInTheDocument();
  });

  it("renders tree error state with retry and recovers", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: RequestInfo | URL) => {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("/api/trees/")) {
          calls += 1;
          return calls === 1
            ? Promise.reject(new Error("network error"))
            : Promise.resolve(jsonResponse(mockTreePayload()));
        }
        if (urlStr.includes("/api/community/memories")) {
          return Promise.resolve(jsonResponse([]));
        }
        return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
      }),
    );
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "공개 러브트리를 불러오지 못했습니다.",
    );
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));

    expect(await screen.findByRole("heading", { name: "공개 테스트 트리" })).toBeInTheDocument();
  });

  it("renders memories empty state", async () => {
    setupApi(mockTreePayload(), []);
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByRole("heading", { name: "공개 테스트 트리" })).toBeInTheDocument();
    expect(screen.getByText("아직 공개된 기억이 없습니다.")).toBeInTheDocument();
  });

  it("renders memories error with retry and recovers", async () => {
    let calls = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn((url: RequestInfo | URL) => {
        const urlStr = typeof url === "string" ? url : url.toString();
        if (urlStr.includes("/api/trees/")) {
          return Promise.resolve(jsonResponse(mockTreePayload()));
        }
        if (urlStr.includes("/api/community/memories")) {
          calls += 1;
          return calls === 1
            ? Promise.reject(new Error("memories error"))
            : Promise.resolve(jsonResponse([mockMemoryPayload({ title: "재시도된 기억" })]));
        }
        return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
      }),
    );
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByRole("heading", { name: "공개 테스트 트리" })).toBeInTheDocument();
    const partialSuccess = await screen.findByTestId("partial-success");
    expect(partialSuccess).toHaveTextContent("공개 기억을 불러오지 못했습니다.");
    fireEvent.click(within(partialSuccess).getByRole("button", { name: "기억 다시 시도" }));

    expect(await screen.findByText("재시도된 기억")).toBeInTheDocument();
  });

  it("partial success: tree header visible when memories fail", async () => {
    setupApi(mockTreePayload({ title: "트리 헤더 유지됨" }), null, 200, 500);
    renderRoute(["/tree/tree-abc"]);

    expect(await screen.findByText("트리 헤더 유지됨")).toBeInTheDocument();
    const partialSuccess = await screen.findByTestId("partial-success");
    expect(partialSuccess).toBeInTheDocument();
  });

  it("removes unsupported mock-only content", async () => {
    setupApi(mockTreePayload(), [mockMemoryPayload()]);
    renderRoute(["/tree/tree-abc"]);

    await screen.findByRole("heading", { name: "공개 테스트 트리" });
    expect(screen.queryByText(/작성자|author/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/스토리|story|narrative/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/카테고리|category/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /좋아요|저장|공유|댓글/ })).not.toBeInTheDocument();
    expect(screen.queryByTestId("timeline-featured-badge")).not.toBeInTheDocument();
    const memoryCards = screen.getAllByTestId("timeline-memory-card");
    expect(memoryCards.length).toBeGreaterThan(0);
    memoryCards.forEach((card) => {
      expect(card.closest("a")).toBeNull();
    });
  });

  it("back button navigates to /community fallback", async () => {
    setupApi(mockTreePayload(), [mockMemoryPayload()]);
    renderRoute(["/tree/tree-abc"]);

    await screen.findByRole("heading", { name: "공개 테스트 트리" });
    expect(currentLocation()).toBe("/tree/tree-abc");

    const backButton = screen.getByRole("button", { name: "뒤로 가기" });
    fireEvent.click(backButton);

    expect(currentLocation()).toBe("/community");
  });

  it("performs no backend writes", async () => {
    const fetchSpy = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/")) {
        return Promise.resolve(jsonResponse(mockTreePayload()));
      }
      if (urlStr.includes("/api/community/memories")) {
        return Promise.resolve(jsonResponse([mockMemoryPayload()]));
      }
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    });
    vi.stubGlobal("fetch", fetchSpy);
    renderRoute(["/tree/tree-abc"]);

    await screen.findByRole("heading", { name: "공개 테스트 트리" });

    const allCalls = fetchSpy.mock.calls.map((call: unknown[]) => {
      const input = call[0] as RequestInfo | URL;
      return {
        url: typeof input === "string" ? input : input.toString(),
        method: "GET",
      };
    });
    allCalls.forEach((call) => {
      expect(call.method).toBe("GET");
    });
    const nonGet = allCalls.filter((c) => c.method !== "GET");
    expect(nonGet).toHaveLength(0);
  });

  it("sends no Authorization header", async () => {
    const fetchSpy = vi.fn((url: RequestInfo | URL, _init?: RequestInit) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/") || urlStr.includes("/api/community/memories")) {
        return Promise.resolve(
          urlStr.includes("/api/trees/")
            ? jsonResponse(mockTreePayload())
            : jsonResponse([mockMemoryPayload()]),
        );
      }
      return Promise.resolve(jsonResponse({ error: "unexpected" }, 404));
    });
    vi.stubGlobal("fetch", fetchSpy);
    renderRoute(["/tree/tree-abc"]);

    await screen.findByRole("heading", { name: "공개 테스트 트리" });

    const apiCalls = fetchSpy.mock.calls.filter(
      (call: unknown[]) =>
        typeof call[0] === "string" && (call[0] as string).includes("/api/"),
    );
    expect(apiCalls.length).toBeGreaterThan(0);
    apiCalls.forEach((call: unknown[]) => {
      const secondArg = call[1] as Record<string, unknown> | undefined;
      if (secondArg && typeof secondArg.headers === "object" && secondArg.headers) {
        const headers = new Headers(secondArg.headers as HeadersInit);
        expect(headers.has("Authorization")).toBe(false);
      }
    });
  });
});
