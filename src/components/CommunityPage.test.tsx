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
    // 제목 1개(페이지) + 카드 8개 = 9, Featured 제목은 level 2
    expect(titles.length).toBeGreaterThanOrEqual(8);
    expect(screen.getByText("BTS - Map of the Soul 7 Memories")).toBeInTheDocument();
    expect(screen.getByText("NewJeans 'Ditto' Vibes")).toBeInTheDocument();
  });

  it("Featured LoveTree 영역을 렌더링한다", () => {
    render(<CommunityPage />);
    expect(screen.getByText("Featured LoveTree")).toBeInTheDocument();
    expect(screen.getByText("OUR JOURNEY WITH RED VELVET")).toBeInTheDocument();
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
