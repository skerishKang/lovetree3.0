import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import CommunityPage from "./CommunityPage";
import AuthLoginPage from "./AuthLoginPage";

const renderWithRouter = (
  initialPath: string,
  { routeOptions = {} }: { routeOptions?: { initialEntries?: string[] } } = {}
) => {
  const { initialEntries = [initialPath], ...options } = routeOptions;
  return render(
    <MemoryRouter initialEntries={initialEntries} {...options}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/login" element={<AuthLoginPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Auth 로그인 화면 검증 (LT3-AUTH-001)", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("1. 필수 DOM 요소들이 정확히 렌더링된다", () => {
    render(<AuthLoginPage />);

    // Brand and heading
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Relovetree")).toBeInTheDocument();
    expect(screen.getByText(/기록한 순간을 안전하게 저장하고/)).toBeInTheDocument();

    // Buttons
    expect(screen.getByRole("button", { name: "구글 계정으로 계속하기" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "이메일로 로그인" })).toBeInTheDocument();

    // Legal notice
    expect(screen.getByText(/서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다/)).toBeInTheDocument();

    // Trust context
    expect(screen.getByRole("heading", { level: 2, name: "기록은 개인 공간에서 시작됩니다" })).toBeInTheDocument();
    expect(screen.getByText(/로그인한 뒤 나만의 기록을 이어가고/)).toBeInTheDocument();

    // Value items (3)
    expect(screen.getAllByText(/기록 저장|공유 관리|댓글 알림/)).toHaveLength(3);
  });

  it("2. 모든 decorative SVG는 aria-hidden=\"true\" 이고 focusable=false이다", () => {
    const { container } = render(<AuthLoginPage />);
    const decorativeSvgs = container.querySelectorAll(
      'svg[aria-hidden="true"]'
    );
    expect(decorativeSvgs).toHaveLength(4);

    decorativeSvgs.forEach((svg) => {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
    });
  });

  it("3. 로그인 버튼 클릭 시 side-effect가 발생하지 않는다", async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => Promise.resolve(new Response()));
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => window);
    const pushStateSpy = vi.spyOn(window.history, "pushState");

    render(<AuthLoginPage />);

    const googleBtn = screen.getByRole("button", { name: "구글 계정으로 계속하기" });
    await user.click(googleBtn);

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(pushStateSpy).not.toHaveBeenCalled();

    // Check that the UI remains the same
    expect(screen.getByRole("button", { name: "구글 계정으로 계속하기" })).toBeInTheDocument();
  });

  it("4. 라우팅 회귀 테스트", () => {
    renderWithRouter("/");
    expect(screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })).toBeInTheDocument();
    cleanup();

    renderWithRouter("/community");
    expect(screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })).toBeInTheDocument();
    cleanup();

    renderWithRouter("/login");
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
  });

  it("5. 미존재 경로는 fallback된다", () => {
    renderWithRouter("/unknown-path");
    expect(screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })).toBeInTheDocument();
  });
});
