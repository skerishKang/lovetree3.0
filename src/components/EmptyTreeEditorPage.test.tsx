import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";
import EmptyTreeEditorPage from "./EmptyTreeEditorPage";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current path">{location.pathname}</output>;
}

function renderStart() {
  render(
    <MemoryRouter initialEntries={["/tree/new-demo"]}>
      <Routes>
        <Route path="/tree/new-demo" element={<EmptyTreeEditorPage />} />
        <Route path="/tree/new-demo/memory/new" element={<h1>첫 기억 입력 화면</h1>} />
        <Route path="/tree/new-demo/edit" element={<h1>공개 데모 편집 화면</h1>} />
      </Routes>
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("EmptyTreeEditorPage — public demo start", () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    localStorage.removeItem("unrelated-key");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("preserves the editor layout while exposing editable draft fields", () => {
    renderStart();

    expect(screen.getByRole("navigation", { name: "에디터 메뉴" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "새 러브트리" })).toBeInTheDocument();
    expect(screen.getByText("첫 순간을 추가해 러브트리를 시작하세요")).toBeInTheDocument();
    expect(screen.getByText("브라우저 체험판 · 서버 저장 없음")).toBeInTheDocument();
    expect(screen.getByLabelText("러브트리 제목")).toBeRequired();
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
  });

  it("requires a title and starts the public first-memory route without network writes", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderStart();

    await user.click(screen.getByRole("button", { name: "첫 순간 추가" }));
    expect(screen.getByRole("alert")).toHaveTextContent("러브트리 제목을 입력하세요");

    await user.type(screen.getByLabelText("러브트리 제목"), "공개 데모 트리");
    await user.type(screen.getByLabelText("설명"), "브라우저에만 저장되는 설명");
    await user.click(screen.getByRole("button", { name: "첫 순간 추가" }));

    expect(screen.getByLabelText("current path")).toHaveTextContent("/tree/new-demo/memory/new");
    expect(screen.getByRole("heading", { name: "첫 기억 입력 화면" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });

  it("resumes an existing valid draft at the editor route", async () => {
    localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      tree: { title: "복원된 트리", description: "복원 설명" },
      nodes: [{
        id: "root",
        parentId: null,
        title: "복원 기억",
        date: "2026-07-26",
        emotion: "행복",
        memo: "복원 메모",
        youtubeUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
        videoId: "c4V0FNZfEv0",
      }],
      selectedNodeId: "root",
    }));
    const user = userEvent.setup();
    renderStart();

    expect(screen.getByDisplayValue("복원된 트리")).toBeInTheDocument();
    expect(screen.getByDisplayValue("복원 설명")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "기존 작업 이어가기" }));
    expect(screen.getByLabelText("current path")).toHaveTextContent("/tree/new-demo/edit");
  });

  it("reset Escape returns focus and confirmation removes only the exact key", async () => {
    localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      tree: { title: "초기화 대상", description: "" },
      nodes: [],
      selectedNodeId: null,
    }));
    localStorage.setItem("unrelated-key", "keep");
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    const user = userEvent.setup();
    renderStart();

    const resetButton = screen.getByRole("button", { name: "전체 초기화" });
    resetButton.focus();
    await user.click(resetButton);
    await waitFor(() => expect(screen.getByRole("button", { name: "취소" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(resetButton).toHaveFocus());

    await user.click(resetButton);
    await user.click(screen.getByRole("button", { name: "draft 완전 삭제" }));
    expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated-key")).toBe("keep");
    expect(clearSpy).not.toHaveBeenCalled();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
  });

  it("does not call localStorage.clear while editing fields", () => {
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    renderStart();
    fireEvent.change(screen.getByLabelText("러브트리 제목"), {
      target: { value: "편집 중" },
    });
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
