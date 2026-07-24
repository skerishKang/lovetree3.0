import { useNavigate } from "react-router-dom";
import styles from "./HeroSection.module.css";
import MemoryTreePreview from "./MemoryTreePreview";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section id="about" className={styles.hero}>
      <div className={styles.copy}>
        <h1 className={styles.headline}>
          사랑에 빠진 모든 순간을
          <br />
          기록해 보세요
        </h1>
        <p className={styles.description}>
          영상, 날짜, 감정, 메모가 이어져
          <br />
          나만의 럤브트리가 됩니다
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate("/tree/new-demo")}
          >
            첫 러브트리 만들기
          </button>
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={() => navigate("/community")}
          >
            다른 러브트리 구경하기
          </button>
        </div>
      </div>

      <MemoryTreePreview />
    </section>
  );
}
