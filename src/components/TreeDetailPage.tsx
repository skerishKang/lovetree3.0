import { MOCK_TREE_DETAIL } from "../data/treeDetailMockData";
import TreeDetailHeader from "./TreeDetailHeader";
import TimelineSection from "./TimelineSection";
import TreeSocialSidebar from "./TreeSocialSidebar";
import styles from "./TreeDetailPage.module.css";

export default function TreeDetailPage() {
  const data = MOCK_TREE_DETAIL;

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <div className={styles.mainArea}>
          <TreeDetailHeader data={data} />
          <TimelineSection memories={data.memories} />
        </div>
        <aside className={styles.sidebar}>
          <TreeSocialSidebar data={data} />
        </aside>
      </div>
    </div>
  );
}
