import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  useLocation,
} from "react-router-dom";
import appSource from "../App.tsx?raw";
import { AppRoutes } from "../App";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

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
  return <div data-testid="location" style={{ display: "none" }}>{location.pathname}</div>;
}

function renderRoute(path: string) {
  window.history.pushState({}, "", path);
  const router = createMemoryRouter([
    {
      path: "*",
      element: (
        <>
          <AppRoutes />
          <LocationProbe />
        </>
      ),
    },
  ], { initialEntries: [path] });
  render(<RouterProvider router={router} />);
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
  "/tree/new-demo",
  "/tree/new-demo/edit",
  "/tree/new-demo/memory/new",
  "/tree/new-demo/memory/missing/edit",
  "/tree/new-demo/preview",
] as const;

const PROTECTED_ROUTES = [
  "/memory/connect-demo",
  "/my-trees",
  "/tree/edit-demo",
  "/media/search-demo",
  "/settings/visibility-demo",
  "/my-trees/empty-demo",
] as const;

const ROUTE_HEADINGS: Record<string, string> = {
  "/": "사랑에 빠진 모든 순간을 기록해 보세요",
  "/community": "다른 팬들의 러브트리 구경하기",
  "/login": "내 러브트리를 계속 이어가려면 로그인하세요",
  "/tree/community-demo": "테스트 러버 A의 러브트리",
  "/memory/detail-demo": "기억 상세",
  "/tree/new-demo": "새 러브트리",
  "/tree/new-demo/edit": "공개 데모 러브트리 편집",
  "/tree/new-demo/memory/new": "첫 기억 추가",
  "/tree/new-demo/memory/missing/edit": "기억을 찾을 수 없습니다",
  "/tree/new-demo/preview": "제목 없는 러브트리",
  "/memory/connect-demo": "어느 순간과 연결할까요?",
  "/my-trees": "나의 러브트리",
  "/tree/edit-demo": "러브트리 편집",
  "/media/search-demo": "미디어 검색",
  "/settings/visibility-demo": "공개 범위 설정",
  "/my-trees/empty-demo": "아직 러브트리가 없어요",
};

describe("Route Graph — public demo and protected routes", () => {
  afterEach(() => {
    cleanup();
    routeAuth.user = null;
    routeAuth.loading = false;
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    window.history.pushState({}, "", "/");
  });

  it("mounts auth once and uses one public-demo provider shell", () => {
    expect(appSource.match(/<AuthProvider>/g)).toHaveLength(1);
    expect(appSource.match(/<AuthSessionController\s*\/>/g)).toHaveLength(1);
    expect(appSource.match(/<PublicDemoEditorProvider>/g)).toHaveLength(1);
  });

  it("renders every public demo route while signed out", () => {
    routeAuth.user = null;
    for (const route of PUBLIC_ROUTES) {
      renderRoute(route);
      expect(currentLocation()).toBe(route);
      expect(screen.getByRole("heading", { level: 1, name: ROUTE_HEADINGS[route] })).toBeInTheDocument();
      cleanup();
    }
  });

  it("renders every protected route when signed in", () => {
    routeAuth.user = {
      uid: "route-user",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };
    for (const route of PROTECTED_ROUTES) {
      renderRoute(route);
      expect(currentLocation()).toBe(route);
      expect(screen.getByRole("heading", { level: 1, name: ROUTE_HEADINGS[route] })).toBeInTheDocument();
      cleanup();
    }
  });

  it("redirects only the six existing protected routes while signed out", async () => {
    routeAuth.user = null;
    for (const route of PROTECTED_ROUTES) {
      renderRoute(route);
      await waitFor(() => expect(currentLocation()).toBe("/login"));
      expect(screen.getByRole("heading", { name: "내 러브트리를 계속 이어가려면 로그인하세요" })).toBeInTheDocument();
      cleanup();
    }
  });

  it("keeps exactly 16 defined routes plus fallback", () => {
    expect([...PUBLIC_ROUTES, ...PROTECTED_ROUTES]).toHaveLength(16);
  });

  it("unknown routes fall back to home", async () => {
    renderRoute("/nonexistent-route");
    await waitFor(() => expect(currentLocation()).toBe("/"));
    expect(screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" })).toBeInTheDocument();
  });
});
