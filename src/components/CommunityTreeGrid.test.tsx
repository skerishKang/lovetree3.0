import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { CommunityTreeSnapshot } from "../types/community";
import CommunityTreeGrid from "./CommunityTreeGrid";

function tree(id: string): CommunityTreeSnapshot {
  return {
    id,
    title: `공개 트리 ${id}`,
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    representativeThumbnail: "",
    representativeMemorySourceUrl: "",
    memoryCount: 3,
    emotionTags: [],
    stage: "mature",
    theme: "",
    timeRange: "",
  };
}

function renderGrid(element: React.ReactNode) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

describe("CommunityTreeGrid", () => {
  it("renders loading skeletons", () => {
    renderGrid(
      <CommunityTreeGrid trees={[]} status="loading" error={null} onRetry={vi.fn()} />,
    );

    expect(screen.getAllByTestId("community-card-skeleton")).toHaveLength(4);
  });

  it("renders the empty state", () => {
    renderGrid(
      <CommunityTreeGrid trees={[]} status="empty" error={null} onRetry={vi.fn()} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("아직 공개된 러브트리가 없습니다.");
  });

  it("renders an error with explicit retry", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    renderGrid(
      <CommunityTreeGrid
        trees={[]}
        status="error"
        error="공개 러브트리를 불러오지 못했습니다."
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("불러오지 못했습니다");
    await user.click(screen.getByRole("button", { name: "다시 시도" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders live cards with real public-detail links and no demo route", () => {
    renderGrid(
      <CommunityTreeGrid
        trees={[tree("one"), tree("two")]} 
        status="success"
        error={null}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("community-tree-card")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "공개 트리 one 상세 보기" })).toHaveAttribute(
      "href",
      "/tree/one",
    );
    expect(screen.getByRole("link", { name: "공개 트리 two 상세 보기" })).toHaveAttribute(
      "href",
      "/tree/two",
    );
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
  });
});
