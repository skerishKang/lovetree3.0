import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("로고 'Relovetree'를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("Relovetree")).toBeInTheDocument();
  });

  it("헤더 메뉴 4개를 모두 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("소개")).toBeInTheDocument();
    expect(screen.getByText("주요 기능")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("My Tree")).toBeInTheDocument();
  });

  it("로그인 링크가 보이고 /login으로 연결된다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const loginLink = screen.getByRole("link", { name: "로그인" });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute("href", "/login");
  });

  it("메인 헤드라인을 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
    expect(screen.getByText(/기록해 보세요/)).toBeInTheDocument();
  });

  it("CTA 버튼 2개를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(
      screen.getByRole("button", { name: "첫 러브트리 만들기" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다른 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("하단 기능 설명 4개를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("기록하기")).toBeInTheDocument();
    expect(screen.getByText("연결하기")).toBeInTheDocument();
    expect(screen.getByText("다시 보기")).toBeInTheDocument();
    expect(screen.getByText("공유하기")).toBeInTheDocument();
  });

  it("5개 기억 카드의 날짜를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("2023-01-07")).toBeInTheDocument();
    expect(screen.getByText("2023-01-10")).toBeInTheDocument();
    expect(screen.getByText("2023-03-06")).toBeInTheDocument();
    expect(screen.getByText("2023-03-20")).toBeInTheDocument();
    expect(screen.getByText("2023-05-17")).toBeInTheDocument();
  });

  it("재생/메뉴 affordance는 interactive button이 아닌 decorative(aria-hidden) 요소다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(
      screen.queryByRole("button", { name: "기억 재생" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "카드 메뉴" })
    ).not.toBeInTheDocument();
    const preview = screen.getByLabelText("러브트리 미리보기");
    expect(
      within(preview).getAllByTestId("memory-play-affordance")
    ).toHaveLength(5);
    expect(
      within(preview).getAllByTestId("memory-dots-affordance")
    ).toHaveLength(5);
  });
});

/**
 * Mobile containment contract (Phase 1 — mobile Home P1 clipping).
 *
 * jsdom은 실제 layout/bounding box를 계산하지 못하므로, 여기서는 모바일에서
 * 콘텐츠가 잘리지 않기 위한 DOM 전제조건을 검증한다. 실제 geometry(요소
 * bounding box + 부모 clipping context) 검증은 Playwright 감사 스크립트로
 * 수행하며 docs/audits/ui-remediation-batch/responseive-audit.md에 기록한다.
 */
describe("HomePage mobile containment contract", () => {
  it("h1은 정확히 1개만 존재한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("주요 메뉴 nav가 4개 항목을 모두 단일 nav 안에 렌더링한다 (wrap으로 전부 노출)", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const nav = screen.getByRole("navigation", { name: "주요 메뉴" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => l.textContent)).toEqual([
      "소개",
      "주요 기능",
      "Community",
      "My Tree",
    ]);
  });

  it("러브트리 미리보기가 단일 컨테이너에 5개 카드를 모두 포함한다 (scale-to-fit containment)", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const preview = screen.getByLabelText("러브트리 미리보기");
    const cards = within(preview).getAllByRole("article");
    expect(cards).toHaveLength(5);
  });

  it("CTA 버튼은 presentation-only type=button 이다 (navigation/storage side-effect 없음)", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const primary = screen.getByRole("button", { name: "첫 러브트리 만들기" });
    const secondary = screen.getByRole("button", { name: "다른 러브트리 구경하기" });
    expect(primary).toHaveAttribute("type", "button");
    expect(secondary).toHaveAttribute("type", "button");
  });

  it("소개/주요 기능 해시 링크가 올바른 section id를 가리킨다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const aboutLink = screen.getByRole("link", { name: "소개" });
    const featuresLink = screen.getByRole("link", { name: "주요 기능" });
    expect(aboutLink).toHaveAttribute("href", "/#about");
    expect(featuresLink).toHaveAttribute("href", "/#features");
    expect(document.getElementById("about")).not.toBeNull();
    expect(document.getElementById("features")).not.toBeNull();
  });
});
