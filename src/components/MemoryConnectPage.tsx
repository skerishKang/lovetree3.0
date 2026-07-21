import { Fragment } from "react";
import { MOCK_MEMORY_CONNECT } from "../data/memoryConnectMockData";
import styles from "./MemoryConnectPage.module.css";

export default function MemoryConnectPage() {
  const data = MOCK_MEMORY_CONNECT;
  const selectedNode = data.nodes.find((n) => n.id === data.selectedNodeId);

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={styles.logo}>LoveTree</span>
      </header>

      <section className={styles.intro}>
        <h1 className={styles.title}>{data.title}</h1>
        {data.description && (
          <p className={styles.description}>{data.description}</p>
        )}
      </section>

      <section className={styles.newMemorySection} aria-label="연결할 새 기억">
        <div className={styles.newMemoryCard}>
          <div className={styles.newMemoryBadge}>새 기억</div>
          <div className={styles.newMemoryContent}>
            <span className={styles.newMemoryEmoji} aria-hidden="true">
              {data.newMemory.emoji}
            </span>
            <div className={styles.newMemoryText}>
              <div className={styles.newMemoryMetaRow}>
                <span className={styles.newMemoryType}>{data.newMemory.typeLabel}</span>
                <span className={styles.newMemoryMedia}>{data.newMemory.mediaLabel}</span>
              </div>
              <strong className={styles.newMemoryTitle}>{data.newMemory.title}</strong>
              <time className={styles.newMemoryDate}>{data.newMemory.date}</time>
              <p className={styles.newMemoryDesc}>{data.newMemory.description}</p>
              <div className={styles.newMemoryTags}>
                {data.newMemory.tags.map((tag) => (
                  <span key={tag} className={styles.newMemoryTag}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {selectedNode && (
          <p className={styles.connectionHint}>
            <strong>{selectedNode.title}</strong> 뒤에 연결됩니다
          </p>
        )}
      </section>

      <section className={styles.treeSection} aria-label="기존 기억 트리">
        <svg
          className={styles.connectorSvg}
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="connectorGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d4cdc4" />
              <stop offset="100%" stopColor="#c0b5a8" />
            </linearGradient>
          </defs>
          {data.nodes.slice(0, -1).map((node, i) => {
            const isNextSelected = data.nodes[i + 1]?.id === data.selectedNodeId;
            return (
              <path
                key={`conn-${node.id}`}
                d={`M 16 ${32 + i * 180} C 16 ${32 + i * 180 + 50}, 16 ${32 + (i + 1) * 180 - 50}, 16 ${32 + (i + 1) * 180}`}
                fill="none"
                stroke={isNextSelected ? "var(--accent-rose, #e06b8b)" : "url(#connectorGrad)"}
                strokeWidth={isNextSelected ? 2.5 : 1.5}
                strokeDasharray={isNextSelected ? "none" : "6 4"}
                strokeLinecap="round"
              />
            );
          })}
          {data.nodes.map((node, i) => (
            <circle
              key={`dot-${node.id}`}
              cx="16"
              cy={32 + i * 180}
              r={node.id === data.selectedNodeId ? 6 : 4}
              fill={node.id === data.selectedNodeId ? "var(--accent-rose, #e06b8b)" : "#fff"}
              stroke={node.id === data.selectedNodeId ? "var(--accent-rose, #e06b8b)" : "#d4cdc4"}
              strokeWidth="2"
            />
          ))}
        </svg>

        <ul className={styles.nodeList}>
          {data.nodes.map((node) => {
            const isSelected = node.id === data.selectedNodeId;
            return (
              <Fragment key={node.id}>
              <li className={styles.nodeItem}>
                <article
                  className={`${styles.nodeCard} ${
                    isSelected ? styles.nodeSelected : ""
                  }`}
                  data-selected={isSelected ? "true" : "false"}
                  aria-current={isSelected ? "location" : undefined}
                >
                  <div className={styles.nodeVisual}>
                    <div
                      className={`${styles.iconArea} ${styles[`iconColor_${node.colorKey}`]}`}
                    >
                      <span className={styles.emoji} aria-hidden="true">
                        {node.emoji}
                      </span>
                    </div>
                  </div>
                  <div className={styles.textArea}>
                    <div className={styles.nodeMetaRow}>
                      <span className={styles.nodeType}>{node.typeLabel}</span>
                      <span className={styles.nodeMedia}>{node.mediaLabel}</span>
                    </div>
                    <time className={styles.date}>{node.date}</time>
                    <strong className={styles.nodeTitle}>{node.title}</strong>
                    <p className={styles.nodeDesc}>{node.description}</p>
                    <div className={styles.tags}>
                      {node.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  {isSelected && (
                    <span className={styles.selectedBadge} aria-hidden="true">
                      선택됨
                    </span>
                  )}
                </article>
              </li>
              {isSelected && (
                <li className={styles.nodeItem} data-testid="insert-marker">
                  <div className={styles.insertMarker}>
                    <span className={styles.insertMarkerLine} />
                    <span className={styles.insertMarkerLabel}>여기에 연결</span>
                    <span className={styles.insertMarkerLine} />
                  </div>
                </li>
              )}
              </Fragment>
            );
          })}
        </ul>
      </section>

      <div className={styles.ctaArea}>
        <div className={styles.ctaPanel}>
          {selectedNode && (
            <p className={styles.ctaContext}>
              "<strong>{selectedNode.title}</strong>" 뒤에
              "<strong>{data.newMemory.title}</strong>"를 연결합니다
            </p>
          )}
          <button type="button" className={styles.ctaButton}>
            {data.ctaText}
          </button>
        </div>
      </div>
    </div>
  );
}
