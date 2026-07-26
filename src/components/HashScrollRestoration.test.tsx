import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Link, MemoryRouter, Route, Routes } from "react-router-dom";
import {
  HASH_SCROLL_HEADER_OFFSET,
  HASH_SCROLL_HIGHLIGHT_ATTRIBUTE,
  HASH_SCROLL_HIGHLIGHT_DURATION_MS,
  HashScrollRestoration,
  requestHashScrollActivation,
} from "./HashScrollRestoration";

const scrollToMock = vi.fn();

function makeRect(top: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    right: 0,
    bottom: top,
    left: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
  };
}

function makeMediaQueryList(matches: boolean): MediaQueryList {
  return {
    matches,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: () => true,
  };
}

function HomeSections() {
  return (
    <main>
      <section id="about">소개 영역</section>
      <section id="features">주요 기능 영역</section>
    </main>
  );
}

function renderAt(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <HashScrollRestoration />
      <Routes>
        <Route path="/" element={<HomeSections />} />
        <Route
          path="/community"
          element={<Link to="/#about">소개로 이동</Link>}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("HashScrollRestoration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    scrollToMock.mockReset();
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      writable: true,
      value: 40,
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue(makeMediaQueryList(false)),
    });
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: scrollToMock,
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect() {
        if (this.id === "about") {
          return makeRect(300);
        }
        if (this.id === "features") {
          return makeRect(620);
        }
        return makeRect(0);
      },
    );
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("scrolls from another route to the home target with the header offset", async () => {
    renderAt("/community");

    await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(
      screen.getByRole("link", { name: "소개로 이동" }),
    );

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 300 + 40 - HASH_SCROLL_HEADER_OFFSET,
      behavior: "smooth",
    });
    expect(screen.getByText("소개 영역")).toHaveAttribute(
      HASH_SCROLL_HIGHLIGHT_ATTRIBUTE,
      "true",
    );
  });

  it("clamps the calculated scroll position to zero", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      makeRect(10),
    );
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });

    renderAt("/#about");

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("reactivates the same hash on every explicit request", () => {
    renderAt("/#about");
    scrollToMock.mockClear();

    act(() => requestHashScrollActivation("#about"));
    act(() => requestHashScrollActivation("#about"));

    expect(scrollToMock).toHaveBeenCalledTimes(2);
    expect(screen.getByText("소개 영역")).toHaveAttribute(
      HASH_SCROLL_HIGHLIGHT_ATTRIBUTE,
      "true",
    );
  });

  it("removes the bounded highlight automatically", () => {
    renderAt("/#about");
    const about = screen.getByText("소개 영역");

    expect(about).toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE, "true");
    act(() => vi.advanceTimersByTime(HASH_SCROLL_HIGHLIGHT_DURATION_MS - 1));
    expect(about).toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE, "true");
    act(() => vi.advanceTimersByTime(1));
    expect(about).not.toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
  });

  it("clears the previous target and timer when another hash activates quickly", () => {
    renderAt("/#about");
    const about = screen.getByText("소개 영역");
    const features = screen.getByText("주요 기능 영역");

    act(() => requestHashScrollActivation("#features"));

    expect(about).not.toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
    expect(features).toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE, "true");
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(HASH_SCROLL_HIGHLIGHT_DURATION_MS));
    expect(features).not.toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses instant scrolling when reduced motion is preferred", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: vi.fn().mockReturnValue(makeMediaQueryList(true)),
    });

    renderAt("/#features");

    expect(scrollToMock).toHaveBeenCalledWith({
      top: 620 + 40 - HASH_SCROLL_HEADER_OFFSET,
      behavior: "auto",
    });
    expect(screen.getByText("주요 기능 영역")).toHaveAttribute(
      HASH_SCROLL_HIGHLIGHT_ATTRIBUTE,
      "true",
    );
  });

  it("does not throw or log when the hash target is missing", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    expect(() => renderAt("/#missing")).not.toThrow();
    expect(scrollToMock).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it("cleans the active highlight and timer on unmount", () => {
    const view = renderAt("/#about");
    const about = screen.getByText("소개 영역");

    expect(about).toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE, "true");
    view.unmount();

    expect(about).not.toHaveAttribute(HASH_SCROLL_HIGHLIGHT_ATTRIBUTE);
    expect(vi.getTimerCount()).toBe(0);
  });
});
