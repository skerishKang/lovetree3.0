import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavigationHistoryProvider } from "../hooks/NavigationHistory";
import { usePublicTreeDetail } from "../hooks/usePublicTreeDetail";
import type {
  PublicTreeDetail,
  PublicTreeMemory,
} from "../types/publicTreeDetail";
import TreeDetailPage from "./TreeDetailPage";

vi.mock("../hooks/usePublicTreeDetail", () => ({
  usePublicTreeDetail: vi.fn(),
}));

const mockUsePublicTreeDetail = vi.mocked(usePublicTreeDetail);

function tree(overrides: Partial<PublicTreeDetail> = {}): PublicTreeDetail {
  return {
    id: "tree-123",
    title: "실제 공개 러브트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    memoryCount: 1,
    likeCount: 0,
    viewCount: 15,
    ...overrides,
  };
}

function memory(overrides: Partial<PublicTreeMemory> = {}): PublicTreeMemory {
  return {
    id: "memory-1",
    treeId: "tree-123",
    parentId: null,
    title: "실제 기억 제목",
    memo: "실제 기억 메모",
    artist: "실제 아티스트",
    source: "실제 출처",
    sourceUrl: "",
    sourceType: "note",
    thumbnail: "",
    emotionTags: ["행복"],
    timestamp: "2026-07-21T10:00:00.000Z",
    visibility: "public",
    channelId: null,
    channelName: null,
    channelUrl: null,
    createdAt: "2026-07-21T10:00:00.000Z",
    updatedAt: null,
    ...overrides,
  };
}

function renderPage(path = "/tree/tree-123") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <NavigationHistoryProvider>
        <Routes>
          <Route path="/tree/:treeId" element={<TreeDetailPage />} />
          <Route path="/community" element={<h1>Community</h1>} />
        </Routes>
      </NavigationHistoryProvider>
    </MemoryRouter>,
  );
}

function result(overrides: Record<string, unknown> = {}) {
  return {
    tree: { data: tree(), status: "success", error: null },
    memories: { items: [memory()], status: "success", error: null },
    retryTree: vi.fn(),
    retryMemories: vi.fn(),
    ...overrides,
  } as ReturnType<typeof usePublicTreeDetail>;
}

describe("TreeDetailPage", () => {
  beforeEach(() => {
    mockUsePublicTreeDetail.mockReset();
    mockUsePublicTreeDetail.mockReturnValue(result());
  });

  it("reads the dynamic treeId and renders only honest public data", () => {
    renderPage();

    expect(mockUsePublicTreeDetail).toHaveBeenCalledWith("tree-123");
    expect(screen.getByRole("heading", { name: "실제 공개 러브트리" })).toBeInTheDocument();
    expect(screen.getByText("공개 범위: public")).toBeInTheDocument();
    expect(screen.getByText("기억 1개")).toBeInTheDocument();
    expect(screen.getByText("좋아요 0")).toBeInTheDocument();
    expect(screen.getByText("조회 15")).toBeInTheDocument();
    expect(screen.getByText("실제 기억 제목")).toBeInTheDocument();
    expect(screen.getByText("실제 기억 메모")).toBeInTheDocument();
    expect(screen.getByText("기억 상세 연결 준비 중")).toBeInTheDocument();

    expect(screen.queryByText(/작성자|댓글 3|대표 기억|트리 이야기 요약/)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /좋아요|댓글|공유|저장|기억 연결/ })).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("link").some((link) => link.getAttribute("href") === "/memory/detail-demo"),
    ).toBe(false);
  });

  it("hides absent optional metrics", () => {
    mockUsePublicTreeDetail.mockReturnValue(result({
      tree: { data: tree({ likeCount: undefined, viewCount: undefined }), status: "success", error: null },
    }));
    renderPage();
    expect(screen.queryByText(/좋아요/)).not.toBeInTheDocument();
    expect(screen.queryByText(/조회/)).not.toBeInTheDocument();
  });

  it("renders a dedicated tree 404 state with a Community route", () => {
    mockUsePublicTreeDetail.mockReturnValue(result({
      tree: { data: null, status: "not-found", error: null },
      memories: { items: [], status: "empty", error: null },
    }));
    renderPage("/tree/missing");
    expect(screen.getByRole("heading", { name: "공개 러브트리를 찾을 수 없습니다" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Community로 돌아가기" })).toHaveAttribute("href", "/community");
  });

  it("renders tree malformed and error states with tree retry", () => {
    const retryTree = vi.fn();
    mockUsePublicTreeDetail.mockReturnValue(result({
      tree: { data: null, status: "malformed", error: "응답 오류" },
      memories: { items: [], status: "loading", error: null },
      retryTree,
    }));
    const { rerender } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(retryTree).toHaveBeenCalledTimes(1);

    mockUsePublicTreeDetail.mockReturnValue(result({
      tree: { data: null, status: "error", error: "요청 오류" },
      memories: { items: [], status: "loading", error: null },
      retryTree,
    }));
    rerender(
      <MemoryRouter initialEntries={["/tree/tree-123"]}>
        <NavigationHistoryProvider>
          <Routes><Route path="/tree/:treeId" element={<TreeDetailPage />} /></Routes>
        </NavigationHistoryProvider>
      </MemoryRouter>,
    );
    expect(screen.getByRole("heading", { name: "요청 오류" })).toBeInTheDocument();
  });

  it("keeps the real tree header during memory failure and retries memories independently", () => {
    const retryMemories = vi.fn();
    mockUsePublicTreeDetail.mockReturnValue(result({
      memories: { items: [], status: "error", error: "기억 요청 오류" },
      retryMemories,
    }));
    renderPage();

    expect(screen.getByRole("heading", { name: "실제 공개 러브트리" })).toBeInTheDocument();
    expect(screen.getByTestId("partial-success")).toHaveTextContent("기억 요청 오류");
    fireEvent.click(screen.getByRole("button", { name: "기억 다시 시도" }));
    expect(retryMemories).toHaveBeenCalledTimes(1);
  });

  it("renders memory empty and malformed states without removing the tree", () => {
    mockUsePublicTreeDetail.mockReturnValue(result({
      memories: { items: [], status: "empty", error: null },
    }));
    const { rerender } = renderPage();
    expect(screen.getByText("아직 공개된 기억이 없습니다.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "실제 공개 러브트리" })).toBeInTheDocument();

    mockUsePublicTreeDetail.mockReturnValue(result({
      memories: { items: [], status: "malformed", error: "기억 응답 오류" },
    }));
    rerender(
      <MemoryRouter initialEntries={["/tree/tree-123"]}>
        <NavigationHistoryProvider>
          <Routes><Route path="/tree/:treeId" element={<TreeDetailPage />} /></Routes>
        </NavigationHistoryProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId("partial-success")).toHaveTextContent("기억 응답 오류");
    expect(screen.getByRole("heading", { name: "실제 공개 러브트리" })).toBeInTheDocument();
  });

  it("uses Community as the direct-entry back fallback", () => {
    renderPage();
    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(screen.getByRole("heading", { name: "Community" })).toBeInTheDocument();
  });
});
