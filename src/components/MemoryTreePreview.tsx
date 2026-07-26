import { useEffect, useRef, useState } from "react";
import styles from "./MemoryTreePreview.module.css";
import { memoryCards, type MemoryCardData } from "../data/mockData";
import MemoryPreviewCard from "./MemoryPreviewCard";
import TreeConnectorSvg from "./TreeConnectorSvg";
import { YouTubePlayerFrame } from "./YouTubeMedia";
import { normalizeYouTubeUrl } from "../utils/youtube";

export default function MemoryTreePreview() {
  const [activeCard, setActiveCard] = useState<MemoryCardData | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const closePlayer = () => {
    setActiveCard(null);
    triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!activeCard) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closePlayer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeCard]);

  const handlePlay = (card: MemoryCardData, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setActiveCard(card);
  };

  const activeSource = activeCard
    ? normalizeYouTubeUrl(activeCard.youtubeUrl)
    : null;

  return (
    <div className={styles.preview} aria-label="러브트리 미리보기">
      <TreeConnectorSvg className={styles.connector} />

      {memoryCards.map((card) => (
        <div
          key={card.id}
          className={styles.cardSlot}
          style={{
            top: card.position.top,
            left: card.position.left,
            transform: `translate(-50%, -50%) scale(${card.scale})`,
          }}
        >
          <MemoryPreviewCard card={card} onPlay={handlePlay} />
        </div>
      ))}

      {activeCard ? (
        <section
          className={styles.playerPanel}
          role="dialog"
          aria-label={`${activeCard.memo} 영상 플레이어`}
          data-testid="home-youtube-player-panel"
        >
          <div className={styles.playerHeader}>
            <strong className={styles.playerTitle}>{activeCard.memo}</strong>
            <button
              type="button"
              className={styles.closeButton}
              aria-label="영상 닫기"
              onClick={closePlayer}
            >
              ×
            </button>
          </div>
          <div className={styles.playerStage}>
            <YouTubePlayerFrame
              key={activeCard.id}
              youtubeUrl={activeCard.youtubeUrl}
              source={activeSource}
              title={activeCard.memo}
            />
          </div>
          {activeSource ? (
            <a
              className={styles.externalLink}
              href={activeSource.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube에서 보기
            </a>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
