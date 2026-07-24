import { describe, it, expect, afterEach } from "vitest";
import { cleanup, screen, fireEvent, render } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { NavigationHistoryProvider } from "../hooks/NavigationHistory";
import { useBackWithFallback } from "../hooks/useBackWithFallback";

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location" style={{ display: "none" }}>
      {location.pathname}
    </div>
  );
}

function BackButton({ fallback }: { fallback: string }) {
  const goBack = useBackWithFallback(fallback);
  return (
    <button type="button" aria-label="뒤로 가기" onClick={goBack}>
      뒤로
    </button>
  );
}

function ForwardButton() {
  const navigate = useNavigate();
  return (
    <button type="button" aria-label="앞으로 가기" onClick={() => navigate(1)}>
      앞으로
    </button>
  );
}

function Page({ to, label, fallback }: { to: string; label: string; fallback: string }) {
  return (
    <div>
      <h1>{label}</h1>
      <Link to={to}>이동</Link>
      <BackButton fallback={fallback} />
      <ForwardButton />
    </div>
  );
}

function renderApp(initialEntries: string[], initialIndex?: number) {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: (
          <NavigationHistoryProvider>
            <Routes>
              <Route path="/" element={<Page to="/a" label="home" fallback="/fallback-home" />} />
              <Route path="/a" element={<Page to="/b" label="A" fallback="/fallback-b" />} />
              <Route path="/b" element={<Page to="/c" label="B" fallback="/fallback-c" />} />
              <Route path="/c" element={<Page to="/" label="C" fallback="/fallback-c" />} />
              <Route path="/fallback-b" element={<h1>fallback-b</h1>} />
              <Route path="/fallback-c" element={<h1>fallback-c</h1>} />
              <Route path="/fallback-home" element={<h1>fallback-home</h1>} />
            </Routes>
            <LocationProbe />
          </NavigationHistoryProvider>
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

describe("useBackWithFallback — Router-based history", () => {
  afterEach(() => {
    cleanup();
  });

  it("direct-entry에서 뒤로 가기 클릭 시 fallback으로 이동한다", () => {
    renderApp(["/c"]);
    expect(currentLocation()).toBe("/c");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));

    expect(currentLocation()).toBe("/fallback-c");
  });

  it("내부 뒤로가기 2회 연속: 각각 이전 페이지로 이동한다 (fallback 아님)", () => {
    renderApp(["/"]);
    expect(currentLocation()).toBe("/");

    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/a");

    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/b");

    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/c");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/b");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/a");
  });

  it("Back → Forward → Back: 올바른 페이지로 이동한다", () => {
    renderApp(["/"]);
    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/a");
    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/b");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/a");

    fireEvent.click(screen.getByRole("button", { name: "앞으로 가기" }));
    expect(currentLocation()).toBe("/b");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/a");
  });

  it("Router/test instance 간 history가 격리된다 (모듈 상태 없음)", () => {
    renderApp(["/"]);
    fireEvent.click(screen.getByRole("link", { name: "이동" }));
    expect(currentLocation()).toBe("/a");

    cleanup();

    renderApp(["/c"]);
    expect(currentLocation()).toBe("/c");

    fireEvent.click(screen.getByRole("button", { name: "뒤로 가기" }));
    expect(currentLocation()).toBe("/fallback-c");
  });
});
