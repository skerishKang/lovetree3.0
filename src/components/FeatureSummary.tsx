import styles from "./FeatureSummary.module.css";
import { featureItems } from "../data/mockData";
import { iconMap } from "./icons";

/**
 * 하단 기능 설명 영역 (4개 항목)
 *   기록하기, 연결하기, 다시 보기, 공유하기
 *
 * 각 항목: 색이 다른 라운드 아이콘 배경 + 아이콘 + 굵은 제목 + 두 줄 설명
 */
export default function FeatureSummary() {
  return (
    <section className={styles.summary} aria-label="주요 기능">
      {featureItems.map((item) => {
        const Icon = iconMap[item.iconType];
        return (
          <div key={item.id} className={styles.item}>
            <div
              className={styles.iconBox}
              style={{ background: item.iconBg }}
            >
              <Icon className={styles.icon} />
            </div>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.description}</p>
          </div>
        );
      })}
    </section>
  );
}
