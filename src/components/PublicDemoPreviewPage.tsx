import { useState } from "react";
import { Link } from "react-router-dom";
import { usePublicDemoEditor } from "../context/PublicDemoEditorContext";
import { getConnectors, getNodeDepth } from "../utils/publicDemoGraph";
import YouTubeMedia from "./YouTubeMedia";
import styles from "./PublicDemoEditor.module.css";

export default function PublicDemoPreviewPage() {
  const { draft } = usePublicDemoEditor();
  const [selectedNodeId, setSelectedNodeId] = useState(
    draft.selectedNodeId ?? draft.nodes[0]?.id ?? null,
  );
  const selectedNode = draft.nodes.find((node) => node.id === selectedNodeId) ?? draft.nodes[0] ?? null;
  const connectors = getConnectors(draft.nodes);

  return (
    <div className={styles.page}>
      <header className={styles.simpleHeader}>
        <Link to="/tree/new-demo/edit" className={styles.brand}>Relovetree</Link>
        <span>공개 데모 미리보기 · 게시되지 않음</span>
      </header>
      <main className={styles.previewPage}>
        <section className={styles.previewHero}>
          <span className={styles.eyebrow}>브라우저 draft 미리보기</span>
          <h1>{draft.tree.title || "제목 없는 러브트리"}</h1>
          <p>{draft.tree.description || "설명이 아직 없습니다."}</p>
          <strong>{draft.nodes.length} / 12 기억</strong>
        </section>

        {draft.nodes.length === 0 ? (
          <section className={styles.emptyState}>
            <p>미리볼 기억이 없습니다.</p>
            <Link to="/tree/new-demo/memory/new" className={styles.primaryButton}>첫 기억 추가</Link>
          </section>
        ) : (
          <div className={styles.previewLayout}>
            <section className={styles.treePanel} aria-labelledby="preview-graph-title">
              <h2 id="preview-graph-title">완성된 연결 구조</h2>
              <div className={styles.graph}>
                {draft.nodes
                  .slice()
                  .sort((left, right) => getNodeDepth(draft.nodes, left.id) - getNodeDepth(draft.nodes, right.id))
                  .map((node) => {
                    const depth = getNodeDepth(draft.nodes, node.id);
                    const connector = connectors.find((item) => item.toId === node.id);
                    const selected = selectedNode?.id === node.id;
                    return (
                      <div key={node.id} className={styles.graphRow} style={{ paddingInlineStart: `${Math.min(depth, 6) * 28}px` }}>
                        {connector && (
                          <span
                            className={styles.connector}
                            data-testid="preview-connector"
                            data-from-id={connector.fromId}
                            data-to-id={connector.toId}
                            aria-hidden="true"
                          />
                        )}
                        <button
                          type="button"
                          className={`${styles.nodeButton} ${selected ? styles.nodeButtonSelected : ""}`}
                          data-selected={selected ? "true" : "false"}
                          onClick={() => setSelectedNodeId(node.id)}
                        >
                          <strong>{node.title}</strong>
                          <span>{node.date} · {node.emotion}</span>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </section>

            {selectedNode && (
              <article className={styles.previewMemory} aria-labelledby={`preview-memory-${selectedNode.id}`}>
                <h2 id={`preview-memory-${selectedNode.id}`}>{selectedNode.title}</h2>
                <p><time>{selectedNode.date}</time> · {selectedNode.emotion}</p>
                <p className={styles.memo}>{selectedNode.memo}</p>
                <YouTubeMedia youtubeUrl={selectedNode.youtubeUrl} title={selectedNode.title} />
              </article>
            )}
          </div>
        )}

        <div className={styles.actionRow}>
          <Link to="/tree/new-demo/edit" className={styles.primaryButton}>편집으로 돌아가기</Link>
          <Link to="/tree/new-demo" className={styles.secondaryButton}>시작 화면</Link>
        </div>
      </main>
    </div>
  );
}
