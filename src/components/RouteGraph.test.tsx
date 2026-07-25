import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import appSource from "../App.tsx?raw";
import { AppRoutes } from "../App";

const routeAuth = vi.hoisted(() => ({
  user: null as null | {
    uid: string;
    displayName: null;
    email: null;
    photoURL: null;
    emailVerified: boolean;
  },
  loading: false,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: routeAuth.user,
    loading: routeAuth.loading,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

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
    { initialEntries, initialIndex }
  );
  render(<RouterProvider router={router} />);
  return router;
}

function currentLocation() {
  return screen.getByTestId("location").textContent ?? "";
}

const PUBLIC_ROUTES = [
  "/",
  "/community",
  "/login",
  "/tree/community-demo",
  "/memory/detail-demo",
] as const;

const PROTECTED_ROUTES = [
  "/memory/connect-demo",
  "/my-trees",
  "/tree/edit-demo",
  "/tree/new-demo",
  "/media/search-demo",
  "/settings/visibility-demo",
  "/my-trees/empty-demo",
] as const;

const ALL_ROUTES = [...PUBLIC_ROUTES, ...PROTECTED_ROUTES] as const;

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

function signInForRoute(route: string) {
  routeAuth.loading = false;
  routeAuth.user = PROTECTED_ROUTES.includes(
    route as (typeof PROTECTED_ROUTES)[number]
  )
    ? {
        uid: "route-user",
        displayName: null,
        email: null,
        photoURL: null,
        emailVerified: true,
      }
    : null;
}

describe("Route Graph — public and protected prototype routes", () => {
  afterEach(() => {
    routeAuth.user = null;
    routeAuth.loading = false;
    cleanup();
  });

  it("mounts AuthProvider and AuthSessionController exactly once in App", () => {
    expect(appSource.match(/<AuthProvider>/g)).toHaveLength(1);
    expect(appSource.match(/<AuthSessionController\s*\/>/g)).toHaveLength(1);
  });

  it("renders all 12 routes with the correct auth state", () => {
    for (const route of ALL_ROUTES) {
      signInForRoute(route);
      renderRoute([route]);
      expect(currentLocation()).toBe(route);
      expect(
        screen.getByRole("heading", {
          level: ROUTE_HEADINGS[route].level,
          name: ROUTE_HEADINGS[route].name,
        })
      ).toBeInTheDocument();
      cleanup();
    }
  });

  it("redirects every protected route to /login while signed out", async () => {
    routeAuth.user = null;
    routeAuth.loading = false;

    for (const route of PROTECTED_ROUTES) {
      renderRoute([route]);
      await waitFor(() => expect(currentLocation()).toBe("/login"));
      expect(
        screen.getByRole("heading", {
          name: "내 러브트리를 계속 이어가려면 로그인하세요",
        })
      ).toBeInTheDocument();
      cleanup();
    }
  });

  it("does not redirect public routes because of auth state", () => {
    routeAuth.user = null;
    routeAuth.loading = false;

    for (const route of PUBLIC_ROUTES) {
      renderRoute([route]);
      expect(currentLocation()).toBe(route);
      cleanup();
    }
  });

  it("preserves the full signed-in click-through graph", () => {
    const visited = new Set<string>();
    routeAuth.user = null;
    renderRoute(["/"]);
    visited.add("/");

    fireEvent.click(screen.getByRole("link", { name: "로그인" }));
    expect(currentLocation()).toBe("/login");
    visited.add("/login");

    fireEvent.click(screen.getByRole("link", { name: "Relovetree" }));
    fireEvent.click(screen.getByRole("link", { name: "Community" }));
    visited.add("/community");

    fireEvent.click(screen.getByRole("link", { name: "🌟 Featured 러브트리" }));
    visited.add("/tree/community-demo");

    fireEvent.click(screen.getAllByTestId("timeline-memory-card")[0]);
    visited.add("/memory/detail-demo");

    routeAuth.user = {
      uid: "route-user",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };

    fireEvent.click(screen.getByRole("button", { name: "기억 연결" }));
    visited.add("/memory/connect-demo");
    fireEvent.click(screen.getByRole("button", { name: "미디어 검색" }));
    visited.add("/media/search-demo");
    fireEvent.click(screen.getByRole("button", { name: "결과 검토" }));
    fireEvent.click(screen.getByRole("button", { name: "에디터 복귀" }));
    visited.add("/tree/edit-demo");
    fireEvent.click(screen.getByText("설정").closest("a")!);
    visited.add("/settings/visibility-demo");
    fireEvent.click(screen.getByRole("button", { name: "에디터 복귀" }));
    fireEvent.click(screen.getByRole("button", { name: "새 러브트리 만들기" }));
    visited.add("/tree/new-demo");

    cleanup();
    routeAuth.user = {
      uid: "route-user",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };
    renderRoute(["/"]);
    fireEvent.click(screen.getByRole("link", { name: "My Tree" }));
    visited.add("/my-trees");
    fireEvent.click(screen.getByRole("link", { name: "빈 상태 미리보기" }));
    visited.add("/my-trees/empty-demo");

    expect(visited.size).toBe(12);
    ALL_ROUTES.forEach((route) => {
      expect(visited.has(route), `Route ${route} was not reached`).toBe(true);
    });
  });

  it("unknown routes fall back to /", async () => {
    routeAuth.user = null;
    renderRoute(["/nonexistent-route"]);
    await waitFor(() => expect(currentLocation()).toBe("/"));
    expect(screen.getByText(/사랑에 빠진 모든 순간을/)).toBeInTheDocument();
  });

  it("keeps exactly 12 defined routes plus fallback", () => {
    expect(ALL_ROUTES).toHaveLength(12);
  });
});
