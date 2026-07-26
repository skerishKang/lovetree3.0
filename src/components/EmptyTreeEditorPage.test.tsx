import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { PublicDemoEditorProvider } from "../context/PublicDemoEditorContext";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";
import EmptyTreeEditorPage from "./EmptyTreeEditorPage";

function LocationProbe() {
  const location = useLocation();
  return <output aria-label="current path">{location.pathname}</output>;
}

function renderStart() {
  render(
    <MemoryRouter initialEntries={["/tree/new-demo"]}>
      <PublicDemoEditorProvider>
        <Routes>
          <Route path="/tree/new-demo" element={<EmptyTreeEditorPage />} />
          <Route path="/tree/new-demo/memory/new" element={<h1>첫 기억 입력 화면</h1>} />
        </Routes>
        <LocationProbe />
      </PublicDemoEditorProvider>
    </MemoryRouter>,
  );
}

describe("EmptyTreeEditorPage — interactive public start", () => {
  afterEach(() => {
    cleanup();
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    localStorage.removeItem("unrelated-key");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders one h1, semantic fields, main landmark, browser-only wording, and empty count", () => {
    renderStart();
    expect(screen.getByLabelText("current path")).toHaveTextContent("/tree/new-demo");
    expect(screen.getAllByRole("heading", { level: 1, name: "새 러브트리" })).toHaveLength(1);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("러브트리 제목")).toBeRequired();
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
    expect(screen.getByText("브라우저 체험판 · 서버 저장 없음")).toBeInTheDocument();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
  });

  it("validates the required title and starts the first-memory flow without network calls", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderStart();

    await user.click(screen.getByRole("button", { name: "첫 기억 추가" }));
    expect(screen.getByLabelText("러브트리 제목")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("러브트리 제목을 입력하세요");

    await user.type(screen.getByLabelText("러브트리 제목"), "새 공개 데모");
    await user.type(screen.getByLabelText("설명"), "서버 없이 만드는 트리");
    await user.click(screen.getByRole("button", { name: "첫 기억 추가" }));

    expect(screen.getByLabelText("current path")).toHaveTextContent("/tree/new-demo/memory/new");
    expect(screen.getByRole("heading", { name: "첫 기억 입력 화면" })).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrSendSpy).not.toHaveBeenCalled();
  });

  it("resumes a valid saved draft", () => {
    localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      tree: { title: "복원된 트리", description: "복원 설명" },
      nodes: [],
      selectedNodeId: null,
    }));
    renderStart();
    expect(screen.getByDisplayValue("복원된 트리")).toBeInTheDocument();
    expect(screen.getByDisplayValue("복원 설명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체 초기화" })).toBeInTheDocument();
  });

  it("cancels reset with Escape, returns focus, and removes only the exact draft key", async () => {
    localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      tree: { title: "복원된 트리", description: "" },
      nodes: [],
      selectedNodeId: null,
    }));
    localStorage.setItem("unrelated-key", "keep");
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    const user = userEvent.setup();
    renderStart();

    const reset = screen.getByRole("button", { name: "전체 초기화" });
    reset.focus();
    await user.click(reset);
    await waitFor(() => expect(screen.getByRole("button", { name: "취소" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(reset).toHaveFocus());

    await user.click(reset);
    await user.click(screen.getByRole("button", { name: "draft 완전 삭제" }));
    expect(localStorage.getItem(PUBLIC_DEMO_STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem("unrelated-key")).toBe("keep");
    expect(clearSpy).not.toHaveBeenCalled();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
  });

  it("does not call localStorage.clear while editing", () => {
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    renderStart();
    fireEvent.change(screen.getByLabelText("러브트리 제목"), { target: { value: "테스트" } });
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
