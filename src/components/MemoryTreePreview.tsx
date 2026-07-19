import styles from "./MemoryTreePreview.module.css";
import { memoryCards } from "../data/mockData";
import MemoryPreviewCard from "./MemoryPreviewCard";
import TreeConnectorSvg from "./TreeConnectorSvg";

/**
 * 오른쪽 러브트리 미리보기
 *
 * 5개 기억 카드 + SVG 곡선 연결선
 * 카드 크기 차이: 시작 카드 작음 → 오른쪽 카드 큼
 * 연결선: 장밋빛 곡선, 카드 뒤(z-index 0)
 *
 * 구조 (원본 기준):
 *   [왼쪽 시작] ─┬─ [중앙 상단] ─┬─ [상단 오른쪽]
 *               └─ [중앙 하단] └─ [하단 오른쪽]
 */
export default function MemoryTreePreview() {
  return (
    <div className={styles.preview} aria-label="러브트리 미리보기">
      {/* SVG 연결선 (카드 뒤) */}
      <TreeConnectorSvg className={styles.connector} />

      {/* 5개 기억 카드 */}
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
          <MemoryPreviewCard card={card} />
        </div>
      ))}
    </div>
  );
}
