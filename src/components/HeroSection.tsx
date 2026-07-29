import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";
import MemoryTreePreview from "./MemoryTreePreview";

export default function HeroSection() {
  return (
    <section id="about" className={styles.hero} style={{ scrollMarginTop: "80px" }}>
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
          <Link to="/tree/new" className={styles.btnPrimary}>
            첫 러브트리 만들기
          </Link>
          <Link to="/community" className={styles.btnSecondary}>
            다른 러브트리 구경하기
          </Link>
        </div>
      </div>

      <MemoryTreePreview />
    </section>
  );
}
