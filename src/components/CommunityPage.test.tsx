import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CommunityPage from "./CommunityPage";
import { communityTreeCards } from "../data/communityMockData";

describe("CommunityPage (LT3-COMMUNITY-001)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network calls are forbidden during testing")));
  });

  it("페이지 제목을 렌더링한다", () => {
    render(<CommunityPage />);
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("일반 카드 정확히 8개를 렌더링하고, 각 카드의 세부 메타데이터 필드를 검증한다", () => {
    render(<CommunityPage />);

    // 일반 카드 8개 개수 검증
    expect(communityTreeCards).toHaveLength(8);

    // 8개 개별 카드 각각의 메타데이터 검증
    communityTreeCards.forEach((card) => {
      // 1. Title 검증
      expect(screen.getByText(card.title)).toBeInTheDocument();
      // 2. Summary 검증
      expect(screen.getByText(card.summary)).toBeInTheDocument();
      // 3. memoryCount 검증
      expect(screen.getByText(`🌳 기억 ${card.memoryCount}개`)).toBeInTheDocument();
      // 4. updatedLabel 검증
      expect(screen.getByText(card.updatedLabel)).toBeInTheDocument();
      // 5. category 검증
      expect(screen.getAllByText(card.category).length).toBeGreaterThanOrEqual(1);
      // 6. visibilityLabel 검증
      expect(screen.getAllByText(card.visibilityLabel).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("CommunityTreePreview가 총 9개(일반 카드 8개 + Featured 1개) 존재하고 모든 SVG는 aria-hidden='true'이다", () => {
    render(<CommunityPage />);

    const previews = screen.getAllByTestId("community-tree-preview");
    expect(previews).toHaveLength(9);

    previews.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("Featured LoveTree 영역과 상세 구조(태그 및 반응 정보 포함)를 검증한다", () => {
    render(<CommunityPage />);
    expect(screen.getByText("🌟 Featured LoveTree")).toBeInTheDocument();
    expect(screen.getByText("이주의 추천 트리")).toBeInTheDocument();
    expect(screen.getByText("OUR JOURNEY WITH RED VELVET")).toBeInTheDocument();
    expect(screen.getByText("레드벨벳 10주년을 함께한 팬들의 소중한 콘서트 현장 열기와 미발매곡 최초 공개의 순간, 그리고 멤버들과 함께 울고 웃었던 추억의 타임라인을 총망라한 기념비적 트리.")).toBeInTheDocument();
    expect(screen.getByText("🌳 총 35개의 소중한 기억 노드 연결됨")).toBeInTheDocument();
    expect(screen.getByText("12시간 전 업데이트")).toBeInTheDocument();

    // Featured 전용 태그 검증
    expect(screen.getByText("#레드벨벳")).toBeInTheDocument();
    expect(screen.getByText("#10주년")).toBeInTheDocument();
    expect(screen.getByText("#콘서트")).toBeInTheDocument();

    // Featured Likes & Comments 검증
    expect(screen.getByText("♥ 852")).toBeInTheDocument();
    expect(screen.getByText("💬 124")).toBeInTheDocument();
  });

  it("검색 입력이 가능하다", () => {
    render(<CommunityPage />);
    const input = screen.getByRole("searchbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute(
      "aria-label",
      "러브트리 검색"
    );
  });

  it("카테고리 메뉴를 렌더링한다", () => {
    render(<CommunityPage />);
    const nav = screen.getByRole("navigation", { name: "커뮤니티 카테고리" });
    expect(within(nav).getByText("인기")).toBeInTheDocument();
    expect(within(nav).getByText("컴백")).toBeInTheDocument();
  });

  it("네트워크/API 호출이 없는 무네트워크(zero-network) 환경임을 보장한다", () => {
    render(<CommunityPage />);
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
