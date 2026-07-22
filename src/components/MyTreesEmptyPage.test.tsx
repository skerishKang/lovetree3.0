/**
 * LT3-MY-TREES-002 — MyTreesEmptyPage UI BASE 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("MyTreesEmptyPage — /my-trees/empty-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  /* ─── 기본 존재 ─── */

  it("h1 제목이 '아직 러브트리가 없어요'이어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "아직 러브트리가 없어요" })
    ).toBeInTheDocument();
  });

  it("안내 문구가 표시되어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(
      screen.getByText(
        "처음 좋아하게 된 순간부터 하나씩 이어보세요"
      )
    ).toBeInTheDocument();
  });

  /* ─── CTA 버튼 ─── */

  it("'첫 순간 기록하기' 버튼이 있어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(
      screen.getByRole("button", { name: "첫 순간 기록하기" })
    ).toBeInTheDocument();
  });

  it("'예시 러브트리 보기' 버튼이 있어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(
      screen.getByRole("button", { name: "예시 러브트리 보기" })
    ).toBeInTheDocument();
  });

  /* ─── 빠른 시작 태그 ─── */

  it("빠른 시작 태그가 정확히 3개여야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const tags = screen.getAllByRole("button", { name: /^입덕|첫 콘서트|최애 무대$/ });
    expect(tags).toHaveLength(3);
  });

  it("각 태그에 정확한 accessible name이 있어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(
      screen.getByRole("button", { name: "입덕" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "첫 콘서트" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "최애 무대" })
    ).toBeInTheDocument();
  });

  it("태그가 ul > li > button 구조여야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const tagList = screen.getByRole("list");
    expect(tagList).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    items.forEach((item) => {
      expect(item.querySelector("button")).toBeInTheDocument();
    });
  });

  it("태그에 aria-pressed, aria-selected, role='tab'이 없어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const tags = screen.getAllByRole("button", { name: /^입덕|첫 콘서트|최애 무대$/ });
    tags.forEach((tag) => {
      expect(tag).not.toHaveAttribute("aria-pressed");
      expect(tag).not.toHaveAttribute("aria-selected");
      expect(tag).not.toHaveAttribute("role", "tab");
    });
  });

  /* ─── 빠른 시작 설명 ─── */

  it("빠른 시작 항목이 정확히 3개여야 한다 (data-testid)", () => {
    renderAppAt("/my-trees/empty-demo");
    const items = screen.getAllByTestId("quick-start-item");
    expect(items).toHaveLength(3);
  });

  it("각 빠른 시작 항목에 설명이 있어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const descriptions = screen.getAllByTestId("quick-start-description");
    expect(descriptions).toHaveLength(3);
    descriptions.forEach((desc) => {
      expect(desc.textContent!.length).toBeGreaterThan(0);
    });
  });

  /* ─── decorative SVG 계약 ─── */

  it("decorative SVG가 정확히 4개여야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs).toHaveLength(4);
  });

  it("모든 decorative SVG에 aria-hidden='true'와 focusable='false'가 있어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    expect(svgs.length).toBe(4);
    for (const svg of svgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
    }
  });

  /* ─── 상호작용 후 사이드 이펙트 없음 ─── */

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Storage API가 호출되지 않아야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
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
    renderAppAt("/my-trees/empty-demo");
    const currentUrl = window.location.href;

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(window.location.href).toBe(currentUrl);
  });

  it("heading, CTA, 태그 수가 불변이어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");

    const initialHeading = screen.getByRole("heading", { level: 1 }).textContent;
    const initialCtas = screen.getAllByRole("button").filter(
      (b) => !b.closest("section") && b !== screen.getByRole("button", { name: "마이페이지" })
    ).length;
    const initialTags = screen.getAllByRole("button", { name: /^입덕|첫 콘서트|최애 무대$/ }).length;

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(initialHeading);
    expect(
      screen.getAllByRole("button").filter(
        (b) => !b.closest("section") && b !== screen.getByRole("button", { name: "마이페이지" })
      ).length
    ).toBe(initialCtas);
    expect(
      screen.getAllByRole("button", { name: /^입덕|첫 콘서트|최애 무대$/ }).length
    ).toBe(initialTags);
  });

  it("dialog, alert, alertdialog가 없어야 한다", () => {
    renderAppAt("/my-trees/empty-demo");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  /* ─── render 전 설치 side-effect spy ─── */

  it("render 전 spy 설치: 모든 버튼 5개 클릭 후 side-effect 0회", () => {
    const fetchSpy = vi.fn();
    const xhrOpenSpy = vi.fn();
    const storageGetSpy = vi.fn(() => null);
    const storageSetSpy = vi.fn();
    const storageRemoveSpy = vi.fn();
    const storageClearSpy = vi.fn();
    const windowOpenSpy = vi.fn();
    const pushStateSpy = vi.spyOn(window.history, "pushState");
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");

    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("XMLHttpRequest", class {
      open = xhrOpenSpy;
      send = vi.fn();
      setRequestHeader = vi.fn();
    });
    vi.stubGlobal("localStorage", {
      getItem: storageGetSpy,
      setItem: storageSetSpy,
      removeItem: storageRemoveSpy,
      clear: storageClearSpy,
      length: 0,
      key: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: storageGetSpy,
      setItem: storageSetSpy,
      removeItem: storageRemoveSpy,
      clear: storageClearSpy,
      length: 0,
      key: vi.fn(),
    });
    vi.stubGlobal("open", windowOpenSpy);

    renderAppAt("/my-trees/empty-demo");
    pushStateSpy.mockClear();
    replaceStateSpy.mockClear();

    const urlBefore = window.location.href;
    const h1Before = screen.getByRole("heading", { level: 1 }).textContent;
    const primaryCount = screen.getAllByRole("button", { name: "첫 순간 기록하기" }).length;
    const secondaryCount = screen.getAllByRole("button", { name: "예시 러브트리 보기" }).length;
    const quickStartCount = screen.getAllByTestId("quick-start-item").length;

    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBeGreaterThanOrEqual(5);
    allButtons.forEach((btn) => fireEvent.click(btn));

    expect(window.location.href).toBe(urlBefore);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(h1Before);
    expect(screen.getAllByRole("button", { name: "첫 순간 기록하기" }).length).toBe(primaryCount);
    expect(screen.getAllByRole("button", { name: "예시 러브트리 보기" }).length).toBe(secondaryCount);
    expect(screen.getAllByTestId("quick-start-item").length).toBe(quickStartCount);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
    expect(windowOpenSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();
    expect(replaceStateSpy).not.toHaveBeenCalled();
  });

  /* ─── 기존 /my-trees 화면 유지 ─── */

  it("/my-trees 경로가 정상 유지되어야 한다", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
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
        screen.getByRole("heading", { level: 1, name: "내 러브트리를 계속 이어가려면 로그인하세요" })
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
  });
});
