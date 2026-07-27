import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { PublicTreeMemory } from "../types/publicTreeDetail";
import TimelineCard from "./TimelineCard";

function memory(overrides: Partial<PublicTreeMemory> = {}): PublicTreeMemory {
  return {
    id: "mem-1",
    treeId: "tree-1",
    parentId: null,
    title: "테스트 기억",
    memo: "기억 본문 내용",
    artist: "테스트 아티스트",
    source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc123",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    emotionTags: ["설렘", "행복"],
    timestamp: "2026-07-20T10:00:00.000Z",
    visibility: "public",
    channelId: "UC123",
    channelName: "테스트 채널",
    channelUrl: "https://www.youtube.com/@test",
    createdAt: "2026-07-20T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    ...overrides,
  };
}

describe("TimelineCard", () => {
  it("is a non-link article with pending detail message", () => {
    render(<TimelineCard memory={memory()} />);
    const card = screen.getByRole("article", { name: "테스트 기억" });
    expect(card.tagName).toBe("ARTICLE");
    expect(card.closest("a")).toBeNull();
    expect(screen.getByText("기억 상세 연결 준비 중")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /기억 상세/ })).not.toBeInTheDocument();
  });

  it("does not link to /memory/detail-demo", () => {
    render(<TimelineCard memory={memory()} />);
    expect(document.querySelector('a[href="/memory/detail-demo"]')).toBeNull();
    const links = document.querySelectorAll("a");
    for (const link of links) {
      expect(link.getAttribute("href")).not.toBe("/memory/detail-demo");
    }
  });

  it("renders real memo, tags, artist, source, channel", () => {
    render(<TimelineCard memory={memory()} />);
    expect(screen.getByText("기억 본문 내용")).toBeInTheDocument();
    expect(screen.getByText("#설렘")).toBeInTheDocument();
    expect(screen.getByText("#행복")).toBeInTheDocument();
    expect(screen.getByText("테스트 아티스트")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("테스트 채널")).toBeInTheDocument();
  });

  it("shows thumbnail from sourceUrl when normalizeYouTubeUrl does not match", () => {
    render(<TimelineCard memory={memory()} />);
    expect(screen.getByTestId("timeline-image-thumbnail")).toBeInTheDocument();
    expect(screen.queryByTestId("timeline-youtube-thumbnail")).not.toBeInTheDocument();
    expect(screen.queryByTestId("timeline-media-fallback")).not.toBeInTheDocument();
  });

  it("falls back to HTTPS thumbnail when sourceUrl is not YouTube", () => {
    render(
      <TimelineCard
        memory={memory({ sourceUrl: "https://vimeo.com/123456" })}
      />,
    );
    expect(screen.getByTestId("timeline-image-thumbnail")).toHaveAttribute(
      "src",
      "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    );
    expect(screen.queryByTestId("timeline-youtube-thumbnail")).not.toBeInTheDocument();
  });

  it("rejects HTTP thumbnail and shows fallback", () => {
    render(
      <TimelineCard
        memory={memory({
          sourceUrl: "",
          thumbnail: "http://insecure.example.com/img.jpg",
        })}
      />,
    );
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("shows fallback for broken image", () => {
    render(
      <TimelineCard
        memory={memory({
          sourceUrl: "",
          thumbnail: "https://images.example.com/broken.jpg",
        })}
      />,
    );
    fireEvent.error(screen.getByTestId("timeline-image-thumbnail"));
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("shows fallback when both sourceUrl and thumbnail are empty", () => {
    render(
      <TimelineCard
        memory={memory({ sourceUrl: "", thumbnail: "" })}
      />,
    );
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("hides optional metadata when absent", () => {
    render(
      <TimelineCard
        memory={memory({
          memo: "",
          artist: "",
          source: "",
          sourceType: "",
          emotionTags: [],
          channelId: null,
          channelName: null,
          channelUrl: null,
        })}
      />,
    );
    expect(screen.queryByText("본문 내용")).not.toBeInTheDocument();
    expect(screen.queryByText("아티스트")).not.toBeInTheDocument();
    expect(screen.queryByText("출처")).not.toBeInTheDocument();
    expect(screen.queryByText("형식")).not.toBeInTheDocument();
    expect(screen.queryByText("채널")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "감정 태그" })).not.toBeInTheDocument();
  });

  it("includes source link for valid HTTPS sourceUrl", () => {
    render(<TimelineCard memory={memory()} />);
    const sourceLink = screen.getByText("원본 보기");
    expect(sourceLink.closest("a")).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=abc123",
    );
  });

  it("does not add synthetic reaction, location, or featured data", () => {
    render(<TimelineCard memory={memory()} />);
    expect(screen.queryByText(/반응/)).not.toBeInTheDocument();
    expect(screen.queryByText(/위치/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("timeline-featured-badge")).not.toBeInTheDocument();
  });
});
