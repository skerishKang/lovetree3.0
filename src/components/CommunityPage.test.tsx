import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CommunityPage from "./CommunityPage";
import { communityTreeCards } from "../data/communityMockData";

describe("CommunityPage (LT3-COMMUNITY-001)", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network calls are forbidden during testing")),
    );
  });

  it("페이지 제목을 렌더링한다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })).toBeInTheDocument();
  });

  it("일반 카드 8개와 세부 메타데이터를 렌더링한다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(communityTreeCards).toHaveLength(8);

    communityTreeCards.forEach((card) => {
      expect(screen.getByText(card.title)).toBeInTheDocument();
      expect(screen.getByText(card.summary)).toBeInTheDocument();
      expect(screen.getByText(`🌳 기억 ${card.memoryCount}개`)).toBeInTheDocument();
      expect(screen.getByText(card.updatedLabel)).toBeInTheDocument();
      expect(screen.getAllByText(card.category).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(card.visibilityLabel).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("8개 일반 카드가 실제 YouTube thumbnail을 사용하고 inline player를 만들지 않는다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);

    expect(screen.getAllByTestId("community-youtube-thumbnail")).toHaveLength(8);
    expect(screen.getAllByRole("img", { name: /대표 YouTube 썸네일/ })).toHaveLength(8);
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });

  it("카드 전체 Link를 유지하고 Link 내부에 button을 중첩하지 않는다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);

    communityTreeCards.forEach((card) => {
      const link = screen.getByRole("link", { name: `${card.title} 러브트리 보기` });
      expect(link).toHaveAttribute("href", "/tree/community-demo");
      expect(within(link).queryByRole("button")).not.toBeInTheDocument();
      expect(within(link).queryByRole("link")).not.toBeInTheDocument();
    });
  });

  it("Featured 러브트리 영역과 기존 미니 트리 preview를 유지한다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(screen.getByText("🌟 Featured 러브트리")).toBeInTheDocument();
    expect(screen.getByText("이주의 추천 트리")).toBeInTheDocument();
    expect(screen.getByText("OUR JOURNEY WITH RED VELVET")).toBeInTheDocument();
    expect(screen.getByText("🌳 총 35개의 소중한 기억 노드 연결됨")).toBeInTheDocument();
    expect(screen.getAllByTestId("community-tree-preview")).toHaveLength(1);
    expect(screen.getByText("#레드벨벳")).toBeInTheDocument();
    expect(screen.getByText("♥ 852")).toBeInTheDocument();
    expect(screen.getByText("💬 124")).toBeInTheDocument();
  });

  it("검색 입력과 카테고리 메뉴를 렌더링한다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(screen.getByRole("searchbox")).toHaveAttribute("aria-label", "러브트리 검색");
    const nav = screen.getByRole("navigation", { name: "커뮤니티 카테고리" });
    expect(within(nav).getByText("인기")).toBeInTheDocument();
    expect(within(nav).getByText("컴백")).toBeInTheDocument();
  });

  it("API 호출 없이 thumbnail URL을 직접 렌더링한다", () => {
    render(<MemoryRouter><CommunityPage /></MemoryRouter>);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});
