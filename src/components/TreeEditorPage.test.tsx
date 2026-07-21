import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import App from "../App";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.pushState({}, "", "/");
});

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

describe("TreeEditorPage - route and structure", () => {
  it("renders h1 on /tree/edit-demo", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "러브트리 편집" }),
    ).toBeInTheDocument();
  });

  it("renders 5 memory cards", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(5);
  });

  it("uses ul > li > article structure", () => {
    renderAppAt("/tree/edit-demo");
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const items = list.querySelectorAll(":scope > li");
    expect(items).toHaveLength(5);
    items.forEach((item) => {
      const article = item.querySelector(":scope > article");
      expect(article).not.toBeNull();
    });
  });

  it("gives each card an accessible name from its title", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("article", { name: "비디오 프레젠테이션" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "대기실 준비" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "팬들이 준비한 이벤트" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "무대 위 첫인사" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "앙코르 무대" }),
    ).toBeInTheDocument();
  });

  it("does not put role='button' on non-interactive cards", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article.getAttribute("role")).not.toBe("button");
    });
  });

  it("does not put tabIndex on non-interactive cards", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article.hasAttribute("tabindex")).toBe(false);
    });
  });

  it("does not use draggable on cards", () => {
    renderAppAt("/tree/edit-demo");
    const articles = screen.getAllByRole("article");
    articles.forEach((article) => {
      expect(article.getAttribute("draggable")).not.toBe("true");
    });
  });
});

describe("TreeEditorPage - inputs", () => {
  it("renders read-only tree title input", () => {
    renderAppAt("/tree/edit-demo");
    const input = screen.getByLabelText("러브트리 제목");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("renders read-only description input", () => {
    renderAppAt("/tree/edit-demo");
    const input = screen.getByLabelText("설명");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("readonly");
  });

  it("renders read-only date and memo in detail panel", () => {
    renderAppAt("/tree/edit-demo");
    expect(screen.getByLabelText("날짜")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("메모")).toHaveAttribute("readonly");
  });
});

describe("TreeEditorPage - selected state", () => {
  it("has exactly one selected card", () => {
    renderAppAt("/tree/edit-demo");
    const selected = document.querySelectorAll('[data-selected="true"]');
    expect(selected).toHaveLength(1);
    expect(selected[0]).toHaveAttribute("aria-current", "true");
  });

  it("marks only mem-2 as selected", () => {
    renderAppAt("/tree/edit-demo");
    const selected = document.querySelector('[data-selected="true"]');
    expect(selected?.textContent).toContain("대기실 준비");
  });

  it("does not put aria-current on non-selected items", () => {
    renderAppAt("/tree/edit-demo");
    const nonSelected = document.querySelectorAll(
      '[data-selected="false"]',
    );
    expect(nonSelected).toHaveLength(4);
    nonSelected.forEach((el) => {
      expect(el.getAttribute("aria-current")).toBeNull();
    });
  });
});

describe("TreeEditorPage - buttons", () => {
  it("renders 저장 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "저장" }),
    ).toBeInTheDocument();
  });

  it("renders 게시하기 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "게시하기" }),
    ).toBeInTheDocument();
  });

  it("renders 미리보기 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "미리보기" }),
    ).toBeInTheDocument();
  });

  it("renders 기억 추가 button", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "기억 추가" }),
    ).toBeInTheDocument();
  });

  it("gives detail action buttons target-based aria-label", () => {
    renderAppAt("/tree/edit-demo");
    expect(
      screen.getByRole("button", { name: "대기실 준비 편집" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "대기실 준비 삭제" }),
    ).toBeInTheDocument();
  });
});

describe("TreeEditorPage - presentation-only buttons", () => {
  it("does not change UI state after all buttons clicked", () => {
    renderAppAt("/tree/edit-demo");
    const fetchSpy = vi.fn();
    globalThis.fetch = fetchSpy;

    const allButtons = screen.getAllByRole("button");
    const initialCardCount = screen.getAllByRole("article").length;
    const initialTitle = screen.getByLabelText("러브트리 제목");
    const initialTitleValue = (initialTitle as HTMLInputElement).value;

    allButtons.forEach((btn) => btn.click());

    expect(screen.getAllByRole("article")).toHaveLength(initialCardCount);
    expect(
      (screen.getByLabelText("러브트리 제목") as HTMLInputElement).value,
    ).toBe(initialTitleValue);
    expect(
      document.querySelectorAll('[data-selected="true"]'),
    ).toHaveLength(1);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("TreeEditorPage - existing routes preserved", () => {
  it("renders Home on /", () => {
    renderAppAt("/");
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/),
    ).toBeInTheDocument();
  });

  it("renders Community on /community", () => {
    renderAppAt("/community");
    expect(
      screen.getByRole("heading", {
        name: "다른 팬들의 러브트리 구경하기",
      }),
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
      screen.getByRole("heading", {
        name: "테스트 러버 A의 러브트리",
      }),
    ).toBeInTheDocument();
  });

  it("renders Memory Connect on /memory/connect-demo", () => {
    renderAppAt("/memory/connect-demo");
    expect(
      screen.getByRole("heading", {
        name: "어느 순간과 연결할까요?",
      }),
    ).toBeInTheDocument();
  });

  it("renders My Trees on /my-trees", () => {
    renderAppAt("/my-trees");
    expect(
      screen.getByRole("heading", { level: 1, name: "나의 러브트리" }),
    ).toBeInTheDocument();
  });

  it("falls back to Home on /nonexistent-route", () => {
    renderAppAt("/nonexistent-route");
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/),
    ).toBeInTheDocument();
  });
});
