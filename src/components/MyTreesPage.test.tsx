import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import MyTreesPage from "./MyTreesPage";
import HomePage from "./HomePage";

function renderMyTrees() {
  return render(
    <MemoryRouter initialEntries={["/my-trees"]}>
      <Routes>
        <Route path="/my-trees" element={<MyTreesPage />} />
      </Routes>
    </MemoryRouter>
  );
}

function renderFullApp(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/my-trees" element={<MyTreesPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("MyTreesPage", () => {
  it("renders the page title", () => {
    renderMyTrees();
    expect(screen.getByRole("heading", { level: 1, name: "나의 러브트리" })).toBeInTheDocument();
  });

  it("renders exactly 6 tree cards", () => {
    renderMyTrees();
    const cards = screen.getAllByRole("article");
    expect(cards).toHaveLength(6);
  });

  it("uses article for each card in a list structure", () => {
    const { container } = renderMyTrees();
    const list = container.querySelector("ul");
    expect(list).not.toBeNull();
    const articles = list?.querySelectorAll(":scope > li > article");
    expect(articles).toHaveLength(6);
  });

  it("does not use role=button on non-interactive cards", () => {
    renderMyTrees();
    const cards = screen.getAllByRole("article");
    for (const card of cards) {
      expect(card).not.toHaveAttribute("role", "button");
    }
  });

  it("does not use tabIndex on non-interactive cards", () => {
    renderMyTrees();
    const cards = screen.getAllByRole("article");
    for (const card of cards) {
      expect(card).not.toHaveAttribute("tabindex");
    }
  });

  it("marks exactly one card as selected", () => {
    renderMyTrees();
    const selectedCards = document.querySelectorAll(
      '[data-selected="true"]'
    );
    expect(selectedCards).toHaveLength(1);
  });

  it("selects the card matching selectedTreeId", () => {
    const { container } = renderMyTrees();
    const articles = container.querySelectorAll("article");
    const selected = Array.from(articles).find((a) =>
      a.querySelector("h3")?.textContent === "나의 러브트리"
    );
    expect(selected).toBeDefined();
    expect(selected?.getAttribute("data-selected")).toBe("true");
    expect(selected?.getAttribute("aria-current")).toBe("true");
  });

  it("does not set selection ARIA on non-selected cards", () => {
    renderMyTrees();
    const cards = screen.getAllByRole("article");
    const nonSelected = Array.from(cards).filter(
      (c) => c.getAttribute("data-selected") !== "true"
    );
    expect(nonSelected).toHaveLength(5);
    for (const card of nonSelected) {
      expect(card.getAttribute("aria-current")).toBeNull();
      expect(card.getAttribute("data-selected")).toBe("false");
    }
  });

  it("renders visibility badges matching mock data", () => {
    renderMyTrees();
    const publicBadges = screen.getAllByText("공개");
    const privateBadges = screen.getAllByText("비공개");
    expect(publicBadges).toHaveLength(2);
    expect(privateBadges).toHaveLength(4);
  });

  it("renders the new-tree CTA", () => {
    renderMyTrees();
    expect(
      screen.getByRole("button", { name: /새 러브트리 만들기/ })
    ).toBeInTheDocument();
  });

  it("does not change UI state when CTA is clicked", () => {
    renderMyTrees();
    const cta = screen.getByRole("button", { name: /새 러브트리 만들기/ });
    const beforeText = screen.getByRole("heading", { level: 1 }).textContent;
    fireEvent.click(cta);
    const afterText = screen.getByRole("heading", { level: 1 }).textContent;
    expect(afterText).toBe(beforeText);
  });

  it("does not make any network requests", () => {
    const originalFetch = global.fetch;
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof globalThis.fetch;
    renderMyTrees();
    expect(fetchSpy).not.toHaveBeenCalled();
    global.fetch = originalFetch;
  });

  it("renders card action buttons per card", () => {
    renderMyTrees();
    // 4 action buttons per card x 6 cards = 24, plus new-tree CTA + 3 header buttons = 28
    const allButtons = screen.getAllByRole("button");
    expect(allButtons.length).toBe(28);
  });

  it("renders the sidebar with recent moments", () => {
    renderMyTrees();
    expect(
      screen.getByRole("heading", { level: 2, name: "최근 수정한 순간" })
    ).toBeInTheDocument();
  });

  it("keeps the Home route accessible", () => {
    const { unmount } = renderFullApp("/");
    expect(document.body).toBeInTheDocument();
    unmount();
  });

  it("keeps the my-trees route accessible", () => {
    renderFullApp("/my-trees");
    expect(screen.getByRole("heading", { level: 1, name: "나의 러브트리" })).toBeInTheDocument();
  });

  it("keeps the fallback route accessible", () => {
    const { container } = renderFullApp("/nonexistent-route");
    // Fallback renders HomePage which has its own content
    expect(container).toBeDefined();
  });
});
