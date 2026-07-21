import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import TreeDetailPage from "./TreeDetailPage";

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/tree/community-demo"]}>
      <TreeDetailPage />
    </MemoryRouter>
  );
}

describe("TreeDetailPage (LT3-TREE-DETAIL-001)", () => {
  it("트리 제목을 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { name: "테스트 러버 A의 러브트리" })
    ).toBeInTheDocument();
  });

  it("트리 작성자를 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("테스트 러버 A")).toBeInTheDocument();
    expect(screen.getByText("@user.hanma")).toBeInTheDocument();
  });

  it("8개 기억 카드를 렌더링한다", () => {
    renderPage();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(8);
  });

  it("소셜 액션 버튼을 렌더링한다", () => {
    renderPage();
    expect(screen.getByRole("button", { name: "좋아요" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "댓글" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "공유" })).toBeInTheDocument();
  });

  it("저장 버튼을 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByRole("button", { name: "내 러브트리에 저장" })
    ).toBeInTheDocument();
  });

  it("댓글 목록을 렌더링한다", () => {
    renderPage();
    expect(screen.getByText("아트라")).toBeInTheDocument();
    expect(screen.getByText("타이마")).toBeInTheDocument();
    expect(screen.getByText("리온")).toBeInTheDocument();
  });

  it("댓글 입력창을 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByPlaceholderText("댓글 달기...")
    ).toBeInTheDocument();
  });

  it("subtitle을 렌더링한다", () => {
    renderPage();
    expect(
      screen.getByText("입덕부터 지금까지 이어진 순간들")
    ).toBeInTheDocument();
  });

  it("좋아요 수가 128이며 클릭 후에도 변하지 않는다", () => {
    renderPage();
    const likeBtn = screen.getByRole("button", { name: "좋아요" });
    expect(likeBtn).toHaveTextContent("128");
    likeBtn.click();
    expect(likeBtn).toHaveTextContent("128");
  });

  it("저장 버튼 문구가 클릭 전후로 동일하다", () => {
    renderPage();
    const saveBtn = screen.getByRole("button", {
      name: "내 러브트리에 저장",
    });
    expect(saveBtn).toHaveTextContent("내 러브트리에 저장");
    saveBtn.click();
    expect(saveBtn).toHaveTextContent("내 러브트리에 저장");
  });

  it("네트워크 요청을 하지 않는다", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderPage();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
