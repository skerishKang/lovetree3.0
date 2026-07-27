import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { CommunityTreeSnapshot } from "../types/community";
import CommunityTreeCard from "./CommunityTreeCard";

function tree(overrides: Partial<CommunityTreeSnapshot> = {}): CommunityTreeSnapshot {
  return {
    id: "tree-live",
    title: "라이브 공개 트리",
    visibility: "public",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-26T10:00:00.000Z",
    representativeThumbnail: "https://images.example.com/tree.jpg",
    representativeMemorySourceUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    memoryCount: 5,
    emotionTags: ["설렘", "행복"],
    stage: "mature",
    theme: "concert",
    timeRange: "2024-2026",
    likeCount: 0,
    viewCount: 12,
    ...overrides,
  };
}

function renderCard(value = tree()) {
  return render(
    <MemoryRouter>
      <CommunityTreeCard tree={value} />
    </MemoryRouter>,
  );
}

describe("CommunityTreeCard", () => {
  it("links a real card to its encoded public tree route", () => {
    renderCard(tree({ id: "tree/한글 space" }));

    const link = screen.getByRole("link", { name: "라이브 공개 트리 상세 보기" });
    expect(link).toHaveAttribute("href", "/tree/tree%2F%ED%95%9C%EA%B8%80%20space");
    expect(link).not.toHaveAttribute("href", "/tree/community-demo");
    expect(screen.getByText("공개 트리 보기")).toBeInTheDocument();
  });

  it("navigates from the card to /tree/:treeId", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/community"]}>
        <Routes>
          <Route path="/community" element={<CommunityTreeCard tree={tree()} />} />
          <Route path="/tree/:treeId" element={<h1>실제 트리 상세</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("link", { name: "라이브 공개 트리 상세 보기" }));
    expect(screen.getByRole("heading", { name: "실제 트리 상세" })).toBeInTheDocument();
  });

  it("renders real browse fields and valid optional metrics", () => {
    renderCard();

    expect(screen.getByRole("article", { name: "라이브 공개 트리" })).toBeInTheDocument();
    expect(screen.getByText("공개 범위: public")).toBeInTheDocument();
    expect(screen.getByText("단계: mature")).toBeInTheDocument();
    expect(screen.getByText("테마: concert")).toBeInTheDocument();
    expect(screen.getByText("기간: 2024-2026")).toBeInTheDocument();
    expect(screen.getByText("🌳 기억 5개")).toBeInTheDocument();
    expect(screen.getByLabelText("좋아요 0")).toBeInTheDocument();
    expect(screen.getByLabelText("조회 12")).toBeInTheDocument();
  });

  it("hides absent optional metrics", () => {
    renderCard(tree({ likeCount: undefined, viewCount: undefined }));
    expect(screen.queryByLabelText(/좋아요/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/조회/)).not.toBeInTheDocument();
  });

  it("prefers a valid YouTube source and never creates an inline player", () => {
    renderCard();
    expect(screen.getByTestId("community-youtube-thumbnail")).toBeInTheDocument();
    expect(screen.queryByTestId("community-image-thumbnail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });

  it("uses safe HTTPS thumbnail and falls back for unsafe or broken images", () => {
    const { rerender } = render(
      <MemoryRouter>
        <CommunityTreeCard
          tree={tree({ representativeMemorySourceUrl: "https://video.example.com/watch/1" })}
        />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("community-image-thumbnail")).toHaveAttribute(
      "src",
      "https://images.example.com/tree.jpg",
    );

    rerender(
      <MemoryRouter>
        <CommunityTreeCard
          tree={tree({
            representativeMemorySourceUrl: "not-a-url",
            representativeThumbnail: "http://images.example.com/tree.jpg",
          })}
        />
      </MemoryRouter>,
    );
    expect(screen.getByTestId("community-media-fallback")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CommunityTreeCard
          tree={tree({
            representativeMemorySourceUrl: "",
            representativeThumbnail: "https://images.example.com/broken.jpg",
          })}
        />
      </MemoryRouter>,
    );
    fireEvent.error(screen.getByTestId("community-image-thumbnail"));
    expect(screen.getByTestId("community-media-fallback")).toBeInTheDocument();
  });
});
