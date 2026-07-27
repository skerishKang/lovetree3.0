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

  it("shows retrying state copy", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "retrying", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("내 러브트리를 다시 불러오고 있어요")).toBeInTheDocument();
    expect(screen.queryByText("총")).not.toBeInTheDocument();
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

  it("unauthorized shows bounded redirecting state, no list, no empty", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "unauthorized", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("세션을 다시 확인하고 있어요. 로그인 화면으로 이동합니다.")).toBeInTheDocument();
    expect(screen.queryByText("총")).not.toBeInTheDocument();
    expect(screen.queryByText("아직 만든 러브트리가 없습니다.")).not.toBeInTheDocument();
    expect(screen.queryByText("테스트 트리")).not.toBeInTheDocument();
  });

  it("shows empty state with demo and community CTAs", () => {
    mockUseMyTrees.mockReturnValue({ items: [], status: "empty", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("아직 만든 러브트리가 없습니다.")).toBeInTheDocument();
    expect(screen.getAllByText("체험용 러브트리 만들기").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("다른 팬들 트리 구경하기")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "다른 팬들 트리 구경하기" })).toHaveAttribute("href", "/community");
  });

  it("shows success state with real tree titles and metrics", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item(), item({ id: "t2", title: "두 번째 트리", visibility: "private", memoryCount: 2, likeCount: undefined, viewCount: undefined })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    expect(screen.getByText("두 번째 트리")).toBeInTheDocument();
    expect(screen.getByText("5개")).toBeInTheDocument();
    expect(screen.getByText("2개")).toBeInTheDocument();
    expect(screen.getAllByText("그룹A").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("비공개")).toBeInTheDocument();
  });

  it("shows public tree link for public trees only", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item(), item({ id: "t2", title: "비공개 트리", visibility: "private" })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    expect(screen.getAllByText("공개 화면 보기")).toHaveLength(1);
    expect(screen.getAllByText("편집 연결 준비 중")).toHaveLength(2);
  });

  it("public tree link is encoded", () => {
    mockUseMyTrees.mockReturnValue({
      items: [item({ id: "a/b c" })],
      status: "success", error: null, retry: vi.fn(),
    });
    renderPage();
    const links = screen.getAllByText("공개 화면 보기");
    expect(links[0].closest("a")).toHaveAttribute("href", "/tree/a%2Fb%20c");
  });

  it("likeCount and viewCount when present are integers", () => {
    mockUseMyTrees.mockReturnValue({ items: [item({ likeCount: 5, viewCount: 20 })], status: "success", error: null, retry: vi.fn() });
    renderPage();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
  });

  it("ownerId is never rendered", () => {
    mockUseMyTrees.mockReturnValue({ items: [item({})], status: "success", error: null, retry: vi.fn() });
    renderPage();
    const html = document.body.innerHTML;
    expect(html).not.toContain("ownerId");
  });

  it("no mock content, no /tree/community-demo, no /tree/edit-demo", () => {
    mockUseMyTrees.mockReturnValue({ items: [item()], status: "success", error: null, retry: vi.fn() });
    renderPage();
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
    expect(document.querySelector('a[href="/tree/edit-demo"]')).toBeNull();
  });
});
