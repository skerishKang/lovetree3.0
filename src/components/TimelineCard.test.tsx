import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { PublicTreeMemory } from "../types/publicTreeDetail";
import TimelineCard from "./TimelineCard";

function memory(overrides: Partial<PublicTreeMemory> = {}): PublicTreeMemory {
  return {
    id: "mem-1", treeId: "tree-1", parentId: null,
    title: "테스트 기억", memo: "기억 본문 내용",
    artist: "테스트 아티스트", source: "YouTube",
    sourceUrl: "https://www.youtube.com/watch?v=abc123",
    sourceType: "youtube",
    thumbnail: "https://img.youtube.com/vi/abc123/mqdefault.jpg",
    emotionTags: ["설렘", "행복"],
    timestamp: "2026-07-20T10:00:00.000Z", visibility: "public",
    channelId: "UC123", channelName: "테스트 채널",
    channelUrl: "https://www.youtube.com/@test",
    createdAt: "2026-07-20T10:00:00.000Z", updatedAt: "2026-07-20T10:00:00.000Z",
    ...overrides,
  };
}

function renderCard(mem: PublicTreeMemory, treeId = "tree-1") {
  return render(<MemoryRouter><TimelineCard memory={mem} treeId={treeId} /></MemoryRouter>);
}

describe("TimelineCard", () => {
  it("has no nested anchors — article with sibling anchor elements", () => {
    renderCard(memory());
    const anchors = document.querySelectorAll("a");
    for (const a of anchors) {
      expect(a.querySelector("a")).toBeNull();
    }
  });

  it("detail link has exact encoded href", () => {
    renderCard(memory({ id: "mem/1" }), "tree/1");
    const link = screen.getByRole("link", { name: "테스트 기억 기억 상세 보기" });
    expect(link).toHaveAttribute("href", "/tree/tree%2F1/memory/mem%2F1");
  });

  it("detail link is keyboard focusable", () => {
    renderCard(memory());
    const link = screen.getByRole("link", { name: "테스트 기억 기억 상세 보기" });
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  it("does not link to /memory/detail-demo", () => {
    renderCard(memory());
    const links = document.querySelectorAll("a");
    for (const link of links) {
      expect(link.getAttribute("href")).not.toBe("/memory/detail-demo");
    }
  });

  it("renders real memo, tags, artist, source, channel", () => {
    renderCard(memory());
    expect(screen.getByText("기억 본문 내용")).toBeInTheDocument();
    expect(screen.getByText("#설렘")).toBeInTheDocument();
    expect(screen.getByText("#행복")).toBeInTheDocument();
    expect(screen.getByText("테스트 아티스트")).toBeInTheDocument();
    expect(screen.getByText("YouTube")).toBeInTheDocument();
    expect(screen.getByText("테스트 채널")).toBeInTheDocument();
  });

  it("shows thumbnail from sourceUrl when normalizeYouTubeUrl does not match", () => {
    renderCard(memory());
    expect(screen.getByTestId("timeline-image-thumbnail")).toBeInTheDocument();
    expect(screen.queryByTestId("timeline-youtube-thumbnail")).not.toBeInTheDocument();
  });

  it("falls back to HTTPS thumbnail when sourceUrl is not YouTube", () => {
    renderCard(memory({ sourceUrl: "https://vimeo.com/123456" }));
    expect(screen.getByTestId("timeline-image-thumbnail")).toHaveAttribute("src", "https://img.youtube.com/vi/abc123/mqdefault.jpg");
  });

  it("rejects HTTP thumbnail and shows fallback", () => {
    renderCard(memory({ sourceUrl: "", thumbnail: "http://insecure.example.com/img.jpg" }));
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("shows fallback for broken image", () => {
    renderCard(memory({ sourceUrl: "", thumbnail: "https://images.example.com/broken.jpg" }));
    fireEvent.error(screen.getByTestId("timeline-image-thumbnail"));
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("shows fallback when both sourceUrl and thumbnail are empty", () => {
    renderCard(memory({ sourceUrl: "", thumbnail: "" }));
    expect(screen.getByTestId("timeline-media-fallback")).toBeInTheDocument();
  });

  it("hides optional metadata when absent", () => {
    renderCard(memory({ memo: "", artist: "", source: "", sourceType: "", emotionTags: [], channelId: null, channelName: null, channelUrl: null }));
    expect(screen.queryByText("본문 내용")).not.toBeInTheDocument();
    expect(screen.queryByText("아티스트")).not.toBeInTheDocument();
    expect(screen.queryByText("출처")).not.toBeInTheDocument();
    expect(screen.queryByText("형식")).not.toBeInTheDocument();
    expect(screen.queryByText("채널")).not.toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "감정 태그" })).not.toBeInTheDocument();
  });

  it("includes source link for valid HTTPS sourceUrl", () => {
    renderCard(memory());
    const sourceLink = screen.getByText("원본 보기");
    expect(sourceLink.closest("a")).toHaveAttribute("href", "https://www.youtube.com/watch?v=abc123");
    expect(sourceLink.closest("a")?.getAttribute("target")).toBe("_blank");
    expect(sourceLink.closest("a")?.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("shows 기억 상세 보기 detail link", () => {
    renderCard(memory());
    expect(screen.getByText("기억 상세 보기")).toBeInTheDocument();
  });

  it("does not add synthetic reaction, location, or featured data", () => {
    renderCard(memory());
    expect(screen.queryByText(/반응/)).not.toBeInTheDocument();
    expect(screen.queryByText(/위치/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("timeline-featured-badge")).not.toBeInTheDocument();
  });
});
