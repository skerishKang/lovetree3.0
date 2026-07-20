import { MOCK_MEMORY_CONNECT } from "../data/memoryConnectMockData";
import styles from "./MemoryConnectPage.module.css";

export default function MemoryConnectPage() {
  const data = MOCK_MEMORY_CONNECT;

  return (
    <div className={styles.page}>
      {/* 상단 뒤로 가기 + 로고 */}
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={styles.logo}>LoveTree</span>
      </header>

      {/* 제목 영역 */}
      <section className={styles.intro}>
        <h1 className={styles.title}>{data.title}</h1>
        {data.description && (
          <p className={styles.description}>{data.description}</p>
        )}
      </section>

      {/* 트리 구조 */}
      <section className={styles.treeSection} aria-label="기억 노드 목록">
        <div className={styles.connectorLine} aria-hidden="true" />
        <ul className={styles.nodeList}>
          {data.nodes.map((node, index) => {
            const isSelected = node.id === data.selectedNodeId;
            return (
            <li key={node.id} className={styles.nodeItem}>
              <article
                className={`${styles.nodeCard} ${
                  isSelected ? styles.nodeSelected : ""
                }`}
                data-selected={isSelected ? "true" : "false"}
                aria-current={isSelected ? "location" : undefined}
              >
                {/* 아이콘 영역 */}
                <div
                  className={`${styles.iconArea} ${styles[`iconColor_${node.colorKey}`]}`}
                >
                  <span className={styles.emoji} aria-hidden="true">
                    {node.emoji}
                  </span>
                </div>
                {/* 텍스트 영역 */}
                <div className={styles.textArea}>
                  <span className={styles.date}>{node.date}</span>
                  <strong className={styles.nodeTitle}>{node.title}</strong>
                  <div className={styles.tags}>
                    {node.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
              {/* 노드 사이 연결 점선 노드 (마지막 제외) */}
              {index < data.nodes.length - 1 && (
                <div className={styles.nodeConnector} aria-hidden="true">
                  <svg width="2" height="32" viewBox="0 0 2 32" fill="none" aria-hidden="true">
                    <line x1="1" y1="0" x2="1" y2="32" stroke="#d4cdc4" strokeWidth="2" strokeDasharray="4 4" />
                  </svg>
                </div>
              )}
            </li>
            );
          })}
        </ul>
      </section>

      {/* 하단 CTA */}
      <div className={styles.ctaArea}>
        <div className={styles.ctaPanel}>
          <button type="button" className={styles.ctaButton}>
            {data.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
