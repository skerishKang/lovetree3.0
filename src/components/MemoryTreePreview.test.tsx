import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import MemoryTreePreview from "./MemoryTreePreview";

function renderPreview() {
  return render(<MemoryTreePreview />);
}

describe("MemoryTreePreview YouTube media", () => {
  it("keeps five cards, five real thumbnails, and the existing connector with no initial iframe", () => {
    renderPreview();
    const preview = screen.getByLabelText("러브트리 미리보기");

    expect(within(preview).getAllByRole("article")).toHaveLength(5);
    expect(within(preview).getAllByRole("img")).toHaveLength(5);
    expect(within(preview).getAllByRole("button", { name: /영상 재생/ })).toHaveLength(5);
    expect(within(preview).queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(preview.querySelector("svg")).not.toBeNull();
  });

  it("creates only one iframe and replaces it when another card is selected", () => {
    renderPreview();
    const buttons = screen.getAllByRole("button", { name: /영상 재생/ });

    fireEvent.click(buttons[0]);
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    expect(screen.getByTestId("youtube-player")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/jNQXAC9IVRw",
    );

    fireEvent.click(buttons[1]);
    expect(screen.getAllByTestId("youtube-player")).toHaveLength(1);
    expect(screen.getByTestId("youtube-player")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });

  it("closes from the close button and restores focus to the triggering button", () => {
    renderPreview();
    const trigger = screen.getAllByRole("button", { name: /영상 재생/ })[0];

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "영상 닫기" }));

    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes on Escape and restores focus to the latest trigger", () => {
    renderPreview();
    const triggers = screen.getAllByRole("button", { name: /영상 재생/ });

    fireEvent.click(triggers[0]);
    fireEvent.click(triggers[2]);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    expect(triggers[2]).toHaveFocus();
  });

  it("keeps a safe external YouTube link in the active player", () => {
    renderPreview();
    fireEvent.click(screen.getAllByRole("button", { name: /영상 재생/ })[0]);

    const link = screen.getByRole("link", { name: "YouTube에서 보기" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute(
      "href",
      "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    );
  });
});
