import styles from "./CommunityTreeGrid.module.css";
import { communityTreeCards } from "../data/communityMockData";
import CommunityTreeCard from "./CommunityTreeCard";

/**
 * 일반 러브트리 카드 목록
 * - 제목: "다른 팬들의 러브트리 구경하기"
 * - 4열 그리드 (모바일 반응형 축소)
 * - VISUAL 단계에서 5열 + Featured 중앙 배치로 변경 예정
 */
export default function CommunityTreeGrid() {
  return (
    <section className={styles.section} aria-labelledby="community-title">
      <h1 id="community-title" className={styles.title}>
        <span>다른 팬들의 러브트리</span>{" "}
        <span className={styles.mobileTitleLine}>구경하기</span>
      </h1>
      <div className={styles.grid}>
        {communityTreeCards.map((card) => (
          <CommunityTreeCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
