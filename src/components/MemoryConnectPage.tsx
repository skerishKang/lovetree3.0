import { Fragment } from "react";
import { MOCK_MEMORY_CONNECT } from "../data/memoryConnectMockData";
import styles from "./MemoryConnectPage.module.css";

function MemoryConnector({ highlighted }: { highlighted: boolean }) {
  return (
    <div className={styles.connectorBlock} aria-hidden="true" data-testid="connector">
      <svg
        className={styles.connectorSvg}
        viewBox="0 0 32 48"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="16" y1="0" x2="16" y2="48"
          stroke={highlighted ? "var(--accent-rose, #e06b8b)" : "#d4cdc4"}
          strokeWidth={highlighted ? 2.5 : 1.5}
          strokeDasharray={highlighted ? "none" : "6 4"}
          strokeLinecap="round"
        />
        <circle
          cx="16" cy="48"
          r={highlighted ? 5 : 3.5}
          fill={highlighted ? "var(--accent-rose, #e06b8b)" : "#fff"}
          stroke={highlighted ? "var(--accent-rose, #e06b8b)" : "#d4cdc4"}
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export default function MemoryConnectPage() {
  const data = MOCK_MEMORY_CONNECT;
  const selectedNode = data.nodes.find((n) => n.id === data.selectedNodeId);

  return (
    <div className={styles.page}>
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} aria-label="뒤로 가기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className={styles.logo}>LoveTree</span>
      </header>

      <div className={styles.memoryConnectLayout}>
        <div className={styles.contextColumn}>
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
              <section className={styles.connectionHint} aria-label="연결 결과">
                <p data-testid="connection-result">
                  <strong>{selectedNode.title}</strong> 뒤에 연결됩니다
                </p>
              </section>
            )}
          </section>

          <div className={styles.desktopCtaPanel}>
            {selectedNode && (
              <p className={styles.ctaContext} data-testid="cta-context">
                "<strong>{selectedNode.title}</strong>" 뒤에
                "<strong>{data.newMemory.title}</strong>"를 연결합니다
              </p>
            )}
            <button type="button" className={styles.ctaButton}>
              {data.ctaText}
            </button>
          </div>
        </div>

        <div className={styles.treeColumn}>
          <section className={styles.treeSection} aria-label="기존 기억 트리">
            <ul className={styles.nodeList}>
              {data.nodes.map((node, index) => {
                const isSelected = node.id === data.selectedNodeId;
                const isNextSelected = index < data.nodes.length - 1 && data.nodes[index + 1]?.id === data.selectedNodeId;
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
                    {index < data.nodes.length - 1 && (
                      <li className={styles.connectorItem} data-testid={isNextSelected ? "connector-highlighted" : undefined}>
                        <MemoryConnector highlighted={isNextSelected} />
                      </li>
                    )}
                    {isSelected && (
                      <li className={styles.insertMarkerItem} data-testid="insert-marker">
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
        </div>
      </div>

      <div className={styles.ctaArea} data-testid="mobile-cta">
        <div className={styles.ctaPanel}>
          {selectedNode && (
            <p className={styles.ctaContext} data-testid="cta-context-mobile">
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
