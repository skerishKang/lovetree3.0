/**
 * LT3-MEMORY-002 — MemoryDetailPage UI BASE 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("MemoryDetailPage — /memory/detail-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  it("h1 제목이 '기억 상세'여야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "기억 상세" })
    ).toBeInTheDocument();
  });

  it("기억 제목이 표시되어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(screen.getByText("첫 콘서트 직캠")).toBeInTheDocument();
  });

  it("날짜가 표시되어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(screen.getByText("2023. 12. 25.")).toBeInTheDocument();
  });

  it("태그가 정확히 3개여야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const tags = screen.getAllByText(/#/);
    expect(tags).toHaveLength(3);
    expect(tags[0]).toHaveTextContent("#콘서트");
    expect(tags[1]).toHaveTextContent("#직캠");
    expect(tags[2]).toHaveTextContent("#크리스마스");
  });

  it("메모 본문이 표시되어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByText(/정말 행복했던 첫 콘서트 순간/)
    ).toBeInTheDocument();
  });

  it("정적 미디어 영역이 존재해야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const playButton = screen.getByRole("button", {
      name: "기억 영상 재생",
    });
    expect(playButton).toBeInTheDocument();
  });

  it("재생 버튼은 onClick 없이 클릭해도 URL이 변하지 않아야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const playButton = screen.getByRole("button", {
      name: "기억 영상 재생",
    });
    expect(playButton).not.toHaveAttribute("onClick");
    fireEvent.click(playButton);
    expect(window.location.pathname).toBe("/memory/detail-demo");
  });

  it("관련 기억 섹션 heading이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "이 순간과 이어진 기억",
      })
    ).toBeInTheDocument();
  });

  it("관련 기억 카드가 정확히 3개여야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
  });

  it("관련 기억이 ul > li > article 구조여야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const list = document.querySelector('[class*="relatedList"]');
    expect(list).toBeInTheDocument();
    expect(list!.tagName).toBe("UL");
    const items = list!.querySelectorAll(":scope > li");
    expect(items).toHaveLength(3);
    items.forEach((li) => {
      const article = li.querySelector(":scope > article");
      expect(article).toBeInTheDocument();
    });
  });

  it("각 article에 accessible name이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("article", { name: "콘서트 준비 과정" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "콘서트 굿즈 언박싱" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "콘서트 후 일기" })
    ).toBeInTheDocument();
  });

  it("관련 카드에 role='button'이 없어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("role", "button");
    });
  });

  it("관련 카드에 tabIndex가 없어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("tabindex");
    });
  });

  it("관련 카드에 draggable이 없어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article).not.toHaveAttribute("draggable");
    });
  });

  it("좋아요 버튼이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "좋아요 128" })
    ).toBeInTheDocument();
  });

  it("댓글 버튼이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "댓글 17" })
    ).toBeInTheDocument();
  });

  it("공유 버튼이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "공유" })
    ).toBeInTheDocument();
  });

  it("수정 버튼이 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "수정" })
    ).toBeInTheDocument();
  });

  it("좋아요 숫자에 의미 있는 accessible text가 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "좋아요 128" })
    ).toBeInTheDocument();
  });

  it("댓글 숫자에 의미 있는 accessible text가 있어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("button", { name: "댓글 17" })
    ).toBeInTheDocument();
  });

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/memory/detail-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("모든 버튼 클릭 후 카드 수가 불변이어야 한다", () => {
    renderAppAt("/memory/detail-demo");

    const articlesBefore = screen.getAllByRole("article").length;

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const articlesAfter = screen.getAllByRole("article");
    expect(articlesAfter).toHaveLength(articlesBefore);
    expect(articlesAfter).toHaveLength(3);
  });

  it("모든 버튼 클릭 후 제목·날짜·메모가 불변이어야 한다", () => {
    renderAppAt("/memory/detail-demo");

    const titleBefore = screen.getByText("첫 콘서트 직캠");
    const dateBefore = screen.getByText("2023. 12. 25.");
    const memoBefore = screen.getByText(/정말 행복했던 첫 콘서트 순간/);

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(screen.getByText("첫 콘서트 직캠")).toBe(titleBefore);
    expect(screen.getByText("2023. 12. 25.")).toBe(dateBefore);
    expect(
      screen.getByText(/정말 행복했던 첫 콘서트 순간/)
    ).toBe(memoBefore);
  });

  it("Storage API가 호출되지 않아야 한다", () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");

    renderAppAt("/memory/detail-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
  });

  it("URL이 /memory/detail-demo에서 변하지 않아야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(window.location.pathname).toBe("/memory/detail-demo");

    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(window.location.pathname).toBe("/memory/detail-demo");
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
      screen.getByText("LoveTree에 계속 이어가려면 로그인하세요")
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

  it("/memory/detail-demo에서 MemoryDetailPage가 렌더링되어야 한다", () => {
    renderAppAt("/memory/detail-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "기억 상세" })
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

  it("/nonexistent-route에서 HomePage로 fallback되어야 한다", () => {
    renderAppAt("/nonexistent-route");
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/)
    ).toBeInTheDocument();
  });
});
