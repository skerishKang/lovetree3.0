import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import App from "../App";

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  render(<App />);
}

describe("VisibilitySettingsPage — Visual Contracts", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.pushState({}, "", "/");
  });

  it("h1이 정확히 하나야", () => {
    renderAppAt("/settings/visibility-demo");
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it("h1 텍스트가 '공개 범위 설정'이어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("heading", { level: 1, name: "공개 범위 설정" })
    ).toBeInTheDocument();
  });

  it("설명 문장이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByText(/LoveTree의 공개 범위와 참여 설정을 관리합니다/)
    ).toBeInTheDocument();
  });

  it("공개 범위 radio가 정확히 3개야", () => {
    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(3);
  });

  it("초기 선택된 radio가 정확히 1개야", () => {
    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    const checked = radios.filter((r) => (r as HTMLInputElement).checked);
    expect(checked).toHaveLength(1);
  });

  it("초기 선택된 radio은 '나만 보기'여야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const radio = screen.getByRole("radio", {
      name: "나만 보기 본인만 LoveTree를 볼 수 있습니다.",
    });
    expect(radio).toBeChecked();
  });

  it("공개 범위 radio 텍스트가 정확해야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("radio", {
        name: "나만 보기 본인만 LoveTree를 볼 수 있습니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "링크를 가진 사람만 링크를 알고 있는 사람에게만 LoveTree가 공개됩니다.",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", {
        name: "커뮤니티에 공개 모든 Relovetree 사용자가 커뮤니티에서 LoveTree를 검색하고 볼 수 있습니다.",
      })
    ).toBeInTheDocument();
  });

  it("추가 설정 checkbox가 정확히 3개야", () => {
    renderAppAt("/settings/visibility-demo");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
  });

  it("댓글 허용 checkbox가 초기 선택되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "댓글 허용 내 LoveTree에 다른 사용자가 댓글을 남길 수 있습니다.",
      })
    ).toBeChecked();
  });

  it("좋아요 허용 checkbox가 초기 선택되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "좋아요 허용 내 LoveTree에 좋아요 표현을 받을 수 있습니다.",
      })
    ).toBeChecked();
  });

  it("프로필 표시 이름 공개 checkbox가 초기 선택 해제되어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("checkbox", {
        name: "프로필 표시 이름 공개 LoveTree 옆에 내 프로필 표시 이름을 공개합니다.",
      })
    ).not.toBeChecked();
  });

  it("공유 링크 textbox가 정확히 1개야", () => {
    renderAppAt("/settings/visibility-demo");
    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes).toHaveLength(1);
  });

  it("공유 링크 textbox는 readOnly여야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const textbox = screen.getByRole("textbox", { name: "공유 링크 주소" });
    expect(textbox).toHaveAttribute("readonly");
  });

  it("공유 링크 textbox 값이 placeholder여야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const textbox = screen.getByRole("textbox", { name: "공유 링크 주소" });
    expect(textbox).toHaveValue("https://example.invalid/share/demo-tree");
  });

  it("링크 복사 버튼이 정확히 1개야", () => {
    renderAppAt("/settings/visibility-demo");
    const copyButtons = screen.getAllByRole("button", { name: "링크 복사" });
    expect(copyButtons).toHaveLength(1);
  });

  it("저장 버튼이 정확히 1개야", () => {
    renderAppAt("/settings/visibility-demo");
    const saveButtons = screen.getAllByRole("button", { name: "공개 범위 저장" });
    expect(saveButtons).toHaveLength(1);
  });

  it("모든 버튼 클릭 후 fetch 호출 0회", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/settings/visibility-demo");
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("XHR 호출 0회", () => {
    const xhrSpy = vi.fn();
    const originalXMLHttpRequest = globalThis.XMLHttpRequest;
    vi.stubGlobal("XMLHttpRequest", class {
      open = xhrSpy;
      send = vi.fn();
    });

    renderAppAt("/settings/visibility-demo");
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(xhrSpy).not.toHaveBeenCalled();

    vi.stubGlobal("XMLHttpRequest", originalXMLHttpRequest);
  });

  it("Storage 접근 0회", () => {
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

    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    radios.forEach((r) => fireEvent.click(r));
    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach((c) => fireEvent.click(c));
    const buttons = screen.getAllByRole("button");
    buttons.forEach((b) => fireEvent.click(b));

    expect(getItemSpy).not.toHaveBeenCalled();
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("Clipboard API 호출 0회", () => {
    const clipboardSpy = vi.fn();
    vi.stubGlobal("navigator", {
      ...navigator,
      clipboard: { writeText: clipboardSpy },
    });

    renderAppAt("/settings/visibility-demo");
    const copyButton = screen.getByRole("button", { name: "링크 복사" });
    fireEvent.click(copyButton);

    expect(clipboardSpy).not.toHaveBeenCalled();
  });

  it("URL이 변경되지 않아야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    const currentUrl = window.location.href;

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(window.location.href).toBe(currentUrl);
  });

  it("dialog 0", () => {
    renderAppAt("/settings/visibility-demo");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("alertdialog 0", () => {
    renderAppAt("/settings/visibility-demo");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("alert 0", () => {
    let alertCalled = false;
    const originalAlert = window.alert;
    vi.stubGlobal("alert", () => {
      alertCalled = true;
    });

    renderAppAt("/settings/visibility-demo");
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(alertCalled).toBe(false);

    vi.stubGlobal("alert", originalAlert);
  });

  it("window.open 0", () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    renderAppAt("/settings/visibility-demo");
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => fireEvent.click(btn));

    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("radio 선택 변경 후 사이드 이펙트 없음", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/settings/visibility-demo");
    const radios = screen.getAllByRole("radio");
    const uncheckedRadio = radios.find((r) => !(r as HTMLInputElement).checked);
    if (uncheckedRadio) fireEvent.click(uncheckedRadio);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("checkbox 선택 변경 후 사이드 이펙트 없음", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    renderAppAt("/settings/visibility-demo");
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("공유 링크 섹션 h2 라벨이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("heading", { level: 2, name: "공유 링크" })
    ).toBeInTheDocument();
  });

  it("추가 설정 섹션 legend이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("group", { name: "추가 설정" })
    ).toBeInTheDocument();
  });

  it("공개 범위 섹션 legend이 있어야 한다", () => {
    renderAppAt("/settings/visibility-demo");
    expect(
      screen.getByRole("group", { name: "공개 범위" })
    ).toBeInTheDocument();
  });
});