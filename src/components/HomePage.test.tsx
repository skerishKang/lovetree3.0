import { describe, expect, it } from "vitest";
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
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  });

  it("메인 헤드라인을 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
    expect(screen.getByText(/기록해 보세요/)).toBeInTheDocument();
  });

  it("Hero CTA 2개를 링크로 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const primary = screen.getByRole("link", { name: "첫 러브트리 만들기" });
    expect(primary).toHaveAttribute("href", "/tree/new");
    const secondary = screen.getByRole("link", { name: "다른 러브트리 구경하기" });
    expect(secondary).toHaveAttribute("href", "/community");
  });

  it("하단 기능 설명 4개를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByText("기록하기")).toBeInTheDocument();
    expect(screen.getByText("연결하기")).toBeInTheDocument();
    expect(screen.getByText("다시 보기")).toBeInTheDocument();
    expect(screen.getByText("공유하기")).toBeInTheDocument();
  });

  it("feature item 4개 — 각각 올바른 경로와 action label을 가진 링크다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const features = screen.getByRole("region", { name: "주요 기능" });
    const featureLinks = features.querySelectorAll("a");
    expect(featureLinks).toHaveLength(4);
    expect(featureLinks[0]).toHaveAttribute("href", "/tree/new");
    expect(featureLinks[1]).toHaveAttribute("href", "/tree/new-demo");
    expect(featureLinks[2]).toHaveAttribute("href", "/my-trees");
    expect(featureLinks[3]).toHaveAttribute("href", "/community");
  });

  it("연결하기에만 브라우저 데모 표시가 있고 다른 세 기능에는 없다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const connect = screen.getByText("연결하기").closest("a");
    expect(connect?.textContent).toContain("브라우저 체험");
    const record = screen.getByText("기록하기").closest("a");
    const replay = screen.getByText("다시 보기").closest("a");
    const share = screen.getByText("공유하기").closest("a");
    expect(record?.textContent).not.toContain("브라우저 체험");
    expect(replay?.textContent).not.toContain("브라우저 체험");
    expect(share?.textContent).not.toContain("브라우저 체험");
  });

  it("5개 기억 카드의 날짜를 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    ["2023-01-07", "2023-01-10", "2023-03-06", "2023-03-20", "2023-05-17"].forEach((date) => {
      expect(screen.getByText(date)).toBeInTheDocument();
    });
  });

  it("5개 실제 썸네일과 접근 가능한 재생 버튼을 제공하며 초기 iframe은 없다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const preview = screen.getByLabelText("러브트리 미리보기");

    expect(within(preview).getAllByRole("img")).toHaveLength(5);
    expect(within(preview).getAllByRole("button", { name: /영상 재생/ })).toHaveLength(5);
    expect(within(preview).queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(within(preview).getAllByTestId("memory-dots-affordance")).toHaveLength(5);
  });
});

describe("HomePage mobile containment contract", () => {
  it("h1은 정확히 1개만 존재한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("주요 메뉴 nav가 4개 항목을 모두 단일 nav 안에 렌더링한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const nav = screen.getByRole("navigation", { name: "주요 메뉴" });
    expect(within(nav).getAllByRole("link").map((link) => link.textContent)).toEqual([
      "소개",
      "주요 기능",
      "Community",
      "My Tree",
    ]);
  });

  it("러브트리 미리보기가 단일 컨테이너에 5개 카드를 모두 포함한다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const preview = screen.getByLabelText("러브트리 미리보기");
    expect(within(preview).getAllByRole("article")).toHaveLength(5);
  });

  it("Hero CTA는 링크이며 버튼이 아니다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.queryByRole("button", { name: "첫 러브트리 만들기" })).toBeNull();
    expect(screen.queryByRole("button", { name: "다른 러브트리 구경하기" })).toBeNull();
    expect(screen.getByRole("link", { name: "첫 러브트리 만들기" })).toHaveAttribute("href", "/tree/new");
    expect(screen.getByRole("link", { name: "다른 러브트리 구경하기" })).toHaveAttribute("href", "/community");
  });

  it("소개/주요 기능 해시 링크가 올바른 section id를 가리킨다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    expect(screen.getByRole("link", { name: "소개" })).toHaveAttribute("href", "/#about");
    expect(screen.getByRole("link", { name: "주요 기능" })).toHaveAttribute("href", "/#features");
    expect(document.getElementById("about")).not.toBeNull();
    expect(document.getElementById("features")).not.toBeNull();
  });

  it("feature item 링크에 중첩 interactive element가 없다", () => {
    render(<MemoryRouter><HomePage /></MemoryRouter>);
    const features = screen.getByRole("region", { name: "주요 기능" });
    const featureLinks = features.querySelectorAll("a");
    expect(featureLinks).toHaveLength(4);
    featureLinks.forEach(link => {
      const nestedControls = link.querySelectorAll("button, a");
      expect(nestedControls.length).toBe(0);
    });
  });
});
