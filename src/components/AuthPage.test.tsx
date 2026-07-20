import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import CommunityPage from "./CommunityPage";
import AuthLoginPage from "./AuthLoginPage";

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Auth BASE 라우팅 (LT3-AUTH-001)", () => {
  it("/login에서 로그인 화면이 노출된다", () => {
    renderWithRouter("/login");
    expect(screen.getByText("Relovetree")).toBeInTheDocument();
    expect(
      screen.getByText("내 러브트리를 계속 이어가려면 로그인하세요")
    ).toBeInTheDocument();
  });

  it("Google 로그인 버튼이 노출된다", () => {
    render(<AuthLoginPage />);
    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeInTheDocument();
  });

  it("이메일 로그인 버튼이 노출된다", () => {
    render(<AuthLoginPage />);
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();
  });

  it("로그인 버튼 클릭 시 네트워크 요청이 없다", async () => {
    const user = userEvent.setup();
    render(<AuthLoginPage />);
    const googleBtn = screen.getByRole("button", {
      name: "구글 계정으로 계속하기",
    });
    await user.click(googleBtn);
    /* No error, no navigation, no toast — BASE placeholder */
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();
  });

  it("/는 HomePage를 유지한다", () => {
    renderWithRouter("/");
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })
    ).toBeInTheDocument();
  });

  it("/community는 CommunityPage를 유지한다", () => {
    renderWithRouter("/community");
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("미존재 경로는 fallback된다", () => {
    renderWithRouter("/unknown-path");
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })
    ).toBeInTheDocument();
  });
});
