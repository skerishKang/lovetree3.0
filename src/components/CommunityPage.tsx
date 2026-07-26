import { useCommunityTrees } from "../hooks/useCommunityTrees";
import CommunityCategories from "./CommunityCategories";
import CommunityHeader from "./CommunityHeader";
import CommunitySearch from "./CommunitySearch";
import CommunityTreeGrid from "./CommunityTreeGrid";
import FeaturedLoveTree from "./FeaturedLoveTree";
import styles from "./CommunityPage.module.css";

export default function CommunityPage() {
  const { main, growing, retryMain, retryGrowing } = useCommunityTrees();

  return (
    <div className={styles.page}>
      <main className={styles.panel}>
        <CommunityHeader />
        <CommunitySearch />
        <CommunityCategories />
        <CommunityTreeGrid
          trees={main.items}
          status={main.status}
          error={main.error}
          onRetry={retryMain}
        />
        <FeaturedLoveTree
          trees={growing.items}
          status={growing.status}
          error={growing.error}
          onRetry={retryGrowing}
        />
      </main>
    </div>
  );
}
