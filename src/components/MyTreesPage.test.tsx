import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyTreesPage from "./MyTreesPage";
import type { OwnerTreeSummary } from "../types/myTrees";

vi.mock("../hooks/useMyTrees", () => ({
  useMyTrees: vi.fn(),
}));

import { useMyTrees } from "../hooks/useMyTrees";
const mockUseMyTrees = useMyTrees as ReturnType<typeof vi.fn>;

function item(overrides: Partial<OwnerTreeSummary> = {}): OwnerTreeSummary {
  return { id: "t1", title: "테스트 트리", visibility: "public", groupName: "그룹A", keywords: ["키워드1"], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-07-01T00:00:00Z", memoryCount: 5, likeCount: 3, viewCount: 10, ...overrides } as OwnerTreeSummary;
}

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPage() {
  return render(<MemoryRouter><MyTreesPage /></MemoryRouter>);
}

describe("MyTreesPage — /my-trees", () => {
  it("shows loading state", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "loading", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("내 러브트리를 불러오고 있어요")).toBeInTheDocument();
  });

  it("shows server error with retry", () => {
    const retry = vi.fn();
    mockUseMyTrees.mockReturnValue({ items: [], status: "server-error", error: "오류", retry });
    renderPage();
    expect(screen.getByText("서버에서 트리 목록을 불러오지 못했습니다.")).toBeInTheDocument();
    screen.getByRole("button", { name: "다시 시도" }).click();
    expect(retry).toHaveBeenCalled();
  });

  it("shows network error with retry", () => {
    const retry = vi.fn();
    mockUseMyTrees.mockReturnValue({ items: [], status: "network-error", error: "오류", retry });
    renderPage();
    expect(screen.getByText("네트워크 오류로 트리 목록을 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("shows malformed error with retry", () => {
    const retry = vi.fn();
    mockUseMyTrees.mockReturnValue({ items: [], status: "malformed", error: "형식 오류", retry });
    renderPage();
    expect(screen.getByText("형식 오류")).toBeInTheDocument();
  });

  it("shows forbidden state with retry", () => {
    const retry = vi.fn();
    mockUseMyTrees.mockReturnValue({ items: [], status: "forbidden", error: "권한 없음", retry });
    renderPage();
    expect(screen.getByText("접근 권한이 없습니다.")).toBeInTheDocument();
  });

  it("shows empty state with demo and community CTAs", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "empty", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("아직 만든 러브트리가 없습니다.")).toBeInTheDocument();
    expect(screen.getAllByText("체험용 러브트리 만들기").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("다른 팬들 트리 구경하기")).toBeInTheDocument();
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
    expect(screen.getByRole("link", { name: "다른 팬들 트리 구경하기" })).toHaveAttribute("href", "/community");
  });

  it("shows success state with real tree titles and metrics", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item(), item({ id: "t2", title: "두 번째 트리", visibility: "private", memoryCount: 2, likeCount: undefined, viewCount: undefined })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    const titles = screen.getAllByText("테스트 트리");
    expect(titles.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("두 번째 트리")).toBeInTheDocument();
    expect(screen.getByText("5개")).toBeInTheDocument();
    expect(screen.getByText("2개")).toBeInTheDocument();
    expect(screen.getAllByText("그룹A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("키워드1").length).toBeGreaterThanOrEqual(1);
    const visibilityBadges = screen.getAllByText("공개");
    expect(visibilityBadges.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("비공개")).toBeInTheDocument();
  });

  it("shows public tree link for public trees only", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item(), item({ id: "t2", title: "비공개 트리", visibility: "private" })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    const publicLinks = screen.getAllByText("공개 화면 보기");
    expect(publicLinks).toHaveLength(1);
    expect(screen.getAllByText("편집 연결 준비 중")).toHaveLength(2);
  });

  it("shows likeCount and viewCount only when present", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item({ likeCount: 5, viewCount: 20 }), item({ likeCount: undefined, viewCount: undefined })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    expect(screen.getAllByText("5")).toHaveLength(1);
    expect(screen.getAllByText("20")).toHaveLength(1);
  });

  it("does not show mock descriptions, recent moments, mock comments, or /tree/edit-demo", () => {
    mockUseMyTrees.mockReturnValue({ items: [item()], status: "success", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.queryByText(/처음 좋아하게 된 순간/)).not.toBeInTheDocument();
    expect(screen.queryByText(/최근 수정한 순간/)).not.toBeInTheDocument();
    expect(screen.queryByText(/댓글/)).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/tree/edit-demo"]')).toBeNull();
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
  });

  it("renders header title and create button", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "empty", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getAllByText("나의 러브트리").length).toBeGreaterThanOrEqual(1);
    const ctas = screen.getAllByText("체험용 러브트리 만들기");
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    // First CTA is in the intro section
    expect(ctas[0].closest("button")).not.toBeNull();
  });
});
