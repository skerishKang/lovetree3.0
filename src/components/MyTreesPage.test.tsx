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

function verifyPresentationContract() {
  expect(screen.getByRole("heading", { level: 1, name: "나의 러브트리" })).toBeInTheDocument();
  expect(screen.getAllByRole("heading", { level: 1, name: "나의 러브트리" })).toHaveLength(1);

  expect(screen.getByText(MOCK_MY_TREES.headerDescription)).toBeInTheDocument();
  expect(screen.getAllByText(MOCK_MY_TREES.headerDescription)).toHaveLength(1);

  expect(screen.getByRole("button", { name: "새 러브트리 만들기" })).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: "새 러브트리 만들기" })).toHaveLength(1);

  const header = screen.getByRole("banner");
  const headerButtons = within(header).getAllByRole("button");
  expect(headerButtons).toHaveLength(3);
  expect(within(header).getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
  expect(within(header).getByRole("button", { name: "알림 보기" })).toBeInTheDocument();
  expect(within(header).getByRole("button", { name: "마이페이지" })).toBeInTheDocument();

  const articles = screen.getAllByRole("article");
  expect(articles).toHaveLength(6);

  const selectedCards = screen.getAllByRole("article").filter(
    (c) => c.getAttribute("data-selected") === "true"
  );
  expect(selectedCards).toHaveLength(1);
  const selected = selectedCards[0];
  expect(selected).toHaveAttribute("aria-current", "true");
  expect(selected).toHaveAttribute("aria-labelledby", "my-tree-title-tree-1");
  expect(selected.getAttribute("aria-labelledby")).toBe("my-tree-title-tree-1");
  expect(screen.getByRole("article", { name: "나의 러브트리" })).toHaveAttribute("data-selected", "true");

  const nonSelected = screen.getAllByRole("article").filter(
    (c) => c.getAttribute("data-selected") !== "true"
  );
  expect(nonSelected).toHaveLength(5);
  nonSelected.forEach((card) => {
    expect(card.getAttribute("aria-current")).toBeNull();
    expect(card.getAttribute("data-selected")).toBe("false");
  });

  expect(screen.getAllByText("공개")).toHaveLength(2);
  expect(screen.getAllByText("비공개")).toHaveLength(4);

  expect(screen.getAllByRole("button", { name: / 편집$/ })).toHaveLength(6);
  expect(screen.getAllByRole("button", { name: / 공유$/ })).toHaveLength(6);
  expect(screen.getAllByRole("button", { name: / 복제$/ })).toHaveLength(6);
  expect(screen.getAllByRole("button", { name: / 삭제$/ })).toHaveLength(6);

  expect(screen.getAllByRole("button").filter((b) => {
    const name = b.getAttribute("aria-label") || "";
    return name.endsWith(" 편집");
  })).toHaveLength(6);
  expect(screen.getAllByRole("button").filter((b) => {
    const name = b.getAttribute("aria-label") || "";
    return name.endsWith(" 공유");
  })).toHaveLength(6);
  expect(screen.getAllByRole("button").filter((b) => {
    const name = b.getAttribute("aria-label") || "";
    return name.endsWith(" 복제");
  })).toHaveLength(6);
  expect(screen.getAllByRole("button").filter((b) => {
    const name = b.getAttribute("aria-label") || "";
    return name.endsWith(" 삭제");
  })).toHaveLength(6);

  for (const title of TREE_TITLES) {
    for (const action of ["편집", "공유", "복제", "삭제"]) {
      expect(screen.getByRole("button", { name: `${title} ${action}` })).toBeInTheDocument();
    }
  }

  const aside = screen.getByRole("complementary", { name: "최근 수정한 순간" });
  expect(aside).toBeInTheDocument();
  expect(
    within(aside).getByRole("heading", { level: 2, name: "최근 수정한 순간" })
  ).toBeInTheDocument();
  const recentListItems = within(aside).queryAllByRole("listitem");
  expect(recentListItems).toHaveLength(2);
  expect(within(aside).getByText("첫 콘서트 도착")).toBeInTheDocument();
  expect(within(aside).getByText("앙코르 무대")).toBeInTheDocument();

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.pushState({}, "", "/");
});

describe("MyTreesPage — /my-trees", () => {
  it("renders the page title", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" })
    ).toBeInTheDocument();
  });

  it("renders header buttons scoped within banner with exact count of 3", () => {
    renderAppAt("/my-trees");
    const header = screen.getByRole("banner");
    const buttons = within(header).getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(within(header).getByRole("button", { name: "메뉴 열기" })).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "알림 보기" })).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "마이페이지" })).toBeInTheDocument();
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

  it("does not set onclick attribute on cards", () => {
    renderAppAt("/my-trees");
    const cards = screen.getAllByRole("article");
    for (const card of cards) {
      expect(card).not.toHaveAttribute("onclick");
      expect((card as HTMLElement).onclick).toBeNull();
    }
  });

  it("marks exactly one card as selected", () => {
    renderAppAt("/my-trees");
    const selectedCards = document.querySelectorAll('[data-selected="true"]');
    expect(selectedCards).toHaveLength(1);
  });

  it("selects the card matching selectedTreeId with correct aria-labelledby", () => {
    renderAppAt("/my-trees");
    const selected = screen.getByRole("article", { name: "나의 러브트리" });
    expect(selected.getAttribute("data-selected")).toBe("true");
    expect(selected.getAttribute("aria-current")).toBe("true");
    expect(selected.getAttribute("aria-labelledby")).toBe("my-tree-title-tree-1");
  });

  it("selected article connects to the correct heading id", () => {
    renderAppAt("/my-trees");
    const selected = screen.getByRole("article", { name: "나의 러브트리" });
    const labelledby = selected.getAttribute("aria-labelledby");
    expect(labelledby).toBe("my-tree-title-tree-1");
    const heading = document.getElementById(labelledby!);
    expect(heading).not.toBeNull();
    expect(heading!.tagName).toBe("H3");
    expect(heading!.textContent).toBe("나의 러브트리");
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

  it("renders description text exactly once", () => {
    renderAppAt("/my-trees");
    expect(screen.getByText(MOCK_MY_TREES.headerDescription)).toBeInTheDocument();
    expect(screen.getAllByText(MOCK_MY_TREES.headerDescription)).toHaveLength(1);
  });

  it("renders H1 exactly once", () => {
    renderAppAt("/my-trees");
    expect(screen.getAllByRole("heading", { level: 1, name: "나의 러브트리" })).toHaveLength(1);
  });

  it("renders CTA exactly once", () => {
    renderAppAt("/my-trees");
    expect(screen.getAllByRole("button", { name: "새 러브트리 만들기" })).toHaveLength(1);
  });

  it("renders every card article with an accessible name from the tree title", () => {
    renderAppAt("/my-trees");
    for (const title of TREE_TITLES) {
      expect(
        screen.getByRole("article", { name: title })
      ).toBeInTheDocument();
    }
  });

  it("renders card action buttons with tree-title aria-labels for all 6 trees", () => {
    renderAppAt("/my-trees");
    for (const title of TREE_TITLES) {
      for (const action of ["편집", "공유", "복제", "삭제"]) {
        expect(
          screen.getByRole("button", { name: `${title} ${action}` })
        ).toBeInTheDocument();
      }
    }
  });

  it("renders exactly 6 buttons per action type (total 24 action buttons)", () => {
    renderAppAt("/my-trees");
    expect(screen.getAllByRole("button", { name: / 편집$/ })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: / 공유$/ })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: / 복제$/ })).toHaveLength(6);
    expect(screen.getAllByRole("button", { name: / 삭제$/ })).toHaveLength(6);
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

  it("renders decorative SVGs and ensures non-vacuous aria-hidden protection", () => {
    const { container } = renderAppAt("/my-trees");
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);

    svgs.forEach((svg) => {
      const isHidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest('[aria-hidden="true"]') !== null;
      expect(isHidden).toBe(true);
    });
  });

  it("모든 SVG에 focusable='false'가 있어야 한다", () => {
    const { container } = renderAppAt("/my-trees");
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  it("renders the sidebar with recent moments", () => {
    renderAppAt("/my-trees");
    const sidebar = screen.getByRole("complementary", { name: "최근 수정한 순간" });
    expect(sidebar).toBeInTheDocument();
    expect(
      within(sidebar).getByRole("heading", { level: 2, name: "최근 수정한 순간" })
    ).toBeInTheDocument();
    expect(within(sidebar).getByText("첫 콘서트 도착")).toBeInTheDocument();
    expect(within(sidebar).getByText("앙코르 무대")).toBeInTheDocument();
  });

  it("renders aside exact count of 1", () => {
    renderAppAt("/my-trees");
    expect(screen.getAllByRole("complementary", { name: "최근 수정한 순간" })).toHaveLength(1);
  });

  it("renders exactly 2 recent moment items in aside", () => {
    renderAppAt("/my-trees");
    const aside = screen.getByRole("complementary", { name: "최근 수정한 순간" });
    const items = within(aside).queryAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("recent moments are non-interactive", () => {
    renderAppAt("/my-trees");
    const aside = screen.getByRole("complementary", { name: "최근 수정한 순간" });
    const items = within(aside).queryAllByRole("listitem");
    for (const item of items) {
      expect(item).not.toHaveAttribute("role", "button");
      expect(item).not.toHaveAttribute("tabindex");
      expect(item).not.toHaveAttribute("onclick");
      expect((item as HTMLElement).onclick).toBeNull();
    }
  });

  /* ─── 종합 Presentation-only 강한 회귀 계약 테스트 ─── */

  it("상호작용 전후 DOM 계약이 유지되고 네트워크/Storage/Dialog side-effect가 전혀 발생하지 않아야 한다", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, "open");

    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");

    renderAppAt("/my-trees");

    const initialUrl = window.location.href;

    verifyPresentationContract();

    const allButtons = screen.getAllByRole("button");
    allButtons.forEach((button) => fireEvent.click(button));

    verifyPresentationContract();

    expect(window.location.href).toBe(initialUrl);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
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
