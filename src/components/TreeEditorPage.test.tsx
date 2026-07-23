import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { MOCK_TREE_EDITOR } from "../data/treeEditorMockData";
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
    expect(screen.getByRole("heading", { level: 1, name: "러브트리 편집" })).toBeInTheDocument();
  });

  it("renders workspace navigation landmark", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("navigation", { name: "작업 공간 내비게이션" })).toBeInTheDocument();
  });

  it("renders tree canvas section", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("region", { name: "트리 캔버스" })).toBeInTheDocument();
  });

  it("renders inspector panel", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("complementary", { name: "선택한 기억 상세" })).toBeInTheDocument();
  });
});

describe("TreeEditorPage - memory nodes", () => {
  it("renders exactly 5 memory nodes", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
  });

  it("has exactly one selected node", () => {
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

  it("has exactly 4 non-selected nodes", () => {
    renderAppAt("/tree/edit-demo");
    const nonSelected = document.querySelectorAll('[data-selected="false"]');
    expect(nonSelected).toHaveLength(4);
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
    expect(screen.getByRole("article", { name: "비디오 프레젠테이션" })).toBeInTheDocument();
    expect(screen.getAllByText("대기실 준비").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("article", { name: "팬들이 준비한 이벤트" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "무대 위 첫인사" })).toBeInTheDocument();
    expect(screen.getByRole("article", { name: "앙코르 무대" })).toBeInTheDocument();
  });
});

describe("TreeEditorPage - connectors", () => {
  it("renders exactly 4 logical connectors", () => {
    renderAppAt("/tree/edit-demo");
    const connectors = document.querySelectorAll('[data-connector-id]');
    expect(connectors).toHaveLength(4);
  });

  it("renders exactly 1 highlighted connector", () => {
    renderAppAt("/tree/edit-demo");
    const highlighted = document.querySelectorAll('[data-highlighted="true"]');
    expect(highlighted).toHaveLength(1);
  });

  it("highlighted connector is conn-2 (mem-2 → mem-3)", () => {
    renderAppAt("/tree/edit-demo");
    const highlighted = document.querySelector('[data-highlighted="true"]');
    expect(highlighted).toHaveAttribute("data-connector-id", "conn-2");
    expect(highlighted).toHaveAttribute("data-from-id", "mem-2");
    expect(highlighted).toHaveAttribute("data-to-id", "mem-3");
  });

  it("conn-1: mem-1 → mem-2", () => {
    renderAppAt("/tree/edit-demo");
    const conn1 = document.querySelector('[data-connector-id="conn-1"]');
    expect(conn1).toHaveAttribute("data-from-id", "mem-1");
    expect(conn1).toHaveAttribute("data-to-id", "mem-2");
    expect(conn1).toHaveAttribute("data-highlighted", "false");
  });

  it("conn-3: mem-2 → mem-4", () => {
    renderAppAt("/tree/edit-demo");
    const conn3 = document.querySelector('[data-connector-id="conn-3"]');
    expect(conn3).toHaveAttribute("data-from-id", "mem-2");
    expect(conn3).toHaveAttribute("data-to-id", "mem-4");
    expect(conn3).toHaveAttribute("data-highlighted", "false");
  });

  it("conn-4: mem-4 → mem-5", () => {
    renderAppAt("/tree/edit-demo");
    const conn4 = document.querySelector('[data-connector-id="conn-4"]');
    expect(conn4).toHaveAttribute("data-from-id", "mem-4");
    expect(conn4).toHaveAttribute("data-to-id", "mem-5");
    expect(conn4).toHaveAttribute("data-highlighted", "false");
  });

  it("all connector IDs are unique", () => {
    renderAppAt("/tree/edit-demo");
    const ids = Array.from(document.querySelectorAll('[data-connector-id]')).map(
      (el) => el.getAttribute("data-connector-id"),
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all connectors reference existing node IDs", () => {
    renderAppAt("/tree/edit-demo");
    const validIds = new Set(MOCK_TREE_EDITOR.memories.map((m) => m.id));
    document.querySelectorAll('[data-connector-id]').forEach((el) => {
      expect(validIds.has(el.getAttribute("data-from-id")!)).toBe(true);
      expect(validIds.has(el.getAttribute("data-to-id")!)).toBe(true);
    });
  });
});

describe("TreeEditorPage - tree relationships", () => {
  it("root node '비디오 프레젠테이션' exists with no parent", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("article", { name: "비디오 프레젠테이션" })).toBeInTheDocument();
    expect(MOCK_TREE_EDITOR.memories.find((m) => m.id === "mem-1")?.parentId).toBeNull();
  });

  it("inspector connection text matches mock data for selected node", () => {
    renderAppAt("/tree/edit-demo");
    const connDesc = screen.getByTestId("connection-position");
    expect(connDesc.textContent).toContain("비디오 프레젠테이션");
  });

  it("renders insert marker", () => {
    renderAppAt("/tree/edit-demo");
    const markers = screen.getAllByTestId("insert-marker");
    expect(markers).toHaveLength(1);
    expect(markers[0].textContent).toContain("여기에 연결");
  });

  it("renders exactly 1 branch group", () => {
    renderAppAt("/tree/edit-demo");
    const branchGroups = screen.getAllByTestId("branch-group");
    expect(branchGroups).toHaveLength(1);
  });
});

describe("TreeEditorPage - read-only fields", () => {
  it("renders read-only tree title input with label '러브트리 제목'", () => {
    renderAppAt("/tree/edit-demo");
    const input = screen.getByLabelText("러브트리 제목");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("renders read-only description input with label '설명'", () => {
    renderAppAt("/tree/edit-demo");
    const input = screen.getByLabelText("설명");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("renders read-only date input with label '날짜'", () => {
    renderAppAt("/tree/edit-demo");
    const input = screen.getByLabelText("날짜");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("renders read-only memo textarea with label '메모'", () => {
    renderAppAt("/tree/edit-demo");
    const textarea = screen.getByLabelText("메모");
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute("readonly");
  });
});

describe("TreeEditorPage - inspector consistency", () => {
  it("inspector title matches selected node title", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getAllByText("대기실 준비").length).toBeGreaterThanOrEqual(1);
  });

  it("inspector date matches selected node", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getAllByText("2023.10.15").length).toBeGreaterThanOrEqual(1);
  });
});

describe("TreeEditorPage - buttons", () => {
  it("renders toolbar buttons: 미리보기, 저장, 게시하기", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("button", { name: "미리보기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "게시하기" })).toBeInTheDocument();
  });

  it("renders 메모리 추가 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("button", { name: "메모리 추가" })).toBeInTheDocument();
  });

  it("renders inspector action buttons with correct labels", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByRole("button", { name: "대기실 준비 편집" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "대기실 준비 삭제" })).toBeInTheDocument();
  });

  it("renders workspace navigation items", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByText("홈")).toBeInTheDocument();
    expect(screen.getByText("내 러브트리")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByText("새 러브트리 만들기")).toBeInTheDocument();
  });
});

describe("TreeEditorPage - presentation-only regression", () => {
  it("no state change after all buttons clicked", () => {
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");
    const fetchSpy = vi.fn();
    const xhrOpenSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("XMLHttpRequest", class {
      open = xhrOpenSpy;
      send() {}
    });

    renderAppAt("/tree/edit-demo");

    const initialUrl = window.location.href;
    const initialArticles = screen.getAllByRole("article").length;
    const initialConnectors = document.querySelectorAll('[data-connector-id]').length;
    const initialHighlighted = document.querySelectorAll('[data-highlighted="true"]').length;
    const initialSelected = document.querySelector('[data-selected="true"]')?.textContent;
    const titleInput = screen.getByLabelText("러브트리 제목") as HTMLInputElement;
    const descInput = screen.getByLabelText("설명") as HTMLInputElement;
    const dateInput = screen.getByLabelText("날짜") as HTMLInputElement;
    const memoInput = screen.getByLabelText("메모") as HTMLTextAreaElement;
    const initialTitle = titleInput.value;
    const initialDesc = descInput.value;
    const initialDate = dateInput.value;
    const initialMemo = memoInput.value;
    const initialInspectorTitle = screen.getByRole("heading", { level: 2 }).textContent;

    const allButtons = screen.getAllByRole("button");
    for (const button of allButtons) {
      fireEvent.click(button);
    }

    expect(screen.getAllByRole("article")).toHaveLength(initialArticles);
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(document.querySelectorAll('[data-connector-id]')).toHaveLength(initialConnectors);
    expect(document.querySelectorAll('[data-highlighted="true"]')).toHaveLength(initialHighlighted);
    expect(screen.getAllByRole("button").length).toBe(allButtons.length);
    expect(titleInput.value).toBe(initialTitle);
    expect(descInput.value).toBe(initialDesc);
    expect(dateInput.value).toBe(initialDate);
    expect(memoInput.value).toBe(initialMemo);
    expect(document.querySelector('[data-selected="true"]')?.textContent).toBe(initialSelected);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(initialInspectorTitle);
    expect(window.location.href).toBe(initialUrl);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
  });
});

describe("TreeEditorPage - decorative SVG accessibility", () => {
  it("모든 SVG는 aria-hidden이거나 aria-hidden 조상 안에 있어야 한다", () => {
    renderAppAt("/tree/edit-demo");
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      const hidden =
        svg.getAttribute("aria-hidden") === "true" ||
        svg.closest('[aria-hidden="true"]') !== null;
      expect(hidden).toBe(true);
    });
  });

  it("모든 SVG는 focusable='false'여야 한다", () => {
    renderAppAt("/tree/edit-demo");
    const svgs = document.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  it("connector/branch 라인 SVG는 aria-hidden 컨테이너 안에 있어야 한다", () => {
    renderAppAt("/tree/edit-demo");
    document.querySelectorAll('[data-testid="connector"]').forEach((el) => {
      expect(el.closest('[aria-hidden="true"]')).not.toBeNull();
    });
    document.querySelectorAll('[data-testid="branch-connector"]').forEach((el) => {
      expect(el).toHaveAttribute("aria-hidden", "true");
    });
  });
});

describe("TreeEditorPage - existing routes preserved", () => {
  it("renders Home on /", () => {
    renderAppAt("/");
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
  });

  it("renders Community on /community", () => {
    renderAppAt("/community");
    expect(screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })).toBeInTheDocument();
  });

  it("renders Login on /login", () => {
    renderAppAt("/login");
    expect(screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요")).toBeInTheDocument();
  });

  it("renders Tree Detail on /tree/community-demo", () => {
    renderAppAt("/tree/community-demo");
    expect(screen.getByRole("heading", { name: "테스트 러버 A의 러브트리" })).toBeInTheDocument();
  });

  it("renders Memory Connect on /memory/connect-demo", () => {
    renderAppAt("/memory/connect-demo");
    expect(screen.getByRole("heading", { name: "어느 순간과 연결할까요?" })).toBeInTheDocument();
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
