import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

describe("CommunityTreeGrid", () => {
  it("renders loading skeletons", () => {
    render(
      <CommunityTreeGrid trees={[]} status="loading" error={null} onRetry={vi.fn()} />,
    );

    expect(screen.getAllByTestId("community-card-skeleton")).toHaveLength(4);
  });

  it("renders the empty state", () => {
    render(
      <CommunityTreeGrid trees={[]} status="empty" error={null} onRetry={vi.fn()} />,
    );

    expect(screen.getByRole("status")).toHaveTextContent("아직 공개된 러브트리가 없습니다.");
  });

  it("renders an error with explicit retry", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(
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

  it("renders live cards without demo-detail links", () => {
    render(
      <CommunityTreeGrid
        trees={[tree("one"), tree("two")]}
        status="success"
        error={null}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getAllByTestId("community-tree-card")).toHaveLength(2);
    expect(screen.getByText("공개 트리 one")).toBeInTheDocument();
    expect(screen.getByText("공개 트리 two")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
