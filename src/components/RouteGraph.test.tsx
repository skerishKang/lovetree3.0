import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { PUBLIC_DEMO_STORAGE_KEY } from "../utils/publicDemoStorage";

interface TestUser {
  uid: string;
  displayName: null;
  email: null;
  photoURL: null;
  emailVerified: boolean;
}

const routeAuth = vi.hoisted(() => ({
  user: null as TestUser | null,
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: routeAuth.user,
    loading: false,
    tier: null,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
    expireSession: vi.fn(),
  }),
}));

function renderAppAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

const publicRoutes = [
  ["/tree/new-demo", "새 러브트리"],
  ["/tree/new-demo/edit", "공개 데모 러브트리 편집"],
  ["/tree/new-demo/memory/new", "첫 기억 추가"],
  ["/tree/new-demo/memory/missing/edit", "기억을 찾을 수 없습니다"],
  ["/tree/new-demo/preview", "제목 없는 러브트리"],
] as const;

const protectedRoutes = [
  ["/tree/edit-demo", "러브트리 편집"],
  ["/memory/connect-demo", "어느 순간과 연결할까요?"],
  ["/my-trees", "나의 러브트리"],
  ["/media/search-demo", "미디어 검색"],
  ["/settings/visibility-demo", "공개 범위 설정"],
  ["/my-trees/empty-demo", "아직 러브트리가 없어요"],
] as const;

describe("Route graph — public demo isolation", () => {
  afterEach(() => {
    cleanup();
    routeAuth.user = null;
    localStorage.removeItem(PUBLIC_DEMO_STORAGE_KEY);
    window.history.pushState({}, "", "/");
    vi.restoreAllMocks();
  });

  it.each(publicRoutes)("keeps %s public while signed out", (path, heading) => {
    routeAuth.user = null;
    renderAppAt(path);
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });

  it.each(protectedRoutes)("redirects %s to login while signed out", async (path) => {
    routeAuth.user = null;
    renderAppAt(path);
    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "내 러브트리를 계속 이어가려면 로그인하세요",
      }),
    ).toBeInTheDocument();
  });

  it.each(protectedRoutes)("keeps %s available when signed in", (path, heading) => {
    routeAuth.user = {
      uid: "route-user",
      displayName: null,
      email: null,
      photoURL: null,
      emailVerified: true,
    };
    renderAppAt(path);
    expect(window.location.pathname).toBe(path);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });

  it("does not make a mock editor route public as a side effect", async () => {
    routeAuth.user = null;
    renderAppAt("/tree/edit-demo");
    await waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(screen.queryByRole("heading", { name: "러브트리 편집" })).not.toBeInTheDocument();
  });

  it("falls back to Home for unknown routes", async () => {
    renderAppAt("/unknown-public-demo-route");
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(
      screen.getByRole("heading", { name: "사랑에 빠진 모든 순간을 기록해 보세요" }),
    ).toBeInTheDocument();
  });
});
