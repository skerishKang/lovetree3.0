import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CreateTreePage from "./CreateTreePage";

vi.mock("../hooks/useCreateTree", () => ({
  useCreateTree: vi.fn(),
}));

import { useCreateTree } from "../hooks/useCreateTree";
const mockUseCreateTree = useCreateTree as ReturnType<typeof vi.fn>;

afterEach(() => { cleanup(); vi.clearAllMocks(); });

function renderPage() {
  return render(<MemoryRouter><CreateTreePage /></MemoryRouter>);
}

const defaultReturn = {
  status: "idle",
  error: null,
  created: null,
  submit: vi.fn(),
};

describe("CreateTreePage — /tree/new", () => {
  it("shows title input and visibility radio", () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    expect(screen.getByLabelText("러브트리 제목")).toBeInTheDocument();
    expect(screen.getByLabelText("공개")).toBeInTheDocument();
    expect(screen.getByLabelText("비공개")).toBeInTheDocument();
  });

  it("defaults to public visibility", () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    expect(screen.getByLabelText("공개")).toBeChecked();
    expect(screen.getByLabelText("비공개")).not.toBeChecked();
  });

  it("shows submit button", () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    expect(screen.getByRole("button", { name: "러브트리 만들기" })).toBeInTheDocument();
  });

  it("disables submit while submitting", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "submitting" });
    renderPage();
    expect(screen.getByRole("button", { name: "저장 중..." })).toBeDisabled();
  });

  it("shows private visibility note when private selected", async () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    await userEvent.click(screen.getByLabelText("비공개"));
    expect(screen.getByText("비공개 저장은 계정 등급에 따라 제한될 수 있습니다.")).toBeInTheDocument();
  });

  it("blocks empty title client-side", async () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    await userEvent.click(screen.getByRole("button", { name: "러브트리 만들기" }));
    expect(screen.getByText("러브트리 제목을 입력해 주세요.")).toBeInTheDocument();
    expect(defaultReturn.submit).not.toHaveBeenCalled();
  });

  it("blocks whitespace-only title client-side", async () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    await userEvent.type(screen.getByLabelText("러브트리 제목"), "   ");
    await userEvent.click(screen.getByRole("button", { name: "러브트리 만들기" }));
    expect(screen.getByText("러브트리 제목을 입력해 주세요.")).toBeInTheDocument();
    expect(defaultReturn.submit).not.toHaveBeenCalled();
  });

  it("shows validation-error from hook", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "validation-error", error: "제목이 유효하지 않습니다." });
    renderPage();
    expect(screen.getByText("제목이 유효하지 않습니다.")).toBeInTheDocument();
  });

  it("shows forbidden state", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "forbidden", error: "비공개 저장이 제한됩니다." });
    renderPage();
    expect(screen.getByText("비공개 저장이 제한됩니다.")).toBeInTheDocument();
  });

  it("shows conflict state", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "conflict", error: "중복 트리" });
    renderPage();
    expect(screen.getByText("중복 트리")).toBeInTheDocument();
  });

  it("shows too-large state", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "too-large", error: "너무 큼" });
    renderPage();
    expect(screen.getByText("너무 큼")).toBeInTheDocument();
  });

  it("shows unauthorized state", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "unauthorized" });
    renderPage();
    expect(screen.getByText("세션을 다시 확인하고 있어요. 로그인 화면으로 이동합니다.")).toBeInTheDocument();
  });

  it("shows ambiguous state with error and /my-trees action", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "ambiguous", error: "저장 결과를 확인할 수 없습니다." });
    renderPage();
    expect(screen.getByText("저장 결과를 확인할 수 없습니다.")).toBeInTheDocument();
    expect(screen.getByText("내 러브트리에서 확인")).toBeInTheDocument();
  });

  it("shows malformed state as ambiguous", () => {
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, status: "malformed", error: "응답 형식 오류" });
    renderPage();
    expect(screen.getByText("응답 형식 오류")).toBeInTheDocument();
    expect(screen.getByText("내 러브트리에서 확인")).toBeInTheDocument();
  });

  it("shows char count", () => {
    mockUseCreateTree.mockReturnValue(defaultReturn);
    renderPage();
    expect(screen.getByText("0/80")).toBeInTheDocument();
  });

  it("calls submit on form submit", async () => {
    const submit = vi.fn();
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, submit });
    renderPage();
    await userEvent.type(screen.getByLabelText("러브트리 제목"), "내 새 트리");
    await userEvent.click(screen.getByRole("button", { name: "러브트리 만들기" }));
    expect(submit).toHaveBeenCalledWith({ title: "내 새 트리", visibility: "public" });
  });

  it("submits private visibility when selected", async () => {
    const submit = vi.fn();
    mockUseCreateTree.mockReturnValue({ ...defaultReturn, submit });
    renderPage();
    await userEvent.type(screen.getByLabelText("러브트리 제목"), "비공개 트리");
    await userEvent.click(screen.getByLabelText("비공개"));
    await userEvent.click(screen.getByRole("button", { name: "러브트리 만들기" }));
    expect(submit).toHaveBeenCalledWith({ title: "비공개 트리", visibility: "private" });
  });
});
