/**
 * LT3-EDITOR-001 — EmptyTreeEditorPage UI BASE 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent } from "@testing-library/react";
import { render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("EmptyTreeEditorPage — /tree/new-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  /* ─── 기본 존재 ─── */

  it("h1 '새 러브트리'가 표시되어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "새 러브트리" })
    ).toBeInTheDocument();
  });

  it("안내 문구가 표시되어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByText("첫 순간을 추가해 러브트리를 시작하세요")
    ).toBeInTheDocument();
  });

  /* ─── CTA ─── */

  it("'첫 순간 추가' CTA 버튼이 있어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("button", { name: "첫 순간 추가" })
    ).toBeInTheDocument();
  });

  /* ─── 사이드바 ─── */

  it("사이드바에 '내 러브트리' 메뉴가 있어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("button", { name: "내 러브트리" })
    ).toBeInTheDocument();
  });

  it("사이드바에 '탐색' 메뉴가 있어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("button", { name: "탐색" })
    ).toBeInTheDocument();
  });

  it("사이드바에 '설정' 메뉴가 있어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("button", { name: "설정" })
    ).toBeInTheDocument();
  });

  /* ─── 메뉴 및 활성 상태 검증 ─── */

  it("사이드바 메뉴가 정확히 3개이고 '내 러브트리'가 활성 상태여야 한다", () => {
    renderAppAt("/tree/new-demo");
    const nav = screen.getByRole("navigation", { name: "에디터 메뉴" });
    const menuButtons = nav.querySelectorAll("button");
    expect(menuButtons.length).toBe(3);

    const activeButtons = Array.from(menuButtons).filter(
      (btn) => btn.getAttribute("aria-current") === "page"
    );
    expect(activeButtons.length).toBe(1);
    expect(activeButtons[0]).toHaveTextContent("내 러브트리");
  });

  /* ─── 접근성 구조 ─── */

  it("navigation landmark가 존재해야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.getByRole("navigation", { name: "에디터 메뉴" })
    ).toBeInTheDocument();
  });

  it("main landmark가 존재해야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("메뉴가 ul > li > button 구조여야 하며 정확히 3개 항목이어야 한다", () => {
    renderAppAt("/tree/new-demo");
    const nav = screen.getByRole("navigation", { name: "에디터 메뉴" });
    const list = nav.querySelector("ul");
    expect(list).toBeInTheDocument();
    const items = list!.querySelectorAll("li");
    expect(items.length).toBe(3);
    items.forEach((item) => {
      expect(item.querySelector("button")).toBeInTheDocument();
    });
  });

  it("장식 SVG는 accessibility tree에서 숨겨져 있어야 한다", () => {
    renderAppAt("/tree/new-demo");
    const main = screen.getByRole("main");
    const svgs = main.querySelectorAll("svg");
    svgs.forEach((svg) => {
      const isHidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest('[aria-hidden="true"]') !== null;
      expect(isHidden).toBe(true);
    });
  });

  /* ─── 순간 카드 및 미허용 버튼 없음 ─── */

  it("article(순간 카드)이 0개여야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });

  it("기억 추가, 저장, 게시하기 버튼이 없어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(
      screen.queryByRole("button", { name: /기억 추가/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /저장/ })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /게시하기/ })
    ).not.toBeInTheDocument();
  });

  /* ─── 상호작용 후 사이드 이펙트 없음 ─── */

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    renderAppAt("/tree/new-demo");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Storage API가 호출되지 않아야 한다", () => {
    renderAppAt("/tree/new-demo");
    const getItemSpy = vi.fn(() => null);
    const setItemSpy = vi.fn();
    vi.stubGlobal("localStorage", {
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });

    const buttons = screen.getAllByRole("button");
    buttons.forEach((b) => fireEvent.click(b));

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("URL이 변경되지 않아야 한다", () => {
    renderAppAt("/tree/new-demo");
    const currentUrl = window.location.href;

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(window.location.href).toBe(currentUrl);
  });

  it("heading, CTA, 메뉴 항목 수가 불변이어야 한다", () => {
    renderAppAt("/tree/new-demo");

    const initialHeading = screen.getByRole("heading", { level: 1 }).textContent;
    const initialCtas = screen.getAllByRole("button", { name: "첫 순간 추가" }).length;
    const initialMenus = screen.getAllByRole("button").filter(
      (b) =>
        b.textContent === "내 러브트리" ||
        b.textContent === "탐색" ||
        b.textContent === "설정"
    ).length;

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(initialHeading);
    expect(
      screen.getAllByRole("button", { name: "첫 순간 추가" }).length
    ).toBe(initialCtas);
    expect(
      screen.getAllByRole("button").filter(
        (b) =>
          b.textContent === "내 러브트리" ||
          b.textContent === "탐색" ||
          b.textContent === "설정"
      ).length
    ).toBe(initialMenus);
  });

  it("dialog, alert, alertdialog가 없어야 한다", () => {
    renderAppAt("/tree/new-demo");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  /* ─── 기존 /tree/edit-demo 유지 ─── */

  it("/tree/edit-demo 경로가 정상 유지되어야 한다", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "러브트리 편집" })
    ).toBeInTheDocument();
  });

  /* ─── 기존 경로 회귀 테스트 ─── */

  describe("기존 경로 회귀", () => {
    it("/ 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/");
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("/community 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/community");
      expect(
        screen.getByRole("heading", { level: 1, name: "다른 팬들의 러브트리 구경하기" })
      ).toBeInTheDocument();
    });

    it("/login 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/login");
      expect(
        screen.getByRole("heading", { level: 1, name: "Relovetree" })
      ).toBeInTheDocument();
    });

    it("/tree/community-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/tree/community-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "테스트 러버 A의 러브트리" })
      ).toBeInTheDocument();
    });

    it("/memory/connect-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/memory/connect-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "어느 순간과 연결할까요?" })
      ).toBeInTheDocument();
    });

    it("/my-trees 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/my-trees");
      expect(
        screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
      ).toBeInTheDocument();
    });

    it("/tree/edit-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/tree/edit-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "러브트리 편집" })
      ).toBeInTheDocument();
    });

    it("/memory/detail-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/memory/detail-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "기억 상세" })
      ).toBeInTheDocument();
    });

    it("/media/search-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/media/search-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "미디어 검색" })
      ).toBeInTheDocument();
    });

    it("/settings/visibility-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/settings/visibility-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "공개 범위 설정" })
      ).toBeInTheDocument();
    });

    it("/my-trees/empty-demo 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/my-trees/empty-demo");
      expect(
        screen.getByRole("heading", { level: 1, name: "아직 러브트리가 없어요" })
      ).toBeInTheDocument();
    });
  });
});
