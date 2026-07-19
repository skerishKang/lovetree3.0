import type { ReactNode } from "react";
import styles from "./HomePage.module.css";
import { StarDecoration } from "./icons";
import SiteHeader from "./SiteHeader";
import HeroSection from "./HeroSection";
import FeatureSummary from "./FeatureSummary";

interface HomePageProps {
  children?: ReactNode;
}

/**
 * LT3-HOME-001 — LoveTree 3.0 홈 랜딩
 *
 * 전체 페이지 구조:
 *   LandingBackground (파스텔 배경 + 곡선 + 별)
 *   └─ LandingPanel (아이보리 메인 패널)
 *      ├─ SiteHeader
 *      ├─ HeroSection (HeroCopy + HeroActions + MemoryTreePreview)
 *      └─ FeatureSummary
 */
export default function HomePage({ children }: HomePageProps) {
  return (
    <div className={styles.container}>
      {/* 우측 상단 곡선형 녹색 면 */}
      <div className={styles.curveTopRight} aria-hidden="true" />
      {/* 우측 하단 반투명 별 장식 */}
      <StarDecoration className={styles.starDeco} aria-hidden="true" />

      {/* 중앙 아이보리 메인 패널 */}
      <main className={styles.panel}>
        <div className={styles.panelContent}>
          <SiteHeader />
          <HeroSection />
          <FeatureSummary />
        </div>
      </main>
      {children}
    </div>
  );
}
