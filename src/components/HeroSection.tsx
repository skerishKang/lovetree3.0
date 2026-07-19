import styles from "./HeroSection.module.css";
import MemoryTreePreview from "./MemoryTreePreview";

/**
 * 메인 히어로 영역
 *
 * 왼쪽: 제목 + 설명 + CTA 버튼 2개
 * 오른쪽: 러브트리 미리보기 (5개 기억 카드 + SVG 연결선)
 *
 * 버튼은 시각/hover/focus-visible만 구현하고 실제 이동/저장은 하지 않습니다.
 */
export default function HeroSection() {
  return (
    <section className={styles.hero}>
      {/* 왼쪽 설명부 */}
      <div className={styles.copy}>
        <h1 className={styles.headline}>
          사랑에 빠진 모든 순간을
          <br />
          기록해 보세요
        </h1>
        <p className={styles.description}>
          영상, 날짜, 감정, 메모가 이어져
          <br />
          나만의 러브트리가 됩니다
        </p>
        <div className={styles.actions}>
          <button type="button" className={styles.btnPrimary}>
            첫 러브트리 만들기
          </button>
          <button type="button" className={styles.btnSecondary}>
            다른 러브트리 구경하기
          </button>
        </div>
      </div>

      {/* 오른쪽 트리 시각화 */}
      <MemoryTreePreview />
    </section>
  );
}
