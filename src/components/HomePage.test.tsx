import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./HomePage";

describe("HomePage", () => {
  it("로고 'Relovetree'를 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText("Relovetree")).toBeInTheDocument();
  });

  it("헤더 메뉴 4개를 모두 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText("About")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Community")).toBeInTheDocument();
    expect(screen.getByText("My Tree")).toBeInTheDocument();
  });

  it("메인 헤드라인을 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
    expect(screen.getByText(/기록해 보세요/)).toBeInTheDocument();
  });

  it("CTA 버튼 2개를 렌더링한다", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("button", { name: "첫 러브트리 만들기" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "다른 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("하단 기능 설명 4개를 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText("기록하기")).toBeInTheDocument();
    expect(screen.getByText("연결하기")).toBeInTheDocument();
    expect(screen.getByText("다시 보기")).toBeInTheDocument();
    expect(screen.getByText("공유하기")).toBeInTheDocument();
  });

  it("5개 기억 카드의 날짜를 렌더링한다", () => {
    render(<HomePage />);
    expect(screen.getByText("2023-01-07")).toBeInTheDocument();
    expect(screen.getByText("2023-01-10")).toBeInTheDocument();
    expect(screen.getByText("2023-03-06")).toBeInTheDocument();
    expect(screen.getByText("2023-03-20")).toBeInTheDocument();
    expect(screen.getByText("2023-05-17")).toBeInTheDocument();
  });

  it("재생 버튼 5개를 렌더링한다", () => {
    render(<HomePage />);
    const playButtons = screen.getAllByRole("button", { name: "기억 재생" });
    expect(playButtons).toHaveLength(5);
  });

  it("카드 메뉴 버튼 5개를 렌더링한다", () => {
    render(<HomePage />);
    const menuButtons = screen.getAllByRole("button", { name: "카드 메뉴" });
    expect(menuButtons).toHaveLength(5);
  });
});
