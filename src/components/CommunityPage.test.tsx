import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import CommunityPage from "./CommunityPage";

describe("CommunityPage (LT3-COMMUNITY-001)", () => {
  it("페이지 제목을 렌더링한다", () => {
    render(<CommunityPage />);
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("일반 카드 8개를 렌더링한다", () => {
    render(<CommunityPage />);
    // 카드 제목 텍스트 기준 카운트
    const titles = screen.getAllByRole("heading", { level: 2 });
    // 제목 1개(페이지) + 카드 8개 = 9 (Featured 제목은 level 2)
    expect(titles.length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText("BTS - Map of the Soul 7 Memories")).toBeInTheDocument();
    expect(screen.getByText("NewJeans 'Ditto' Vibes")).toBeInTheDocument();
  });

  it("일반 카드에 추가된 요약(summary), 기억(memoryCount), 업데이트 라벨을 검증한다", () => {
    render(<CommunityPage />);
    // 카드의 요약 정보 노출 확인
    expect(screen.getByText("첫 티저 공개부터 스타디움 투어의 불꽃놀이까지 담은 역사적 7년의 기록")).toBeInTheDocument();
    expect(screen.getByText("오프닝 무대의 베이스 비트부터 마지막 앙코르 소감까지 한 순간도 놓칠 수 없는 기억")).toBeInTheDocument();
    // memoryCount 라벨 노출 확인
    expect(screen.getByText("🌳 기억 18개")).toBeInTheDocument();
    expect(screen.getByText("🌳 기억 12개")).toBeInTheDocument();
    // updatedLabel 노출 확인
    expect(screen.getByText("2일 전 업데이트")).toBeInTheDocument();
    expect(screen.getByText("3일 전 업데이트")).toBeInTheDocument();
  });

  it("Featured LoveTree 영역과 상세 구조를 검증한다", () => {
    render(<CommunityPage />);
    expect(screen.getByText("🌟 Featured LoveTree")).toBeInTheDocument();
    expect(screen.getByText("이주의 추천 트리")).toBeInTheDocument();
    expect(screen.getByText("OUR JOURNEY WITH RED VELVET")).toBeInTheDocument();
    expect(screen.getByText("레드벨벳 10주년을 함께한 팬들의 소중한 콘서트 현장 열기와 미발매곡 최초 공개의 순간, 그리고 멤버들과 함께 울고 웃었던 추억의 타임라인을 총망라한 기념비적 트리.")).toBeInTheDocument();
    expect(screen.getByText("🌳 총 35개의 소중한 기억 노드 연결됨")).toBeInTheDocument();
    expect(screen.getByText("12시간 전 업데이트")).toBeInTheDocument();
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

  it("좋아요/댓글 표시를 렌더링한다", () => {
    render(<CommunityPage />);
    expect(screen.getAllByText(/♥ \d+/).length).toBeGreaterThanOrEqual(8);
    expect(screen.getAllByText(/💬 \d+/).length).toBeGreaterThanOrEqual(8);
  });
});
