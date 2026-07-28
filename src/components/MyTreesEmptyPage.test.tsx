import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MyTreesEmptyPage from "./MyTreesEmptyPage";

afterEach(() => { cleanup(); });

function renderPage() {
  return render(<MemoryRouter><MyTreesEmptyPage /></MemoryRouter>);
}

describe("MyTreesEmptyPage — /my-trees/empty-demo", () => {
  it("renders empty-state heading and guidance", () => {
    renderPage();
    expect(screen.getByText("아직 만든 러브트리가 없어요")).toBeInTheDocument();
    expect(screen.getByText("첫 기억을 연결하고 당신만의 이야기가 담긴 러브트리를 만들어 보세요.")).toBeInTheDocument();
  });

  it("renders create CTA", () => {
    renderPage();
    expect(screen.getByText("새 러브트리 만들기")).toBeInTheDocument();
  });

  it("renders Community link not /tree/community-demo", () => {
    renderPage();
    const link = screen.getByText("다른 팬들 트리 구경하기");
    expect(link.closest("a")).toHaveAttribute("href", "/community");
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
  });

  it("does not render demo CTA", () => {
    renderPage();
    expect(screen.queryByText("체험용 러브트리 만들기")).not.toBeInTheDocument();
  });

  it("renders quick-start items", () => {
    renderPage();
    const items = screen.getAllByTestId("quick-start-item");
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("첫사랑 노래")).toBeInTheDocument();
    expect(screen.getByText("직캠 모음")).toBeInTheDocument();
    expect(screen.getByText("콘서트 후기")).toBeInTheDocument();
  });

  it("keeps decorative SVGs hidden", () => {
    renderPage();
    const svgs = document.querySelectorAll("svg[aria-hidden='true']");
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });
});
