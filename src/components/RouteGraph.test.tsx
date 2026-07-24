import { describe, it, expect, afterEach } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import { AppRoutes } from "../App";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location" style={{ display: "none" }}>
      {location.pathname}
    </div>
  );
}

function renderRoute(initialEntries: string[], initialIndex?: number) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <>
            <AppRoutes />
            <LocationProbe />
          </>
        ),
      },
    ],
    { initialEntries, initialIndex },
  );
  render(<RouterProvider router={router} />);
  return router;
}

function currentLocation() {
  return screen.getByTestId("location").textContent ?? "";
}

const ALL_ROUTES = [
  "/",
  "/community",
  "/login",
  "/tree/community-demo",
  "/memory/connect-demo",
  "/my-trees",
  "/tree/edit-demo",
  "/tree/new-demo",
  "/memory/detail-demo",
  "/media/search-demo",
  "/settings/visibility-demo",
  "/my-trees/empty-demo",
] as const;

const ROUTE_HEADINGS: Record<string, { level: number; name: string }> = {
  "/": { level: 1, name: "사랑에 빠진 모든 순간을 기록해 보세요" },
  "/community": { level: 1, name: "다른 팬들의 러브트리 구경하기" },
  "/login": { level: 1, name: "내 러브트리를 계속 이어가려면 로그인하세요" },
  "/tree/community-demo": { level: 1, name: "테스트 러버 A의 러브트리" },
  "/memory/connect-demo": { level: 1, name: "어느 순간과 연결할까요?" },
  "/my-trees": { level: 1, name: "나의 러브트리" },
  "/tree/edit-demo": { level: 1, name: "러브트리 편집" },
  "/tree/new-demo": { level: 1, name: "새 러브트리" },
  "/memory/detail-demo": { level: 1, name: "기억 상세" },
  "/media/search-demo": { level: 1, name: "미디어 검색" },
  "/settings/visibility-demo": { level: 1, name: "공개 범위 설정" },
  "/my-trees/empty-demo": { level: 1, name: "아직 러브트리가 없어요" },
};

describe("Route Graph — all 12 routes reachable from /", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders all 12 routes without error", () => {
    for (const route of ALL_ROUTES) {
      renderRoute([route]);
      expect(currentLocation()).toBe(route);
      const heading = screen.getByRole("heading", {
        level: ROUTE_HEADINGS[route].level,
        name: ROUTE_HEADINGS[route].name,
      });
      expect(heading).toBeInTheDocument();
      cleanup();
    }
  });

  it("click-through from / reaches all 12 routes via visible links and buttons", () => {
    const visited = new Set<string>();

    renderRoute(["/"]);
    expect(currentLocation()).toBe("/");
    visited.add("/");

    fireEvent.click(screen.getByRole("link", { name: "로그인" }));
    expect(currentLocation()).toBe("/login");
    visited.add("/login");

    fireEvent.click(screen.getByRole("link", { name: "Relovetree" }));
    expect(currentLocation()).toBe("/");

    fireEvent.click(screen.getByRole("link", { name: "Community" }));
    expect(currentLocation()).toBe("/community");
    visited.add("/community");

    fireEvent.click(screen.getByRole("link", { name: "🌟 Featured 러브트리" }));
    expect(currentLocation()).toBe("/tree/community-demo");
    visited.add("/tree/community-demo");

    fireEvent.click(screen.getAllByTestId("timeline-memory-card")[0]);
    expect(currentLocation()).toBe("/memory/detail-demo");
    visited.add("/memory/detail-demo");

    fireEvent.click(screen.getByRole("button", { name: "기억 연결" }));
    expect(currentLocation()).toBe("/memory/connect-demo");
    visited.add("/memory/connect-demo");

    fireEvent.click(screen.getByRole("button", { name: "미디어 검색" }));
    expect(currentLocation()).toBe("/media/search-demo");
    visited.add("/media/search-demo");

    fireEvent.click(screen.getByRole("button", { name: "결과 검토" }));
    expect(currentLocation()).toBe("/memory/connect-demo");

    fireEvent.click(screen.getByRole("button", { name: "에디터 복귀" }));
    expect(currentLocation()).toBe("/tree/edit-demo");
    visited.add("/tree/edit-demo");

    fireEvent.click(screen.getByText("설정").closest("a")!);
    expect(currentLocation()).toBe("/settings/visibility-demo");
    visited.add("/settings/visibility-demo");

    fireEvent.click(screen.getByRole("button", { name: "에디터 복귀" }));
    expect(currentLocation()).toBe("/tree/edit-demo");

    fireEvent.click(screen.getByRole("button", { name: "새 러브트리 만들기" }));
    expect(currentLocation()).toBe("/tree/new-demo");
    visited.add("/tree/new-demo");

    cleanup();
    renderRoute(["/my-trees"]);
    visited.add("/my-trees");

    fireEvent.click(screen.getByRole("link", { name: "빈 상태 미리보기" }));
    expect(currentLocation()).toBe("/my-trees/empty-demo");
    visited.add("/my-trees/empty-demo");

    expect(visited.size).toBe(12);
    for (const route of ALL_ROUTES) {
      expect(visited.has(route), `Route ${route} was not reached via click-through`).toBe(true);
    }
  });

  it("unknown routes fall back to /", () => {
    renderRoute(["/nonexistent-route"]);
    expect(currentLocation()).toBe("/");
    expect(
      screen.getByText(/사랑에 빠진 모든 순간을/)
    ).toBeInTheDocument();
  });

  it("has exactly 12 defined routes plus fallback", () => {
    expect(ALL_ROUTES).toHaveLength(12);
  });
});
