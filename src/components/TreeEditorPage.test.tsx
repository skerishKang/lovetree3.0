import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
});

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("TreeEditorPage - layout structure", () => {
  it("renders h1 '러브트리 편집' on /tree/edit-demo", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "러브트리 편집" }),
    ).toBeInTheDocument();
  });

  it("renders workspace navigation landmark", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("navigation", { name: "작업 공간 내비게이션" }),
    ).toBeInTheDocument();
  });

  it("renders tree canvas section", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("region", { name: "트리 캔버스" }),
    ).toBeInTheDocument();
  });

  it("renders inspector panel", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("complementary", { name: "선택한 기억 상세" }),
    ).toBeInTheDocument();
  });
});

describe("TreeEditorPage - memory nodes", () => {
  it("renders exactly 5 memory cards as articles", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    expect(articles.length).toBeGreaterThanOrEqual(5);
  });

  it("has exactly one selected node with data-selected=true", () => {
    renderAppAt("/tree/edit-demo");
    const selected = document.querySelectorAll('[data-selected="true"]');
    expect(selected).toHaveLength(1);
  });

  it("selected node is '대기실 준비'", () => {
    renderAppAt("/tree/edit-demo");
    const selected = document.querySelector('[data-selected="true"]');
    expect(selected?.textContent).toContain("대기실 준비");
  });

  it("selected node has aria-current='location'", () => {
    renderAppAt("/tree/edit-demo");
    const selected = document.querySelector('[data-selected="true"]');
    expect(selected).toHaveAttribute("aria-current", "location");
  });

  it("non-selected nodes have data-selected=false and no aria-current", () => {
    renderAppAt("/tree/edit-demo");
    const nonSelected = document.querySelectorAll('[data-selected="false"]');
    expect(nonSelected.length).toBeGreaterThanOrEqual(4);
    nonSelected.forEach((el) => {
      expect(el.getAttribute("aria-current")).toBeNull();
    });
  });

  it("each card has no button role, no tabindex, no draggable", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article.getAttribute("role")).not.toBe("button");
      expect(article.hasAttribute("tabindex")).toBe(false);
      expect(article.getAttribute("draggable")).not.toBe("true");
    });
  });

  it("renders all 5 unique memory titles", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getAllByText("비디오 프레젠테이션").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("대기실 준비").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("팬들이 준비한 이벤트").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("무대 위 첫인사").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("앙코르 무대").length).toBeGreaterThanOrEqual(1);
  });
});

describe("TreeEditorPage - connectors", () => {
  it("renders connectors between nodes", () => {
    renderAppAt("/tree/edit-demo");
    const connectors = screen.getAllByTestId("connector");
    expect(connectors.length).toBeGreaterThanOrEqual(1);
  });

  it("renders branch connector", () => {
    renderAppAt("/tree/edit-demo");
    const branch = screen.getAllByTestId("branch-connector");
    expect(branch.length).toBeGreaterThanOrEqual(1);
  });

  it("renders insert marker", () => {
    renderAppAt("/tree/edit-demo");
    const markers = screen.getAllByTestId("insert-marker");
    expect(markers.length).toBeGreaterThanOrEqual(1);
    expect(markers[0].textContent).toContain("여기에 연결");
  });
});

describe("TreeEditorPage - tree relationships", () => {
  it("root node '비디오 프레젠테이션' exists", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("article", { name: "비디오 프레젠테이션" }),
    ).toBeInTheDocument();
  });

  it("selected node '대기실 준비' has child memories", () => {
    renderAppAt("/tree/edit-demo");
    const connDesc = screen.getByTestId("connection-position");
    expect(connDesc.textContent).toContain("비디오 프레젠테이션");
  });
});

describe("TreeEditorPage - inspector consistency", () => {
  it("inspector title matches selected node title", () => {
    renderAppAt("/tree/edit-demo");
    const inspectorTitle = screen.getAllByText("대기실 준비");
    expect(inspectorTitle.length).toBeGreaterThanOrEqual(1);
  });

  it("inspector shows date matching selected node", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getAllByText("2023.10.15").length).toBeGreaterThanOrEqual(1);
  });

  it("inspector shows memo content", () => {
    renderAppAt("/tree/edit-demo");
    const memo = screen.getByTestId("inspector-memo");
    expect(memo.textContent).toContain("대기실");
  });
});

describe("TreeEditorPage - toolbar and buttons", () => {
  it("renders toolbar buttons: 미리보기, 저장, 게시하기", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("button", { name: "미리보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "게시하기" })).toBeInTheDocument();
  });

  it("renders 메모리 추가 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "메모리 추가" }),
    ).toBeInTheDocument();
  });

  it("renders inspector action buttons", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "대기실 준비 편집" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "대기실 준비 삭제" }),
    ).toBeInTheDocument();
  });

  it("renders workspace navigation items", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("내 러브트리")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByText("새 러브트리 만들기")).toBeInTheDocument();
  });
});

describe("TreeEditorPage - presentation-only", () => {
  it("no fetch, storage, or UI change after all buttons clicked", () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/tree/edit-demo");

    const initialCardCount = screen.getAllByRole("article").length;
    const initialSelected = document.querySelector('[data-selected="true"]');
    const initialSelectedTitle = initialSelected?.textContent;

    const allButtons = screen.getAllByRole("button");
    for (const button of allButtons) {
      fireEvent.click(button);
    }

    expect(screen.getAllByRole("article").length).toBe(initialCardCount);

    const selectedAfter = document.querySelector('[data-selected="true"]');
    expect(selectedAfter?.textContent).toBe(initialSelectedTitle);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
  });
});

describe("TreeEditorPage - existing routes preserved", () => {
  it("renders Home on /", () => {
    renderAppAt("/");
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
  });

  it("renders Community on /community", () => {
    renderAppAt("/community");
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" }),
    ).toBeInTheDocument();
  });

  it("renders Login on /login", () => {
    renderAppAt("/login");
    expect(
      screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요"),
    ).toBeInTheDocument();
  });

  it("renders Tree Detail on /tree/community-demo", () => {
    renderAppAt("/tree/community-demo");
    expect(
      screen.getByRole("heading", { name: "테스트 러버 A의 러브트리" }),
    ).toBeInTheDocument();
  });

  it("renders Memory Connect on /memory/connect-demo", () => {
    renderAppAt("/memory/connect-demo");
    expect(
      screen.getByRole("heading", { name: "어느 순간과 연결할까요?" }),
    ).toBeInTheDocument();
  });

  it("renders My Trees on /my-trees", () => {
    renderAppAt("/my-trees");
    expect(screen.getByRole("heading", { level: 1, name: "나의 러브트리" })).toBeInTheDocument();
  });

  it("falls back to Home on /nonexistent-route", () => {
    renderAppAt("/nonexistent-route");
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
  });
});
