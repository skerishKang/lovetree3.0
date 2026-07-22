import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage";
import CommunityPage from "./CommunityPage";
import AuthLoginPage from "./AuthLoginPage";
import {
  APP_BRAND,
  LOGIN_HEADING,
  LOGIN_DESCRIPTION,
  TRUST_CONTEXT,
  LEGAL_NOTICE,
  AUTH_FEATURES,
} from "../data/authMockData";

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
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("1. /login 실제 route가 정상 렌더링된다", () => {
    renderWithRouter("/login");

    // Brand text exact 1
    const brandElements = screen.getAllByText(APP_BRAND);
    expect(brandElements).toHaveLength(1);

    // Heading h1 exact 1 and text matches LOGIN_HEADING
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(LOGIN_HEADING);
    expect(headings[0].textContent).toBe(LOGIN_HEADING);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: LOGIN_HEADING,
      })
    ).toBeInTheDocument();

    // Description exact 1
    const descriptions = screen.getAllByText(LOGIN_DESCRIPTION);
    expect(descriptions).toHaveLength(1);
  });

  it("2. exact DOM contract를 준수한다", () => {
    const { container } = renderWithRouter("/login");

    // Google & Email buttons exact 1
    const googleBtn = screen.getByRole("button", { name: "구글 계정으로 계속하기" });
    const emailBtn = screen.getByRole("button", { name: "이메일로 로그인" });
    expect(googleBtn).toBeInTheDocument();
    expect(emailBtn).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);

    // Trust section exact 1
    const trustTitle = screen.getByRole("heading", { level: 2, name: TRUST_CONTEXT.title });
    expect(trustTitle).toBeInTheDocument();
    expect(screen.getByText(TRUST_CONTEXT.description)).toBeInTheDocument();

    // Value items, labels, descriptions exact 3
    const valueItems = screen.getAllByTestId("auth-value-item");
    expect(valueItems).toHaveLength(3);

    AUTH_FEATURES.forEach((feature) => {
      expect(screen.getByText(feature.label)).toBeInTheDocument();
      expect(screen.getByText(feature.description)).toBeInTheDocument();
    });

    // Legal notice exact 1
    expect(screen.getByText(LEGAL_NOTICE)).toBeInTheDocument();

    // Dialog/alertdialog/alert count 0
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="alertdialog"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
  });

  it("3. decorative SVG contract를 준수한다", () => {
    const { container } = renderWithRouter("/login");

    const decorativeSvgs = container.querySelectorAll('svg[aria-hidden="true"]');
    expect(decorativeSvgs).toHaveLength(4);

    for (const svg of decorativeSvgs) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
      expect(svg).toHaveAttribute("focusable", "false");
    }
  });

  it("4. presentation-only side-effect contract를 준수한다", async () => {
    // Install side-effect spies BEFORE render
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const xhrOpenSpy = vi.spyOn(XMLHttpRequest.prototype, "open");
    const storageGetSpy = vi.spyOn(Storage.prototype, "getItem");
    const storageSetSpy = vi.spyOn(Storage.prototype, "setItem");
    const storageRemoveSpy = vi.spyOn(Storage.prototype, "removeItem");
    const storageClearSpy = vi.spyOn(Storage.prototype, "clear");
    const windowOpenSpy = vi.spyOn(window, "open");

    const { container } = renderWithRouter("/login");

    // Capture initial DOM state & URL
    const initialUrl = window.location.href;
    const initialH1s = screen.getAllByRole("heading", { level: 1 });
    const initialH1Text = initialH1s[0].textContent;
    const initialGoogleBtnCount = screen.getAllByRole("button", { name: "구글 계정으로 계속하기" }).length;
    const initialEmailBtnCount = screen.getAllByRole("button", { name: "이메일로 로그인" }).length;
    const initialValueItemCount = screen.getAllByTestId("auth-value-item").length;
    const initialLegalNoticeCount = screen.getAllByText(LEGAL_NOTICE).length;

    const user = userEvent.setup();
    const googleBtn = screen.getByRole("button", { name: "구글 계정으로 계속하기" });
    const emailBtn = screen.getByRole("button", { name: "이메일로 로그인" });

    // Click both buttons
    await user.click(googleBtn);
    await user.click(emailBtn);

    // Verify side-effect call counts are exactly 0
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(xhrOpenSpy).not.toHaveBeenCalled();
    expect(storageGetSpy).not.toHaveBeenCalled();
    expect(storageSetSpy).not.toHaveBeenCalled();
    expect(storageRemoveSpy).not.toHaveBeenCalled();
    expect(storageClearSpy).not.toHaveBeenCalled();
    expect(windowOpenSpy).not.toHaveBeenCalled();

    // Verify DOM and URL contracts remain unchanged
    expect(window.location.href).toBe(initialUrl);
    const postH1s = screen.getAllByRole("heading", { level: 1 });
    expect(postH1s).toHaveLength(initialH1s.length);
    expect(postH1s[0].textContent).toBe(initialH1Text);
    expect(screen.getAllByRole("button", { name: "구글 계정으로 계속하기" })).toHaveLength(initialGoogleBtnCount);
    expect(screen.getAllByRole("button", { name: "이메일로 로그인" })).toHaveLength(initialEmailBtnCount);
    expect(screen.getAllByTestId("auth-value-item")).toHaveLength(initialValueItemCount);
    expect(screen.getAllByText(LEGAL_NOTICE)).toHaveLength(initialLegalNoticeCount);

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="alertdialog"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="alert"]')).toHaveLength(0);
  });

  it("5. /는 HomePage를 유지한다", () => {
    renderWithRouter("/");
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })
    ).toBeInTheDocument();
  });

  it("6. /community는 CommunityPage를 유지한다", () => {
    renderWithRouter("/community");
    expect(
      screen.getByRole("heading", { name: "다른 팬들의 러브트리 구경하기" })
    ).toBeInTheDocument();
  });

  it("7. 미존재 경로는 fallback된다", () => {
    renderWithRouter("/unknown-path");
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })
    ).toBeInTheDocument();
  });
});
