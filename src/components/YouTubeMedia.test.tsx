import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import YouTubeMedia, { YouTubeThumbnail } from "./YouTubeMedia";

const FIRST_URL = "https://www.youtube.com/watch?v=jNQXAC9IVRw";
const SECOND_URL = "https://youtu.be/dQw4w9WgXcQ";

describe("YouTubeMedia", () => {
  it("renders a real thumbnail and no iframe before activation", () => {
    render(<YouTubeMedia youtubeUrl={FIRST_URL} title="첫 영상" />);

    expect(screen.getByRole("button", { name: "첫 영상 재생" })).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
    );
    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
  });

  it("creates exactly one privacy-enhanced iframe after activation", () => {
    render(<YouTubeMedia youtubeUrl={FIRST_URL} title="첫 영상" />);

    fireEvent.click(screen.getByRole("button", { name: "첫 영상 재생" }));

    const frames = screen.getAllByTestId("youtube-player");
    expect(frames).toHaveLength(1);
    expect(frames[0]).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/jNQXAC9IVRw",
    );
    expect(frames[0].getAttribute("src")).not.toContain("autoplay");
    expect(frames[0]).toHaveAttribute("title", "첫 영상 YouTube 영상");
    expect(frames[0]).toHaveAttribute("loading", "lazy");
    expect(frames[0]).toHaveAttribute("allowfullscreen");
    expect(frames[0]).toHaveAttribute(
      "allow",
      "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    expect(frames[0]).toHaveAttribute(
      "referrerpolicy",
      "strict-origin-when-cross-origin",
    );
  });

  it("keeps a safe canonical external link visible", () => {
    render(<YouTubeMedia youtubeUrl={FIRST_URL} title="첫 영상" />);

    const link = screen.getByRole("link", { name: "YouTube에서 보기" });
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows a bounded fallback when the thumbnail fails", () => {
    render(<YouTubeMedia youtubeUrl={FIRST_URL} title="첫 영상" />);

    fireEvent.error(screen.getByRole("img"));

    expect(
      screen.getByRole("img", { name: "영상 썸네일을 불러올 수 없음" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "첫 영상 재생" })).toBeInTheDocument();
  });

  it("removes the old iframe when the video changes", async () => {
    const view = render(<YouTubeMedia youtubeUrl={FIRST_URL} title="첫 영상" />);
    fireEvent.click(screen.getByRole("button", { name: "첫 영상 재생" }));
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);

    view.rerender(<YouTubeMedia youtubeUrl={SECOND_URL} title="두 번째 영상" />);

    await waitFor(() =>
      expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "두 번째 영상 재생" }));
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    expect(screen.getByTestId("youtube-player")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("renders a safe fallback for invalid media input", () => {
    render(<YouTubeMedia youtubeUrl="https://youtube.com.evil.example/watch?v=jNQXAC9IVRw" title="악성" />);

    expect(screen.getByRole("status")).toHaveTextContent("유효한 YouTube 미디어가 없습니다");
    expect(screen.queryByRole("iframe")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});

describe("YouTubeThumbnail", () => {
  it("can render a non-interactive thumbnail for cards inside links", () => {
    render(<YouTubeThumbnail youtubeUrl={FIRST_URL} title="목록 영상" />);

    expect(screen.getByRole("img", { name: "목록 영상 YouTube 썸네일" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
