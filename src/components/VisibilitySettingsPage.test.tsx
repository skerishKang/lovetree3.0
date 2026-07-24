/**
 * LT3-SETTINGS-001 — VisibilitySettingsPage UI BASE 테스트
 * 실제 App 기반 렌더링, presentation-only 검증
 *
 * 접근성 참고:
 * - <label> 내부에 설명문(<span>)이 포함되어 radio/checkbox의
 *   accessible name은 "라벨 + 설명문" 전체가 됩니다.
 * - name 검증 시 전체 accessible name을 사용합니다.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("VisibilitySettingsPage — /settings/visibility-demo", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.history.pushState({}, "", "/");
  });

  /* ─── 기본 존재 ─── */

  it("h1 제목이 '공개 범위 설정'이어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "공개 범위 설정" })
    ).toBeInTheDocument();
  });

  /* ─── 공개 범위 radio 3개 ─── */

  it("공개 범위 radio 3개가 표시되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("각 radio에 정확한 accessible name이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("radio", {
        name: "나만 보기 본인만 러브트리를 볼 수 있습니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "링크를 가진 사람만 링크를 알고 있는 사람에게만 러브트리가 공개됩니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "커뮤니티에 공개 모든 Relovetree 사용자가 커뮤니티에서 러브트리를 검색하고 볼 수 있습니다.",
      })
    ).toBeInTheDocument();
  });

  it("정확히 하나의 radio가 초기 선택되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    const checked = radios.filter((r) => (r as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
  });

  it("초기 선택된 radio는 '나만 보기'여야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const radio = screen.getByRole("radio", {
      name: "나만 보기 본인만 러브트리를 볼 수 있습니다.",
    });
    expect(radio).toBeChecked();
  });

  /* ─── 추가 설정 checkbox 3개 ─── */

  it("추가 설정 checkbox 3개가 표시되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("각 checkbox에 정확한 accessible name이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "댓글 허용 내 러브트리에 다른 사용자가 댓글을 남길 수 있습니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "좋아요 허용 내 러브트리에 좋아요 표현을 받을 수 있습니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: "프로필 표시 이름 공개 러브트리 옆에 내 프로필 표시 이름을 공개합니다.",
      })
    ).toBeInTheDocument();
  });

  it("댓글 허용과 좋아요 허용은 초기 선택되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "댓글 허용 내 러브트리에 다른 사용자가 댓글을 남길 수 있습니다.",
      })
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "좋아요 허용 내 러브트리에 좋아요 표현을 받을 수 있습니다.",
      })
    ).toBeChecked();
  });

  it("프로필 표시 이름 공개는 초기 선택 해제되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "프로필 표시 이름 공개 러브트리 옆에 내 프로필 표시 이름을 공개합니다.",
      })
    ).not.toBeChecked();
  });

  /* ─── 공유 링크 ─── */

  it("공유 링크 입력 필드가 표시되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const input = screen.getByRole("textbox", { name: "공유 링크 주소" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("https://example.invalid/share/demo-tree");
  });

  /* ─── 버튼 ─── */

  it("링크 복사 버튼이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("button", { name: "링크 복사" })
    ).toBeInTheDocument();
  });

  it("저장 버튼이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("button", { name: "공개 범위 저장" })
    ).toBeInTheDocument();
  });

  it("홈 빠른 이동 버튼 클릭 시 /로 이동한다", () => {
    renderAppAt("/settings/visibility-demo");
    const homeBtn = screen.getByRole("button", { name: "홈" });
    fireEvent.click(homeBtn);
    expect(window.location.pathname).toBe("/");
  });

  it("내 러브트리 빠른 이동 버튼 클릭 시 /my-trees로 이동한다", () => {
    renderAppAt("/settings/visibility-demo");
    const treesBtn = screen.getByRole("button", { name: "내 러브트리" });
    fireEvent.click(treesBtn);
    expect(window.location.pathname).toBe("/my-trees");
  });

  it("에디터 복귀 버튼 클릭 시 /tree/edit-demo로 이동한다", () => {
    renderAppAt("/settings/visibility-demo");
    const editorBtn = screen.getByRole("button", { name: "에디터 복귀" });
    fireEvent.click(editorBtn);
    expect(window.location.pathname).toBe("/tree/edit-demo");
  });

  it("모든 버튼 클릭 후 fetch가 0회여야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const navigationButtonNames = ["홈", "내 러브트리", "에디터로 돌아가기"];
    const buttons = screen.getAllByRole("button").filter(
      (b) => !navigationButtonNames.includes(b.textContent || "")
    );
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("Clipboard API가 호출되지 않아야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const clipboardSpy = vi.fn();
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: clipboardSpy },
    });

    const copyButton = screen.getByRole("button", { name: "링크 복사" });
    fireEvent.click(copyButton);

    expect(clipboardSpy).not.toHaveBeenCalled();
  });

  it("Storage API가 호출되지 않아야 한다", () => {
    renderAppAt("/settings/visibility-demo");
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

    // Render and interact with radios and checkboxes
    const radios = screen.getAllByRole("radio");
    radios.forEach((r) => fireEvent.click(r));
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((c) => fireEvent.click(c));
    const navigationButtonNames = ["홈", "내 러브트리", "에디터로 돌아가기"];
    const buttons = screen.getAllByRole("button").filter(
      (b) => !navigationButtonNames.includes(b.textContent || "")
    );
    buttons.forEach((b) => fireEvent.click(b));

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("URL이 변경되지 않아야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const currentUrl = window.location.href;

    const navigationButtonNames = ["홈", "내 러브트리", "에디터로 돌아가기"];
    const buttons = screen.getAllByRole("button").filter(
      (b) => !navigationButtonNames.includes(b.textContent || "")
    );
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(window.location.href).toBe(currentUrl);
  });

  it("modal, toast, dialog가 없어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  /* ─── decorative SVG 접근성 계약 ─── */

  it("모든 SVG는 aria-hidden 조상 안에 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const svgs = document.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
    svgs.forEach((svg) => {
      expect(svg.closest('[aria-hidden="true"]')).not.toBeNull();
    });
  });

  it("모든 SVG에 focusable='false'가 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const svgs = document.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  /* ─── radio/checkbox 변경 후 사이드 이펙트 없음 ─── */

  it("radio를 변경해도 네트워크·Storage·Clipboard 호출이 없어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const fetchSpy = vi.fn();
    const clipboardSpy = vi.fn();
    const getItemSpy = vi.fn(() => null);
    const setItemSpy = vi.fn();

    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: clipboardSpy },
    });
    vi.stubGlobal("localStorage", {
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });

    const radios = screen.getAllByRole("radio");
    // 이미 선택된 것 외의 radio를 클릭
    const uncheckedRadio = radios.find((r) => !(r as HTMLInputElement).checked);
    if (uncheckedRadio) fireEvent.click(uncheckedRadio);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clipboardSpy).not.toHaveBeenCalled();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("checkbox를 변경해도 네트워크·Storage·Clipboard 호출이 없어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const fetchSpy = vi.fn();
    const clipboardSpy = vi.fn();
    const getItemSpy = vi.fn(() => null);
    const setItemSpy = vi.fn();

    vi.stubGlobal("fetch", fetchSpy);
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: clipboardSpy },
    });
    vi.stubGlobal("localStorage", {
      getItem: getItemSpy,
      setItem: setItemSpy,
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });

    const checkboxes = screen.getAllByRole("checkbox");
    // 하나 클릭/변경
    fireEvent.click(checkboxes[0]);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(clipboardSpy).not.toHaveBeenCalled();
    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  /* ─── 기존 경로 회귀 테스트 ─── */

  describe("기존 경로 회귀", () => {
    it("/ 경로가 정상 렌더링되어야 한다", () => {
      renderAppAt("/");
      // HomePage: document.title 미설정, 페이지 내용이 렌더링되는 것으로 확인
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
  });
});
