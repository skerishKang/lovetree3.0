/**
 * LT3-MEDIA-001 — MediaSearchPage UI BASE 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("MediaSearchPage — /media/search-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("h1 제목이 '미디어 검색'이어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "미디어 검색" })
    ).toBeInTheDocument();
  });

  it("검색창에 정확한 accessible name과 placeholder가 있어야 한다", () => {
    renderAppAt("/media/search-demo");
    const input = screen.getByRole("searchbox", { name: "미디어 검색" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute(
      "placeholder",
      "무대, 직캠, 영상 링크 검색"
    );
  });

  it("카테고리 필터 4개가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(
      screen.getByRole("button", { name: "무대" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "직캠" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "컴백" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "콘서트" })
    ).toBeInTheDocument();
  });

  it("검색 결과 카드가 정확히 5개여야 한다", () => {
    renderAppAt("/media/search-demo");
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
  });

  it("각 결과가 article로 노출되어야 한다", () => {
    renderAppAt("/media/search-demo");
    const list = document.querySelector('[class*="resultList"]');
    expect(list).toBeInTheDocument();
    expect(list!.tagName).toBe("UL");
    const items = list!.querySelectorAll(":scope > li");
    expect(items).toHaveLength(5);
    items.forEach((li) => {
      const article = li.querySelector(":scope > article");
      expect(article).toBeInTheDocument();
    });
  });

  it("각 article에 accessible name이 있어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(
      screen.getByRole("article", { name: "2025 어워즈 직캠" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "컴백 쇼케이스 무대" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "팬미팅 하이라이트" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "콘서트 앵콜 무대" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "뮤직뱅크 출근길" })
    ).toBeInTheDocument();
  });

  it("카드에 role='button'이 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("role", "button");
    });
  });

  it("카드에 tabIndex가 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("tabindex");
    });
  });

  it("카드에 draggable이 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("draggable");
    });
  });

  it("각 추가 버튼에 정확한 accessible name이 있어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(
      screen.getByRole("button", { name: "2025 어워즈 직캠 러브트리에 추가" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "컴백 쇼케이스 무대 러브트리에 추가" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "팬미팅 하이라이트 러브트리에 추가" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "콘서트 앵콜 무대 러브트리에 추가" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "뮤직뱅크 출근길 러브트리에 추가" })
    ).toBeInTheDocument();
  });

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/media/search-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Storage API가 호출되지 않아야 한다", () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");

    renderAppAt("/media/search-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
  });

  it("모든 버튼 클릭 후 결과 카드 수가 불변이어야 한다", () => {
    renderAppAt("/media/search-demo");

    const articlesBefore = screen.getAllByRole("article").length;

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const articlesAfter = screen.getAllByRole("article");
    expect(articlesAfter).toHaveLength(articlesBefore);
    expect(articlesAfter).toHaveLength(5);
  });

  it("모든 버튼 클릭 후 URL이 변하지 않아야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(window.location.pathname).toBe("/media/search-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(window.location.pathname).toBe("/media/search-demo");
  });

  it("검색 결과 section이 필터 group보다 DOM상 먼저 위치해야 한다", () => {
    renderAppAt("/media/search-demo");
    const resultSection = screen.getByRole("region", { name: "검색 결과" });
    const filterGroup = screen.getByRole("group", { name: "카테고리 필터" });

    expect(
      resultSection.compareDocumentPosition(filterGroup) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("필터 그룹이 결과 목록 뒤에 존재해야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterGroup = screen.getByRole("group", { name: "카테고리 필터" });
    expect(filterGroup).toBeInTheDocument();
  });

  it("필터 버튼만 클릭해도 카드 수가 불변이어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterButtons = screen.getAllByRole("button").filter(
      (btn) =>
        btn.textContent === "무대" ||
        btn.textContent === "직캠" ||
        btn.textContent === "컴백" ||
        btn.textContent === "콘서트"
    );

    const initialCount = screen.getAllByRole("article").length;

    for (const btn of filterButtons) {
      fireEvent.click(btn);
    }

    expect(screen.getAllByRole("article")).toHaveLength(initialCount);
  });

  it("필터 버튼만 클릭해도 URL이 변하지 않아야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterButtons = screen.getAllByRole("button").filter(
      (btn) =>
        btn.textContent === "무대" ||
        btn.textContent === "직캠" ||
        btn.textContent === "컴백" ||
        btn.textContent === "콘서트"
    );

    for (const btn of filterButtons) {
      fireEvent.click(btn);
    }

    expect(window.location.pathname).toBe("/media/search-demo");
  });

  it("필터 버튼에 aria-pressed, role='tab', aria-selected가 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterButtons = screen.getAllByRole("button").filter(
      (btn) =>
        btn.textContent === "무대" ||
        btn.textContent === "직캠" ||
        btn.textContent === "컴백" ||
        btn.textContent === "콘서트"
    );

    for (const btn of filterButtons) {
      expect(btn).not.toHaveAttribute("aria-pressed");
      expect(btn).not.toHaveAttribute("aria-selected");
      expect(btn).not.toHaveAttribute("role", "tab");
    }
  });
});

describe("기존 App 경로 검증", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("/에서 HomePage가 렌더링되어야 한다", () => {
    renderAppAt("/");
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/)
    ).toBeInTheDocument();
  });

  it("/community에서 CommunityPage가 렌더링되어야 한다", () => {
    renderAppAt("/community");
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("/login에서 AuthLoginPage가 렌더링되어야 한다", () => {
    renderAppAt("/login");
    expect(
      screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요")
    ).toBeInTheDocument();
  });

  it("/tree/community-demo에서 TreeDetailPage가 렌더링되어야 한다", () => {
    renderAppAt("/tree/community-demo");
    expect(
      screen.getByRole("heading", { name: "테스트 러버 A의 러브트리" })
    ).toBeInTheDocument();
  });

  it("/memory/connect-demo에서 MemoryConnectPage가 렌더링되어야 한다", () => {
    renderAppAt("/memory/connect-demo");
    expect(
      screen.getByRole("heading", { name: "어느 순간과 연결할까요?" })
    ).toBeInTheDocument();
  });

  it("/my-trees에서 MyTreesPage가 렌더링되어야 한다", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
    ).toBeInTheDocument();
  });

  it("/tree/edit-demo에서 TreeEditorPage가 렌더링되어야 한다", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "러브트리 편집" })
    ).toBeInTheDocument();
  });

  it("/memory/detail-demo에서 MemoryDetailPage가 렌더링되어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "기억 상세" })
    ).toBeInTheDocument();
  });

  it("/media/search-demo에서 MediaSearchPage가 렌더링되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "미디어 검색" })
    ).toBeInTheDocument();
  });
});
