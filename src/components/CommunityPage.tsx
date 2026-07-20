import styles from "./CommunityPage.module.css";
import CommunityHeader from "./CommunityHeader";
import CommunitySearch from "./CommunitySearch";
import CommunityCategories from "./CommunityCategories";
import CommunityTreeGrid from "./CommunityTreeGrid";
import FeaturedLoveTree from "./FeaturedLoveTree";

/**
 * 커뮤니티 탐색 화면 (LT3-COMMUNITY-001) — BASE 구현
 *
 * 구조:
 *   CommunityPage
 *   ├─ CommunityHeader
 *   ├─ CommunitySearch
 *   ├─ CommunityCategories
 *   ├─ CommunityTreeGrid  (└─ CommunityTreeCard × N)
 *   └─ FeaturedLoveTree
 */
export default function CommunityPage() {
  return (
    <div className={styles.page}>
      <main className={styles.panel}>
        <CommunityHeader />
        <CommunitySearch />
        <CommunityCategories />
        <CommunityTreeGrid />
        <FeaturedLoveTree />
      </main>
    </div>
  );
}
