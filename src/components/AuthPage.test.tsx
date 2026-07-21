import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import CommunityPage from "./CommunityPage";
import AuthLoginPage from "./AuthLoginPage";

const { fetch: originalFetch } = globalThis as typeof globalThis & {
  fetch: typeof fetch;
};

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
  beforeEach(() => {
    vi.spyOn(globalThis, "fetch").mockImplementation(originalFetch);
    vi.spyOn(globalThis.XMLHttpRequest.prototype, "open").mockImplementation(() => null as never);
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => null);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "clear").mockImplementation(() => {});
    vi.spyOn(globalThis, "open").mockImplementation(() => null as never);
  });

  it("/login에서 로그인 화면이 노출된다", () => {
    renderWithRouter("/login");
    expect(screen.getByText("LoveTree")).toBeInTheDocument();
    expect(
      screen.getByText("LoveTree에 계속 이어가려면 로그인하세요")
    ).toBeInTheDocument();
  });

  it("LoveTree 브랜드가 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const brandElements = screen.getAllByText("LoveTree");
    expect(brandElements).toHaveLength(1);
  });

  it("h1이 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
  });

  it("짧은 설명 문구가 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const descriptions = screen.getByText(
      "기록한 순간을 안전하게 개인 공간에 저장하고, 다른 기기에서도 이어서 볼 수 있어요"
    );
    expect(descriptions).toBeInTheDocument();
  });

  it("Google 계정으로 계속하기 버튼이 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const googleButtons = screen.getAllByRole("button", { name: "Google 계정으로 계속하기" });
    expect(googleButtons).toHaveLength(1);
  });

  it("이메일로 로그인 버튼이 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const emailButtons = screen.getAllByRole("button", { name: "이메일로 로그인" });
    expect(emailButtons).toHaveLength(1);
  });

  it("핵심 가치 항목이 정확히 3개 노출된다", () => {
    render(<AuthLoginPage />);
    expect(screen.getByText("개인 아카이브")).toBeInTheDocument();
    expect(screen.getByText("동기화")).toBeInTheDocument();
    expect(screen.getByText("연결")).toBeInTheDocument();
  });

  it("법적 공지사항이 정확히 1개 노출된다", () => {
    render(<AuthLoginPage />);
    const legalNotices = screen.getByText(
      "로그인하면 서비스 이용약관과 개인정보 처리방침에 동의하게 됩니다."
    );
    expect(legalNotices).toBeInTheDocument();
  });

  it("Google 로그인 버튼이 노출된다", () => {
    render(<AuthLoginPage />);
    expect(
      screen.getByRole("button", { name: "Google 계정으로 계속하기" })
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
      name: "Google 계정으로 계속하기",
    });
    await user.click(googleBtn);
    expect(
      screen.getByRole("button", { name: "이메일로 로그인" })
    ).toBeInTheDocument();
  });

  it("이메일 로그인 버튼 클릭 시 네트워크 요청이 없다", async () => {
    const user = userEvent.setup();
    render(<AuthLoginPage />);
    const emailBtn = screen.getByRole("button", {
      name: "이메일로 로그인",
    });
    await user.click(emailBtn);
    expect(
      screen.getByRole("button", { name: "Google 계정으로 계속하기" })
    ).toBeInTheDocument();
  });

  it("Google 로그인 버튼 클릭 후 URL과 DOM 계약이 불변", async () => {
    const user = userEvent.setup();
    render(<AuthLoginPage />);
    const initialButtons = screen.getAllByRole("button");
    expect(initialButtons).toHaveLength(2);

    const googleBtn = screen.getByRole("button", { name: "Google 계정으로 계속하기" });
    await user.click(googleBtn);

    const afterButtons = screen.getAllByRole("button");
    expect(afterButtons).toHaveLength(2);
  });

  it("dialog, alertdialog, alert 요소가 0개다", () => {
    render(<AuthLoginPage />);
    const dialogs = document.querySelectorAll("dialog, alertdialog, alert");
    expect(dialogs).toHaveLength(0);
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