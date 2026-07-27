import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
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

function renderCard(treeData: CommunityTreeSnapshot) {
  return render(
    <MemoryRouter>
      <CommunityTreeCard tree={treeData} />
    </MemoryRouter>,
  );
}

describe("CommunityTreeCard", () => {
  it("renders real browse fields with a link to /tree/:encodedTreeId", () => {
    renderCard(tree());
    const link = screen.getByRole("link", { name: "라이브 공개 트리 상세 보기" });
    expect(link).toHaveAttribute("href", "/tree/tree-live");
    expect(screen.getByRole("article", { name: "라이브 공개 트리" })).toBeInTheDocument();
    expect(screen.getByText("공개 범위: public")).toBeInTheDocument();
    expect(screen.getByText("단계: mature")).toBeInTheDocument();
    expect(screen.getByText("테마: concert")).toBeInTheDocument();
    expect(screen.getByText("기간: 2024-2026")).toBeInTheDocument();
    expect(screen.getByText("🌳 기억 5개")).toBeInTheDocument();
    expect(screen.getByText("설렘")).toBeInTheDocument();
    expect(screen.getByText("행복")).toBeInTheDocument();
    expect(screen.getByText("공개 트리 보기")).toBeInTheDocument();
    expect(document.querySelector('a[href="/tree/community-demo"]')).toBeNull();
  });

  it("encodes special characters in treeId", () => {
    renderCard(tree({ id: "a/b c?d", title: "특수 ID 트리" }));
    const link = screen.getByRole("link", { name: "특수 ID 트리 상세 보기" });
    expect(link).toHaveAttribute("href", "/tree/a%2Fb%20c%3Fd");
  });

  it("whole card is a keyboard-accessible link", () => {
    renderCard(tree());
    const link = screen.getByRole("link", { name: "라이브 공개 트리 상세 보기" });
    expect(link.getAttribute("href")).toBe("/tree/tree-live");
    expect(link.tabIndex).toBe(0);
  });

  it("shows valid optional metrics including zero and hides absent metrics", () => {
    const { rerender } = renderCard(tree());

    expect(screen.getByLabelText("좋아요 0")).toBeInTheDocument();
    expect(screen.getByLabelText("조회 12")).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <CommunityTreeCard tree={tree({ likeCount: undefined, viewCount: undefined })} />
      </MemoryRouter>,
    );

    expect(screen.queryByLabelText(/좋아요/)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/조회/)).not.toBeInTheDocument();
  });

  it("prefers a valid YouTube source and never creates an inline player", () => {
    renderCard(tree());

    expect(screen.getByTestId("community-youtube-thumbnail")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "라이브 공개 트리 YouTube 대표 썸네일" })).toBeInTheDocument();
    expect(screen.queryByTestId("community-image-thumbnail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });

  it("uses a safe HTTPS thumbnail when the source is not YouTube", () => {
    renderCard(
      tree({ representativeMemorySourceUrl: "https://video.example.com/watch/1" }),
    );

    expect(screen.getByTestId("community-image-thumbnail")).toHaveAttribute(
      "src",
      "https://images.example.com/tree.jpg",
    );
    expect(screen.queryByTestId("community-youtube-thumbnail")).not.toBeInTheDocument();
  });

  it("falls back for missing, unsafe, or broken images", () => {
    const { rerender } = renderCard(
      tree({
        representativeMemorySourceUrl: "not-a-url",
        representativeThumbnail: "http://images.example.com/tree.jpg",
      }),
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
