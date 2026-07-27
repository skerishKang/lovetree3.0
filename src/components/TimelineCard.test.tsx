import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublicTreeMemory } from "../types/publicTreeDetail";
import TimelineCard from "./TimelineCard";

function memory(overrides: Partial<PublicTreeMemory> = {}): PublicTreeMemory {
  return {
    id: "memory-1",
    treeId: "tree-1",
    parentId: null,
    title: "실제 기억",
    memo: "실제 메모",
    artist: "실제 아티스트",
    source: "실제 출처",
    sourceUrl: "https://www.youtube.com/watch?v=c4V0FNZfEv0",
    sourceType: "youtube",
    thumbnail: "https://images.example.com/memory.jpg",
    emotionTags: ["설렘"],
    timestamp: "2026-07-21T10:00:00.000Z",
    visibility: "public",
    channelId: "channel-1",
    channelName: "실제 채널",
    channelUrl: "https://www.youtube.com/@example",
    createdAt: "2026-07-21T10:00:00.000Z",
    updatedAt: null,
    ...overrides,
  };
}

describe("TimelineCard", () => {
  it("uses a valid YouTube source as a thumbnail only", () => {
    render(<TimelineCard memory={memory()} />);
    expect(screen.getByTestId("timeline-youtube-thumbnail")).toBeInTheDocument();
    expect(screen.queryByTestId("timeline-image-thumbnail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(screen.queryByRole("iframe")).not.toBeInTheDocument();
  });

  it("uses a safe HTTPS thumbnail when the source is not YouTube", () => {
    render(<TimelineCard memory={memory({ sourceUrl: "https://media.example.com/item" })} />);
    expect(screen.getByTestId("timeline-image-thumbnail")).toHaveAttribute(
      "src",
      "https://images.example.com/memory.jpg",
    );
  });

  it("falls back for unsafe and broken thumbnails", () => {
    const { rerender } = render(
      <TimelineCard memory={memory({ sourceUrl: "", thumbnail: "http://images.example.com/a.jpg" })} />,
    );
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();

    rerender(
      <TimelineCard memory={memory({ sourceUrl: "", thumbnail: "https://images.example.com/broken.jpg" })} />,
    );
    fireEvent.error(screen.getByTestId("timeline-image-thumbnail"));
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("renders only real memory metadata and no demo detail link", () => {
    render(<TimelineCard memory={memory()} />);
    expect(screen.getByText("실제 기억")).toBeInTheDocument();
    expect(screen.getByText("실제 메모")).toBeInTheDocument();
    expect(screen.getByText("실제 아티스트")).toBeInTheDocument();
    expect(screen.getByText("실제 출처")).toBeInTheDocument();
    expect(screen.getByText("youtube")).toBeInTheDocument();
    expect(screen.getByText("#설렘")).toBeInTheDocument();
    expect(screen.getByText("기억 상세 연결 준비 중")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /memory\/detail-demo/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryAllByRole("link").some((link) => link.getAttribute("href") === "/memory/detail-demo"),
    ).toBe(false);
  });
});
