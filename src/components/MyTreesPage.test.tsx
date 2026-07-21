import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import {
  describe,
  it,
  expect,
  vi,
  afterEach,
} from "vitest";
import App from "../App";
import { MOCK_MY_TREES } from "../data/myTreesMockData";

const TREE_TITLES = MOCK_MY_TREES.trees.map((t) => t.title);

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
});

describe("MyTreesPage", () => {
  it("renders the page title", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
    ).toBeInTheDocument();
  });

  it("renders exactly 6 tree cards", () => {
    renderAppAt("/my-trees");
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);
  });

  it("uses article for each card in a list structure", () => {
    const { container } = renderAppAt("/my-trees");
    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    const articles = list?.querySelectorAll(":scope > li > article");
    expect(articles).toHaveLength(6);
  });

  it("does not use role=button on non-interactive cards", () => {
    renderAppAt("/my-trees");
    const cards = screen.getAllByRole("article");
    for (const card of cards) {
      expect(card).not.toHaveAttribute("role", "button");
    }
  });

  it("does not use tabIndex on non-interactive cards", () => {
    renderAppAt("/my-trees");
    const cards = screen.getAllByRole("article");
    for (const card of cards) {
      expect(card).not.toHaveAttribute("tabindex");
    }
  });

  it("marks exactly one card as selected", () => {
    renderAppAt("/my-trees");
    const selectedCards = document.querySelectorAll('[data-selected="true"]');
    expect(selectedCards).toHaveLength(1);
  });

  it("selects the card matching selectedTreeId", () => {
    renderAppAt("/my-trees");
    const selected = screen.getByRole("article", { name: "나의 러브트리" });
    expect(selected.getAttribute("data-selected")).toBe("true");
    expect(selected.getAttribute("aria-current")).toBe("true");
  });

  it("does not set selection ARIA on non-selected cards", () => {
    renderAppAt("/my-trees");
    const cards = screen.getAllByRole("article");
    const nonSelected = Array.from(cards).filter(
      (c) => c.getAttribute("data-selected") !== "true"
    );
    expect(nonSelected).toHaveLength(5);
    for (const card of nonSelected) {
      expect(card.getAttribute("aria-current")).toBeNull();
      expect(card.getAttribute("data-selected")).toBe("false");
    }
  });

  it("renders visibility badges matching mock data", () => {
    renderAppAt("/my-trees");
    const publicBadges = screen.getAllByText("공개");
    const privateBadges = screen.getAllByText("비공개");
    expect(publicBadges).toHaveLength(2);
    expect(privateBadges).toHaveLength(4);
  });

  it("renders the new-tree CTA", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("button", { name: /새 러브트리 만들기/ })
    ).toBeInTheDocument();
  });

  it("does not change UI state when CTA is clicked", () => {
    renderAppAt("/my-trees");
    const cta = screen.getByRole("button", { name: /새 러브트리 만들기/ });
    const beforeText = screen.getByRole("heading", { level: 1 }).textContent;
    fireEvent.click(cta);
    const afterText = screen.getByRole("heading", { level: 1 }).textContent;
    expect(afterText).toBe(beforeText);
  });

  it("does not make any network requests", () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
    renderAppAt("/my-trees");
    expect(fetchSpy).not.toHaveBeenCalled();
    globalThis.fetch = originalFetch;
  });

  it("renders every card article with an accessible name from the tree title", () => {
    renderAppAt("/my-trees");
    for (const title of TREE_TITLES) {
      expect(
        screen.getByRole("article", { name: title })
      ).toBeInTheDocument();
    }
  });

  it("renders card action buttons with tree-title aria-labels", () => {
    renderAppAt("/my-trees");
    // 첫 번째 트리
    expect(
      screen.getByRole("button", { name: "나의 러브트리 편집" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "나의 러브트리 공유" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "나의 러브트리 복제" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "나의 러브트리 삭제" })
    ).toBeInTheDocument();
    // 마지막 트리
    expect(
      screen.getByRole("button", { name: "일상 기록 편집" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "일상 기록 공유" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "일상 기록 복제" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "일상 기록 삭제" })
    ).toBeInTheDocument();
  });

  it("renders exactly 6 buttons per action type", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getAllByRole("button", { name: / 편집$/ })
    ).toHaveLength(6);
    expect(
      screen.getAllByRole("button", { name: / 공유$/ })
    ).toHaveLength(6);
    expect(
      screen.getAllByRole("button", { name: / 복제$/ })
    ).toHaveLength(6);
    expect(
      screen.getAllByRole("button", { name: / 삭제$/ })
    ).toHaveLength(6);
  });

  it("exposes stat meaning via visually-hidden text inside the first article", () => {
    renderAppAt("/my-trees");
    const firstArticle = screen.getByRole("article", {
      name: "나의 러브트리",
    });
    expect(within(firstArticle).getByText("조회")).toBeInTheDocument();
    expect(within(firstArticle).getByText("좋아요")).toBeInTheDocument();
    expect(within(firstArticle).getByText("댓글")).toBeInTheDocument();
  });

  it("keeps all buttons presentation-only (no fetch, no state change)", () => {
    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy as unknown as typeof globalThis.fetch;
    renderAppAt("/my-trees");
    const beforeH1 = screen.getByRole("heading", { level: 1 }).textContent;
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      fireEvent.click(button);
    }
    expect(fetchSpy).not.toHaveBeenCalled();
    const selectedCards = document.querySelectorAll('[data-selected="true"]');
    expect(selectedCards).toHaveLength(1);
    expect(selectedCards[0].textContent).toContain("나의 러브트리");
    const afterH1 = screen.getByRole("heading", { level: 1 }).textContent;
    expect(afterH1).toBe(beforeH1);
    expect(screen.getAllByRole("article")).toHaveLength(6);
    globalThis.fetch = originalFetch;
  });

  it("renders the sidebar with recent moments", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 2, name: "최근 수정한 순간" })
    ).toBeInTheDocument();
  });

  describe("routes through real App", () => {
    it("keeps the Home route accessible", () => {
      renderAppAt("/");
      expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
    });

    it("keeps the Community route accessible", () => {
      renderAppAt("/community");
      expect(
        screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
      ).toBeInTheDocument();
    });

    it("keeps the Login route accessible", () => {
      renderAppAt("/login");
      expect(
        screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요")
      ).toBeInTheDocument();
    });

    it("keeps the Tree Detail route accessible", () => {
      renderAppAt("/tree/community-demo");
      expect(
        screen.getByRole("heading", { name: "테스트 러버 A의 러브트리" })
      ).toBeInTheDocument();
    });

    it("keeps the Memory Connect route accessible", () => {
      renderAppAt("/memory/connect-demo");
      expect(
        screen.getByRole("heading", { name: "어느 순간과 연결할까요?" })
      ).toBeInTheDocument();
    });

    it("keeps the My Trees route accessible", () => {
      renderAppAt("/my-trees");
      expect(
        screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
      ).toBeInTheDocument();
    });

    it("falls back to Home on unknown routes", () => {
      renderAppAt("/nonexistent-route");
      expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
    });
  });
});
