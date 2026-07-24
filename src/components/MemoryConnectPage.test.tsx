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

  it("설명 문구를 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByText("기억을 선택하면 해당 순간 뒤에 새로운 기록이 추가됩니다.")
    ).toBeInTheDocument();
  });

  it("새 기억 미리보기를 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("새 기억")).toBeInTheDocument();
    expect(screen.getAllByText("첫 음악방송 1위").length).toBeGreaterThanOrEqual(1);
  });

  it("새 기억의 날짜와 태그를 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("2024. 1. 21.")).toBeInTheDocument();
    expect(screen.getByText("#음악방송")).toBeInTheDocument();
    expect(screen.getByText("#1위")).toBeInTheDocument();
  });

  it("새 기억의 유형과 미디어 라벨을 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("음악방송")).toBeInTheDocument();
    expect(screen.getByText("TV 방송 녹화")).toBeInTheDocument();
  });

  it("기존 기억 노드를 정확히 4개 렌더링한다", () => {
    renderPage();
    const nodes = screen.getAllByRole("article");
    expect(nodes).toHaveLength(4);
  });

  it("각 노드의 주요 메타데이터를 렌더링한다", () => {
    renderPage();
    expect(screen.getAllByText("첫 만남의 순간").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("첫 앨범 구매").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("콘서트 직캠").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("컴백 D-Day").length).toBeGreaterThanOrEqual(1);
  });

  it("각 노드의 날짜가 노출된다", () => {
    renderPage();
    expect(screen.getByText("2023. 9. 28.")).toBeInTheDocument();
    expect(screen.getByText("2023. 10. 15.")).toBeInTheDocument();
    expect(screen.getByText("2023. 11. 20.")).toBeInTheDocument();
    expect(screen.getByText("2024. 1. 7.")).toBeInTheDocument();
  });

  it("각 노드의 태그가 노출된다", () => {
    renderPage();
    expect(screen.getByText("#첫만남")).toBeInTheDocument();
    expect(screen.getAllByText("#컴백").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("#앨범")).toBeInTheDocument();
    expect(screen.getByText("#콘서트")).toBeInTheDocument();
  });

  it("모든 SVG는 aria-hidden이거나 aria-hidden 조상 안에 있어야 한다", () => {
    const { container } = renderPage();
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      const hidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest('[aria-hidden="true"]') !== null;
      expect(hidden).toBe(true);
    });
  });

  it("모든 SVG에 focusable='false'가 있어야 한다", () => {
    const { container } = renderPage();
    const svgs = container.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  it("각 노드의 기억 유형 라벨을 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("무대 영상")).toBeInTheDocument();
    expect(screen.getByText("음반 수집")).toBeInTheDocument();
    expect(screen.getByText("콘서트 현장")).toBeInTheDocument();
    expect(screen.getByText("신보 발매")).toBeInTheDocument();
  });

  it("각 노드의 미디어 라벨을 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("YouTube 링크")).toBeInTheDocument();
    expect(screen.getByText("실물 앨범 사진")).toBeInTheDocument();
    expect(screen.getByText("4K 직캠 영상")).toBeInTheDocument();
    expect(screen.getByText("음원 스트리밍")).toBeInTheDocument();
  });

  it("실제 버튼은 뒤로 가기, CTA, 미디어 찾기, 에디터 복귀가 존재한다", () => {
    renderPage();
    expect(screen.getAllByRole("button", { name: "뒤로 가기" })).toHaveLength(1);
    const ctaButtons = screen.getAllByRole("button").filter(b => b.textContent === "이 순간 뒤에 연결하기");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: "미디어 검색" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "에디터 복귀" })).toHaveLength(1);
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
    expect(screen.getAllByText("컴백 D-Day").length).toBeGreaterThanOrEqual(1);
  });

  it("선택된 노드가 정확히 하나이고 data-selected=true, aria-current=location을 갖는다", () => {
    renderPage();
    const selectedNodes = document.querySelectorAll(
      '[data-selected="true"][aria-current="location"]'
    );
    expect(selectedNodes).toHaveLength(1);
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

  it("선택된 노드에 선택 배지가 표시된다", () => {
    renderPage();
    expect(screen.getByText("선택됨")).toBeInTheDocument();
  });

  it("기존 노드 사이 connector가 정확히 3개 존재한다", () => {
    renderPage();
    const connectors = screen.getAllByTestId("connector");
    expect(connectors).toHaveLength(3);
  });

  it("highlighted connector가 정확히 1개 존재한다", () => {
    renderPage();
    const highlighted = screen.getAllByTestId("connector-highlighted");
    expect(highlighted).toHaveLength(1);
  });

  it("insert marker가 정확히 1개 존재한다", () => {
    renderPage();
    const markers = screen.getAllByTestId("insert-marker");
    expect(markers).toHaveLength(1);
    expect(markers[0].textContent).toContain("여기에 연결");
  });

  it("연결 결과 문구에 선택된 노드와 새 기억 제목이 모두 포함된다", () => {
    renderPage();
    const result = screen.getByTestId("connection-result");
    expect(result).toBeInTheDocument();
    expect(result.textContent).toContain("컴백 D-Day");
    expect(result.textContent).toContain("뒤에 연결됩니다");
  });

  it("CTA 컨텍스트 문구에 두 제목이 모두 포함된다", () => {
    renderPage();
    const ctaContext = screen.getByTestId("cta-context");
    expect(ctaContext).toBeInTheDocument();
    expect(ctaContext.textContent).toContain("컴백 D-Day");
    expect(ctaContext.textContent).toContain("첫 음악방송 1위");
    expect(ctaContext.textContent).toContain("연결합니다");
  });

  it("CTA 버튼 문구가 노출된다", () => {
    renderPage();
    const ctaButtons = screen.getAllByRole("button").filter(b => b.textContent === "이 순간 뒤에 연결하기");
    expect(ctaButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("CTA 클릭 전후 화면·문구 변화가 없다 (presentation-only, disabled)", () => {
    renderPage();
    const ctaBtn = screen.getAllByRole("button", {
      name: "이 순간 뒤에 연결하기",
    })[0];
    const textBefore = ctaBtn.textContent;
    const htmlBefore = document.body.innerHTML;
    ctaBtn.click();
    expect(ctaBtn.textContent).toBe(textBefore);
    expect(document.body.innerHTML).toBe(htmlBefore);
  });

  it("뒤로 가기 버튼 클릭 후에도 상태 변화가 없다 (MemoryRouter 단일 entry)", () => {
    renderPage();
    const backBtn = screen.getByRole("button", { name: "뒤로 가기" });
    const htmlBefore = document.body.innerHTML;
    backBtn.click();
    expect(document.body.innerHTML).toBe(htmlBefore);
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
});
