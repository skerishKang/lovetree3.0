import { describe, it, expect, vi } from "vitest";
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

describe("Auth 로그인 화면 검증 (LT3-AUTH-001)", () => {
  it("필수 요소들이 정확히 렌더링된다", () => {
    render(<AuthLoginPage />);
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Relovetree")).toBeInTheDocument();
    expect(screen.getByText(/기록한 순간을 안전하게 저장하고/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "구글 계정으로 계속하기" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다/)
    ).toBeInTheDocument();
    
    // 3 value items
    const features = screen.getAllByText(/기록 저장|공유 관리|댓글 알림/);
    expect(features).toHaveLength(3);
  });

  it("모든 decorative SVG는 aria-hidden='true'이다", () => {
    render(<AuthLoginPage />);
    const svgs = document.querySelectorAll("svg");
    svgs.forEach((svg) => {
      expect(svg.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("로그인 버튼 클릭 시 side-effect가 발생하지 않는다", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(new Response()));
    
    render(<AuthLoginPage />);
    
    const googleBtn = screen.getByRole("button", { name: "구글 계정으로 계속하기" });
    await user.click(googleBtn);
    
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("라우팅 회귀 테스트", () => {
    renderWithRouter("/");
    expect(screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })).toBeInTheDocument();
    
    renderWithRouter("/community");
    expect(screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })).toBeInTheDocument();
    
    renderWithRouter("/login");
    expect(screen.getByRole("heading", { name: "Relovetree", level: 1 })).toBeInTheDocument();
  });
});
