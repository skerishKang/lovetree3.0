/**
 * LT3-MEDIA-001 — MediaSearchPage UI 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user:
      window.location.pathname === "/login"
        ? null
        : {
            uid: "presentation-test-user",
            displayName: null,
            email: null,
            photoURL: null,
            emailVerified: true,
          },
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

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

  it("검색 맥락에 source/scope 정보가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByText("YouTube · 전체 채널")).toBeInTheDocument();
  });

  it("검색 맥락에 검색어와 결과 수가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByText(/무대 직캠 검색/)).toBeInTheDocument();
    expect(screen.getByTestId("result-count")).toHaveTextContent("6건");
  });

  it("최근 검색 키워드가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByText("컴백 무대")).toBeInTheDocument();
    expect(screen.getByText("직캠 모음")).toBeInTheDocument();
    expect(screen.getByText("콘서트 하이라이트")).toBeInTheDocument();
    expect(screen.getByText("데뷔 무대")).toBeInTheDocument();
  });

  it("카테고리 필터 chip이 4개 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterGroup = screen.getByRole("list", { name: "카테고리 필터" });
    const items = filterGroup.querySelectorAll(":scope > li");
    expect(items).toHaveLength(4);
  });

  it("data-selected=true인 chip이 정확히 1개이고 선택텍스트가 '무대'여야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterGroup = screen.getByRole("list", { name: "카테고리 필터" });
    const selectedChips = filterGroup.querySelectorAll('[data-selected="true"]');
    expect(selectedChips).toHaveLength(1);
    expect(selectedChips[0]).toHaveTextContent("무대");
  });

  it("필터 chip에 button role이 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterGroup = screen.getByRole("list", { name: "카테고리 필터" });
    const chips = filterGroup.querySelectorAll("span");
    chips.forEach((chip) => {
      expect(chip).not.toHaveAttribute("role");
    });
  });

  it("필터 chip에 tabIndex가 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterGroup = screen.getByRole("list", { name: "카테고리 필터" });
    const chips = filterGroup.querySelectorAll("span");
    chips.forEach((chip) => {
      expect(chip).not.toHaveAttribute("tabindex");
    });
  });

  it("검색 결과 카드가 정확히 6개여야 한다", () => {
    renderAppAt("/media/search-demo");
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(6);
  });

  it("각 결과가 article로 노출되어야 한다", () => {
    renderAppAt("/media/search-demo");
    const list = screen.getByRole("list", {
      name: "미디어 검색 결과 목록",
    });
    expect(list).toBeInTheDocument();
    expect(list.tagName).toBe("UL");
    const items = list.querySelectorAll(":scope > li");
    expect(items).toHaveLength(6);
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
    expect(
      screen.getByRole("article", { name: "음악방송 1위 무대" })
    ).toBeInTheDocument();
  });

  it("각 카드에 영상 길이 정보가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByText("3:42")).toBeInTheDocument();
    expect(screen.getByText("12:15")).toBeInTheDocument();
    expect(screen.getByText("8:30")).toBeInTheDocument();
    expect(screen.getByText("5:20")).toBeInTheDocument();
    expect(screen.getByText("2:55")).toBeInTheDocument();
    expect(screen.getByText("4:10")).toBeInTheDocument();
  });

  it("각 카드에 콘텐츠 유형 배지가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    const badges = screen.getAllByText("직캠");
    expect(badges.length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText("컴백").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("콘서트").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("무대").length).toBeGreaterThanOrEqual(2);
  });

  it("각 카드에 태그가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByText("쇼케이스")).toBeInTheDocument();
    expect(screen.getByText("하이라이트")).toBeInTheDocument();
    expect(screen.getByText("앵콜")).toBeInTheDocument();
    expect(screen.getByText("출근길")).toBeInTheDocument();
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
    expect(
      screen.getByRole("button", { name: "음악방송 1위 무대 러브트리에 추가" })
    ).toBeInTheDocument();
  });

  it("추가 대상 트리 맥락 정보가 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(screen.getByTestId("tree-context")).toBeInTheDocument();
    expect(screen.getAllByText(/MY_STARLINE/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/선택한 미디어가 이 트리에 추가됩니다/).length).toBeGreaterThanOrEqual(1);
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

    const navigationButtonNames = ["결과 검토"];
    const buttons = screen.getAllByRole("button").filter(
      (b) => !navigationButtonNames.includes(b.textContent || "") && b.getAttribute("aria-label") !== "뒤로 가기"
    );
    for (const button of buttons) {
      fireEvent.click(button);
    }

    const articlesAfter = screen.getAllByRole("article");
    expect(articlesAfter).toHaveLength(articlesBefore);
    expect(articlesAfter).toHaveLength(6);
  });

  it("모든 버튼 클릭 후 URL이 변하지 않아야 한다", () => {
    renderAppAt("/media/search-demo");
    expect(window.location.pathname).toBe("/media/search-demo");

    const navigationButtonNames = ["결과 검토"];
    const buttons = screen.getAllByRole("button").filter(
      (b) => !navigationButtonNames.includes(b.textContent || "") && b.getAttribute("aria-label") !== "뒤로 가기"
    );
    for (const button of buttons) {
      fireEvent.click(button);
    }

    expect(window.location.pathname).toBe("/media/search-demo");
  });

  it("검색 결과 section이 필터 list보다 DOM상 뒤에 위치해야 한다", () => {
    renderAppAt("/media/search-demo");
    const resultSection = screen.getByRole("region", { name: "검색 결과" });
    const filterList = screen.getByRole("list", { name: "카테고리 필터" });

    expect(
      filterList.compareDocumentPosition(resultSection) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("필터 list가 결과 목록 뒤에 존재해야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterList = screen.getByRole("list", { name: "카테고리 필터" });
    expect(filterList).toBeInTheDocument();
  });

  it("필터 chip은 비상호작용으로 button이 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterList = screen.getByRole("list", { name: "카테고리 필터" });
    const chips = filterList.querySelectorAll("span");
    expect(chips).toHaveLength(4);
    chips.forEach((chip) => {
      expect(chip.tagName).toBe("SPAN");
      expect(chip).not.toHaveAttribute("role");
    });
  });

  it("필터 chip에 aria-pressed, aria-selected가 없어야 한다", () => {
    renderAppAt("/media/search-demo");
    const filterList = screen.getByRole("list", { name: "카테고리 필터" });
    const chips = filterList.querySelectorAll("span");

    for (const chip of chips) {
      expect(chip).not.toHaveAttribute("aria-pressed");
      expect(chip).not.toHaveAttribute("aria-selected");
    }
  });

  it("mobile CTA에 트리 맥락이 표시되어야 한다", () => {
    renderAppAt("/media/search-demo");
    const ctaContext = screen.getByTestId("cta-context-mobile");
    expect(ctaContext).toBeInTheDocument();
    expect(ctaContext.textContent).toContain("MY_STARLINE");
    expect(ctaContext.textContent).toContain("선택한 미디어를");
  });

  it("결과 검토 버튼 클릭 시 /memory/connect-demo로 이동한다", () => {
    renderAppAt("/media/search-demo");
    const reviewBtn = screen.getByRole("button", { name: "결과 검토" });
    fireEvent.click(reviewBtn);
    expect(window.location.pathname).toBe("/memory/connect-demo");
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

  it("/tree/:treeId에서 TreeDetailPage가 렌더링되어야 한다", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((url) => {
      const urlStr = typeof url === "string" ? url : url.toString();
      if (urlStr.includes("/api/trees/")) {
        return Promise.resolve(
          new Response(JSON.stringify({ id: "test-route-id", title: "테스트 러버 A의 러브트리", visibility: "public", createdAt: "2023-09-28T00:00:00.000Z", updatedAt: "2024-08-01T00:00:00.000Z", memoryCount: 8, likeCount: 128, viewCount: 1420 }), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      if (urlStr.includes("/api/community/memories")) {
        return Promise.resolve(
          new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } })
        );
      }
      return Promise.resolve(new Response(null, { status: 404 }));
    });
    renderAppAt("/tree/test-route-id");
    expect(
      await screen.findByRole("heading", { name: "테스트 러버 A의 러브트리" })
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