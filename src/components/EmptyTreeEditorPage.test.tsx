import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

const authState = vi.hoisted(() => ({
  user: null as null | {
    uid: string;
    displayName: null;
    email: null;
    photoURL: null;
    emailVerified: boolean;
  },
}));

vi.mock("../context/AuthContext", () => ({
  AuthProvider: ({ children }: { children: ReactNode }) => children,
  useAuthContext: () => null,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: authState.user,
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function renderStart() {
  window.history.pushState({}, "", "/tree/new-demo");
  render(<App />);
}

describe("EmptyTreeEditorPage — interactive public start", () => {
  afterEach(() => {
    cleanup();
    authState.user = null;
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("is public, has one h1, semantic fields, main landmark, and empty count", () => {
    renderStart();
    expect(window.location.pathname).toBe("/tree/new-demo");
    expect(screen.getAllByRole("heading", { level: 1, name: "새 러브트리" })).toHaveLength(1);
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByLabelText("러브트리 제목")).toBeRequired();
    expect(screen.getByLabelText("설명")).toBeInTheDocument();
    expect(screen.getByText("0 / 12 기억")).toBeInTheDocument();
    expect(screen.getByText("브라우저 체험판 · 서버 저장 없음")).toBeInTheDocument();
  });

  it("requires a title and associates the active alert with the field", async () => {
    const user = userEvent.setup();
    renderStart();
    await user.click(screen.getByRole("button", { name: "첫 기억 추가" }));
    const title = screen.getByLabelText("러브트리 제목");
    expect(title).toHaveAttribute("aria-invalid", "true");
    expect(title).toHaveAttribute("aria-describedby", "public-tree-title-error");
    expect(screen.getByRole("alert")).toHaveTextContent("러브트리 제목을 입력하세요");
  });

  it("starts a draft and navigates to the first-memory form without backend calls", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);
    const xhrSendSpy = vi.spyOn(XMLHttpRequest.prototype, "send");
    const user = userEvent.setup();
    renderStart();

    await user.type(screen.getByLabelText("러브트리 제목"), "새 공개 데모");
    await user.type(screen.getByLabelText("설명"), "서버 없이 만드는 트리");
    await user.click(screen.getByRole("button", { name: "첫 기억 추가" }));

    expect(window.location.pathname).toBe("/tree/new-demo/memory/new");
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
    expect(screen.getByRole("button", { name: "첫 기억 추가" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전체 초기화" })).toBeInTheDocument();
  });

  it("reset dialog cancels with Escape and returns focus", async () => {
    localStorage.setItem(PUBLIC_DEMO_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      tree: { title: "복원된 트리", description: "" },
      nodes: [],
      selectedNodeId: null,
    }));
    const user = userEvent.setup();
    renderStart();
    const reset = screen.getByRole("button", { name: "전체 초기화" });
    reset.focus();
    await user.click(reset);
    expect(screen.getByRole("dialog", { name: "공개 데모를 초기화할까요?" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("button", { name: "취소" })).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(reset).toHaveFocus());
  });

  it("never calls localStorage.clear", () => {
    const clearSpy = vi.spyOn(Storage.prototype, "clear");
    renderStart();
    fireEvent.change(screen.getByLabelText("러브트리 제목"), { target: { value: "테스트" } });
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
