import { Link } from "react-router-dom";
import styles from "./FeatureSummary.module.css";
import { featureItems } from "../data/mockData";
import { iconMap } from "./icons";

export default function FeatureSummary() {
  return (
    <section className={styles.summary} aria-label="주요 기능">
      {featureItems.map((item) => {
        const Icon = iconMap[item.iconType];
        return (
          <Link
            key={item.id}
            to={item.route}
            className={styles.item}
            aria-label={`${item.title} — ${item.actionLabel}`}
          >
            <div
              className={styles.iconBox}
              style={{ background: item.iconBg }}
            >
              <Icon className={styles.icon} />
            </div>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.body}>{item.description}</p>
            <span className={styles.actionRow}>
              <span className={styles.actionLabel}>{item.actionLabel}</span>
              {item.experience === "demo" && (
                <span className={styles.demoBadge}>브라우저 체험</span>
              )}
            </span>
          </Link>
        );
      })}
    </section>
  );
}
