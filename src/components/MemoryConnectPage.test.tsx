import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import MemoryConnectPage from "./MemoryConnectPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/memory/connect-demo"]}>
      <MemoryConnectPage />
    </MemoryRouter>
  );
}

describe("MemoryConnectPage (LT3-MEMORY-001)", () => {
  it("제목 '어느 순간과 연결할까요?'를 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByRole("heading", {
        name: "어느 순간과 연결할까요?",
      })
    ).toBeInTheDocument();
  });

  it("4개의 기억 노드를 렌더링한다", () => {
    renderPage();
    const nodes = screen.getAllByRole("article");
    expect(nodes).toHaveLength(4);
  });

  it("실제 버튼은 뒤로 가기와 CTA 2개만 존재한다", () => {
    renderPage();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("노드에는 button role이 부여되지 않는다", () => {
    renderPage();
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("role", "button");
      expect(article).not.toHaveAttribute("tabindex");
      expect(article).not.toHaveAttribute("onClick");
    });
  });

  it("고정 선택된 노드(컴백 D-Day)가 존재한다", () => {
    renderPage();
    expect(screen.getByText("컴백 D-Day")).toBeInTheDocument();
  });

  it("선택된 노드가 정확히 하나이고 data-selected=true, aria-current=location을 갖는다", () => {
    renderPage();
    const selectedNodes = document.querySelectorAll(
      '[data-selected="true"][aria-current="location"]'
    );
    expect(selectedNodes).toHaveLength(1);
    // 선택된 노드 안에 컴백 D-Day 제목이 존재
    expect(selectedNodes[0].textContent).toContain("컴백 D-Day");
  });

  it("비선택 노드는 data-selected=false이고 aria-current가 없다", () => {
    renderPage();
    const unselectedNodes = document.querySelectorAll(
      '[data-selected="false"]'
    );
    expect(unselectedNodes).toHaveLength(3);
    unselectedNodes.forEach((node) => {
      expect(node).not.toHaveAttribute("aria-current");
    });
  });

  it("CTA 버튼 문구가 노출된다", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: "이 순간 뒤에 연결하기" })
    ).toBeInTheDocument();
  });

  it("CTA 클릭 전후 화면·문구 변화가 없다 (presentation-only)", () => {
    renderPage();
    const ctaBtn = screen.getByRole("button", {
      name: "이 순간 뒤에 연결하기",
    });
    const textBefore = ctaBtn.textContent;
    ctaBtn.click();
    expect(ctaBtn.textContent).toBe(textBefore);
  });

  it("네트워크 요청을 하지 않는다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderPage();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("뒤로 가기 버튼이 존재한다", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: "뒤로 가기" })
    ).toBeInTheDocument();
  });

  it("각 노드의 날짜가 노출된다", () => {
    renderPage();
    expect(screen.getByText("2023. 9. 28.")).toBeInTheDocument();
    expect(screen.getByText("2023. 10. 15.")).toBeInTheDocument();
    expect(screen.getByText("2023. 11. 20.")).toBeInTheDocument();
    expect(screen.getByText("2024. 1. 7.")).toBeInTheDocument();
  });

  it("태그가 노출된다", () => {
    renderPage();
    expect(screen.getByText("#첫만남")).toBeInTheDocument();
    expect(screen.getByText("#컴백")).toBeInTheDocument();
  });
});
